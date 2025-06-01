// File: pages/index.tsx

import { useEffect, useState, useRef } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

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

const Home: NextPage = () => {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'dijual' | 'disewa' | 'baru'>('dijual');

  // Daftar menu utama (contoh)
  const menuItems = [
    {
      label: 'Notifikasiku',
      href: '/notifikasi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-3.866-3.582-7-8-7S2 7.134 2 11v3.159c0 .538-.214 1.055-.595 1.436L0 17h5m10 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      label: 'Favoritku',
      href: '/favorit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ),
    },
    {
      label: 'Forum Global',
      href: '/forum',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM8 10h8v2H8v-2zm0 4h5v2H8v-2z" />
        </svg>
      ),
    },
    {
      label: 'Blog Global',
      href: '/blog',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm2 3v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h10v-2H7z" />
        </svg>
      ),
    },
    {
      label: 'Pusat Bantuan',
      href: '/help',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414m0 0a9 9 0 01-12.728 0m0 0L5.636 5.636m12.728 12.728l-1.414-1.414m0 0a9 9 0 01-12.728 0m0 0L5.636 18.364" />
        </svg>
      ),
    },
    {
      label: 'Syarat & Ketentuan',
      href: '/terms',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 4h16v2H4V4zm0 6h10v2H4v-2zm0 6h16v2H4v-2z" />
        </svg>
      ),
    },
    {
      label: 'Kebijakan Privasi',
      href: '/privacy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 2.21-1.79 4-4 4m8-4c0 2.21-1.79 4-4 4M4 4h16v16H4V4z" />
        </svg>
      ),
    },
    {
      label: 'Jadi Franchisor',
      href: '/franchisor',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3 5h-6l3-5zm0 6a4 4 0 110 8 4 4 0 010-8zm-4 8h8v2H8v-2zm-2-4H6v2h2v-2zm12 0h2v2h-2v-2z" />
        </svg>
      ),
    },
  ];

  // Ref untuk infinite scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Fetch daftar franchise dari Supabase
    const fetchFranchises = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchises:', error);
      } else if (data) {
        const withImages = data.map((f) => ({
          ...f,
          logo_url: supabase
            .storage
            .from('listing-images')
            .getPublicUrl(f.logo_url).data.publicUrl!,
        }));
        setFranchises(withImages);
      }
      setLoading(false);
    };

    fetchFranchises();

    // Infinite horizontal scroll untuk menu utama
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollPos = 0;
    const speed = 1; // meningkatkan scrollLeft sebanyak 1px per frame

    const step = () => {
      if (!container) return;
      scrollPos += speed;
      // Jika sudah mencapai setengah scrollWidth, reset ke nol
      if (scrollPos >= container.scrollWidth / 2) {
        scrollPos = 0;
      }
      container.scrollLeft = scrollPos;
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ================= Hero Banner ================= */}
      <section className="relative bg-gray-100">
        <div className="h-96 w-full overflow-hidden relative">
          {/* Menggunakan <img> biasa agar tidak perlu konfigurasi domain Next.js */}
          <img
            src="/banner-franchise.jpg"
            alt="Banner Franchise"
            className="object-cover w-full h-full brightness-75"
          />
        </div>
      </section>

      {/* Spacer agar konten tidak overlap Hero */}
      <div className="h-24"></div>

      {/* ================= Tabs Pencarian ================= */}
      <div className="container mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="flex">
            <button
              onClick={() => setTab('dijual')}
              className={`flex-1 py-3 text-center font-medium ${
                tab === 'dijual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Dijual
            </button>
            <button
              onClick={() => setTab('disewa')}
              className={`flex-1 py-3 text-center font-medium ${
                tab === 'disewa'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Disewa
            </button>
            <button
              onClick={() => setTab('baru')}
              className={`flex-1 py-3 text-center font-medium ${
                tab === 'baru'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Properti Baru
            </button>
          </div>
          <div className="p-6">
            <form className="flex space-x-4">
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
      </div>

      {/* ================= Menu Utama (Infinite Scroll) ================= */}
      <section className="overflow-x-hidden py-4">
        <div
          ref={scrollContainerRef}
          className="flex space-x-8 whitespace-nowrap select-none"
          style={{ overflowX: 'hidden' }}
        >
          {/* Gandakan array dua kali agar loop mulus */}
          {[...menuItems, ...menuItems].map((item, idx) => (
            <Link key={idx} href={item.href} passHref>
              <a>
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-white rounded-full shadow-md mx-2 cursor-pointer hover:shadow-lg transition">
                  {item.icon}
                  <span className="mt-1 text-xs text-gray-700 text-center">
                    {item.label}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= Daftar Franchise ================= */}
      <section className="container mx-auto px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Franchise</h2>

        {loading ? (
          <p className="text-center text-gray-500">Memuat daftar franchise...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {franchises.map((fr) => (
              <Link key={fr.id} href={`/franchise/${fr.slug}`} passHref>
                <a>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer">
                    {/* Menggunakan <img> biasa untuk logo */}
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
                </a>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ================= Footer ================= */}
      <footer className="mt-16 bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center text-sm">
          &copy; 2025 FranchiseHub. Semua hak dilindungi.
        </div>
      </footer>
    </div>
  );
};

export default Home;
