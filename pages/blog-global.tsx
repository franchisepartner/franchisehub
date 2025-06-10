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
            <h1 className="text-3xl md:text-4xl font-extrabold mb-1 tracking-tight text-blue-900">Blog FranchiseNusantara</h1>
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
        {/* List Blog */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 animate-pulse">Memuat blog...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Belum ada blog.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {blogs.map(blog => {
              // Buat ringkasan 110 karakter dari konten (tanpa tag HTML)
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
        )}
      </div>
    </>
  );
}
