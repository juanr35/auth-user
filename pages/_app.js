import { SessionProvider } from "next-auth/react"

import "../assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../assets/css/nextjs-argon-dashboard.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
        <Component {...pageProps} />
    </SessionProvider>
  )
}