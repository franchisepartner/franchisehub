import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  created_at: string;
  cover_url: string;
  content: string;
}

export default function BlogGlobal() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  // Pagination responsive
  const [blogsPerPage, setBlogsPerPage] = useState(20);
  useEffect(() => {
    function updateBlogsPerPage() {
      if (window.innerWidth < 768) {
        setBlogsPerPage(10);
      } else {
        setBlogsPerPage(20);
      }
    }
    updateBlogsPerPage();
    window.addEventListener('resize', updateBlogsPerPage);
    return () => window.removeEventListener('resize', updateBlogsPerPage);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const pagedBlogs = blogs.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage);

  useEffect(() => { setCurrentPage(1); }, [blogs.length, blogsPerPage]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    async function fetchRole() {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile) setRole(profile.role);
      }
    }
    fetchRole();
  }, [session]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBlogs(data);
      }
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  return (
    <>
      <Head>
        <title>Blog FranchiseNusantara - Inspirasi & Wawasan Bisnis Franchise</title>
        <meta
          name="description"
          content="Baca blog, riset, dan cerita sukses franchise Indonesia hanya di FranchiseHub. Tips, studi kasus, panduan bisnis, dan banyak lagi."
        />
        <link rel="canonical" href="https://franchisenusantara.com/blog-global" />
      </Head>
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-10 min-h-screen relative">
        {/* Header */}
        <div className="flex justify-between items-end mb-9">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1 tracking-tight text-blue-900">
                Blog FranchiseNusantara
              </h1>
              <button
                className="text-blue-600 hover:text-blue-900 text-xl mt-1"
                onClick={() => setShowInfo(true)}
                type="button"
                title="Tentang fitur blog"
              >
                ℹ️
              </button>
            </div>
            <p className="text-gray-500 text-sm md:text-base">
              Inspirasi bisnis, wawasan franchise, dan tips sukses terkini dari para pelaku dan ahli.
            </p>
          </div>
          {(role === 'franchisor' || role === 'administrator') && (
            <div>
              <Link
                href="/blog/manage"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white text-3xl shadow-lg hover:scale-110 hover:shadow-2xl transition ring-2 ring-white border-4 border-white"
                title="Buat Blog Baru"
              >
                <span className="sr-only">Buat Blog Baru</span>
                📝
              </Link>
              <span className="block text-xs text-blue-600 font-semibold text-center mt-1">Buat blog</span>
            </div>
          )}
        </div>

        {/* POPUP INFO */}
        {showInfo && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-3" onClick={() => setShowInfo(false)}>
            <div
              className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <button className="absolute top-3 right-5 text-xl text-gray-400 hover:text-red-600" onClick={() => setShowInfo(false)}>&times;</button>
              <h2 className="font-bold text-xl mb-3">Tentang Fitur Blog</h2>
              <div className="text-gray-800 leading-relaxed">
                Blog FranchiseNusantara adalah ruang berbagi inspirasi, tips, dan kisah sukses seputar dunia franchise.<br /><br />
                <b>Fitur & Aturan:</b>
                <ul className="list-disc pl-5 mb-2">
                  <li>Blog dapat dibuat oleh franchisor dan administrator.</li>
                  <li>Semua pengguna bisa membaca blog, baik yang login maupun belum login.</li>
                  <li>Konten yang diperbolehkan: tips, studi kasus, analisis peluang, cerita sukses/gagal, dan panduan bisnis.</li>
                  <li>Admin berhak mengedit atau menghapus blog yang tidak layak.</li>
                  <li>Gunakan bahasa sopan, berbagi ilmu, hindari SARA & promosi pribadi berlebihan.</li>
                </ul>
                <span className="block mt-2">Yuk, baca & tulis blog untuk membangun ekosistem franchise yang lebih sehat & kolaboratif!</span>
              </div>
            </div>
          </div>
        )}

        {/* List Blog */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 animate-pulse">Memuat blog...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Belum ada blog.</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {pagedBlogs.map(blog => {
                const excerpt = blog.content.replace(/<[^>]+>/g, '').slice(0, 110) + (blog.content.length > 110 ? '...' : '');
                return (
                  <Link
                    key={blog.id}
                    href={`/detail/${blog.slug}`}
                    className="group flex flex-col bg-white rounded-2xl border border-blue-50 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition overflow-hidden"
                  >
                    <div className="relative">
                      {blog.cover_url && (
                        <img
                          src={blog.cover_url}
                          alt={blog.title}
                          className="w-full h-44 object-cover bg-gray-100 group-hover:scale-[1.03] transition rounded-t-2xl"
                          loading="lazy"
                        />
                      )}
                      <span className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        {blog.category}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col p-4">
                      <h2 className="text-lg font-semibold mb-1 line-clamp-2 text-gray-900 group-hover:text-blue-700">{blog.title}</h2>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mb-2">
                        <span>{new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>Oleh {blog.author}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 flex-1">{excerpt}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            {/* PAGINATION BUTTONS */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-full font-bold border transition
                      ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
