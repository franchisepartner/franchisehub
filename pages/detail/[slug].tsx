import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaShareAlt } from 'react-icons/fa';

interface Blog {
  id: string;
  title: string;
  content: string;
  cover_url?: string;
  category?: string;
  author?: string;
  created_by: string;
  created_at: string;
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
        <title>{blog?.title || "Memuat..."} - FranchiseHub</title>
      </Head>
      <div className="max-w-2xl mx-auto px-3 sm:px-5 py-8 relative min-h-screen">
        {/* Tombol share mengambang */}
        {blog && (
          <>
            <button
              className="fixed top-5 right-5 z-40 bg-white/80 hover:bg-blue-600 hover:text-white text-blue-600 rounded-full shadow-xl p-3 transition"
              onClick={handleShare}
              aria-label="Bagikan"
              title="Bagikan blog"
              type="button"
            >
              <FaShareAlt size={22} />
            </button>
            {shareMsg && (
              <div className="fixed top-20 right-5 z-50 bg-blue-700 text-white rounded-xl px-4 py-2 text-sm shadow-lg animate-fade-in">
                {shareMsg}
              </div>
            )}
          </>
        )}

        <div className="bg-white/95 rounded-2xl shadow-lg border border-blue-50 p-5 md:p-9 mb-7">
          {blog ? (
            <>
              {/* Headline */}
              <h1 className="text-2xl md:text-3xl font-extrabold mb-3 text-gray-900 leading-tight">{blog.title}</h1>
              <div className="flex flex-wrap gap-3 items-center mb-4 text-sm">
                {blog.category && (
                  <span className="inline-block bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">{blog.category}</span>
                )}
                <span className="text-gray-400 select-none">•</span>
                <span className="text-gray-600">
                  {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="text-gray-400 select-none">•</span>
                <span className="text-gray-600">{blog.author || blog.created_by}</span>
              </div>
              {blog.cover_url && (
                <div className="rounded-2xl overflow-hidden shadow mb-6 border border-blue-100">
                  <img
                    src={blog.cover_url}
                    alt={blog.title}
                    className="object-cover w-full max-h-[320px] min-h-[180px] transition"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="prose prose-lg max-w-none mb-6 text-gray-800" style={{ whiteSpace: "pre-line" }}>
                {blog.content}
              </div>
            </>
          ) : (
            <div className="text-gray-500 py-10 text-center">Memuat konten...</div>
          )}
        </div>

        {/* Komentar */}
        <div className="bg-white/90 border border-blue-100 rounded-2xl shadow px-4 md:px-7 py-7 mb-14">
          <h2 className="text-lg font-bold mb-5 text-blue-700">Komentar</h2>
          {user ? (
            <div className="flex flex-col md:flex-row items-end gap-4 mb-5">
              <textarea
                className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-base resize-none"
                placeholder="Tulis komentar Anda di sini..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
              />
              <button
                className="bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 px-6 py-2 rounded-xl text-white font-bold shadow-lg transition disabled:opacity-60"
                onClick={handleSubmit}
                disabled={loading}
              >
                Kirim
              </button>
            </div>
          ) : (
            <div className="mb-6 text-sm text-gray-500">Silakan login untuk berkomentar.</div>
          )}

          {loading && <p className="text-gray-400 text-center">Memuat komentar...</p>}
          {errorMsg && <p className="text-red-500 text-center">{errorMsg}</p>}

          <div className="mt-2 space-y-4">
            {comments.length === 0 && !loading && (
              <div className="text-center text-gray-400 py-5">Belum ada komentar.</div>
            )}
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 relative group"
              >
                <div className="flex-1">
                  <p className="text-base text-gray-700 mb-1 break-words">{comment.content}</p>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-semibold">{comment.created_by}</span>
                    <span>•</span>
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                </div>
                {userName === comment.created_by && (
                  <button
                    className="absolute top-2 right-3 text-xs text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition"
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
