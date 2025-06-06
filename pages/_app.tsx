// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabaseClient';
import { useState, useEffect } from 'react'; // Tambah useEffect di sini!
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

      {/* Tombol gelembung chat di pojok kanan bawah */}
      <button 
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-xl z-50"
        onClick={() => setChatOpen(true)}
      >
        📬
      </button>

      {/* Popup Chat Pasar */}
      {isChatOpen && <ChatPasarPopup onClose={() => setChatOpen(false)} />}
    </SessionContextProvider>
  );
}
