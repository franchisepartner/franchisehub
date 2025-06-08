// pages/index.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
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
interface Blog {
  id: string;
  title: string;
  cover_url: string;
  category: string;
  created_at: string;
  slug: string;
}
interface Thread {
  id: string;
  title: string;
  created_at: string;
  slug: string;
}

export default function Home() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [banners, setBanners] = useState<string[]>([]);

  useEffect(() => {
    // Fetch franchise (max 6)
    const fetchFranchises = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error && data) {
        const franchisesWithImages = await Promise.all(
          data.map(async (franchise) => {
            let logoUrl = '';
            if (franchise.logo_url) {
              const { data: signed } = await supabase
                .storage
                .from('listing-images')
                .createSignedUrl(franchise.logo_url, 60 * 60);
              logoUrl = signed?.signedUrl || '';
            }
            return { ...franchise, logo_url: logoUrl };
          })
        );
        setFranchises(franchisesWithImages);
      }
    };

    // Fetch blog (max 6)
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, cover_url, category, created_at, slug')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error && data) {
        const blogsWithCovers = await Promise.all(
          data.map(async (blog) => {
            let coverUrl = '';
            if (blog.cover_url) {
              const { data: signed } = await supabase
                .storage
                .from('blog-assets')
                .createSignedUrl(blog.cover_url, 60 * 60);
              coverUrl = signed?.signedUrl || '';
            }
            return { ...blog, cover_url: coverUrl };
          })
        );
        setBlogs(blogsWithCovers);
      }
    };

    // Fetch thread/forum (max 6)
    const fetchThreads = async () => {
      const { data, error } = await supabase
        .from('threads')
        .select('id, title, created_at, slug')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error && data) setThreads(data);
    };

    // Fetch banners from private bucket, signed URL
    const fetchBanners = async () => {
      const { data, error } = await supabase.storage
        .from('homepage-banners')
        .list('', { limit: 20, sortBy: { column: 'name', order: 'asc' } });
      if (!error && data) {
        const promises = data
          .filter(item => item.name.match(/\.(jpg|jpeg|png|webp)$/i))
          .map(async (item) => {
            const { data: signed } = await supabase
              .storage
              .from('homepage-banners')
              .createSignedUrl(item.name, 60 * 60);
            return signed?.signedUrl || '';
          });
        const urls = (await Promise.all(promises)).filter(Boolean);
        setBanners(urls);
      }
    };

    setLoading(true);
    Promise.all([fetchBanners(), fetchFranchises(), fetchBlogs(), fetchThreads()])
      .finally(() => setLoading(false));
  }, []);

  // === Data Menu Fitur (COPY dari versi terbaikmu sebelumnya) ===
  const featureMenus = [
    {
      label: 'Pengumuman',
      href: '/announcement',
      bg: 'bg-yellow-400',
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 7v4.95a3 3 0 01-1.19 2.38l-2.54 2.03a1 1 0 00-.27.32l-1.37 2.44A1 1 0 0112 20h0a1 1 0 01-.87-.5l-1.36-2.43a1 1 0 00-.27-.32l-2.54-2.03A3 3 0 015 11.95V7m14 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 0H5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Forum Global',
      href: '/forum-global',
      bg: 'bg-green-400',
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Blog Global',
      href: '/blog-global',
      bg: 'bg-purple-400',
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 20h9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 20V4a2 2 0 00-2-2H7a2 2 0 00-2 2v16l5-2.18L15 20z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Pusat Bantuan',
      href: '/pusat-bantuan',
      bg: 'bg-blue-400',
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth={2}/>
          <path d="M12 16v.01M12 12a4 4 0 10-4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'S&K',
      href: '/syarat-ketentuan',
      bg: 'bg-gray-700',
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2}/>
          <path d="M8 8h8M8 12h8M8 16h4" strokeWidth={2} strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Kebijakan Privasi',
      href: '/privacy',
      bg: 'bg-green-600',
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 2L4 6v6c0 5.523 3.582 10 8 10s8-4.477 8-10V6l-8-4z" strokeWidth={2}/>
        </svg>
      ),
    },
    {
      label: 'Jadi Franchisor',
      href: '/franchisor',
      bg: 'bg-teal-500',
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="7" r="4" strokeWidth={2}/>
          <path d="M6 21v-2a4 4 0 018 0v2" strokeWidth={2}/>
        </svg>
      ),
    },
    {
      label: 'Kalkulator',
      href: '#',
      bg: 'bg-pink-400',
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2}/>
          <path d="M8 6h8M8 10h8M8 14h8M8 18h4" strokeWidth={2}/>
        </svg>
      ),
      action: () => setShowCalculatorModal(true),
    },
  ];

  return (
    <div className="relative min-h-screen bg-white">
      {/* ======= SWIPER BANNER DARI STORAGE ======= */}
      <div className="relative w-full h-[300px] sm:h-[340px] md:h-[420px] lg:h-[500px] overflow-visible pb-16 bg-white">
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          navigation
          className="w-full h-full"
        >
          {banners.length === 0 ? (
            <SwiperSlide>
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-lg">
                Tidak ada banner
              </div>
            </SwiperSlide>
          ) : (
            banners.map((url, i) => (
              <SwiperSlide key={i}>
                <img
                  src={url}
                  alt={`Banner ${i + 1}`}
                  className="object-cover w-full h-full"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </SwiperSlide>
            ))
          )}
        </Swiper>
        {/* Kotak Search */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-full max-w-3xl px-4 sm:px-6 lg:px-8 z-20">
          <div className="bg-white rounded-xl shadow-lg p-4 relative">
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

      {/* ======= MENU FITUR ======= */}
      <section className="relative mt-14 mb-6 z-20">
        <div className="w-full flex justify-center">
          <div
            className="
              flex gap-4 overflow-x-auto
              px-2 pb-2 pt-1
              max-w-full
              sm:justify-center
              scrollbar-thin scrollbar-thumb-gray-200
            "
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {featureMenus.map((menu, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[90px] max-w-[100px]">
                <button
                  onClick={
                    menu.action
                      ? menu.action
                      : () => window.location.href = menu.href
                  }
                  className={`
                    ${menu.bg}
                    rounded-full shadow-lg flex items-center justify-center
                    w-16 h-16 md:w-16 md:h-16 mb-1 focus:outline-none
                    transition hover:scale-105 active:scale-95
                  `}
                  aria-label={menu.label}
                >
                  {menu.icon}
                </button>
                <span className="block text-center text-xs font-medium text-gray-700 mt-1 truncate w-full">
                  {menu.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= MODAL KALKULATOR ======= */}
      <CalculatorModal show={showCalculatorModal} setShow={setShowCalculatorModal} />

      {/* ======= DAFTAR FRANCHISE: Swiper Card ======= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Daftar Franchise</h2>
          <Link href="/franchise-list" passHref>
            <span className="text-sm text-blue-600 hover:underline cursor-pointer font-medium flex items-center gap-1">
              Lihat Semua &rarr;
            </span>
          </Link>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Memuat daftar franchise...</p>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation
            loop={franchises.length > 2}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1.1 },
              640: { slidesPerView: 2.15 },
              900: { slidesPerView: 3.1 },
            }}
            className="pb-2"
          >
            {franchises.map((fr) => (
              <SwiperSlide key={fr.id}>
                <Link href={`/franchise/${fr.slug}`} passHref>
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
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

      {/* ======= DAFTAR BLOG: Swiper Card ======= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Blog Bisnis</h2>
          <Link href="/blog-global" passHref>
            <span className="text-sm text-blue-600 hover:underline cursor-pointer font-medium flex items-center gap-1">
              Lihat Semua &rarr;
            </span>
          </Link>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Memuat blog...</p>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation
            loop={blogs.length > 2}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1.1 },
              640: { slidesPerView: 2.15 },
              900: { slidesPerView: 3.1 },
            }}
            className="pb-2"
          >
            {blogs.map((blog) => (
              <SwiperSlide key={blog.id}>
                <Link href={`/detail/${blog.slug}`} passHref>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer">
                    <div className="relative h-48">
                      <img
                        src={blog.cover_url}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-purple-500 text-xs font-semibold text-white px-2 py-1 rounded">
                        {blog.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {blog.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(blog.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

      {/* ======= DAFTAR FORUM: Swiper Card ======= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Forum Global</h2>
          <Link href="/forum-global" passHref>
            <span className="text-sm text-blue-600 hover:underline cursor-pointer font-medium flex items-center gap-1">
              Lihat Semua &rarr;
            </span>
          </Link>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Memuat forum...</p>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation
            loop={threads.length > 2}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1.1 },
              640: { slidesPerView: 2.15 },
              900: { slidesPerView: 3.1 },
            }}
            className="pb-2"
          >
            {threads.map((thread) => (
              <SwiperSlide key={thread.id}>
                <Link href={`/forum-global/${thread.slug}`} passHref>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {thread.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(thread.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
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

// ========== MODAL KALKULATOR =============
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
function Calculator() {
  const [display, setDisplay] = useState<string>('0');
  const handleButton = (val: string) => {
    if (val === 'C') setDisplay('0');
    else if (val === '=') {
      try {
        const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
        setDisplay(String(eval(sanitized)));
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
      <div className="w-full bg-gray-100 rounded-md p-3 text-right text-2xl font-mono mb-4">{display}</div>
      <div className="w-full grid grid-cols-4 gap-2">
        {buttons.flat().map((btn, idx) =>
          btn === '' ? <div key={idx} /> : (
            <button
              key={idx}
              onClick={() => handleButton(btn)}
              className="bg-gray-200 hover:bg-gray-300 rounded-md py-2 text-lg font-medium"
            >{btn}</button>
          )
        )}
      </div>
    </div>
  );
}
