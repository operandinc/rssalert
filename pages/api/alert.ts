import { ExecutedQuery } from "@planetscale/database";
import { v4 as uuidv4 } from "uuid";
import {
  db,
  getBaseUrl,
  normalizeEmail,
  createObject,
  createTrigger,
  Object,
  deleteTrigger,
} from "lib/shared";

export const config = {
  runtime: "experimental-edge",
};

export default async function handler(req: Request) {
  switch (req.method) {
    case "POST":
      return createAlertHandler(req);
    case "DELETE":
      return deleteAlertHandler(req);
    case "GET":
      return getAlertsHandler(req);
    default:
      return new Response(null, { status: 405 });
  }
}

async function validateFeedUrl(url: string): Promise<boolean> {
  if (url.length > 512) {
    return false;
  }
  const response = await fetch(url, {
    method: "HEAD",
    headers: {
      Accept: "application/rss+xml",
    },
  });
  if (!response.ok) {
    const rbody = await response.text();
    console.warn(
      `Invalid feed URL: ${url} (${response.status} ${response.statusText}): ${rbody}`
    );
  }
  return response.ok;
}

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

interface CreateAlertRequest {
  feedUrl: string;
  triggerQuery: string;
  triggerThreshold: number;
  destinationEmail: string;
}

async function createAlertHandler(req: Request) {
  const conn = db.connection();

  const { feedUrl, triggerQuery, triggerThreshold, destinationEmail } =
    (await req.json()) as CreateAlertRequest;

  if (triggerQuery.length > 280 || triggerQuery.length == 0) {
    return new Response("Invalid trigger query", { status: 400 });
  } else if (!emailRegex.test(destinationEmail)) {
    return new Response("Invalid destination email address", { status: 400 });
  } else if (triggerThreshold < 0.4 || triggerThreshold > 1) {
    return new Response(
      "Invalid trigger threshold, must be between 0.4 and 1",
      {
        status: 400,
      }
    );
  }

  const existing = await conn.execute(
    "SELECT objectId FROM feeds WHERE url = ?",
    [feedUrl]
  );

  var objectId: string | null = null;
  if (existing.rows.length == 0) {
    const valid = await validateFeedUrl(feedUrl);
    if (!valid) {
      return new Response("Invalid feed URL", { status: 400 });
    }

    var object: Object;
    try {
      object = await createObject({
        type: "rss",
        metadata: {
          rssUrl: feedUrl,
        },
        label: feedUrl,
        parentId: process.env["OPERAND_PARENT_ID"] || undefined,
      });
    } catch (e) {
      console.warn(e);
      return new Response("Failed to create object", { status: 500 });
    }

    await conn.execute("INSERT INTO feeds (url, objectId) VALUES (?, ?)", [
      feedUrl,
      object.id,
    ]);

    objectId = object.id;
  } else {
    objectId = existing.rows[0].objectId;
  }

  const trigger = await createTrigger({
    query: triggerQuery,
    filter: {
      _object: objectId,
    },
    callbackKind: "webhook",
    callbackMetadata: {
      url: `${getBaseUrl()}/api/callback`,
    },
    matchingThreshold: triggerThreshold,
  });

  let email = normalizeEmail(destinationEmail);
  await conn.execute(
    "INSERT INTO alerts (feedUrl, triggerId, destinationEmail, query) VALUES (?, ?, ?, ?)",
    [feedUrl, trigger.id, email, triggerQuery]
  );

  const existingSecret = await conn.execute(
    "SELECT secret FROM emails WHERE email = ?",
    [email]
  );
  if (existingSecret.rows.length == 0) {
    const secret = uuidv4();
    await conn.execute("INSERT INTO emails (email, secret) VALUES (?, ?)", [
      email,
      secret,
    ]);
  }

  return new Response(
    JSON.stringify({
      triggerId: trigger.id,
    }),
    { status: 200 }
  );
}

async function deleteAlertHandler(req: Request) {
  const conn = db.connection();

  const params = new URL(req.url).searchParams;
  const triggerId = params.get("triggerId");
  if (!triggerId) {
    return new Response("Missing triggerId query parameter", { status: 400 });
  }

  await Promise.all([
    deleteTrigger(triggerId),
    conn.execute("DELETE FROM alerts WHERE triggerId = ?", [triggerId]),
  ]);

  return new Response(null, { status: 200 });
}

async function getAlertsHandler(req: Request) {
  const conn = db.connection();

  const params = new URL(req.url).searchParams;
  const triggerId = params.get("triggerId");
  const emailAddress = params.get("emailAddress");
  const emailSecret = params.get("emailSecret");

  let rows: ExecutedQuery | null = null;
  if (triggerId) {
    rows = await conn.execute(
      "SELECT feedUrl, triggerId, destinationEmail, query FROM alerts WHERE triggerId = ?",
      [triggerId]
    );
  } else if (emailAddress || emailSecret) {
    if (!emailAddress) {
      return new Response("Missing emailAddress query parameter", {
        status: 400,
      });
    } else if (!emailSecret) {
      return new Response("Missing emailSecret query parameter", {
        status: 400,
      });
    }

    const secret = await conn.execute(
      "SELECT secret FROM emails WHERE email = ?",
      [emailAddress]
    );
    if (secret.rows.length == 0 || secret.rows[0].secret != emailSecret) {
      return new Response("Invalid emailSecret query parameter", {
        status: 400,
      });
    }

    rows = await conn.execute(
      "SELECT feedUrl, triggerId, destinationEmail, query FROM alerts WHERE destinationEmail = ?",
      [emailAddress]
    );
  }

  if (!rows) {
    return new Response("Missing query parameter", { status: 400 });
  }

  return new Response(JSON.stringify({ alerts: rows.rows }), { status: 200 });
}
