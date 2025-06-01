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
        // Ubah setiap logo_url menjadi publicUrl dari Supabase Storage
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
      {/* ========== Header ========== */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto flex items-center justify-between py-4 px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            {/* Ganti src dengan logo FranchiseHub Anda */}
            <Image
              src="/logo-franchisehub-white.svg"
              alt="FranchiseHub"
              width={140}
              height={32}
              className="object-contain"
            />
          </div>

          {/* Navigation (desktop) */}
          <nav className="hidden lg:flex space-x-6 font-medium">
            <Link href="#" className="hover:underline">Cari Agen</Link>
            <Link href="#" className="hover:underline">Aset Bank</Link>
            <Link href="#" className="hover:underline">Explore</Link>
            <Link href="#" className="hover:underline">Berita</Link>
            <Link href="#" className="hover:underline">Perusahaan</Link>
            <Link href="#" className="hover:underline">Bantuan</Link>
          </nav>

          {/* Tombol Pasang Iklan & Akun (desktop) */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition">
              Pasang Iklan
            </button>
            <button className="flex items-center space-x-2 hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
              </svg>
              <span>Akun</span>
            </button>
          </div>

          {/* Hamburger (mobile) */}
          <button className="lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ========== Hero Section ========== */}
      <section className="relative bg-gray-100">
        {/* Banner */}
        <div className="h-96 w-full overflow-hidden">
          <Image
            src="/banner-franchise.jpg"       // Ganti dengan path banner Anda
            alt="Banner Franchise"
            layout="fill"
            objectFit="cover"
            className="brightness-75"
          />
        </div>

        {/* Kotak Search Utama */}
        <div className="absolute inset-x-0 bottom-0 transform translate-y-1/2 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Tabs: Dijual / Disewa / Properti Baru */}
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

      {/* Spacer agar konten tidak tertutup hero */}
      <div className="h-24"></div>

      {/* ========== Icon Shortcuts Section ========== */}
      <section className="container mx-auto px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
          {/* Contoh Icon: Cari Agen */}
          <div className="flex flex-col items-center">
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
            <span className="mt-2 text-sm font-medium text-gray-700">Cari Agen</span>
          </div>

          {/* Iklankan Franchise */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13H5v-2h14v2zm0-6H5v2h14V7zm0 10H5v2h14v-2z" />
              </svg>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700">Iklankan Franchise</span>
          </div>

          {/* Jual Franchisemu */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 21h18V3H3v18zM5 5h14v14H5V5z" />
                <path d="M9 9h6v2H9V9zm0 4h6v2H9v-2z" />
              </svg>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700">Jual Franchisemu</span>
          </div>

          {/* Cari Franchise */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.02 14 5 11.98 5 9.5S7.02 5 9.5 5 14 7.02 14 9.5 11.98 14 9.5 14z" />
              </svg>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700">Cari Franchise</span>
          </div>

          {/* Simulasi Investasi */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM5 9V6.19l7-3.11 7 3.11V9c0 4.44-2.79 8.85-7 9.88C7.79 17.85 5 13.44 5 9z" />
                <path d="M11 12h2v5h-2zm0-4h2v2h-2z" />
              </svg>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700">Simulasi Investasi</span>
          </div>

          {/* Lainnya */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
                <circle cx="5" cy="12" r="2" />
              </svg>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700">Lainnya</span>
          </div>
        </div>
      </section>

      {/* ========== Daftar Franchise (Grid) ========== */}
      <section className="container mx-auto px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Franchise</h2>

        {loading ? (
          <p className="text-center text-gray-500">Memuat daftar franchise...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {franchises.map((fr) => (
              <Link key={fr.id} href={`/franchise/${fr.slug}`} passHref>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer">
                  {/* Gambar Logo/Thumbnail */}
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

      {/* ========== Footer (opsional) ========== */}
      <footer className="mt-20 bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kolom Tentang */}
          <div>
            <h4 className="font-semibold mb-4">Tentang FranchiseHub</h4>
            <p className="text-sm text-gray-300">
              FranchiseHub adalah platform terdepan untuk menemukan dan mengelola peluang franchise. 
              Kami memudahkan franchisor dan franchisee bertemu dalam satu ekosistem yang transparan.
            </p>
          </div>

          {/* Kolom Menu Cepat */}
          <div>
            <h4 className="font-semibold mb-4">Menu Cepat</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="#" className="hover:underline">Cari Agen</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Iklankan Franchise</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Jual Franchise</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Simulasi Investasi</Link>
              </li>
            </ul>
          </div>

          {/* Kolom Kontak */}
          <div>
            <h4 className="font-semibold mb-4">Kontak Kami</h4>
            <p className="text-sm text-gray-300">Email: support@franchisehub.co.id</p>
            <p className="text-sm text-gray-300">Telepon: +62 812 3456 7890</p>
            <div className="mt-4 flex space-x-4">
              {/* Facebook */}
              <a href="#" className="hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.656 9.128 8.438 9.879v-6.99H7.898v-2.889h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.463H15.04c-1.263 0-1.658.78-1.658 1.577v1.897h2.828l-.453 2.889h-2.375v6.99C18.344 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775a4.936 4.936 0 002.163-2.724 9.868 9.868 0 01-3.127 1.195 4.92 4.92 0 00-8.379 4.482A13.955 13.955 0 011.671 3.149a4.822 4.822 0 001.523 6.56 4.902 4.902 0 01-2.229-.616c-.054 2.28 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.085 4.928 4.928 0 004.604 3.417A9.867 9.867 0 010 19.54a13.9 13.9 0 007.548 2.212c9.058 0 14.01-7.507 14.01-14.01 0-.213 0-.425-.015-.637A10.012 10.012 0 0024 4.59z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.313 3.608 1.289.974.975 1.227 2.243 1.289 3.608.058 1.265.069 1.646.069 4.848 0 3.205-.011 3.584-.069 4.849-.062 1.366-.315 2.633-1.289 3.608-.975.974-2.242 1.227-3.608 1.289-1.265.058-1.645.07-4.849.07-3.204 0-3.584-.012-4.849-.07-1.366-.062-2.633-.315-3.608-1.289-.974-.975-1.227-2.242-1.289-3.608-.058-1.265-.07-1.645-.07-4.849 0-3.205.012-3.584.07-4.849.062-1.366.315-2.633 1.289-3.608.975-.974 2.242-1.227 3.608-1.289 1.265-.058 1.645-.07 4.849-.07M12 0C8.741 0 8.332.014 7.052.072 5.78.13 4.602.346 3.603 1.345 2.605 2.343 2.39 3.52 2.332 4.792.274 6.074.26 6.483.26 12s.014 5.926.072 7.208c.058 1.272.273 2.449 1.271 3.447.998.999 2.175 1.215 3.447 1.273 1.282.058 1.691.072 7.217.072s5.935-.014 7.217-.072c1.272-.058 2.449-.274 3.447-1.273.998-.998 1.214-2.175 1.272-3.447.058-1.282.072-1.691.072-7.217s-.014-5.935-.072-7.217c-.058-1.272-.274-2.449-1.273-3.447C19.65.346 18.473.13 17.201.072 15.919.014 15.51 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
              </a>
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
