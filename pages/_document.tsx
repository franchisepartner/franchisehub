// pages/_document.tsx

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        {/* Versi favicon lain (jika kamu punya) */}
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /> */}
        {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> */}
        {/* SEO & Theme */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="application-name" content="Franchise Nusantara" />
        <meta name="description" content="Franchise Nusantara adalah platform franchise modern Indonesia. Temukan, kelola, dan kembangkan bisnis franchise terbaik bersama kami." />
        {/* Social Preview */}
        <meta property="og:title" content="Franchise Nusantara — Platform Franchise Modern Indonesia" />
        <meta property="og:description" content="Temukan, kelola, dan kembangkan bisnis franchise terbaik bersama Franchise Nusantara." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://franchisenusantara.com" />
        <meta property="og:image" content="https://franchisenusantara.com/logo-og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Franchise Nusantara — Platform Franchise Modern Indonesia" />
        <meta name="twitter:description" content="Temukan, kelola, dan kembangkan bisnis franchise terbaik bersama Franchise Nusantara." />
        {/* Robots */}
        <meta name="robots" content="index, follow" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
