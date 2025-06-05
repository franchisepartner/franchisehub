// pages/franchisor/dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('../../components/BarChart'), { ssr: false });

export default function DashboardFranchisor() {
  const [fullName, setFullName] = useState('');
  const [visitStats, setVisitStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return router.push('/');

      const { user } = session;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setFullName(profile?.full_name || 'Franchisor');

      const { data: visits } = await supabase
        .from('visit_logs')
        .select('role, count')
        .eq('owner_id', user.id);

      setVisitStats(visits || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Dashboard Franchisor</h1>
      <p className="mt-1 text-gray-600">Selamat Datang, {fullName} 👋</p>
      <div className="my-4 border-b-2 border-black" />

      {/* Carousel Placeholder */}
      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
        <span className="text-gray-500">[Carousel Preview]</span>
      </div>

      {/* Fitur Tombol */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <button className="bg-blue-500 text-white py-3 rounded-lg">Kelola Listing</button>
        <button className="bg-green-500 text-white py-3 rounded-lg">Tambah Listing Baru</button>
        <button className="bg-yellow-500 text-white py-3 rounded-lg">Edit Profil</button>
        <button className="bg-indigo-500 text-white py-3 rounded-lg">Lihat Statistik Leads</button>
        <button className="bg-purple-500 text-white py-3 rounded-lg">Panduan Regulasi Waralaba</button>
        <button className="bg-pink-500 text-white py-3 rounded-lg">Posting Blog Bisnis</button>
      </div>

      {/* Statistik Kunjungan */}
      <h2 className="text-xl font-semibold mb-2">Statistik Kunjungan</h2>
      <div className="bg-white shadow p-4 rounded-lg">
        {loading ? (
          <p>Memuat grafik...</p>
        ) : (
          <>
            <BarChart data={visitStats} />
            <ul className="mt-4 space-y-1 text-sm text-gray-700">
              {visitStats.map((v, i) => (
                <li key={i}>
                  {v.role === 'anonymous' ? 'Calon Franchisee/Anonymous' : v.role.charAt(0).toUpperCase() + v.role.slice(1)}{' '}
                  {v.count} 👁️
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
