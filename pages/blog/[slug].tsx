import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  created_at: string;
  cover_url: string;
  content: string;
  created_by: string;
}

export default function BlogDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setBlog(null);
      } else {
        setBlog(data);
        await trackVisit(data);
      }
      setLoading(false);
    };
    fetchBlog();
  }, [slug]);

  async function trackVisit(blogData: Blog) {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    let viewerRole = 'calon_franchisee';
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      viewerRole = profile?.role || 'calon_franchisee';
    }
    await supabase.from('visit_logs').insert({
      content_type: 'blog',
      content_id: blogData.id,
      owner_id: blogData.created_by,
      viewer_role: viewerRole,
    });
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-gray-400">Memuat artikel...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Blog tidak ditemukan.</div>
      </div>
    );
  }

  const plainContent = blog.content.replace(/<[^>]+>/g, '');
  const seoDescription = plainContent.slice(0, 150) + (plainContent.length > 150 ? '...' : '');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": seoDescription,
    "image": blog.cover_url,
    "author": { "@type": "Person", "name": blog.author },
    "datePublished": blog.created_at,
    "publisher": {
      "@type": "Organization",
      "name": "FranchiseHub",
      "logo": {
        "@type": "ImageObject",
        "url": "https://franchisehubcom.vercel.app/logo192.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://franchisehubcom.vercel.app/blog/${blog.slug}`
    }
  };

  return (
    <>
      <Head>
        <title>{blog.title} | FranchiseHub</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={blog.cover_url} />
        <meta property="og:url" content={`https://franchisehubcom.vercel.app/blog/${blog.slug}`} />
        <meta property="og:site_name" content="FranchiseHub" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={blog.cover_url} />
        <link rel="canonical" href={`https://franchisehubcom.vercel.app/blog/${blog.slug}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="max-w-3xl mx-auto px-3 sm:px-6 pb-24 pt-6 min-h-screen">
        {/* Cover */}
        {blog.cover_url && (
          <div className="rounded-2xl overflow-hidden shadow-xl mb-7 border border-blue-100">
            <img
              src={blog.cover_url}
              alt={blog.title}
              className="object-cover w-full max-h-[420px] min-h-[200px] transition"
              loading="lazy"
              style={{ background: "#f7faff" }}
            />
          </div>
        )}
        {/* Kategori, tanggal, author */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
          <span className="inline-block bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
            {blog.category}
          </span>
          <span className="text-gray-400 select-none">•</span>
          <span className="text-gray-600">
            {new Date(blog.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="text-gray-400 select-none">•</span>
          <span className="text-gray-600">by <span className="font-medium">{blog.author}</span></span>
        </div>
        {/* Judul */}
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-2 text-gray-900 drop-shadow-sm">
          {blog.title}
        </h1>
        <hr className="border-blue-100 mb-7" />

        {/* Artikel */}
        <div
          className="prose prose-lg max-w-none bg-white/90 shadow-lg border border-blue-50 rounded-2xl px-4 py-7 md:px-8 md:py-9 mb-4 transition"
          style={{ fontSize: '1.11rem' }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* SEO Friendly Footer */}
        <div className="mt-10 text-xs text-gray-400 text-center select-none">
          © {new Date().getFullYear()} FranchiseHub · Artikel bisnis & franchise Indonesia
        </div>
      </div>
    </>
  );
}
