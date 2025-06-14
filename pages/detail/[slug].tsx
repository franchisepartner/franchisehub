import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaShareAlt, FaFileAlt } from 'react-icons/fa';

interface Blog {
  id: string;
  title: string;
  content: string;
  cover_url?: string;
  category?: string;
  author?: string;
  created_by: string;
  created_at: string;
  url?: string;
  image?: string;
  type?: string;
}

interface Comment {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export default function DetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState<any>(null);
  const [shareMsg, setShareMsg] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  // State showcase
  const [showcaseBlogs, setShowcaseBlogs] = useState<Blog[]>([]);
  const [showcaseListings, setShowcaseListings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBlog() {
      if (!slug) return;
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        setBlog(data);

        // Catat kunjungan ke blog (visit_logs)
        let viewerRole = 'calon_franchisee';
        let userId = null;
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          userId = sessionData?.session?.user?.id || null;
          if (userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .single();
            viewerRole = profile?.role || 'calon_franchisee';
          }
        } catch (e) {}
        await supabase.from('visit_logs').insert({
          content_type: 'blog',
          content_id: data.id,
          owner_id: data.created_by,
          viewer_role: viewerRole,
        });

        // --- FETCH SHOWCASE KARYA FRANCHISOR ---
        const [listingRes, blogRes] = await Promise.all([
          supabase
            .from('franchise_listings')
            .select('id, franchise_name, logo_url, slug, created_at')
            .eq('created_by', data.created_by),
          supabase
            .from('blogs')
            .select('id, title, cover_url, slug, created_at')
            .eq('created_by', data.created_by)
            .neq('id', data.id),
        ]);
        setShowcaseListings(
          (listingRes.data || []).map((item: any) => ({
            ...item,
            image: item.logo_url
              ? supabase.storage.from('listing-images').getPublicUrl(item.logo_url).data.publicUrl
              : '/logo192.png',
            url: `/franchise/${item.slug}`,
            date: item.created_at,
            type: 'listing',
            title: item.franchise_name,
          }))
        );
        setShowcaseBlogs(
          (blogRes.data || []).map((item: any) => ({
            ...item,
            image: item.cover_url,
            url: `/detail/${item.slug}`,
            date: item.created_at,
            type: 'blog',
            title: item.title,
          }))
        );
      }
    }

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }

    fetchBlog();
    getUser();
    if (slug) fetchComments();
    // eslint-disable-next-line
  }, [slug]);

  const userName = user?.user_metadata?.full_name || user?.email || 'Anonymous';

  async function fetchComments() {
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('slug', slug)
      .order('created_at', { ascending: false });
    if (error) {
      setErrorMsg('Gagal memuat komentar.');
    } else {
      setComments(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!newComment.trim()) return;
    if (!user) {
      alert("Anda harus login untuk mengirim komentar!");
      return;
    }
    const { error } = await supabase.from('comments').insert({
      slug: slug,
      content: newComment,
      created_by: userName,
    });
    if (!error) {
      setNewComment('');
      fetchComments();
    } else {
      setErrorMsg('Gagal mengirim komentar.');
    }
  }

  async function handleDelete(commentId: string) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      fetchComments();
    } else {
      setErrorMsg('Gagal menghapus komentar.');
    }
  }

  // Share logic
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title || 'Blog',
          url,
        });
        setShareMsg('Berhasil dibagikan!');
      } catch {
        setShareMsg('Gagal membagikan!');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareMsg('Link disalin!');
      } catch {
        setShareMsg('Gagal menyalin link!');
      }
    }
    setTimeout(() => setShareMsg(''), 1700);
  };

  return (
    <>
      <Head>
        <title>{blog?.title || "Memuat..."} - FranchiseNusantara</title>
      </Head>

      <div className="w-full max-w-5xl xl:max-w-7xl mx-auto px-4 md:px-10 xl:px-20 py-8 relative">
        {blog ? (
          <>
            {/* Tombol share sticky di pojok kanan */}
            <button
              className="absolute top-3 right-4 z-30 bg-white/90 hover:bg-blue-600 hover:text-white text-blue-600 rounded-full shadow-lg p-2 transition"
              onClick={handleShare}
              aria-label="Bagikan"
              title="Bagikan blog"
              type="button"
            >
              <FaShareAlt size={22} />
            </button>
            {shareMsg && (
              <div className="absolute top-16 right-4 z-40 bg-blue-700 text-white rounded-lg px-4 py-2 text-sm shadow">
                {shareMsg}
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold mb-2">{blog.title}</h1>
            <div className="text-sm text-gray-500 mb-4 flex gap-x-3 flex-wrap">
              <span>{blog.category}</span>
              <span>|</span>
              <span>{new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>|</span>
              <span>{blog.author || blog.created_by}</span>
            </div>
            <hr className="border-black mb-6" />

            {blog.cover_url && (
              <div className="relative mb-6">
                <img
                  src={blog.cover_url}
                  alt={blog.title}
                  className="w-full rounded-lg object-cover max-h-[420px] mx-auto cursor-zoom-in transition hover:brightness-90"
                  style={{ boxShadow: "0 4px 12px 0 rgba(0,0,0,0.10)" }}
                  loading="lazy"
                  onClick={() => setShowImageModal(true)}
                  title="Klik untuk memperbesar"
                />
              </div>
            )}

            {/* Modal image preview */}
            {showImageModal && blog.cover_url && (
              <div
                className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
                onClick={() => setShowImageModal(false)}
              >
                <img
                  src={blog.cover_url}
                  alt="Gambar Cover"
                  className="max-h-[90vh] max-w-[96vw] rounded-2xl shadow-2xl border-4 border-white object-contain"
                  onClick={e => e.stopPropagation()}
                  style={{ background: "#fff" }}
                />
                <button
                  className="absolute top-4 right-8 text-white text-4xl font-bold z-60"
                  style={{ textShadow: "0 2px 10px #0008" }}
                  onClick={() => setShowImageModal(false)}
                  aria-label="Tutup gambar"
                >&times;</button>
              </div>
            )}

            <div className="prose prose-lg max-w-none text-gray-700 mb-4 whitespace-pre-wrap">
              {blog.content}
            </div>

            {/* === SHOWCASE KARYA FRANCHISOR === */}
            {(showcaseListings.length > 0 || showcaseBlogs.length > 0) && (
              <div className="my-12">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FaFileAlt className="text-pink-600" /> Showcase Karya Franchisor
                </h2>
                {/* Listing */}
                {showcaseListings.length > 0 && (
                  <>
                    <div className="font-semibold mb-2 text-base text-gray-800">Listing</div>
                    <div className="flex gap-5 overflow-x-auto pb-3">
                      {showcaseListings.map(item => (
                        <div
                          key={item.id}
                          className="min-w-[240px] max-w-[260px] bg-white rounded-xl shadow-md flex flex-col overflow-hidden cursor-pointer transition hover:shadow-lg"
                          onClick={() => item.url && router.push(item.url)}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-24 w-full object-cover rounded-t-lg bg-white"
                            loading="lazy"
                          />
                          <div className="flex-1 px-2 pt-2 flex flex-col justify-between">
                            <div className="font-bold text-base truncate">{item.title}</div>
                            <div className="text-xs text-gray-500 mt-1 px-2 py-0.5 bg-gray-100 rounded inline-block w-max">Listing</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {/* Blog */}
                {showcaseBlogs.length > 0 && (
                  <>
                    <div className="font-semibold mb-2 text-base text-gray-800">Blog</div>
                    <div className="flex gap-5 overflow-x-auto pb-3">
                      {showcaseBlogs.map(item => (
                        <div
                          key={item.id}
                          className="min-w-[240px] max-w-[260px] bg-white rounded-xl shadow-md flex flex-col overflow-hidden cursor-pointer transition hover:shadow-lg"
                          onClick={() => item.url && router.push(item.url)}
                        >
                          <img
                            src={
                              item.image
                                ? item.image.startsWith('http')
                                  ? item.image
                                  : supabase.storage.from('blog-assets').getPublicUrl(item.image).data.publicUrl
                                : '/logo192.png'
                            }
                            alt={item.title}
                            className="h-24 w-full object-cover rounded-t-lg bg-white"
                            loading="lazy"
                          />
                          <div className="flex-1 px-2 pt-2 flex flex-col justify-between">
                            <div className="font-bold text-base truncate">{item.title}</div>
                            <div className="text-xs text-gray-500 mt-1 px-2 py-0.5 bg-gray-100 rounded inline-block w-max">Blog</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

          </>
        ) : (
          <p className="text-gray-500">Memuat konten...</p>
        )}

        {/* Komentar */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Komentar</h2>
          {user ? (
            <>
              <textarea
                className="w-full border rounded p-2 mb-4"
                placeholder="Tulis komentar Anda di sini..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                Kirim
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500">Silakan login untuk berkomentar.</p>
          )}

          {loading && <p>Memuat komentar...</p>}
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}

          <div className="mt-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b py-2 flex justify-between items-center">
                <div>
                  <p>{comment.content}</p>
                  <small className="text-gray-500">
                    {comment.created_by} pada {new Date(comment.created_at).toLocaleString()}
                  </small>
                </div>
                {userName === comment.created_by && (
                  <button
                    className="text-red-500 hover:underline ml-4 text-xs"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
