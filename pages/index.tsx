// pages/index.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
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
      {/* ========== Banner Section ========== */}
      <div className="relative w-full h-[280px] sm:h-[320px] md:h-[420px] lg:h-[540px]">
        {/* Pastikan nama dan ekstensi persis sama dengan yang ada di folder public */}
        <Image
          src="/banner-franchisehub.PNG"
          alt="Banner FranchiseHub"
          fill
          className="object-cover brightness-75"
        />

        {/* Overlay Text (opsional)—bila ingin teks ditaruh, aktifkan kembali; jika tidak, biarkan dihapus */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-2xl md:text-4xl font-semibold">
            Jual Beli Franchise Jadi Mudah
          </h1>
        </div>

        {/* Search form overlay (akan menempel pada kurva banner) */}
        <div className="absolute bottom-0 inset-x-0 transform translate-y-1/2 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-3xl mx-auto">
            {/* Tabs */}
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

            {/* Form Pencarian */}
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
      </div>

      {/* Spacer agar konten berikutnya tidak tertutup overlay */}
      <div className="h-24 md:h-28 lg:h-32"></div>

      {/* ========== Menu Utama (scrollable) ========== */}
      <section className="w-full overflow-x-auto whitespace-nowrap py-6 px-4 sm:px-6 lg:px-8">
        <div className="inline-flex space-x-6">
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
                  <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V9a6 6 0 10-12 0v7l-2 2v1h16v-1l-2-2z" />
                </svg>
              ),
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
                  <path d="M5 15l7 7 7-7V5a2 2 0 00-2-2h-10a2 2 0 00-2 2v10z" />
                </svg>
              ),
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
                  <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                </svg>
              ),
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
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ),
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
                  <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                </svg>
              ),
            },
            {
              label: 'Syarat & Ketentuan',
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 5v14h14V5H5z" />
                  <path d="M9 9h6v6H9z" />
                </svg>
              ),
            },
            {
              label: 'Kebijakan Privasi',
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 2L4 6v6c0 5.523 3.582 10 8 10s8-4.477 8-10V6l-8-4z" />
                </svg>
              ),
            },
            {
              label: 'Jadi Franchisor',
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8c-1.657 0-3 1.343-3 3 0 3 3 7 3 7s3-4 3-7c0-1.657-1.343-3-3-3z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.label} className="inline-flex flex-col items-center justify-center w-24">
              <div className="bg-white rounded-full shadow-md p-4">
                {item.icon}
              </div>
              <span className="text-xs text-gray-600 mt-1 text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ...Daftar Franchise dan Footer tetap sama… */}
    </div>
  );
}
