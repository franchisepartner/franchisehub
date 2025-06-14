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
                  className="w-full rounded-lg object-cover max-h-[420px] mx-auto"
                  style={{ boxShadow: "0 4px 12px 0 rgba(0,0,0,0.10)" }}
                  loading="lazy"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none text-gray-700 mb-4 whitespace-pre-wrap">
              {blog.content}
            </div>
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
