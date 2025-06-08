// File: components/Navbar.tsx

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import BurgerMenu from './BurgerMenu';

export default function Navbar() {
  const router = useRouter();
  const [navbarSession, setNavbarSession] = useState<any>(null);
  const [role, setRole] = useState<string>('Franchisee');
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHomePage = router.pathname === '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setNavbarSession(data.session);
      if (data.session) {
        fetchUserRole(data.session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setNavbarSession(session);
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
      .select('role, is_admin')
      .eq('id', userId)
      .single();

    if (data) {
      setRole(data.role || 'Franchisee');
      setIsAdmin(!!data.is_admin || data.role === 'administrator');
    }
  };

  const userGreeting = navbarSession
    ? `${navbarSession.user?.user_metadata?.full_name || 'User'}_${role}`
    : 'Calon Franchisee';

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex items-center justify-between relative z-50">
        {/* Logo FranchiseHub */}
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

        {/* Kolom Pencarian (hanya jika bukan homepage) */}
        {!isHomePage && (
          <div className="flex-1 mx-6 lg:mx-12">
            <input
              type="text"
              placeholder="Cari franchise..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        {/* Kanan: Salam → Dashboard Franchisor/Administrator → Menu Burger */}
        <div className="flex items-center space-x-3">
          <p className="italic text-gray-500 text-sm">Halo, {userGreeting}!</p>

          {/* Dashboard Franchisor (🎩) */}
          {role === 'franchisor' && (
            <button
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 text-blue-700 font-medium transition"
              onClick={() => router.push('/franchisor/dashboard')}
              title="Dashboard Franchisor"
            >
              <span className="text-lg">🎩</span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          {/* Dashboard Administrator (🃏) */}
          {isAdmin && (
            <button
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-pink-100 text-pink-700 font-medium transition"
              onClick={() => router.push('/admin')}
              title="Dashboard Administrator"
            >
              <span className="text-lg">🃏</span>
              <span className="hidden sm:inline">Administrator</span>
            </button>
          )}

          {/* Burger Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="text-2xl"
            aria-label="Buka menu"
          >
            ☰
          </button>
        </div>
      </nav>
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
