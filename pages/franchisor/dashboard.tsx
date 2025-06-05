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

      const { data: visits } = await supabase.rpc('get_visit_stats', { owner: user.id });

      setVisitStats(visits || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Mapping label ke route path
  const routeMap: Record<string, string> = {
    'Kelola Listing': '/franchisor/manage-listings',
    'Tambah Listing Baru': '/franchisor/manage-listings/new',
    'Panduan Regulasi Waralaba': '/panduan-regulasi-waralaba',
    'Posting Blog Bisnis': '/franchisor/blogs',
  };

  // Fungsi handler klik tombol
  const handleClick = (label: string) => {
    const route = routeMap[label];
    if (route) {
      router.push(route);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Dashboard Franchisor</h1>
      <p className="text-gray-700 mb-6">Selamat Datang, {fullName} 👋</p>
      <div className="w-full h-44 bg-gray-200 rounded-lg flex items-center justify-center mb-8">
        <span className="text-gray-500">[Carousel Preview]</span>
      </div>

      {/* Tombol Fitur Horizontal dengan scroll */}
      <div className="flex space-x-6 overflow-x-auto mb-10 no-scrollbar py-2">
        {[
          { label: 'Kelola Listing', color: 'bg-white text-gray-800' },
          { label: 'Tambah Listing Baru', color: 'bg-white text-gray-800' },
          { label: 'Panduan Regulasi Waralaba', color: 'bg-white text-gray-800' },
          { label: 'Posting Blog Bisnis', color: 'bg-white text-gray-800' },
        ].map(({ label, color }) => (
          <button
            key={label}
            className={`${color} font-semibold rounded-lg shadow-md hover:shadow-lg transition aspect-square flex items-center justify-center text-center text-lg min-w-[140px] flex-shrink-0`}
            onClick={() => handleClick(label)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Statistik Kunjungan */}
      <h2 className="text-xl font-semibold mb-4">Statistik Kunjungan</h2>
      <div className="bg-white shadow p-6 rounded-lg min-h-[320px]">
        {loading ? (
          <p>Memuat grafik...</p>
        ) : (
          <>
            <BarChart data={visitStats} />
            <ul className="mt-6 space-y-2 text-gray-700 text-base">
              {visitStats.map((v, i) => (
                <li key={i}>
                  {v.role === 'calon_franchisee'
                    ? 'Calon Franchisee'
                    : v.role.charAt(0).toUpperCase() + v.role.slice(1)}{' '}
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
