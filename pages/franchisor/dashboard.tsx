import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Import ikon dari react-icons
import { FaListAlt, FaPlus, FaBook, FaPenNib } from 'react-icons/fa';

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

  const features = [
    { label: 'Kelola Listing', icon: <FaListAlt size={48} />, route: '/franchisor/manage-listings' },
    { label: 'Tambah Listing Baru', icon: <FaPlus size={48} />, route: '/franchisor/manage-listings/new' },
    { label: 'Panduan Regulasi Waralaba', icon: <FaBook size={48} />, route: '/panduan-regulasi-waralaba' },
    { label: 'Posting Blog Bisnis', icon: <FaPenNib size={48} />, route: '/blog/manage' },
  ];

  const handleClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Dashboard Franchisor</h1>
      <p className="text-gray-700 mb-6">Selamat Datang, {fullName} 👋</p>
      <div className="w-full h-44 bg-gray-200 rounded-lg flex items-center justify-center mb-8">
        <span className="text-gray-500">[Carousel Preview]</span>
      </div>

      {/* Tombol fitur horizontal scroll */}
      <div className="flex space-x-6 overflow-x-auto no-scrollbar py-2 mb-10">
        {features.map(({ label, icon, route }) => (
          <button
            key={label}
            onClick={() => handleClick(route)}
            className="bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-start text-center text-lg flex-shrink-0"
            style={{ width: 160, height: 160 }}
          >
            <div className="mb-3">{icon}</div>
            <span className="overflow-hidden text-ellipsis max-h-[4.5rem] block">{label}</span>
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
