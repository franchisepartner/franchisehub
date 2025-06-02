// pages/index.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

// ==== IMPORT SWIPER ====
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
  logo_url: string; // URL publik gambar logo dari Supabase Storage
  slug: string;     // Digunakan untuk halaman detail franchise
}

export default function Home() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'dijual' | 'disewa' | 'baru'>('dijual');

  useEffect(() => {
    const fetchFranchises = async () => {
      // Ambil data list franchise dari Supabase
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchises:', error);
      } else if (data) {
        // Konversi setiap franchise.logo_url menjadi URL publik Supabase Storage
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

  return (
    <div className="w-full">
      {/* =============================
          SECTION: Banner Carousel + Kurva
         ============================= */}
      <div className="relative w-full h-[280px] sm:h-[320px] md:h-[420px] lg:h-[540px] overflow-hidden">
        {/* ==== Swiper Carousel ==== */}
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          navigation
          className="w-full h-full"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <Image
              src="/banner-franchisehub.PNG"
              alt="Banner FranchiseHub 1"
              fill
              className="object-cover"
            />
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <Image
              src="/banner-franchisehub1.PNG"
              alt="Banner FranchiseHub 2"
              fill
              className="object-cover"
            />
          </SwiperSlide>

          {/* Slide 3 */}
          <SwiperSlide>
            <Image
              src="/banner-franchisehub2.PNG"
              alt="Banner FranchiseHub 3"
              fill
              className="object-cover"
            />
          </SwiperSlide>

          {/* Tambahkan <SwiperSlide> lagi bila ada gambar tambahan */}
        </Swiper>

        {/* ==== Kurva putih di pojok kiri bawah ==== */}
        <div className="absolute bottom-0 left-0 w-40 h-20 bg-white rounded-tl-full"></div>
      </div>

      {/*
        ====================================================
        SECTION: Search Bar (di luar container overflow-hidden)
        ====================================================
        Kita pakai -mt-16 (−64px) agar search bar “menempel” 
        tepat di atas kurva putih (h-20 = 80px). 
        Tambahkan z-20 agar tidak tertutup carousel.
      */}
      <div className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-3xl mx-auto">
          {/* ==== Tabs: Dijual / Disewa / Properti Baru ==== */}
          <div className="flex">
            <button
              onClick={() => setTab('dijual')}
              className={`flex-1 py-3 text-center font-medium rounded-t-xl ${
                tab === 'dijual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Dijual
            </button>
            <button
              onClick={() => setTab('disewa')}
              className={`flex-1 py-3 text-center font-medium rounded-t-xl ${
                tab === 'disewa'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Disewa
            </button>
            <button
              onClick={() => setTab('baru')}
              className={`flex-1 py-3 text-center font-medium rounded-t-xl ${
                tab === 'baru'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Properti Baru
            </button>
          </div>

          {/* ==== Form Pencarian ==== */}
          <form className="mt-4 flex space-x-2">
            <input
              type="text"
              placeholder={
                tab === 'dijual'
                  ? 'Cari franchise untuk dijual...'
                  : tab === 'disewa'
                  ? 'Cari franchise untuk disewa...'
                  : 'Cari properti baru...'
              }
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

      {/* Spacer agar konten selanjutnya tidak tertutup */}
      <div className="h-24 md:h-28 lg:h-32"></div>

      {/* ======================================
          SECTION: Menu Utama (scrollable horizontal)
         ====================================== */}
      <section className="w-full overflow-x-auto whitespace-nowrap py-6 px-4 sm:px-6 lg:px-8">
        <div className="inline-flex space-x-6">
          {[
            {
              label: 'Notifikasiku',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V9a6 6 0 10-12 0v7l-2 2v1h16v-1l-2-2z" />
                </svg>
              ),
            },
            {
              label: 'Favoritku',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 15l7 7 7-7V5a2 2 0 00-2-2h-10a2 2 0 00-2 2v10z" />
                </svg>
              ),
            },
            {
              label: 'Forum Global',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                </svg>
              ),
            },
            {
              label: 'Blog Global',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ),
            },
            {
              label: 'Pusat Bantuan',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                </svg>
              ),
            },
            {
              label: 'Syarat & Ketentuan',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 5v14h14V5H5z" />
                  <path d="M9 9h6v6H9z" />
                </svg>
              ),
            },
            {
              label: 'Kebijakan Privasi',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 2L4 6v6c0 5.523 3.582 10 8 10s8-4.477 8-10V6l-8-4z" />
                </svg>
              ),
            },
            {
              label: 'Jadi Franchisor',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8c-1.657 0-3 1.343-3 3 0 3 3 7 3 7s3-4 3-7c0-1.657-1.343-3-3-3z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.label} className="inline-flex flex-col items-center justify-center w-24">
              <div className="bg-white rounded-full shadow-md p-4">{item.icon}</div>
              <span className="text-xs text-gray-600 mt-1 text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =================================
          SECTION: Daftar Franchise (Grid)
         ================================= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
                    <h3 className="text-lg font-semibold text-gray-800">
                      {fr.franchise_name}
                    </h3>
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

      {/* ==========
          SECTION: Footer
         ========== */}
      <footer className="mt-16 bg-gray-800 text-white py-12">
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
              <li>
                <a href="#" className="hover:underline">Cari Agen</a>
              </li>
              <li>
                <a href="#" className="hover:underline">Iklankan Franchise</a>
              </li>
              <li>
                <a href="#" className="hover:underline">Jual Franchise</a>
              </li>
              <li>
                <a href="#" className="hover:underline">Simulasi Investasi</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kontak Kami</h4>
            <p className="text-sm text-gray-300">Email: support@franchisehub.co.id</p>
            <p className="text-sm text-gray-300">Telepon: +62 812 3456 7890</p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="hover:text-gray-400">{/* Facebook */}</a>
              <a href="#" className="hover:text-gray-400">{/* Twitter */}</a>
              <a href="#" className="hover:text-gray-400">{/* Instagram */}</a>
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
