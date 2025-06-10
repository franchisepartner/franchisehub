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
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [popupAnim, setPopupAnim] = useState<'in' | 'out'>('in');
  const inputRef = useRef<HTMLInputElement>(null);
  const popupInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setSelectedIdx(-1);
      return;
    }
    const fetchAll = async () => {
      const term = searchTerm.toLowerCase();
      const { data: franchiseData } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, category, slug, logo_url, tags')
        .limit(7);
      const { data: blogData } = await supabase
        .from('blogs')
        .select('id, title, slug, cover_url, category')
        .limit(7);
      const { data: threadData } = await supabase
        .from('threads')
        .select('id, title, image_url')
        .limit(7);

      const staticMenus = [
        { type: 'auth', label: 'Login', url: '/login', icon: '🔑', desc: 'Masuk ke FranchiseHub', match: ['login', 'masuk', 'signin'] },
        { type: 'auth', label: 'Logout', url: '/logout', icon: '🚪', desc: 'Keluar', match: ['logout', 'keluar', 'signout'] },
        { type: 'auth', label: 'Daftar', url: '/register', icon: '📝', desc: 'Daftar sebagai user baru', match: ['daftar', 'register', 'signup'] },
        { type: 'fitur', label: 'Pengembangan', url: '/pengembangan', icon: '🛠️', desc: 'Fitur & roadmap baru', match: ['pengembangan', 'roadmap', 'dev'] },
        { type: 'kontak', label: 'Kontak Administrator', url: 'mailto:support@franchisehub.co.id', icon: '📧', desc: 'Hubungi admin FranchiseHub', match: ['admin', 'kontak', 'hubungi'] },
        { type: 'fitur', label: 'Donasi', url: '/donate', icon: '💸', desc: 'Bantu FranchiseHub berkembang', match: ['donasi', 'donate'] },
        { type: 'fitur', label: 'Kontributor', url: '/contributors', icon: '🤝', desc: 'Lihat kontributor', match: ['kontributor', 'contributors'] },
        { type: 'bantuan', label: 'Pusat Bantuan', url: '/pusat-bantuan', icon: '❓', desc: 'Bantuan & FAQ', match: ['bantuan', 'faq', 'help'] },
        { type: 'bantuan', label: 'Syarat & Ketentuan', url: '/syarat-ketentuan', icon: '📄', desc: 'Syarat Layanan', match: ['syarat', 'terms'] },
        { type: 'bantuan', label: 'Kebijakan Privasi', url: '/privacy', icon: '🔒', desc: 'Kebijakan data', match: ['privasi', 'privacy'] },
        { type: 'fitur', label: 'Forum Global', url: '/forum-global', icon: '🌐', desc: 'Diskusi umum', match: ['forum', 'diskusi'] },
        { type: 'fitur', label: 'Blog Global', url: '/blog-global', icon: '📝', desc: 'Blog bisnis & franchise', match: ['blog', 'artikel', 'jurnal'] },
        { type: 'fitur', label: 'Pengumuman', url: '/announcement', icon: '📢', desc: 'Info resmi', match: ['pengumuman', 'info'] },
        { type: 'fitur', label: 'Kalkulator', url: '#calculator', icon: '🧮', desc: 'Kalkulator bisnis', match: ['kalkulator', 'calculator'] },
      ];

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

  useEffect(() => {
    if (showSearchPopup && popupInputRef.current) {
      setTimeout(() => {
        popupInputRef.current?.focus();
      }, 100);
    }
  }, [showSearchPopup]);

  const openPopup = () => {
    setShowSearchPopup(true);
    setPopupAnim('in');
  };
  const closePopup = () => {
    setPopupAnim('out');
    setTimeout(() => setShowSearchPopup(false), 230);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <nav className="w-full bg-white shadow-lg px-3 sm:px-8 py-2 sm:py-3 flex items-center justify-between rounded-b-2xl relative z-50">
        {/* Logo */}
        <div className="flex-shrink-0 select-none">
          <Link href="/" passHref>
            <a className="font-extrabold text-blue-600 text-xl sm:text-2xl tracking-tight hover:text-blue-800 transition flex items-center gap-2">
             FranchiseNusantara
            </a>
          </Link>
        </div>
        {/* Search Bar */}
        {!isHomePage && (
          <div className="flex-1 mx-2 sm:mx-6 relative flex justify-center">
            <form
              className="flex items-center relative w-full max-w-[150px] sm:max-w-xs md:max-w-md"
              autoComplete="off"
              onSubmit={e => {
                e.preventDefault();
                openPopup();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari franchise, blog, forum, fitur, kontak, dsb..."
                className="w-full px-4 py-2 border border-blue-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base bg-white font-semibold transition cursor-pointer"
                value={searchTerm}
                readOnly
                onClick={openPopup}
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
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg font-bold shadow hover:bg-blue-700 transition flex items-center"
                tabIndex={-1}
                style={{
                  minWidth: 42,
                  minHeight: 42,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={openPopup}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth={2} />
                  <path d="M21 21l-4-4" strokeWidth={2} strokeLinecap="round" />
                </svg>
              </button>
            </form>
          </div>
        )}
        {/* Kanan */}
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

      {/* Popup search mode + animasi */}
      {showSearchPopup && (
        <div
          className={`fixed inset-0 z-[9999] bg-black/40 flex items-start justify-center px-2 py-10 transition-all duration-200
            ${popupAnim === 'in' ? 'animate-fade-in animate-scale-up' : 'animate-fade-out animate-scale-down'}
          `}
          onClick={closePopup}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-6 relative transition-all duration-200
              ${popupAnim === 'in' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}
            style={{ transformOrigin: 'center top' }}
            onClick={e => e.stopPropagation()}
          >
            <form
              className="flex items-center mb-3"
              autoComplete="off"
              onSubmit={e => {
                e.preventDefault();
                if (searchResults[0]) {
                  closePopup();
                  if (searchResults[0].url === '#calculator') {
                    document.getElementById('openCalculator')?.click();
                  } else {
                    window.location.href = searchResults[0].url;
                  }
                }
              }}
            >
              <input
                ref={popupInputRef}
                autoFocus
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari franchise, blog, forum, fitur, kontak, dsb..."
                className="w-full px-6 py-4 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-semibold shadow"
                style={{ fontWeight: 600, minWidth: 0 }}
                onKeyDown={e => {
                  if (e.key === 'Escape') closePopup();
                }}
              />
              <button
                type="submit"
                className="ml-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition text-lg"
              >
                Cari
              </button>
            </form>
            <div className="w-full">
              {searchResults.length === 0 && (
                <div className="p-6 text-gray-400 text-center">Tidak ditemukan.</div>
              )}
              {searchResults.length > 0 && (
                <div className="divide-y border rounded-xl bg-white/90 max-h-[350px] overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <a
                      key={item.url + idx}
                      href={item.url === '#calculator' ? '#' : item.url}
                      className={`
                        flex items-center px-5 py-4 gap-3 hover:bg-blue-50 cursor-pointer transition
                        ${selectedIdx === idx ? 'bg-blue-100/70' : ''}
                      `}
                      tabIndex={-1}
                      onMouseDown={e => {
                        e.preventDefault();
                        closePopup();
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
                  ))}
                </div>
              )}
            </div>
            {/* Close button for popup */}
            <button
              onClick={closePopup}
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
              tabIndex={-1}
            >&times;</button>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scale-up {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        @keyframes scale-down {
          from { transform: scale(1); }
          to { transform: scale(0.95); }
        }
        .animate-fade-in {
          animation: fade-in 0.18s ease both;
        }
        .animate-fade-out {
          animation: fade-out 0.18s ease both;
        }
        .animate-scale-up {
          animation: scale-up 0.2s cubic-bezier(.48,1.6,.59,.99) both;
        }
        .animate-scale-down {
          animation: scale-down 0.18s cubic-bezier(.48,1.6,.59,.99) both;
        }
      `}</style>
    </>
  );
}
