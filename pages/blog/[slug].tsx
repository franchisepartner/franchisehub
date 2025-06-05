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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p>Memuat artikel...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p>Blog tidak ditemukan.</p>
      </div>
    );
  }

  // Buat excerpt untuk meta description
  const plainContent = blog.content.replace(/<[^>]+>/g, '');
  const seoDescription = plainContent.slice(0, 150) + (plainContent.length > 150 ? '...' : '');

  // Struktur JSON-LD untuk SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": seoDescription,
    "image": blog.cover_url,
    "author": {
      "@type": "Person",
      "name": blog.author,
    },
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>https://supabase.com/dashboard/project/dtbuiijyevhfxsfzsknr/editor/30891
        <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-x-3">
          <span className="font-medium">{blog.category}</span>
          <span>|</span>
          <span>{new Date(blog.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>|</span>
          <span>{blog.author}</span>
        </div>
        <hr className="border-black mb-6" />
        {blog.cover_url && (
          <img
            src={blog.cover_url}
            alt="Cover"
            className="w-full rounded-lg mb-6 max-h-[420px] object-cover"
            loading="lazy"
          />
        )}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </>
  );
}
