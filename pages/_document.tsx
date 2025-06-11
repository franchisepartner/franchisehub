// pages/_document.tsx

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Optional: Tambahkan versi lain untuk perangkat lain */}
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /> */}
        {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> */}
        {/* <link rel="manifest" href="/site.webmanifest" /> */}
        {/* SEO tambahan */}
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
