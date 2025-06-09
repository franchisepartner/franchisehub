// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabaseClient';
import { useState, useEffect } from 'react';
import ChatPasarPopup from '../components/ChatPasarPopup';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHome = router.pathname === '/';
  const [isChatOpen, setChatOpen] = useState(false);

  // Fallback insert profil jika login Google (role: franchisee)
  useEffect(() => {
    const checkAndInsertProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      if (!profile) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          role: 'franchisee'
        });
      }
    };
    checkAndInsertProfile();
  }, []);

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Navbar />
      <main className={isHome ? '' : 'pt-0'}>
        <Component {...pageProps} />
      </main>
      <Footer />

      {/* Tombol Chat Pasar modern */}
      <button
        onClick={() => setChatOpen(true)}
        aria-label="Buka Chat Pasar"
        className="
          fixed bottom-6 right-6 z-50
          flex items-center justify-center
          w-16 h-16 rounded-full
          bg-gradient-to-tr from-blue-600 to-cyan-400
          shadow-2xl
          hover:scale-110 hover:shadow-3xl
          transition-all duration-200
          ring-2 ring-white border-4 border-white
          focus:outline-none
          group
        "
      >
        {/* SVG toko/chat */}
        <svg className="w-8 h-8 group-hover:scale-110 transition" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
          <rect x="4" y="10" width="16" height="8" rx="2" stroke="currentColor" />
          <path d="M4 10V8a4 4 0 014-4h8a4 4 0 014 4v2" stroke="currentColor" />
          <path d="M8 14h8" stroke="currentColor" strokeLinecap="round" />
        </svg>
      </button>

      {/* Popup Chat Pasar */}
      {isChatOpen && <ChatPasarPopup onClose={() => setChatOpen(false)} />}
    </SessionContextProvider>
  );
}
