// File: pages/index.tsx

import { useEffect, useRef, useState } from 'react';
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
  // Daftar franchise
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab pencarian: dijual / disewa / properti baru
  const [tab, setTab] = useState<'dijual' | 'disewa' | 'baru'>('dijual');

  // Session dan role user
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>('');

  // Ref untuk container Menu Utama (untuk auto‐scroll)
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 1) Ambil session dan pasang listener auth-state-change
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
  }, []);

  // 2) Jika session ada, ambil role dari tabel profiles
  useEffect(() => {
    if (!session || !session.user) {
      setRole('');
      return;
    }
    async function fetchRole() {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (!error && profile) {
        setRole(profile.role);
      } else {
        setRole('');
      }
    }
    fetchRole();
  }, [session]);

  // 3) Fetch daftar franchise dan convert logo_url→publicUrl
  useEffect(() => {
    const fetchFranchises = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchises:', error);
      } else if (data) {
        const withImages = data.map((fr) => ({
          ...fr,
          logo_url: supabase
            .storage
            .from('listing-images')
            .getPublicUrl(fr.logo_url)
            .data
            .publicUrl!,
        }));
        setFranchises(withImages);
      }
      setLoading(false);
    };

    fetchFranchises();
  }, []);

  // 4) Auto‐scroll -> Menu Utama (infinite loop)
  useEffect(() => {
    const container = menuRef.current;
    if (!container) return;

    let scrollInterval: ReturnType<typeof setInterval>;

    const startAutoScroll = () => {
      const items = container.querySelectorAll<HTMLAnchorElement>('.menu-item');
      if (items.length === 0) return;

      const style = getComputedStyle(items[0]);
      // Lebar satu item + margin‐kanan (jika ada)
      const itemWidth = items[0].offsetWidth + parseInt(style.marginRight || '0');

      scrollInterval = setInterval(() => {
        if (!container) return;

        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        // Jika sudah mendekati ujung kanan, kembali ke awal
        if (container.scrollLeft + itemWidth >= maxScrollLeft + 1) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }, 2500);
    };

    startAutoScroll();
    return () => clearInterval(scrollInterval);
  }, []);

  // 5) Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Setelah logout, refresh halaman atau redirect ke landing page
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/*
        ==============================
        HEADER (HANYA SATU BAR PUTIH)
        ==============================
      */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-4 px-6 lg:px-8">
          {/* Logo / Judul */}
          <div className="flex items-center space-x-2">
            <Image
              src="/logo-franchisehub.svg"   // simpan logo Anda di /public/logo-franchisehub.svg
              alt="FranchiseHub"
              width={140}
              height={32}
              className="object-contain"
            />
          </div>

          {/* Search Bar (Desktop & Mobile) */}
          <div className="flex-1 px-6">
            <input
              type="text"
              placeholder="Cari franchise..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Salam / Akun / Logout */}
          <div className="flex items-center space-x-4">
            {session?.user && (
              <span className="text-sm text-gray-600 italic">
                Halo, {session.user.user_metadata.full_name || 'User'}{role ? `_${role}` : ''}!
              </span>
            )}
            {session ? (
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Login
              </Link>
            )}
            {/* Hamburger (hanya mobile) */}
            <button className="lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/*
        =======================================
        HERO SECTION (+ Kotak Pencarian Tabs)
        =======================================
      */}
      <section className="relative bg-gray-100">
        {/* Banner (pastikan /public/banner-franchise.jpg ada) */}
        <div className="h-96 w-full overflow-hidden">
          <Image
            src="/banner-franchise.jpg"
            alt="Banner Franchise"
            layout="fill"
            objectFit="cover"
            className="brightness-75"
          />
        </div>

        {/* Kotak pencarian (tabs) */}
        <div className="absolute inset-x-0 bottom-0 transform translate-y-1/2 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex">
              <button
                onClick={() => setTab('dijual')}
                className={`flex-1 py-3 text-center font-medium ${
                  tab === 'dijual' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Dijual
              </button>
              <button
                onClick={() => setTab('disewa')}
                className={`flex-1 py-3 text-center font-medium ${
                  tab === 'disewa' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Disewa
              </button>
              <button
                onClick={() => setTab('baru')}
                className={`flex-1 py-3 text-center font-medium ${
                  tab === 'baru' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
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

      {/* Spacer agar konten di bawah tidak tertutup hero */}
      <div className="h-24"></div>

      {/*
        ===========================
        MENU UTAMA (SCROLL HORIZONTAL)
        ===========================
      */}
      <section className="container mx-auto px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu Utama</h2>

        <div
          ref={menuRef}
          className="flex space-x-6 overflow-x-auto scroll-smooth hide-scrollbar pb-2"
        >
          {/* 1) Notifikasiku */}
          <Link href="/notifikasi" passHref>
            <a className="menu-item flex-shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 
                       2.032 0 0118 14.158V11a6.002 
                       6.002 0 00-4-5.659V5a2 2 0 
                       10-4 0v.341C8.67 6.165 8 
                       7.388 8 8.75v5.408c0 .538-.214 
                       1.055-.595 1.436L6 17h9z"
                  />
                </svg>
              </div>
              <span className="mt-1 text-xs text-gray-700 text-center">
                Notifikasiku
              </span>
            </a>
          </Link>

          {/* 2) Favoritku */}
          <Link href="/favorit" passHref>
            <a className="menu-item flex-shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="mt-1 text-xs text-gray-700 text-center">
                Favoritku
              </span>
            </a>
          </Link>

          {/* 3) Forum Global */}
          <Link href="/forum" passHref>
            <a className="menu-item flex-shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 
                       10h.01M21 21l-6-6m-4 0a8 8 0 
                       10-8-8 8 8 0 008 8z"
                  />
                </svg>
              </div>
              <span className="mt-1 text-xs text-gray-700 text-center">
                Forum Global
              </span>
            </a>
          </Link>

          {/* 4) Blog Global */}
          <Link href="/blog" passHref>
            <a className="menu-item flex-shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 1.343-3 
                       3v3h6v-3c0-1.657-1.343-3-3-3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 21h14a2 2 0 002-2v-3a7 
                       7 0 00-7-7H5a2 2 0 00-2 2v8a2 
                       2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="mt-1 text-xs text-gray-700 text-center">
                Blog Global
              </span>
            </a>
          </Link>

          {/* 5) Pusat Bantuan */}
          <Link href="/help" passHref>
            <a className="menu-item flex-shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 10c0 3.866-3.582 
                       7-8 7-4.418 0-8-3.134-8-7 
                       0-3.866 3.582-7 8-7 4.418 
                       0 8 3.134 8 7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14v2m0-8v2"
                  />
                </svg>
              </div>
              <span className="mt-1 text-xs text-gray-700 text-center">
                Pusat Bantuan
              </span>
            </a>
          </Link>

          {/* 6) Syarat & Ketentuan */}
          <Link href="/terms" passHref>
            <a className="menu-item flex-shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-4 0-8 2-8 6 0 4 4 
                       6 8 6s8-2 8-6c0-4-4-6-8-6z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 12v.01"
                  />
                </svg>
              </div>
              <span className="mt-1 text-xs text-gray-700 text-center">
                Syarat & Ketentuan
              </span>
            </a>
          </Link>

          {/* 7) Kebijakan Privasi */}
          <Link href="/privacy" passHref>
            <a className="menu-item flex-shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c0-3.866.686-7 3-7s3 
                       3.134 3 7c0 3.866-3 5-3 5s-3-1.134-3-5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v8"
                  />
                </svg>
              </div>
              <span className="mt-1 text-xs text-gray-700 text-center">
                Kebijakan Privasi
              </span>
            </a>
          </Link>

          {/* 8) Jadi Franchisor (jika sudah login) */}
          {session && (
            <Link href="/franchisor" passHref>
              <a className="menu-item flex-shrink-0 flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 00-8 0v2H6a2 2 0 
                         00-2 2v8h16v-8a2 2 0 00-2-2h-2V7z"
                    />
                  </svg>
                </div>
                <span className="mt-1 text-xs text-gray-700 text-center">
                  Jadi Franchisor
                </span>
              </a>
            </Link>
          )}

          {/* 9) Dashboard Admin (jika role Administrator) */}
          {role === 'Administrator' && (
            <Link href="/admin" passHref>
              <a className="menu-item flex-shrink-0 flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18M3 6h18M3 18h18M7 
                         6v12"
                    />
                  </svg>
                </div>
                <span className="mt-1 text-xs text-gray-700 text-center">
                  Dashboard Admin
                </span>
              </a>
            </Link>
          )}

          {/* 10) Dashboard Franchisor (jika role franchisor) */}
          {role === 'franchisor' && (
            <Link href="/franchisor/dashboard" passHref>
              <a className="menu-item flex-shrink-0 flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11V5m0 
                         6l-4-4m4 4l4-4M4 20h16"
                    />
                  </svg>
                </div>
                <span className="mt-1 text-xs text-gray-700 text-center">
                  Dashboard Franchisor
                </span>
              </a>
            </Link>
          )}

          {/* 11) Login (jika belum login) */}
          {!session && (
            <Link href="/login" passHref>
              <a className="menu-item flex-shrink-0 flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14m-7-7l7 
                         7-7 7"
                    />
                  </svg>
                </div>
                <span className="mt-1 text-xs text-gray-700 text-center">
                  Login
                </span>
              </a>
            </Link>
          )}
        </div>
      </section>

      {/*
        ====================================
        DAFTAR FRANCHISE (GRID 3 KOL)  
        ====================================
      */}
      <section className="container mx-auto px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Franchise</h2>

        {loading ? (
          <p className="text-center text-gray-500">Memuat daftar franchise...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {franchises.map((fr) => (
              <Link key={fr.id} href={`/franchise/${fr.slug}`} passHref>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer">
                  {/* Thumbnail & Kategori */}
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

      {/*
        ===========================
        FOOTER
        ===========================
      */}
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
                <Link href="#" className="hover:underline">
                  Cari Agen
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Iklankan Franchise
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Jual Franchise
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Simulasi Investasi
                </Link>
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
                  <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 
                         2 12c0 4.991 3.656 9.128 8.438 9.879v-6.99
                         H7.898v-2.889h2.54V9.845c0-2.507 
                         1.492-3.89 3.777-3.89 1.094 0 2.238.195 
                         2.238.195v2.463H15.04c-1.263 0-1.658.78
                         -1.658 1.577v1.897h2.828l-.453 
                         2.889h-2.375v6.99C18.344 21.128 22 
                         16.991 22 12z" />
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775
                         a4.936 4.936 0 002.163-2.724 9.868 
                         9.868 0 01-3.127 1.195 4.92 4.92 0 00-8.379 
                         4.482A13.955 13.955 0 011.671 3.149a4.822 
                         4.822 0 001.523 6.56 4.902 4.902 0 01-2.229-.616
                         c-.054 2.28 1.581 4.415 3.949 4.89a4.935 
                         4.935 0 01-2.224.085 4.928 4.928 0 004.604 
                         3.417A9.867 9.867 0 010 19.54a13.9 13.9 
                         0 007.548 2.212c9.058 0 14.01-7.507 
                         14.01-14.01 0-.213 0-.425-.015-.637A10.012 
                         10.012 0 0024 4.59z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="hover:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.849.07 
                         1.366.062 2.633.313 3.608 1.289.974.975 
                         1.227 2.243 1.289 3.608.058 1.265.069 
                         1.646.069 4.848 0 3.205-.011 3.584-.069 
                         4.849-.062 1.366-.315 2.633-1.289 3.608
                         -.975.974-2.242 1.227-3.608 1.289-1.265
                         .058-1.645.07-4.849.07-3.204 0-3.584
                         -.012-4.849-.07-1.366-.062-2.633-.315
                         -3.608-1.289-.974-.975-1.227-2.242
                         -1.289-3.608-.058-1.265-.07-1.645
                         -.07-4.849 0-3.205.012-3.584.07-4.849
                         .062-1.366.315-2.633 1.289-3.608
                         .975-.974 2.242-1.227 3.608-1.289
                         1.265-.058 1.645-.07 4.849-.07M12 0
                         C8.741 0 8.332.014 7.052.072 5.78.13 
                         4.602.346 3.603 1.345 2.605 2.343 
                         2.39 3.52 2.332 4.792  .274 6.074 
                         .26 6.483.26 12s.014 5.926.072 7.208
                         c.058 1.272.273 2.449 1.271 3.447
                         .998.999 2.175 1.215 3.447 1.273 
                         1.282.058 1.691.072 7.217.072s5.935
                         -.014 7.217-.072c1.272-.058 2.449
                         -.274 3.447-1.273 .998-.998 1.214
                         -2.175 1.272-3.447.058-1.282.072
                         -1.691.072-7.217s-.014-5.935-.072
                         -7.217c-.058-1.272-.274-2.449
                         -1.273-3.447C19.65.346 18.473.13
                         17.201.072 15.919.014 15.51 0 
                         12 0zm0 5.838a6.162 6.162 0 100 
                         12.324 6.162 6.162 0 000-12.324zm0 
                         10.162a4 4 0 110-8 4 4 0 010 8zm6.406
                         -11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 
                         0 012.88 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
