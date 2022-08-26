import NextHead from "next/head";

interface HeadProps {
  title?: string;
}

export default function Head({ title }: HeadProps) {
  return (
    <NextHead>
      <title>{title || "RSSAlert | Email-based Alerts for RSS Content"}</title>
      <meta
        name="description"
        content="Receive real-time email alerts for new content from RSS feeds!"
      />
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  );
}
