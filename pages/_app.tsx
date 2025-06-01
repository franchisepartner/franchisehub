// File: pages/_app.tsx

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '../components/Navbar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar />
      <main className="pt-0">
        <Component {...pageProps} />
      </main>
    </>
  )
}
