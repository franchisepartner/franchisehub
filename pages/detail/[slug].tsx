import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

interface Comment {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export default function DetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }

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
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Judul Detail Halaman</h1>
        <img
          src="/path-to-your-detail-image.jpg"
          alt="Detail"
          className="w-full rounded my-4"
        />
        <p>
          Ini adalah deskripsi lengkap mengenai halaman detail, produk, atau artikel yang sedang
          dilihat oleh pengguna. Tambahkan informasi relevan dan menarik di sini.
        </p>
      </div>

      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Komentar</h3>

        {user ? (
          <>
            <textarea
              className="w-full border p-2 rounded mb-2"
              placeholder="Tulis komentar Anda di sini..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <button
              className="bg-blue-500 text-white py-1 px-4 rounded"
              onClick={handleSubmit}
            >
              Kirim
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-500">Silahkan login untuk berkomentar.</p>
        )}

        {loading && <p>Memuat komentar...</p>}
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}

        <div className="mt-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b py-2">
              <p>{comment.content}</p>
              <small className="text-gray-500">
                {comment.created_by} pada{' '}
                {new Date(comment.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
