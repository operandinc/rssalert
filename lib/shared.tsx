/* Some utility functions */
import { Client } from "@planetscale/database";
import { OperandV3 } from "@operandinc/sdk";

export const db = new Client({
  url: process.env["DATABASE_URL"],
});

export const operand = new OperandV3(
  process.env["OPERAND_API_KEY"] as string,
  process.env["OPERAND_ENDPOINT"] as string
);

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
