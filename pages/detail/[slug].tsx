import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface Blog {
  id: string;
  title: string;
  content: string;
  cover_url?: string;
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

  useEffect(() => {
    async function fetchBlog() {
      if (!slug) return;

      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error) setBlog(data);
    }

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }

    fetchBlog();
    getUser();
    if (slug) fetchComments();
  }, [slug]);

  const userName = user?.user_metadata.full_name || user?.email || 'Anonymous';

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

  return (
    <>
      <Head>
        <title>{blog?.title || "Memuat..."} - FranchiseHub</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {blog ? (
          <div>
            <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
            <p className="text-gray-500 text-sm mb-4">
              {blog.author || blog.created_by} | {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {blog.cover_url && (
              <img
                src={blog.cover_url}
                alt={blog.title}
                className="w-full rounded mb-6"
              />
            )}
            <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
        ) : (
          <p className="text-gray-500">Memuat konten...</p>
        )}

        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Komentar</h2>

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
              <div key={comment.id} className="border-b py-2">
                <p>{comment.content}</p>
                <small className="text-gray-500">
                  {comment.created_by} pada {new Date(comment.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
