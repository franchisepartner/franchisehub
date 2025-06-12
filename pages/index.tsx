import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import {
  Megaphone, Globe, BookOpenText, LifeBuoy, FileSignature,
  ShieldCheck, UserPlus, Calculator as CalculatorIcon,
} from 'lucide-react';

interface Franchise {
  id: string;
  franchise_name: string;
  description: string;
  category: string;
  investment_min: number;
  location: string;
  logo_url: string;
  slug: string;
  tags?: string;
}
interface Blog {
  id: string;
  title: string;
  slug: string;
  cover_url: string;
  category: string;
  created_at: string;
}
interface Thread {
  id: string;
  title: string;
  image_url?: string;
  created_at: string;
}

export default function Home() {
  // BANNER DARI PUBLIC FOLDER
  const banners = [
    '/Banner1.PNG',
    '/Banner2.PNG',
    '/Banner3.PNG',
    // Tambah lagi jika perlu
  ];

  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFranchises = async () => {
      const { data } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug, tags')
        .order('created_at', { ascending: false })
        .limit(6);
      setFranchises(
        (data || []).map((franchise: Franchise) => ({
          ...franchise,
          logo_url: franchise.logo_url
            ? supabase.storage.from('listing-images').getPublicUrl(franchise.logo_url).data.publicUrl
            : '/logo192.png',
        }))
      );
    };
    const fetchBlogs = async () => {
      const { data } = await supabase
        .from('blogs')
        .select('id, title, slug, cover_url, category, created_at')
        .order('created_at', { ascending: false })
        .limit(6);
      setBlogs(
        (data || []).map((b: any) => ({
          ...b,
          cover_url: b.cover_url
            ? (b.cover_url.startsWith('http')
              ? b.cover_url
              : supabase.storage.from('blog-assets').getPublicUrl(b.cover_url).data.publicUrl)
            : '/logo192.png',
        }))
      );
    };
    const fetchThreads = async () => {
      const { data } = await supabase
        .from('threads')
        .select('id, title, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(6);
      setThreads(
        (data || []).map((t: any) => ({
          ...t,
          image_url: t.image_url
            ? (t.image_url.startsWith('http')
              ? t.image_url
              : supabase.storage.from('thread-images').getPublicUrl(t.image_url).data.publicUrl)
            : undefined,
        }))
      );
    };
    fetchFranchises();
    fetchBlogs();
    fetchThreads();
  }, []);

  const featureMenus = [
    { label: 'Pengumuman', href: '/announcement', bg: 'from-yellow-400 to-yellow-300', icon: <Megaphone className="h-7 w-7" /> },
    { label: 'Forum Global', href: '/forum-global', bg: 'from-green-400 to-green-300', icon: <Globe className="h-7 w-7" /> },
    { label: 'Blog Global', href: '/blog-global', bg: 'from-purple-500 to-purple-300', icon: <BookOpenText className="h-7 w-7" /> },
    { label: 'Pusat Bantuan', href: '/pusat-bantuan', bg: 'from-blue-500 to-blue-400', icon: <LifeBuoy className="h-7 w-7" /> },
    { label: 'S&K', href: '/syarat-ketentuan', bg: 'from-gray-700 to-gray-500', icon: <FileSignature className="h-7 w-7" /> },
    { label: 'Kebijakan Privasi', href: '/privacy', bg: 'from-green-600 to-green-400', icon: <ShieldCheck className="h-7 w-7" /> },
    { label: 'Jadi Franchisor', href: '/franchisor', bg: 'from-teal-500 to-teal-300', icon: <UserPlus className="h-7 w-7" /> },
    { label: 'Kalkulator', href: '#', bg: 'from-pink-500 to-pink-400', icon: <CalculatorIcon className="h-7 w-7" />, action: () => setShowCalculatorModal(true) },
  ];

  // UNIVERSAL SEARCH (autocomplete)
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setSelectedIdx(-1);
      return;
    }
    const term = searchTerm.toLowerCase();
    const results: any[] = [
      ...franchises.map((fr) => ({
        ...fr,
        type: 'franchise',
        label: fr.franchise_name,
        desc: fr.category,
        url: `/franchise/${fr.slug}`,
        img: fr.logo_url,
        tags: fr.tags || '',
      })),
      ...blogs.map((bl) => ({
        ...bl,
        type: 'blog',
        label: bl.title,
        desc: bl.category,
        url: `/detail/${bl.slug}`,
        img: bl.cover_url,
      })),
      ...threads.map((th) => ({
        ...th,
        type: 'thread',
        label: th.title,
        desc: 'Forum',
        url: `/forum-global?open=${th.id}`,
        img: th.image_url,
      })),
    ].filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        (item.desc && item.desc.toLowerCase().includes(term)) ||
        ('tags' in item && typeof item.tags === 'string' && item.tags.toLowerCase().includes(term))
    );
    setSearchResults(results.slice(0, 7));
    setSelectedIdx(-1);
  }, [searchTerm, franchises, blogs, threads]);

  useEffect(() => {
    if (!showSearchDropdown) return;
    function handleKey(e: KeyboardEvent) {
      if (searchResults.length === 0) return;
      if (e.key === 'ArrowDown') setSelectedIdx(idx => (idx + 1) % searchResults.length);
      else if (e.key === 'ArrowUp') setSelectedIdx(idx => (idx - 1 + searchResults.length) % searchResults.length);
      else if (e.key === 'Enter') {
        if (selectedIdx >= 0 && searchResults[selectedIdx]) {
          window.location.href = searchResults[selectedIdx].url;
        }
      } else if (e.key === 'Escape') setShowSearchDropdown(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showSearchDropdown, searchResults, selectedIdx]);

  return (
    <>
      <Head>
        <title>Franchise Nusantara — Pengembangan & Inovasi Masa Depan</title>
        <meta name="description" content="Franchise Nusantara adalah platform franchise modern Indonesia. Temukan, kelola, dan kembangkan bisnis franchise terbaik bersama kami." />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph & Twitter */}
        <meta property="og:title" content="Franchise Nusantara — Pengembangan & Inovasi Masa Depan" />
        <meta property="og:description" content="Franchise Nusantara adalah platform franchise modern Indonesia. Temukan, kelola, dan kembangkan bisnis franchise terbaik bersama kami." />
        <meta property="og:image" content="https://franchisenusantara.com/logo-og.png" />
        <meta property="og:url" content="https://franchisenusantara.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Franchise Nusantara — Pengembangan & Inovasi Masa Depan" />
        <meta name="twitter:description" content="Franchise Nusantara adalah platform franchise modern Indonesia. Temukan, kelola, dan kembangkan bisnis franchise terbaik bersama kami." />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      
    <div className="relative min-h-screen bg-white">
      {/* ==== BANNER SWIPER ==== */}
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
        {/* ==== SEARCH BAR ==== */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-full max-w-3xl px-2 sm:px-4 md:px-6 lg:px-8 z-30">
          <div className="bg-white/90 rounded-xl shadow-xl p-4 relative border-2 border-blue-100 backdrop-blur-md transition-all ring-1 ring-blue-200 focus-within:ring-2 focus-within:ring-blue-400">
            <form
              className="flex space-x-2 items-center"
              autoComplete="off"
              onSubmit={e => {
                e.preventDefault();
                if (searchResults[0]) window.location.href = searchResults[0].url;
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari franchise, blog, forum, tag, dsb..."
                className="flex-1 px-4 py-3 border-0 focus:ring-0 rounded-lg text-base md:text-lg bg-gray-50 font-semibold shadow-inner"
                value={searchTerm}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 180)}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ fontWeight: 500 }}
              />
              <button
                type="submit"
                className="px-4 md:px-6 py-3 font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white rounded-xl shadow-lg text-base flex items-center gap-2 hover:from-blue-600 transition"
                tabIndex={-1}
                style={{
                  boxShadow: '0 2px 16px 0 rgba(55,176,246,0.10)',
                  filter: 'brightness(1.06) drop-shadow(0 4px 12px #5ecfff33)'
                }}
              >
                <svg className="h-6 w-6 md:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth={2} />
                  <path d="M21 21l-4-4" strokeWidth={2} strokeLinecap="round" />
                </svg>
                <span className="hidden md:inline">Cari</span>
              </button>
            </form>
            {showSearchDropdown && searchTerm && (
              <div className="absolute left-0 w-full bg-white/95 rounded-b-xl shadow-2xl z-40 border-t border-blue-100 max-h-80 overflow-y-auto animate-fade-in backdrop-blur-lg">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-gray-400 text-center">Tidak ditemukan.</div>
                ) : (
                  searchResults.map((item, idx) => (
                    <a
                      key={item.url + idx}
                      href={item.url}
                      className={`
                        flex items-center px-4 py-3 gap-3 border-b last:border-0 transition
                        ${selectedIdx === idx ? 'bg-blue-100/70' : 'hover:bg-blue-50'}
                      `}
                      tabIndex={-1}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <img
                        src={item.img || '/logo192.png'}
                        alt={item.label}
                        className="w-12 h-12 rounded-xl object-cover bg-gray-100 border"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-600">{item.type === 'franchise' ? `Franchise (${item.desc})` : item.type === 'blog' ? 'Blog Bisnis' : 'Forum Global'}</div>
                        {'tags' in item && item.tags && (
                          <div className="text-xs text-blue-500 mt-1">#{item.tags}</div>
                        )}
                      </div>
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MENU FITUR ===== */}
      <section className="relative mt-8 mb-6 z-20">
        <div className="w-full flex justify-center">
          <div
            className="flex gap-4 overflow-x-auto px-2 pb-2 pt-1 max-w-full sm:justify-center scrollbar-thin scrollbar-thumb-gray-200"
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
                    bg-gradient-to-br ${menu.bg}
                    shadow-md border-2 border-white/30
                    rounded-full flex items-center justify-center
                    w-16 h-16 md:w-16 md:h-16 mb-1 focus:outline-none
                    relative overflow-hidden transition hover:scale-105 active:scale-95 group
                  `}
                  aria-label={menu.label}
                  style={{
                    boxShadow: '0 2px 12px 0 rgba(54,172,244,0.12)',
                    filter: 'brightness(1.04) drop-shadow(0 3px 10px #99e7f633)'
                  }}
                >
                  {menu.icon}
                </button>
                <span className="block text-center text-xs font-semibold text-gray-700 mt-1 truncate w-full drop-shadow-sm">
                  {menu.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
      </section>

      {/* === DAFTAR FRANCHISE === */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Daftar Franchise</h2>
          <Link href="/franchise-list" className="text-blue-600 text-sm hover:underline">Lihat Semua →</Link>
        </div>
        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={1.15}
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 2.15 },
            1024: { slidesPerView: 3.15 },
            1280: { slidesPerView: 4.15 },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation
          style={{ width: '100%', minHeight: 280 }}
        >
          {franchises.map((fr) => (
            <SwiperSlide key={fr.id}>
              <Link href={`/franchise/${fr.slug}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer flex flex-col h-full border-2 border-blue-50">
                  <div className="relative h-40">
                    <img
                      src={fr.logo_url}
                      alt={fr.franchise_name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-yellow-400 text-xs font-semibold text-black px-2 py-1 rounded">
                      {fr.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
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
      </section>

      {/* === DAFTAR BLOG === */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Blog Bisnis</h2>
          <Link href="/blog-global" className="text-blue-600 text-sm hover:underline">Lihat Semua →</Link>
        </div>
        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={1.15}
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 2.15 },
            1024: { slidesPerView: 3.15 },
            1280: { slidesPerView: 4.15 },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation
          style={{ width: '100%', minHeight: 280 }}
        >
          {blogs.map((b) => (
            <SwiperSlide key={b.id}>
              <Link href={`/detail/${b.slug}`}>
                <div className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col overflow-hidden h-full">
                  <div className="h-36 flex items-center justify-center bg-gray-50">
                    {b.cover_url ? (
                      <img src={b.cover_url} alt={b.title} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-400 text-sm">Tanpa Cover</span>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <span className="inline-block bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs font-semibold mb-1">{b.category}</span>
                    <div className="font-semibold truncate">{b.title}</div>
                    <div className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* === DAFTAR FORUM === */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Forum Global</h2>
          <Link href="/forum-global" className="text-blue-600 text-sm hover:underline">Lihat Semua →</Link>
        </div>
        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={1.15}
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 2.15 },
            1024: { slidesPerView: 3.15 },
            1280: { slidesPerView: 4.15 },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation
          style={{ width: '100%', minHeight: 280 }}
        >
          {threads.map((t) => (
            <SwiperSlide key={t.id}>
              <Link href={{ pathname: '/forum-global', query: { open: t.id } }} scroll={false}>
                <div className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col overflow-hidden h-full">
                  <div className="h-36 flex items-center justify-center bg-gray-50">
                    {t.image_url ? (
                      <img src={t.image_url} alt={t.title} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-gray-400 text-sm">Tanpa Gambar</span>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="font-semibold truncate">{t.title}</div>
                    <div className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* MODAL KALKULATOR */}
      <CalculatorModal show={showCalculatorModal} setShow={setShowCalculatorModal} />
    </div>
  );
}

// ====== MODAL KALKULATOR ======
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
