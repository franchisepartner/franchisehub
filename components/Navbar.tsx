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

  // Deteksi apakah sedang di halaman utama ("/")
  const isHomePage = router.pathname === '/';

  // Ambil session & role user dari Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        fetchUserRole(data.session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      }
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

  // Siapa nama yang akan disapa
  const userGreeting = session
    ? ${session.user?.user_metadata?.full_name || 'User'}_${role}
    : 'Calon Franchisee';

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex items-center justify-between relative z-50">
        {/* =========== KIRI: Logo (diperbesar menjadi 44×44) =========== */}
        <div className="flex-shrink-0">
          <Link href="/" passHref>
            <a className="flex items-center">
              <Image
                src="/22C6DD46-5682-4FDD-998B-710D24A74856.png"
                alt="FranchiseHub Logo"
                width={44}
                height={44}
                className="object-contain"
              />
            </a>
          </Link>
        </div>

        {/* =========== TENGAH: Kolom Pencarian (hanya jika bukan homepage) =========== */}
        {!isHomePage && (
          <div className="flex-1 mx-6 lg:mx-12">
            <input
              type="text"
              placeholder="Cari franchise..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        {/* =========== KANAN: Salam pengguna + Burger Menu =========== */}
        <div className="flex items-center space-x-4">
          {/* Salam user */}
          <p className="italic text-gray-500 text-sm">Halo, {userGreeting}!</p>

          {/* Tombol Burger Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="text-2xl"
            aria-label="Buka menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* =========== Komponen BurgerMenu (slide-in) =========== */}
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
