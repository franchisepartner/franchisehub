// pages/admin/index.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.push('/');
        return;
      }

      // **Cek ke tabel profiles (lebih aman, update jika perlu)**
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const currentRole = profile?.role || data.user.user_metadata?.role;
      if (!currentRole || currentRole.toLowerCase() !== 'administrator') {
        router.push('/');
      } else {
        setRole(currentRole);
      }
      setLoading(false);
    };
    checkUserRole();
  }, [router]);

  if (loading || role?.toLowerCase() !== 'administrator') {
    return <div className="p-8 text-center text-gray-500">Memuat...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Administrator</h1>

      {/* Tombol Fitur Admin */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <a
          href="/admin/manage-homepage-banners"
          className="flex-1 flex items-center justify-center px-5 py-4 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 text-white font-bold shadow-lg hover:scale-105 transition"
        >
          <span className="text-2xl mr-3">🎨</span>
          Kelola Banner Homepage
        </a>
        <a
          href="/admin/franchisor-approvals"
          className="flex-1 flex items-center justify-center px-5 py-4 rounded-lg bg-gradient-to-br from-green-400 to-teal-500 text-white font-bold shadow-lg hover:scale-105 transition"
        >
          <span className="text-2xl mr-3">✅</span>
          Persetujuan Pengajuan Jadi Franchisor
        </a>
      </div>
    </div>
  );
}
