import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import BurgerMenu from './BurgerMenu';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>('Franchisee');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchUserRole(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

    return () => listener?.subscription.unsubscribe();
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
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="text-xl font-bold text-blue-600">FranchiseHub</Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-2xl"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        <div className="w-full">
          <input
            type="text"
            placeholder="Cari franchise..."
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="w-full flex justify-end items-center text-sm">
          <p className="italic text-gray-500">Halo, {userGreeting}!</p>
        </div>
      </nav>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
