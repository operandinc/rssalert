import { db, getBaseUrl, normalizeEmail, sendEmail } from "lib/shared";

export const config = {
  runtime: "experimental-edge",
};

export default async function handler(req: Request) {
  const { emailAddress } = (await req.json()) as { emailAddress: string };
  if (!emailAddress) {
    return new Response(null, { status: 400 });
  }

  const conn = db.connection();

  const normalized = normalizeEmail(emailAddress);
  const existing = await conn.execute(
    "SELECT secret FROM emails WHERE email = ?",
    [normalized]
  );

  if (existing.rows.length > 0) {
    const managementUrl = `${getBaseUrl()}/manage?email=${normalized}&secret=${
      existing.rows[0].secret
    }`;

    sendEmail({
      from: "rssalert@operand.ai",
      to: normalized,
      subject: "RSS Alert Login",
      htmlBody: `Here's your (secure) link to manage your RSS alerts: <a href="${managementUrl}">${managementUrl}</a>. If you didn't request this link, please ignore this email.`,
    });
  }

  return new Response(null, { status: 200 });
}
