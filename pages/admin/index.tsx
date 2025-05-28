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

      const currentRole = data.user.user_metadata?.role;
      console.log('Current Role:', currentRole); // Debugging (boleh hapus)

      if (currentRole?.toLowerCase() !== 'administrator') {
        router.push('/');
      } else {
        setRole(currentRole);
      }

      setLoading(false);
    };

    checkUserRole();
  }, [router]);

  if (loading || role?.toLowerCase() !== 'administrator') {
    return null; // atau bisa return <p>Memuat...</p> jika ingin feedback visual
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Administrator</h1>
      <ul className="space-y-4">
        <li>
          <a href="/admin/franchisor-approvals" className="text-blue-600 underline">
            Persetujuan Pengajuan Jadi Franchisor
          </a>
        </li>
      </ul>
    </div>
  );
}
