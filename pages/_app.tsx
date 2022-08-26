import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "components/head";
import Banner from "components/banner";
import { useRouter } from "next/router";

export default function RSSAlert({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <>
      <Head />
      <Banner hideManageButton={router.pathname === "/login"} />
      <Component {...pageProps} />
    </>
  );
}
