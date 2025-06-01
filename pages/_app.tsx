// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHome = router.pathname === '/';

  return (
    <>
      <Navbar />
      <main className={isHome ? '' : 'pt-16'}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
