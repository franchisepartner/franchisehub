// pages/index.tsx
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

  useEffect(() => {
    const fetchFranchises = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchises:', error);
      } else if (data) {
        // Konversi setiap logo_url menjadi public URL dari Supabase Storage
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

  // Data daftar menu utama (ikon–ikon bundar)
  const menuItems = [
    {
      label: 'Notifikasiku',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a5 5 0 00-5 5v1H5a2 2 0 00-2 2v2h18v-2a2 2 0 00-2-2h-2V7a5 5 0 00-5-5z" />
          <path fillRule="evenodd" d="M4 13v2a6 6 0 006 6h4a6 6 0 006-6v-2H4zm6 1a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Favoritku',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
    {
      label: 'Forum Global',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 5.58 2 10c0 2.4 1.31 4.57 3.5 6.05V22l4.69-3.13C11.11 18.43 11.55 18.45 12 18.45c5.52 0 10-3.58 10-8.45S17.52 2 12 2z" />
        </svg>
      ),
    },
    {
      label: 'Blog Global',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 4v16h18V4H3zm16 14H5V6h14v12z" />
          <path d="M7 8h10v2H7zm0 4h10v2H7zm0 4h6v2H7z" />
        </svg>
      ),
    },
    {
      label: 'Pusat Bantuan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 19a8 8 0 110-16 8 8 0 010 16z" />
          <path d="M11 10h2v5h-2zm0-3h2v2h-2z" />
        </svg>
      ),
    },
    {
      label: 'Syarat & Ketentuan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 20h10v-2H7v2zm0-4h10v-2H7v2zm0-4h7v-2H7v2zm0-4h7V6H7v2z" />
        </svg>
      ),
    },
    {
      label: 'Kebijakan Privasi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM5 9V6.19l7-3.11 7 3.11V9c0 4.44-2.79 8.85-7 9.88C7.79 17.85 5 13.44 5 9z" />
          <path d="M11 12h2v5h-2zm0-4h2v2h-2z" />
        </svg>
      ),
    },
    {
      label: 'Jadi Franchisor',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 5.91 2 10.5S6.48 19 12 19s10-3.91 10-8.5S17.52 2 12 2zM9 14h6v-2H9v2zm0-4h6V8H9v2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="pt-16">
      {/* ======= BANNER ======= */}
      <div className="relative h-96 w-full">
        <Image
          src="/banner-franchise.jpg"
          alt="Banner Franchise"
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
      </div>

      {/* ======= SEARCH OVERLAY (seperti screenshot rumah123) ======= */}
      <div className="absolute inset-x-0 bottom-0 transform -translate-y-1/2 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex">
            <button
              className="flex-1 py-3 text-center font-medium text-white bg-blue-600"
              type="button"
            >
              Dijual
            </button>
            <button
              className="flex-1 py-3 text-center font-medium text-gray-600 bg-white hover:bg-gray-50"
              type="button"
            >
              Disewa
            </button>
            <button
              className="flex-1 py-3 text-center font-medium text-gray-600 bg-white hover:bg-gray-50"
              type="button"
            >
              Properti Baru
            </button>
          </div>
          <div className="p-6">
            <form className="flex space-x-4">
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

      {/* Spacer agar konten tidak tertutup oleh overlay */}
      <div className="h-48"></div>

      {/* ======= MENU UTAMA (Scroll Horizontal Manual) ======= */}
      <section className="px-6 lg:px-8 mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Menu Utama</h2>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {menuItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center flex-shrink-0">
              <div className="bg-white p-4 rounded-full shadow-md">
                {item.icon}
              </div>
              <span className="mt-2 text-sm text-gray-700 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ======= DAFTAR FRANCHISE (Grid) ======= */}
      <section className="container mx-auto px-6 lg:px-8 mb-16">
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
    </div>
  );
}
