// File: components/Navbar.tsx

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; // <-- impor useRouter
import { supabase } from '../lib/supabaseClient';
import BurgerMenu from './BurgerMenu';

export default function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>('Franchisee');
  const [menuOpen, setMenuOpen] = useState(false);

  // Jika path saat ini adalah "/" (halaman utama), jangan render navbar
  if (router.pathname === '/') {
    return null;
  }

  useEffect(() => {
    // Ambil session Supabase
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchUserRole(data.session.user.id);
    });

    // Listener perubahan auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (data && data.role) {
      setRole(data.role);
    }
  };

  const userGreeting = session
    ? `${session.user?.user_metadata?.full_name || 'User'}_${role}`
    : 'Calon Franchisee';

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex flex-wrap items-center justify-between gap-2 relative z-50">
        {/* Baris ini berisi logo + burger-icon */}
        <div className="flex justify-between items-center w-full lg:w-auto">
          <Link href="/" className="text-xl font-bold text-blue-600">
            FranchiseHub
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-2xl lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-auto">
          <input
            type="text"
            placeholder="Cari franchise..."
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Salam pengguna */}
        <div className="w-full lg:w-auto flex justify-end items-center text-sm">
          <p className="italic text-gray-500">Halo, {userGreeting}!</p>
        </div>
      </nav>

      {/* BurgerMenu */}
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
