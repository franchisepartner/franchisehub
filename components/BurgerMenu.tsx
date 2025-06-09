import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BurgerMenu({ open, onClose }: Props) {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    async function fetchRole() {
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile && !error) setRole(profile.role);
      }
    }
    fetchRole();
  }, [session]);

  const fullName = session?.user?.user_metadata?.full_name || 'User';
  const avatar = session?.user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    location.href = '/';
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl rounded-l-3xl transition-transform duration-300 z-[9999]
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ boxShadow: '0 6px 32px 0 rgba(50, 98, 177, 0.13)' }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 border-b rounded-t-3xl">
        <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight">Menu</h2>
        <button onClick={onClose} className="text-3xl font-bold text-gray-400 hover:text-red-500 transition">
          &times;
        </button>
      </div>

      {/* AVATAR & USER */}
      <div className="p-6 flex flex-col items-center border-b space-y-3">
        {avatar && (
          <Image src={avatar} alt="User Avatar" width={68} height={68} className="rounded-full border shadow" />
        )}
        {session && (
          <p className="text-blue-600 font-semibold text-base text-center break-all">
            {`${fullName}_${role}`}
          </p>
        )}
      </div>

      {/* MENU */}
      <ul className="flex flex-col gap-4 px-6 py-7 text-base font-medium">
        <li>
          <Link href="/announcement" onClick={onClose} className="flex items-center gap-3 hover:text-blue-700 transition">
            <span className="text-xl">📣</span> Pengumuman
          </Link>
        </li>
        <li>
          <Link href="/forum-global" onClick={onClose} className="flex items-center gap-3 hover:text-blue-700 transition">
            <span className="text-xl">🌐</span> Forum Global
          </Link>
        </li>
        <li>
          <Link href="/blog-global" onClick={onClose} className="flex items-center gap-3 hover:text-blue-700 transition">
            <span className="text-xl">📝</span> Blog Global
          </Link>
        </li>
        <li>
          <Link href="/pusat-bantuan" onClick={onClose} className="flex items-center gap-3 hover:text-blue-700 transition">
            <span className="text-xl">❓</span> Pusat Bantuan
          </Link>
        </li>
        <li>
          <Link href="/syarat-ketentuan" onClick={onClose} className="flex items-center gap-3 hover:text-blue-700 transition">
            <span className="text-xl">📄</span> Syarat & Ketentuan
          </Link>
        </li>
        <li>
          <Link href="/privacy" onClick={onClose} className="flex items-center gap-3 hover:text-blue-700 transition">
            <span className="text-xl">🔒</span> Kebijakan Privasi
          </Link>
        </li>
      </ul>

      <div className="flex-1" />

      {/* LOGIN / LOGOUT */}
      <div className="px-6 pb-7 mt-2 flex flex-col gap-2">
        {session ? (
          <button
            onClick={handleLogout}
            className="w-full px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-base shadow hover:bg-red-700 transition"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className="w-full block text-center px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-700 transition"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
