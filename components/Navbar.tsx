// File: components/Navbar.tsx

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import BurgerMenu from './BurgerMenu';

export default function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>('Franchisee');
  const [menuOpen, setMenuOpen] = useState(false);

  // Ambil session & role user dari Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchUserRole(data.session.user.id);
    });

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

  // Hanya tampilkan kolom pencarian jika bukan halaman utama ("/")
  const isHomePage = router.pathname === '/';

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex flex-wrap items-center justify-between gap-2 relative z-50">
        {/* ------------ Logo di pojok kiri (ukuran kecil) ------------ */}
        <div className="flex items-center">
          <Link href="/" passHref>
            <a className="flex-shrink-0 flex items-center">
              {/* 
                Gunakan nama file logo persis seperti di folder public/,
                misalnya: 22C6DD46-5682-4FDD-998B-710D24A74856.png
              */}
              <Image
                src="/22C6DD46-5682-4FDD-998B-710D24A74856.png"
                alt="FranchiseHub Logo"
                width={40}     // Lebar 40px
                height={40}    // Tinggi 40px
                className="object-contain"
              />
            </a>
          </Link>
        </div>

        {/* ------------ Tombol Burger Menu (hanya di mobile) ------------ */}
        <button
          onClick={() => setMenuOpen(true)}
          className="text-2xl lg:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* ------------ Kolom Pencarian (hanya jika bukan homepage) ------------ */}
        {!isHomePage && (
          <div className="flex-1 px-4 lg:px-8">
            <input
              type="text"
              placeholder="Cari franchise..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        {/* ------------ Salam Pengguna & Logout ------------ */}
        <div className="flex items-center space-x-4 text-sm">
          <p className="italic text-gray-500">Halo, {userGreeting}!</p>
          {session && (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* ------------ Komponen BurgerMenu (slide-in menu) ------------ */}
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
