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
  // State untuk daftar franchise
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loadingFranchises, setLoadingFranchises] = useState(true);

  // State untuk sesi & role user
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>('');

  // ======================
  // Ambil daftar franchise
  // ======================
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
      setLoadingFranchises(false);
    };

    fetchFranchises();
  }, []);

  // =================================
  // Ambil sesi Supabase dan role user
  // =================================
  useEffect(() => {
    // Ambil sesi saat ini
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Dengarkan perubahan auth state (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Setelah session diperoleh, ambil role dari tabel 'profiles'
  useEffect(() => {
    const fetchRole = async () => {
      if (session?.user?.id) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!error && profile) {
          setRole(profile.role);
        }
      } else {
        setRole('');
      }
    };

    fetchRole();
  }, [session]);

  // ===================================
  // Fungsi untuk logout
  // ===================================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole('');
    setSession(null);
    // Redirect atau refresh halaman jika perlu
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== Header ========== */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto flex items-center justify-between py-4 px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" passHref>
              <a>
                <Image
                  src="/logo-franchisehub-white.svg" // Ganti dengan logo Anda
                  alt="FranchiseHub"
                  width={140}
                  height={32}
                  className="object-contain"
                />
              </a>
            </Link>
          </div>

          {/* Navigation (desktop) */}
          <nav className="hidden lg:flex space-x-6 font-medium">
            <Link href="#" className="hover:underline">
              Cari Agen
            </Link>
            <Link href="#" className="hover:underline">
              Aset Bank
            </Link>
            <Link href="#" className="hover:underline">
              Explore
            </Link>
            <Link href="#" className="hover:underline">
              Berita
            </Link>
            <Link href="#" className="hover:underline">
              Perusahaan
            </Link>
            <Link href="#" className="hover:underline">
              Bantuan
            </Link>
          </nav>

          {/* Tombol Pasang Iklan & Akun (desktop) */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition">
              Pasang Iklan
            </button>
            {session ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7"
                  />
                </svg>
                <span>Logout</span>
              </button>
            ) : (
              <Link href="/login" passHref>
                <a className="flex items-center space-x-2 hover:underline">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14m-7-7l7 7-7 7"
                    />
                  </svg>
                  <span>Login</span>
                </a>
              </Link>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button className="lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
            src="/banner-franchise.jpg" // Ganti dengan path banner Anda
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
                onClick={() => {}}
                className="flex-1 py-3 text-center font-medium bg-blue-600 text-white"
              >
                Dijual
              </button>
              <button
                onClick={() => {}}
                className="flex-1 py-3 text-center font-medium bg-white text-gray-600 hover:bg-gray-50"
              >
                Disewa
              </button>
              <button
                onClick={() => {}}
                className="flex-1 py-3 text-center font-medium bg-white text-gray-600 hover:bg-gray-50"
              >
                Properti Baru
              </button>
            </div>

            {/* Form Pencarian */}
            <div className="p-6">
              <form className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Cari franchise..."
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

      {/* =====================================================
          “Menu Utama” (semua link yang ada di hamburger)
          ===================================================== */}
      <section className="container mx-auto px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu Utama</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {/* Pengumuman Administrator */}
          <Link href="/announcement" passHref>
            <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-yellow-500 group-hover:text-yellow-600 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C8.67 6.165 8 7.388 8 8.75v5.408c0 .538-.214 1.055-.595 1.436L6 17h9z"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">Pengumuman Administrator</span>
            </a>
          </Link>

          {/* Notifikasiku */}
          <Link href="/notifikasi" passHref>
            <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C8.67 6.165 8 7.388 8 8.75v5.408c0 .538-.214 1.055-.595 1.436L6 17h9z"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">Notifikasiku</span>
            </a>
          </Link>

          {/* Favoritku */}
          <Link href="/favorit" passHref>
            <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500 group-hover:text-red-600 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">Favoritku</span>
            </a>
          </Link>

          {/* Forum Global */}
          <Link href="/forum" passHref>
            <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-500 group-hover:text-green-600 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 21l-6-6m-4 0a8 8 0 10-8-8 8 8 0 008 8z"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">Forum Global</span>
            </a>
          </Link>

          {/* Blog Global */}
          <Link href="/blog" passHref>
            <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-500 group-hover:text-purple-600 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 1.343-3 3v3h6v-3c0-1.657-1.343-3-3-3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 21h14a2 2 0 002-2v-3a7 7 0 00-7-7H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">Blog Global</span>
            </a>
          </Link>

          {/* Pusat Bantuan */}
          <Link href="/help" passHref>
            <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-500 group-hover:text-indigo-600 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 10c0 3.866-3.582 7-8 7-4.418 0-8-3.134-8-7 0-3.866 3.582-7 8-7 4.418 0 8 3.134 8 7z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14v2m0-8v2"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">Pusat Bantuan</span>
            </a>
          </Link>

          {/* Syarat & Ketentuan */}
          <Link href="/terms" passHref>
            <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-700 group-hover:text-gray-800 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-4 0-8 2-8 6 0 4 4 6 8 6s8-2 8-6c0-4-4-6-8-6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 12v.01"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">Syarat & Ketentuan</span>
            </a>
          </Link>

          {/* Kebijakan Privasi */}
          <Link href="/privacy" passHref>
            <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500 group-hover:text-gray-600 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0-3.866.686-7 3-7s3 3.134 3 7c0 3.866-3 5-3 5s-3-1.134-3-5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v8"
                />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-700">Kebijakan Privasi</span>
            </a>
          </Link>

          {/* Dashboard Administrator (hanya untuk role “Administrator”) */}
          {role === 'Administrator' && (
            <Link href="/admin" passHref>
              <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500 group-hover:text-red-600 transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18M3 6h18M3 18h18M7 6v12"
                  />
                </svg>
                <span className="mt-2 text-sm font-medium text-gray-700">Dashboard Admin</span>
              </a>
            </Link>
          )}

          {/* Dashboard Franchisor (hanya untuk role “franchisor”) */}
          {role === 'franchisor' && (
            <Link href="/franchisor/dashboard" passHref>
              <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500 group-hover:text-green-600 transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11V5m0 6l-4-4m4 4l4-4M4 20h16"
                  />
                </svg>
                <span className="mt-2 text-sm font-medium text-gray-700">Dashboard Franchisor</span>
              </a>
            </Link>
          )}

          {/* Jadi Franchisor (untuk semua user yang sudah login) */}
          {session && (
            <Link href="/franchisor" passHref>
              <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-teal-500 group-hover:text-teal-600 transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 00-8 0v2H6a2 2 0 00-2 2v8h16v-8a2 2 0 00-2-2h-2V7z"
                  />
                </svg>
                <span className="mt-2 text-sm font-medium text-gray-700">Jadi Franchisor</span>
              </a>
            </Link>
          )}

          {/* Login (jika belum login) */}
          {!session && (
            <Link href="/login" passHref>
              <a className="group flex flex-col items-center bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14m-7-7l7 7-7 7"
                  />
                </svg>
                <span className="mt-2 text-sm font-medium text-gray-700">Login</span>
              </a>
            </Link>
          )}
        </div>
      </section>

      {/* ===========================================
            Daftar Franchise (Grid) – Tetap ditampilkan
          =========================================== */}
      <section className="container mx-auto px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Franchise</h2>

        {loadingFranchises ? (
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

      {/* ========== Footer ========== */}
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
                <Link href="#" passHref>
                  <a className="hover:underline">Cari Agen</a>
                </Link>
              </li>
              <li>
                <Link href="#" passHref>
                  <a className="hover:underline">Iklankan Franchise</a>
                </Link>
              </li>
              <li>
                <Link href="#" passHref>
                  <a className="hover:underline">Jual Franchise</a>
                </Link>
              </li>
              <li>
                <Link href="#" passHref>
                  <a className="hover:underline">Simulasi Investasi</a>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.656 9.128 8.438 9.879v-6.99H7.898v-2.889h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.463H15.04c-1.263 0-1.658.78-1.658 1.577v1.897h2.828l-.453 2.889h-2.375v6.99C18.344 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="hover:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775a4.936 4.936 0 002.163-2.724 9.868 9.868 0 01-3.127 1.195 4.92 4.92 0 00-8.379 4.482A13.955 13.955 0 011.671 3.149a4.822 4.822 0 001.523 6.56 4.902 4.902 0 01-2.229-.616c-.054 2.28 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.085 4.928 4.928 0 004.604 3.417A9.867 9.867 0 010 19.54a13.9 13.9 0 007.548 2.212c9.058 0 14.01-7.507 14.01-14.01 0-.213 0-.425-.015-.637A10.012 10.012 0 0024 4.59z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="hover:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.313 3.608 1.289.974.975 1.227 2.243 1.289 3.608.058 1.265.069 1.646.069 4.848 0 3.205-.011 3.584-.069 4.849-.062 1.366-.315 2.633-1.289 3.608-.975.974-2.242 1.227-3.608 1.289-1.265.058-1.645.07-4.849.07-3.204 0-3.584-.012-4.849-.07-1.366-.062-2.633-.315-3.608-1.289-.974-.975-1.227-2.242-1.289-3.608-.058-1.265-.07-1.645-.07-4.849 0-3.205.012-3.584.07-4.849.062-1.366.315-2.633 1.289-3.608.975-.974 2.242-1.227 3.608-1.289 1.265-.058 1.645-.07 4.849-.07M12 0C8.741 0 8.332.014 7.052.072 5.78.13 4.602.346 3.603 1.345 2.605 2.343 2.39 3.52 2.332 4.792.274 6.074.26 6.483.26 12s.014 5.926.072 7.208c.058 1.272.273 2.449 1.271 3.447.998.999 2.175 1.215 3.447 1.273 1.282.058 1.691.072 7.217.072s5.935-.014 7.217-.072c1.272-.058 2.449-.274 3.447-1.273.998-.998 1.214-2.175 1.272-3.447.058-1.282.072-1.691.072-7.217s-.014-5.935-.072-7.217c-.058-1.272-.274-2.449-1.273-3.447C19.65.346 18.473.13 17.201.072 15.919.014 15.51 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            &copy; 2025 FranchiseHub. Semua hak dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
