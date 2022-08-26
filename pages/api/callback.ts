import { db, getObject, sendEmail, Object } from "lib/shared";

export const config = {
  runtime: "experimental-edge",
};

interface CallbackBody {
  triggerId: string;
  matches: {
    content: string;
    objectId: string;
    score: number;
  }[];
}

export default async function handler(req: Request) {
  const body = (await req.json()) as CallbackBody;
  if (!body.triggerId || !body.matches) {
    return new Response(null, { status: 400 });
  }

  const conn = db.connection();

  const trigger = await conn.execute(
    "SELECT feedUrl, destinationEmail FROM alerts WHERE triggerId = ?",
    [body.triggerId]
  );
  if (trigger.rows.length === 0) {
    console.warn(`No trigger found for triggerId ${body.triggerId}`);
    return new Response(null, { status: 404 });
  }

  let objects = new Map<string, { matches: string[]; object: Object }>();
  for (const match of body.matches) {
    if (objects.has(match.objectId)) {
      // I miss the Rust entry API...
      let existing = objects.get(match.objectId)!;
      existing.matches.push(match.content);
      objects.set(match.objectId, existing);
    } else {
      const object = await getObject(match.objectId);
      objects.set(match.objectId, {
        matches: [match.content],
        object,
      });
    }
  }

  let html = `<p>New content matches for <pre>${trigger.rows[0].feedUrl}</pre>:</p><br><br>`;
  objects.forEach((value) => {
    let meta = value.object.metadata as {
      html: string;
      title?: string;
      url?: string;
    };
    html += `<p><a href="${meta.url}">${meta.title}</a>:</p><br><ul>`;
    for (const match of value.matches) {
      html += `<li>${match}</li>`;
    }
    html += "</ul><br><br>";
  });

  await sendEmail({
    from: "rssalert@operand.ai",
    to: trigger.rows[0].destinationEmail,
    subject: "New content matches for " + trigger.rows[0].feedUrl,
    htmlBody: html,
  });

  return new Response(null, { status: 200 });
}
