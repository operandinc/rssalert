/* Some utility functions */
import { Client } from "@planetscale/database";

export const db = new Client({
  url: process.env["DATABASE_URL"],
});

/* For some reason, the @operandinc/sdk wasn't compatable w/ Vercel's edge runtime.
   We're going to use basic fetch for now */

export interface Object {
  id: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  metadata: any;
  properties: any;
  indexingStatus: string;
  label?: string;
  objects?: number;
}

export interface Trigger {
  id: string;
  createdAt: Date;
  query: string;
  filter: any;
  matchingThreshold: number;
  callbackKind: string;
  callbackMetadata: any;
  lastFired?: Date;
}

export async function createObject(obj: {
  type: string;
  metadata: any;
  label?: string;
  parentId?: string;
  lifespan?: number;
}): Promise<Object> {
  const response = await fetch(
    `${process.env["OPERAND_ENDPOINT"] as string}/v3/objects`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${process.env["OPERAND_API_KEY"] as string}`,
      },
      body: JSON.stringify(obj),
    }
  );
  if (response.ok) {
    return (await response.json()) as Object;
  } else {
    throw new Error(await response.text());
  }
}

export async function getObject(id: string): Promise<Object> {
  const response = await fetch(
    `${process.env["OPERAND_ENDPOINT"] as string}/v3/objects/${id}`,
    {
      headers: {
        Authorization: `${process.env["OPERAND_API_KEY"] as string}`,
      },
    }
  );
  if (response.ok) {
    return (await response.json()) as Object;
  } else {
    throw new Error(await response.text());
  }
}

export async function createTrigger(trigger: {
  query: string;
  filter: any;
  callbackKind: string;
  callbackMetadata: any;
  matchingThreshold: number;
}): Promise<Trigger> {
  const response = await fetch(
    `${process.env["OPERAND_ENDPOINT"] as string}/v3/triggers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${process.env["OPERAND_API_KEY"] as string}`,
      },
      body: JSON.stringify(trigger),
    }
  );
  if (response.ok) {
    return (await response.json()) as Trigger;
  } else {
    throw new Error(await response.text());
  }
}

export async function deleteTrigger(id: string): Promise<boolean> {
  const response = await fetch(
    `${process.env["OPERAND_ENDPOINT"] as string}/v3/triggers/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `${process.env["OPERAND_API_KEY"] as string}`,
      },
    }
  );
  if (response.ok) {
    const rbody = (await response.json()) as {
      deleted: boolean;
    };
    return rbody.deleted;
  } else {
    throw new Error(await response.text());
  }
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase();
}

export async function sendEmail(email: {
  from: string;
  to: string;
  subject: string;
  htmlBody: string;
}): Promise<void> {
  await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": process.env["POSTMARK_SERVER_TOKEN"] as string,
    },
    body: JSON.stringify({
      From: email.from,
      To: email.to,
      Subject: email.subject,
      HtmlBody: email.htmlBody,
      MessageStream: "outbound",
    }),
  });
}

export function getBaseUrl(): string {
  if (process.env["NODE_ENV"] === "development") {
    return `http://localhost:3000`;
  }
  return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
}
