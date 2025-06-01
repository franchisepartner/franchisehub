// File: pages/index.tsx

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function Home() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'dijual' | 'disewa' | 'baru'>('dijual');

  useEffect(() => {
    const fetchFranchises = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select(
          'id, franchise_name, description, category, investment_min, location, logo_url, slug'
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchises:', error);
      } else if (data) {
        // Konversi setiap logo_url menjadi publicUrl dari Supabase Storage
        const franchisesWithImages = data.map((franchise) => ({
          ...franchise,
          logo_url: supabase
            .storage
            .from('listing-images')
            .getPublicUrl(franchise.logo_url)
            .data.publicUrl!,
        }));
        setFranchises(franchisesWithImages);
      }
      setLoading(false);
    };

    fetchFranchises();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ====================
          Banner Franchise (full‐width, tanpa bar putih di atas)
      ==================== */}
      <section className="relative w-full h-96">
        {/* Pastikan file banner-franchise.jpg sudah Anda letakkan di folder public/ */}
        <Image
          src="/banner-franchise.jpg"
          alt="Banner Franchise"
          fill
          className="object-cover brightness-75"
        />
      </section>

      {/* Spacer agar kotak pencarian tidak menempel rapat ke banner */}
      <div className="h-12 lg:h-16"></div>

      {/* ====================
          Kotak Pencarian (Tabs + Input)
      ==================== */}
      <section className="px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Tabs: Dijual / Disewa / Properti Baru */}
          <div className="flex border-b">
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

          {/* Form Pencarian */}
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
      </section>

      {/* Spacer kecil */}
      <div className="h-12"></div>

      {/* ====================
          Menu Utama (Ikon bulat, horizontally scrollable)
      ==================== */}
      <section className="px-6 lg:px-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Menu Utama</h2>

        <div className="overflow-x-auto">
          <div className="flex space-x-6 pb-2">
            {[
              {
                label: 'Notifikasiku',
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                ),
                href: '/notifikasi',
              },
              {
                label: 'Favoritku',
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                ),
                href: '/favorit',
              },
              {
                label: 'Forum Global',
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v8l-4-4H7a2 2 0 01-2-2V8c0-1.105.895-2 2-2h2"
                    />
                  </svg>
                ),
                href: '/forum',
              },
              {
                label: 'Blog Global',
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16h8M8 12h8m-8-4h8M5 6h14M5 18h14"
                    />
                  </svg>
                ),
                href: '/blog',
              },
              {
                label: 'Pusat Bantuan',
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6h4m4 0h2a2 2 0 012 2v4M6 6H4a2 2 0 00-2 2v4m0 4h2m4 0h4m4 0h2a2 2 0 002-2v-4m0 0v4a2 2 0 01-2 2h-2M6 18H4a2 2 0 01-2-2v-4m0 0V6a2 2 0 012-2h2"
                    />
                  </svg>
                ),
                href: '/help',
              },
              {
                label: 'Syarat & Ketentuan',
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0-1.5.5-3 1.5-4m-3 4c0 1.5.5 3 1.5 4m4-8v8"
                    />
                  </svg>
                ),
                href: '/terms',
              },
              {
                label: 'Kebijakan Privasi',
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 16v4m8-4v4m-16-4v4m4-8v4m8-4v4m-4-4v4"
                    />
                  </svg>
                ),
                href: '/privacy',
              },
              {
                label: 'Jadi Franchisor',
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                href: '/franchisor',
              },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <a className="flex-shrink-0 flex flex-col items-center text-center">
                  <div className="bg-white p-4 rounded-full shadow-md">
                    {item.icon}
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                    {item.label}
                  </span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer kecil */}
      <div className="h-12"></div>

      {/* ====================
          Daftar Franchise (Grid)
      ==================== */}
      <section className="px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Franchise</h2>

        {loading ? (
          <p className="text-center text-gray-500">Memuat daftar franchise...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {franchises.map((fr) => (
              <Link key={fr.id} href={`/franchise/${fr.slug}`}>
                <a className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
                  <div className="relative h-44">
                    <img
                      src={fr.logo_url}
                      alt={fr.franchise_name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-semibold text-black px-2 py-1 rounded">
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
                </a>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Spacer bawah halaman */}
      <div className="h-20"></div>
    </div>
  );
}
