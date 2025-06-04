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
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

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
        <title>Blog FranchiseHub - Inspirasi & Wawasan Bisnis Franchise</title>
        <meta
          name="description"
          content="Baca blog, riset, dan cerita sukses franchise Indonesia hanya di FranchiseHub. Tips, studi kasus, panduan bisnis, dan banyak lagi."
        />
        <link rel="canonical" href="https://franchisehubcom.vercel.app/blog-global" />
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Blog FranchiseHub</h1>
          {(role === 'franchisor' || role === 'administrator') && (
            <div className="flex flex-col items-center">
              <Link
                href="/blog/manage"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg hover:bg-blue-700 transition"
                title="Buat Blog Baru"
              >
                📝
              </Link>
              <span className="text-xs mt-2 text-blue-700 font-semibold">Ayo buat blog</span>
            </div>
          )}
        </div>
        {loading ? (
          <p>Memuat blog...</p>
        ) : blogs.length === 0 ? (
          <p>Belum ada blog.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {blogs.map(blog => {
              // Buat ringkasan 110 karakter dari konten (tanpa tag HTML)
              const excerpt = blog.content.replace(/<[^>]+>/g, '').slice(0, 110) + (blog.content.length > 110 ? '...' : '');
              return (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="block border rounded-lg hover:shadow-md transition bg-white">
                  <div>
                    {blog.cover_url && (
                      <img
                        src={blog.cover_url}
                        alt={blog.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                        loading="lazy"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span className="font-medium">{blog.category}</span>
                        <span>•</span>
                        <span>{new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <h2 className="text-lg font-semibold mb-1 line-clamp-2">{blog.title}</h2>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{excerpt}</p>
                      <div className="text-xs text-gray-400 italic">Oleh {blog.author}</div>
                    </div>
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
