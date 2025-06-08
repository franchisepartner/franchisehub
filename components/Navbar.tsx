// File: components/Navbar.tsx

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import BurgerMenu from './BurgerMenu';

export default function Navbar() {
  const router = useRouter();
  const [navbarSession, setNavbarSession] = useState<any>(null);
  const [role, setRole] = useState<string>('Franchisee');
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Universal Search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHomePage = router.pathname === '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setNavbarSession(data.session);
      if (data.session) fetchUserRole(data.session.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setNavbarSession(session);
      if (session) fetchUserRole(session.user.id);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', userId)
      .single();
    if (data) {
      setRole(data.role || 'Franchisee');
      setIsAdmin(!!data.is_admin || data.role === 'administrator');
    }
  };

  const userGreeting = navbarSession
    ? `${navbarSession.user?.user_metadata?.full_name || 'User'}_${role}`
    : 'Calon Franchisee';

  // UNIVERSAL SEARCH dengan out-of-the-box links
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setSelectedIdx(-1);
      return;
    }
    const fetchAll = async () => {
      const term = searchTerm.toLowerCase();
      // Franchise
      const { data: franchiseData } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, category, slug, logo_url, tags')
        .limit(7);
      // Blog
      const { data: blogData } = await supabase
        .from('blogs')
        .select('id, title, slug, cover_url, category')
        .limit(7);
      // Forum
      const { data: threadData } = await supabase
        .from('threads')
        .select('id, title, image_url')
        .limit(7);

      // Static + Out of the box menus
      const staticMenus = [
        // Platform
        { type: 'auth', label: 'Login', url: '/login', icon: '🔑', desc: 'Masuk ke FranchiseHub', match: ['login', 'masuk', 'signin'] },
        { type: 'auth', label: 'Logout', url: '/logout', icon: '🚪', desc: 'Keluar', match: ['logout', 'keluar', 'signout'] },
        { type: 'auth', label: 'Daftar', url: '/register', icon: '📝', desc: 'Daftar sebagai user baru', match: ['daftar', 'register', 'signup'] },
        // Out of the box
        { type: 'fitur', label: 'Pengembangan', url: '/pengembangan', icon: '🛠️', desc: 'Fitur & roadmap baru', match: ['pengembangan', 'roadmap', 'dev'] },
        { type: 'kontak', label: 'Kontak Administrator', url: 'mailto:support@franchisehub.co.id', icon: '📧', desc: 'Hubungi admin FranchiseHub', match: ['admin', 'kontak', 'hubungi'] },
        { type: 'fitur', label: 'Donasi', url: '/donate', icon: '💸', desc: 'Bantu FranchiseHub berkembang', match: ['donasi', 'donate'] },
        { type: 'fitur', label: 'Kontributor', url: '/contributors', icon: '🤝', desc: 'Lihat kontributor', match: ['kontributor', 'contributors'] },
        // Bantuan & info
        { type: 'bantuan', label: 'Pusat Bantuan', url: '/pusat-bantuan', icon: '❓', desc: 'Bantuan & FAQ', match: ['bantuan', 'faq', 'help'] },
        { type: 'bantuan', label: 'Syarat & Ketentuan', url: '/syarat-ketentuan', icon: '📄', desc: 'Syarat Layanan', match: ['syarat', 'terms'] },
        { type: 'bantuan', label: 'Kebijakan Privasi', url: '/privacy', icon: '🔒', desc: 'Kebijakan data', match: ['privasi', 'privacy'] },
        // Fitur utama
        { type: 'fitur', label: 'Forum Global', url: '/forum-global', icon: '🌐', desc: 'Diskusi umum', match: ['forum', 'diskusi'] },
        { type: 'fitur', label: 'Blog Global', url: '/blog-global', icon: '📝', desc: 'Blog bisnis & franchise', match: ['blog', 'artikel', 'jurnal'] },
        { type: 'fitur', label: 'Pengumuman', url: '/announcement', icon: '📢', desc: 'Info resmi', match: ['pengumuman', 'info'] },
        { type: 'fitur', label: 'Kalkulator', url: '#calculator', icon: '🧮', desc: 'Kalkulator bisnis', match: ['kalkulator', 'calculator'] },
      ];

      // Gabung dan cari cocok
      const results: any[] = [
        ...(franchiseData || []).map((fr) => ({
          type: 'franchise',
          label: fr.franchise_name,
          desc: fr.category,
          url: `/franchise/${fr.slug}`,
          img: fr.logo_url
            ? supabase.storage.from('listing-images').getPublicUrl(fr.logo_url).data.publicUrl
            : '/logo192.png',
          tags: fr.tags || '',
        })),
        ...(blogData || []).map((bl) => ({
          type: 'blog',
          label: bl.title,
          desc: bl.category,
          url: `/detail/${bl.slug}`,
          img: bl.cover_url
            ? (bl.cover_url.startsWith('http')
              ? bl.cover_url
              : supabase.storage.from('blog-assets').getPublicUrl(bl.cover_url).data.publicUrl)
            : '/logo192.png',
        })),
        ...(threadData || []).map((th) => ({
          type: 'forum',
          label: th.title,
          desc: 'Forum Global',
          url: `/forum-global?open=${th.id}`,
          img: th.image_url
            ? supabase.storage.from('thread-images').getPublicUrl(th.image_url).data.publicUrl
            : '/logo192.png',
        })),
        ...staticMenus
          .filter((sm) =>
            sm.match.some((m) => term.includes(m)) ||
            sm.label.toLowerCase().includes(term) ||
            sm.desc.toLowerCase().includes(term)
          )
          .map((sm) => ({
            ...sm,
            img: undefined,
          })),
      ].filter((item) =>
        item.label.toLowerCase().includes(term) ||
        (item.desc && item.desc.toLowerCase().includes(term)) ||
        ('tags' in item && typeof item.tags === 'string' && item.tags.toLowerCase().includes(term))
      );
      setSearchResults(results.slice(0, 8));
      setSelectedIdx(-1);
    };
    fetchAll();
  }, [searchTerm]);

  // Keyboard nav
  useEffect(() => {
    if (!showDropdown) return;
    function handleKey(e: KeyboardEvent) {
      if (searchResults.length === 0) return;
      if (e.key === 'ArrowDown') setSelectedIdx(idx => (idx + 1) % searchResults.length);
      else if (e.key === 'ArrowUp') setSelectedIdx(idx => (idx - 1 + searchResults.length) % searchResults.length);
      else if (e.key === 'Enter') {
        if (selectedIdx >= 0 && searchResults[selectedIdx]) {
          if (searchResults[selectedIdx].url === '#calculator') {
            document.getElementById('openCalculator')?.click();
          } else {
            window.location.href = searchResults[selectedIdx].url;
          }
        }
      } else if (e.key === 'Escape') setShowDropdown(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showDropdown, searchResults, selectedIdx]);

  // (Optional) Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex items-center justify-between relative z-50">
        {/* Tulisan FranchiseHub */}
        <div className="flex-shrink-0 select-none">
          <Link href="/" passHref>
            <a className="font-bold text-blue-600 text-xl sm:text-2xl tracking-tight hover:text-blue-700 transition">
              FranchiseHub
            </a>
          </Link>
        </div>

        {/* Search Bar */}
        {!isHomePage && (
          <div className="flex-1 mx-4 lg:mx-12 relative max-w-xl">
            <form
              className="flex items-center relative"
              autoComplete="off"
              onSubmit={e => {
                e.preventDefault();
                if (searchResults[0]) {
                  if (searchResults[0].url === '#calculator') {
                    document.getElementById('openCalculator')?.click();
                  } else {
                    window.location.href = searchResults[0].url;
                  }
                }
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari franchise, blog, forum, fitur, kontak, dsb..."
                className="flex-1 px-5 py-2 border border-blue-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base bg-white font-semibold"
                value={searchTerm}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ fontWeight: 500, minWidth: 0 }}
              />
              <button
                id="openCalculator"
                type="button"
                className="hidden"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openCalculator'));
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg font-bold shadow hover:bg-blue-700 transition flex items-center"
                tabIndex={-1}
                style={{
                  minWidth: 42,
                  minHeight: 42,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth={2} />
                  <path d="M21 21l-4-4" strokeWidth={2} strokeLinecap="round" />
                </svg>
              </button>
            </form>
            {showDropdown && searchTerm && (
              <div className="absolute left-0 w-full bg-white rounded-b-lg shadow-2xl z-40 border-x border-b border-blue-100 max-h-80 overflow-y-auto animate-fade-in">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-gray-400 text-center">Tidak ditemukan.</div>
                ) : (
                  searchResults.map((item, idx) => (
                    <a
                      key={item.url + idx}
                      href={item.url === '#calculator' ? '#' : item.url}
                      className={`
                        flex items-center px-4 py-3 gap-3 border-b last:border-0 transition
                        ${selectedIdx === idx ? 'bg-blue-100/70' : 'hover:bg-blue-50'}
                      `}
                      tabIndex={-1}
                      onMouseDown={e => {
                        e.preventDefault();
                        if (item.url === '#calculator') {
                          document.getElementById('openCalculator')?.click();
                        } else if (item.type === 'auth' && item.label === 'Logout') {
                          handleLogout();
                        } else {
                          window.location.href = item.url;
                        }
                      }}
                    >
                      {item.img ? (
                        <img
                          src={item.img}
                          alt={item.label}
                          className="w-10 h-10 rounded-xl object-cover bg-gray-100 border"
                        />
                      ) : (
                        <span className="w-10 h-10 flex items-center justify-center text-xl">{item.icon || '🔎'}</span>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-600">
                          {item.type === 'franchise'
                            ? `Franchise (${item.desc})`
                            : item.type === 'blog'
                            ? 'Blog Bisnis'
                            : item.type === 'forum'
                            ? 'Forum Global'
                            : item.type === 'bantuan'
                            ? 'Bantuan'
                            : item.type === 'fitur'
                            ? 'Fitur'
                            : item.type === 'kontak'
                            ? 'Kontak'
                            : 'Menu'}
                        </div>
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
        )}

        {/* Kanan: Sapaan hanya di homepage */}
        <div className="flex items-center space-x-3">
          {isHomePage && (
            <p className="italic text-gray-500 text-sm max-w-[150px] truncate">Halo, {userGreeting}!</p>
          )}
          {role === 'franchisor' && (
            <button
              className="flex items-center px-2 py-1 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-700 font-medium text-2xl transition"
              onClick={() => router.push('/franchisor/dashboard')}
              title="Dashboard Franchisor"
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
            >
              🎩
            </button>
          )}
          {isAdmin && (
            <button
              className="flex items-center px-2 py-1 rounded-full bg-gray-100 hover:bg-pink-100 text-pink-700 font-medium text-2xl transition"
              onClick={() => router.push('/admin')}
              title="Dashboard Administrator"
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
            >
              🃏
            </button>
          )}
          <button
            onClick={() => setMenuOpen(true)}
            className="text-2xl"
            aria-label="Buka menu"
          >
            ☰
          </button>
        </div>
      </nav>
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
