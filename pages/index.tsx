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
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchises:', error);
      } else if (data) {
        const franchisesWithImages = data.map((franchise) => ({
          ...franchise,
          logo_url: supabase
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[24rem] w-full overflow-hidden">
        {/* Banner Image */}
        <Image
          src="/banner-franchise.jpg"
          alt="Banner Franchise"
          fill
          objectFit="cover"
          className="brightness-75"
        />

        {/* Overlay Search Card */}
        <div className="absolute inset-x-0 bottom-0 transform translate-y-1/2 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Tabs */}
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
        </div>
      </section>

      {/* Spacer */}
      <div className="h-32"></div>

      {/* Icon Shortcuts Section */}
      <section className="container mx-auto px-6 lg:px-8 mt-12">
        <h2 className="sr-only">Menu Utama</h2>
        <div className="overflow-x-auto">
          <div className="inline-flex space-x-6">
            {/* Notifikasiku */}
            <Link href="#" className="flex flex-col items-center min-w-[5rem]">
              <div className="bg-white p-4 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a5 5 0 00-5 5v1H5a2 2 0 00-2 2v2h18v-2a2 2 0 00-2-2h-2V7a5 5 0 00-5-5z" />
                  <path
                    fillRule="evenodd"
                    d="M4 13v2a6 6 0 006 6h4a6 6 0 006-6v-2H4zm6 1a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">Notifikasiku</span>
            </Link>

            {/* Favoritku */}
            <Link href="#" className="flex flex-col items-center min-w-[5rem]">
              <div className="bg-white p-4 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.42 3.42 5 5.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5 18.58 5 20 6.42 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">Favoritku</span>
            </Link>

            {/* Forum Global */}
            <Link href="#" className="flex flex-col items-center min-w-[5rem]">
              <div className="bg-white p-4 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 00-9.95 9.09C2.02 12.5 2 12.74 2 13c0 2.76 2.24 5 5 5h3l4 4v-4h3c2.76 0 5-2.24 5-5 0-.26-.02-.5-.05-.91A10 10 0 0012 2z" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">Forum Global</span>
            </Link>

            {/* Blog Global */}
            <Link href="#" className="flex flex-col items-center min-w-[5rem]">
              <div className="bg-white p-4 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">Blog Global</span>
            </Link>

            {/* Pusat Bantuan */}
            <Link href="#" className="flex flex-col items-center min-w-[5rem]">
              <div className="bg-white p-4 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm1.07-7.75c-.9.92-1.07 1.25-1.07 2.25h-2v-.5c0-1.1.3-1.7 1.07-2.41.7-.65 1.39-1.22 1.39-2.09 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.4-.7 2.08-1.93 3.25z" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">Pusat Bantuan</span>
            </Link>

            {/* Syarat & Ketentuan */}
            <Link href="#" className="flex flex-col items-center min-w-[5rem]">
              <div className="bg-white p-4 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zm0 18l-9-4.5V10l9 4.5 9-4.5v5.5L12 20z" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">Syarat & Ketentuan</span>
            </Link>

            {/* Kebijakan Privasi */}
            <Link href="#" className="flex flex-col items-center min-w-[5rem]">
              <div className="bg-white p-4 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM5 9V6.19l7-3.11 7 3.11V9c0 4.44-2.79 8.85-7 9.88C7.79 17.85 5 13.44 5 9z" />
                  <path d="M11 12h2v5h-2zm0-4h2v2h-2z" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">Kebijakan Privasi</span>
            </Link>

            {/* Jadi Franchisor */}
            <Link href="#" className="flex flex-col items-center min-w-[5rem]">
              <div className="bg-white p-4 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zm0 13l-9-4.5V10l9 4.5 9-4.5v.5L12 15z" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-700">Jadi Franchisor</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Daftar Franchise */}
      <section className="container mx-auto px-6 lg:px-8 mt-16 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Franchise</h2>

        {loading ? (
          <p className="text-center text-gray-500">Memuat daftar franchise...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {franchises.map((fr) => (
              <Link key={fr.id} href={`/franchise/${fr.slug}`} passHref>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer">
                  {/* Thumbnail */}
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
                    <p className="mt-1 text-sm text-gray-500">
                      {fr.location}
                    </p>
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
    </div>
  );
}
