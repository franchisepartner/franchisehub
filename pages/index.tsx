// pages/index.tsx

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { FaBullhorn, FaComments, FaBookOpen, FaLifeRing, FaFileContract, FaUserTie, FaCalculator, FaShieldAlt } from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Franchise {
  id: string;
  franchise_name: string;
  description: string;
  category: string;
  investment_min: number;
  location: string;
  logo_url: string;
  slug: string;
}

const MENU = [
  { label: "Pengumuman", icon: <FaBullhorn size={22} />, path: "/announcement" },
  { label: "Forum Global", icon: <FaComments size={22} />, path: "/forum-global" },
  { label: "Blog Global", icon: <FaBookOpen size={22} />, path: "/blog-global" },
  { label: "Pusat Bantuan", icon: <FaLifeRing size={22} />, path: "/pusat-bantuan" },
  { label: "S&K", icon: <FaFileContract size={22} />, path: "/syarat-ketentuan" },
  { label: "Kebijakan Privasi", icon: <FaShieldAlt size={22} />, path: "/privacy" },
  { label: "Jadi Franchisor", icon: <FaUserTie size={22} />, path: "/franchisor" },
  { label: "Kalkulator", icon: <FaCalculator size={22} />, path: "#calculator" }, // special action
];

export default function Home() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);

  useEffect(() => {
    const fetchFranchises = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchises:', error);
      } else if (data) {
        const franchisesWithImages = data.map((franchise) => ({
          ...franchise,
          logo_url:
            supabase
              .storage
              .from('listing-images')
              .getPublicUrl(franchise.logo_url)
              .data
              .publicUrl!,
        }));
        setFranchises(franchisesWithImages);
      }
      setLoading(false);
    };

    fetchFranchises();
  }, []);

  // Handler menu kalkulator
  const handleMenuClick = (menu: any) => {
    if (menu.path === '#calculator') setShowCalculatorModal(true);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* ======= BANNER + CAROUSEL ======= */}
      <div className="relative w-full h-[300px] sm:h-[340px] md:h-[420px] lg:h-[500px] overflow-visible pb-20 bg-white">
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          navigation
          className="w-full h-full"
        >
          <SwiperSlide>
            <Image src="/banner-franchisehub.PNG" alt="Banner FranchiseHub 1" fill className="object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <Image src="/banner-franchisehub1.PNG" alt="Banner FranchiseHub 2" fill className="object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <Image src="/banner-franchisehub2.PNG" alt="Banner FranchiseHub 3" fill className="object-cover" />
          </SwiperSlide>
        </Swiper>

        {/* Curve putih di pojok kiri bawah */}
        <div className="absolute bottom-0 left-0 w-40 h-20 bg-white rounded-tl-full"></div>

        {/* ======= KOTAK SEARCH ======= */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 w-full max-w-3xl px-4 sm:px-6 lg:px-8 z-20">
          <div className="bg-white rounded-xl shadow-lg p-4 relative">
            {/* Logo kecil di kanan atas tombol pencarian */}
            <div className="absolute -top-12 right-6 bg-white rounded-t-full overflow-hidden shadow-md">
              <Image
                src="/22C6DD46-5682-4FDD-998B-710D24A74856.png"
                alt="Logo FranchiseHub"
                width={60}
                height={60}
                className="rounded-t-full rounded-b-none object-cover shadow-md"
              />
            </div>
            <form className="flex space-x-2">
              <input
                type="text"
                placeholder="Cari franchise untuk dijual..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ======= MENU ICON RESPONSIF (SELALU DI TENGAH) ======= */}
      <section className="relative mt-20 bg-white z-10">
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 w-full max-w-2xl">
            {MENU.map(menu => (
              <div
                key={menu.label}
                className="flex flex-col items-center w-24 cursor-pointer select-none"
                onClick={() => menu.path === '#calculator' ? handleMenuClick(menu) : undefined}
              >
                <Link
                  href={menu.path === '#calculator' ? '#' : menu.path}
                  passHref
                  onClick={e => {
                    if (menu.path === '#calculator') {
                      e.preventDefault();
                      setShowCalculatorModal(true);
                    }
                  }}
                >
                  <div className="bg-white rounded-full shadow p-3 flex items-center justify-center mb-1 hover:bg-blue-50 transition">
                    {menu.icon}
                  </div>
                  <span className="text-xs text-gray-700 mt-0.5 text-center">{menu.label}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= MODAL KALKULATOR ======= */}
      <CalculatorModal show={showCalculatorModal} setShow={setShowCalculatorModal} />

      {/* ======= DAFTAR FRANCHISE ======= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Franchise</h2>
        {loading ? (
          <p className="text-center text-gray-500">Memuat daftar franchise...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {franchises.map((fr) => (
              <Link key={fr.id} href={`/franchise/${fr.slug}`} passHref>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer">
                  <div className="relative h-48">
                    <img
                      src={fr.logo_url}
                      alt={fr.franchise_name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-yellow-400 text-xs font-semibold text-black px-2 py-1 rounded">
                      {fr.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{fr.franchise_name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{fr.location}</p>
                    <p className="mt-2 text-sm text-gray-700">
                      Investasi Mulai: Rp {fr.investment_min.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-semibold mb-4">Tentang FranchiseHub</h4>
            <p className="text-sm text-gray-300">
              FranchiseHub adalah platform terdepan untuk menemukan dan mengelola peluang franchise.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Menu Cepat</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:underline">Cari Agen</a></li>
              <li><a href="#" className="hover:underline">Iklankan Franchise</a></li>
              <li><a href="#" className="hover:underline">Jual Franchise</a></li>
              <li><a href="#" className="hover:underline">Simulasi Investasi</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kontak Kami</h4>
            <p className="text-sm text-gray-300">Email: support@franchisehub.co.id</p>
            <p className="text-sm text-gray-300">Telepon: +62 812 3456 7890</p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="hover:text-gray-400">{/* Facebook */}</a>
              <a href="#" className="hover:text-gray-400">{/* Twitter  */}</a>
              <a href="#" className="hover:text-gray-400">{/* Instagram*/}</a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-400">
          &copy; 2025 FranchiseHub. Semua hak dilindungi.
        </div>
      </footer>
    </div>
  );
}

// ================== KOMONEN CALCULATOR MODAL ==================
interface CalculatorModalProps {
  show: boolean;
  setShow: (val: boolean) => void;
}
function CalculatorModal({ show, setShow }: CalculatorModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-md mx-auto p-6 relative">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Kalkulator Sederhana</h2>
        <Calculator />
      </div>
    </div>
  );
}

// ================== KOMONEN CALCULATOR SEDERHANA ==================
function Calculator() {
  const [display, setDisplay] = useState<string>('0');

  const handleButton = (val: string) => {
    if (val === 'C') setDisplay('0');
    else if (val === '=') {
      try {
        const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
        // eslint-disable-next-line no-eval
        const result = eval(sanitized);
        setDisplay(String(result));
      } catch {
        setDisplay('Error');
      }
    } else {
      setDisplay(display === '0' ? val : display + val);
    }
  };

  const buttons: string[][] = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', 'C', '+'],
    ['(', ')', '=', '']
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full bg-gray-100 rounded-md p-3 text-right text-2xl font-mono mb-4">
        {display}
      </div>
      <div className="w-full grid grid-cols-4 gap-2">
        {buttons.flat().map((btn, idx) => (
          btn === '' ? <div key={idx} /> :
          <button
            key={idx}
            onClick={() => handleButton(btn)}
            className="bg-gray-200 hover:bg-gray-300 rounded-md py-2 text-lg font-medium"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
