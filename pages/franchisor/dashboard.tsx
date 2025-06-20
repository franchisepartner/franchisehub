import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FaListAlt, FaPlus, FaBook, FaPenNib, FaCalculator, FaRegClock } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

function AdvancedCalculatorModal({ show, onClose }: { show: boolean, onClose: () => void }) {
  const [display, setDisplay] = useState<string>('0');
  const handleButton = (val: string) => {
    if (val === 'C') setDisplay('0');
    else if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        setDisplay(String(eval(display.replace(/×/g, '*').replace(/÷/g, '/'))));
      } catch { setDisplay('Error'); }
    } else setDisplay(display === '0' ? val : display + val);
  };
  const buttons: string[][] = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', 'C', '+'],
    ['(', ')', '=', '']
  ];
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white max-w-sm w-full rounded-xl shadow-xl p-6 relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-xl" onClick={onClose}>×</button>
        <h2 className="text-xl font-semibold mb-3">Kalkulator</h2>
        <div className="bg-gray-100 rounded-md p-3 text-right text-2xl font-mono mb-4">{display}</div>
        <div className="w-full grid grid-cols-4 gap-2">
          {buttons.flat().map((btn, idx) =>
            btn === '' ? <div key={idx} /> : (
              <button key={idx} onClick={() => handleButton(btn)}
                className="bg-gray-200 hover:bg-blue-200 rounded-md py-2 text-lg font-medium">{btn}</button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardFranchisor() {
  const [fullName, setFullName] = useState('');
  const [visitStats, setVisitStats] = useState<any[]>([]);
  const [roleStats, setRoleStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  const [showCalc, setShowCalc] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/');
      const { user } = session;

      // Profile franchisor
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      setFullName(profile?.full_name || 'Franchisor');

      // Statistik kunjungan harian (grafik utama)
      setLoadingStats(true);
      const { data: daily, error: errDaily } = await supabase.rpc('get_daily_visits_by_owner', { owner_id: user.id });
      setVisitStats(daily || []);

      // Statistik per role (tabel baru)
      const { data: perRole, error: errRole } = await supabase.rpc('get_daily_visits_by_owner_with_roles', { owner_id: user.id });
      setRoleStats(perRole || []);
      setLoadingStats(false);

      // Showcase carousel: listing + blog
      const { data: rawListings } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, logo_url, slug, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      const listings = (rawListings || []).map(item => ({
        ...item,
        logo_url: item.logo_url ? supabase.storage.from('listing-images').getPublicUrl(item.logo_url).data.publicUrl : '',
        type: 'listing',
        title: item.franchise_name,
      }));

      const { data: blogs } = await supabase
        .from('blogs')
        .select('id, title, cover_url, slug, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      const blogItems = (blogs || []).map(item => ({
        ...item,
        type: 'blog',
        logo_url: '',
        cover_url: item.cover_url,
        title: item.title,
      }));

      const combined = [...listings, ...blogItems];
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setCarouselItems(combined.slice(0, 8));
    };
    fetchData();
  }, []);

  const features = [
    { label: 'Kelola Listing', icon: <FaListAlt size={48} />, route: '/franchisor/manage-listings' },
    { label: 'Tambah Listing Baru', icon: <FaPlus size={48} />, route: '/franchisor/manage-listings/new' },
    { label: 'Panduan Regulasi Waralaba', icon: <FaBook size={48} />, route: '/franchisor/panduan-waralaba' },
    { label: 'Posting Blog Bisnis', icon: <FaPenNib size={48} />, route: '/blog/manage' },
    { label: 'Kalkulator', icon: <FaCalculator size={48} />, isModal: true },
    { label: 'Masa Langganan', icon: <FaRegClock size={48} />, route: '/franchisor/subscription-status' },
  ];

  const handleClick = (route: string | undefined, isModal?: boolean) => {
    if (isModal) setShowCalc(true);
    else if (route) router.push(route);
  };

  return (
    <div className="relative min-h-screen">
      {/* Motif batik layer di bawah navbar */}
      <div className="absolute top-0 left-0 w-full h-44 z-0">
        <Image
          src="/batik-dashboard-bar.PNG"
          alt="Motif Batik"
          fill
          className="object-cover"
          style={{ opacity: 0.14 }}
          priority
        />
      </div>

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">Dashboard Franchisor</h1>
        <p className="text-gray-700 mb-6">Selamat Datang, {fullName} 👋</p>
        {/* Showcase Karya */}
        <h2 className="text-xl font-semibold mb-2">Showcase Karya</h2>
        <div className="w-full h-48 bg-white/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-8 overflow-hidden shadow-inner relative">
          {carouselItems.length === 0 ? (
            <span className="text-gray-500">Belum ada karya yang ditampilkan</span>
          ) : (
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop={true}
              spaceBetween={16}
              breakpoints={{
                0:    { slidesPerView: 1 },
                640:  { slidesPerView: 3 },
              }}
              style={{ width: '100%', height: '100%' }}
            >
              {carouselItems.map(item => (
                <SwiperSlide key={item.id} style={{ height: '100%' }}>
                  <div
                    className="bg-white h-full w-full rounded-xl shadow-md flex flex-col overflow-hidden cursor-pointer transition hover:shadow-lg p-2"
                    style={{ height: '176px', width: '260px', margin: 'auto' }}
                    onClick={() =>
                      item.type === 'listing'
                        ? router.push(`/franchise/${item.slug}`)
                        : router.push(`/detail/${item.slug}`)
                    }
                  >
                    <img
                      src={
                        item.type === 'listing'
                          ? item.logo_url || '/logo192.png'
                          : item.cover_url || '/logo192.png'
                      }
                      alt={item.title}
                      className="h-24 w-full object-cover rounded-t-lg bg-white"
                      loading="lazy"
                    />
                    <div className="flex-1 px-2 pt-2 flex flex-col justify-between">
                      <div className="font-bold text-base truncate">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1 px-2 py-0.5 bg-gray-100 rounded inline-block w-max">
                        {item.type === 'listing' ? 'Listing' : 'Blog'}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Tombol fitur */}
        <div className="flex space-x-6 overflow-x-auto no-scrollbar py-2 mb-10">
          {features.map(({ label, icon, route, isModal }) => (
            <button
              key={label}
              onClick={() => handleClick(route, isModal)}
              className="bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition flex flex-col items-center justify-start text-center text-lg flex-shrink-0"
              style={{ width: 160, height: 160 }}
            >
              <div className="mb-3">{icon}</div>
              <span className="mt-2 text-center text-base break-words leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* Statistik Kunjungan Utama */}
        <h2 className="text-xl font-semibold mb-4">Statistik Kunjungan</h2>
        <div className="bg-white shadow p-6 rounded-lg min-h-[320px]">
          {loadingStats ? (
            <p>Memuat grafik statistik kunjungan...</p>
          ) : visitStats.length === 0 ? (
            <p>Belum ada data kunjungan.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visitStats}>
                  <XAxis dataKey="visit_date" tickFormatter={d => new Date(d).toLocaleDateString()} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="visit_count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              <table className="w-full mt-6 border text-sm">
                <thead>
                  <tr>
                    <th className="border px-2">Tanggal</th>
                    <th className="border px-2">Jumlah Kunjungan</th>
                  </tr>
                </thead>
                <tbody>
                  {visitStats.map(({ visit_date, visit_count }) => (
                    <tr key={visit_date}>
                      <td className="border px-2">{new Date(visit_date).toLocaleDateString()}</td>
                      <td className="border px-2">{visit_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Statistik Per Role */}
          <h3 className="text-lg font-semibold mt-10 mb-2">Tabel Kunjungan Per Role</h3>
          {roleStats.length === 0 ? (
            <p className="text-gray-500 mb-6">Belum ada data kunjungan per role.</p>
          ) : (
            <table className="w-full mb-2 border text-sm">
              <thead>
                <tr>
                  <th className="border px-2">Tanggal</th>
                  <th className="border px-2">Role Pengunjung</th>
                  <th className="border px-2">Jumlah Kunjungan</th>
                </tr>
              </thead>
              <tbody>
                {roleStats.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border px-2">{new Date(row.visit_date).toLocaleDateString()}</td>
                    <td className="border px-2">{row.viewer_role}</td>
                    <td className="border px-2">{row.visit_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <AdvancedCalculatorModal show={showCalc} onClose={() => setShowCalc(false)} />
    </div>
  );
}
