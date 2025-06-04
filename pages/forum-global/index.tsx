import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import Image from 'next/image';

interface Thread {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_by: string;
  created_at: string;
  user_name?: string;
}

interface Comment {
  id: string;
  thread_id: string;
  content: string;
  created_by: string;
  created_at: string;
  user_name?: string;
}

export default function ForumGlobal() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState('');
  const [newThread, setNewThread] = useState({ title: '', content: '', imageFile: null as File | null });
  const [newComment, setNewComment] = useState('');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [showThreadPopup, setShowThreadPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) fetchRole(data.session.user.id);
      fetchThreads();
    };

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    fetchSession();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    setRole(data?.role || 'user');
  };

  async function fetchThreads() {
    setLoading(true);
    const { data } = await supabase.from('threads').select('*').order('created_at', { ascending: false });
    setThreads(data || []);
    setLoading(false);
  }

  async function fetchComments(threadId: string) {
    const { data } = await supabase.from('thread_comments').select('*').eq('thread_id', threadId).order('created_at');
    setComments(data || []);
  }

  async function handleCreateThread() {
    if (!session?.user?.id) return alert('Login dahulu!');
    if (!newThread.title.trim()) return alert('Judul tidak boleh kosong.');
    if (!newThread.content.trim()) return alert('Isi thread tidak boleh kosong.');

    let image_url = '';

    if (newThread.imageFile) {
      if (newThread.imageFile.size > 5 * 1024 * 1024) {
        return alert("Ukuran gambar maksimal 5MB.");
      }

      const fileName = `${Date.now()}_${newThread.imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('thread-images')
        .upload(fileName, newThread.imageFile);

      if (uploadError || !uploadData) {
        console.error("Upload failed:", uploadError);
        return alert('Gagal unggah gambar: ' + uploadError?.message);
      }

      const { data: urlData } = supabase
        .storage
        .from('thread-images')
        .getPublicUrl(uploadData.path);

      image_url = urlData?.publicUrl || '';
    }

    const { error: insertError } = await supabase.from('threads').insert({
      title: newThread.title,
      content: newThread.content,
      image_url,
      created_by: session.user.id,
      user_name: `${session.user.user_metadata.full_name}_${role}`,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return alert("Gagal membuat thread: " + insertError.message);
    }

    setNewThread({ title: '', content: '', imageFile: null });
    setShowThreadPopup(false);
    fetchThreads();
  }

  async function handleCommentSubmit() {
    if (!selectedThread?.id || !session?.user?.id) return alert('Pilih thread atau login dahulu!');

    await supabase.from('thread_comments').insert({
      thread_id: selectedThread.id,
      content: newComment,
      created_by: session.user.id,
      user_name: `${session.user.user_metadata.full_name}_${role}`,
    });

    setNewComment('');
    fetchComments(selectedThread.id);
  }

  async function handleDeleteThread(id: string) {
    const confirm = window.confirm("Yakin ingin menghapus thread ini?");
    if (!confirm) return;

    const { error } = await supabase.from('threads').delete().eq('id', id);
    if (error) {
      console.error("Gagal menghapus thread:", error);
      return alert("Gagal menghapus thread");
    }

    setSelectedThread(null);
    fetchThreads();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 relative">
      <Image src="/pattern.jpg" alt="Decorative Corner" width={100} height={100} className="absolute top-0 left-0 -z-10 opacity-20" />

      <h1 className="text-2xl font-bold mb-6">Forum Global 🌐</h1>

      {session && (
        <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowThreadPopup(true)}>
          Buat Thread Baru
        </button>
      )}

      {loading && <p>Loading...</p>}
      {!loading && threads.map(thread => (
        <div
          key={thread.id}
          className="border p-4 rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => { setSelectedThread(thread); fetchComments(thread.id); }}
        >
          <h3 className="font-semibold text-lg">{thread.title}</h3>
          <p className="text-sm text-gray-500">{new Date(thread.created_at).toLocaleString()} oleh {thread.user_name}</p>
        </div>
      ))}

      {selectedThread && (
        <div className="mt-6 border p-4 rounded">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-xl">{selectedThread.title}</h2>
            {(session?.user?.id === selectedThread.created_by || role === 'administrator') && (
              <button
                onClick={() => handleDeleteThread(selectedThread.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Hapus
              </button>
            )}
          </div>
          {selectedThread.image_url && <img src={selectedThread.image_url} className="w-full rounded mb-2" />}
          <p className="mb-4">{selectedThread.content}</p>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Komentar:</h3>
            {comments.map(comment => (
              <div key={comment.id} className="border-b py-2">
                <p><span className="font-semibold">{comment.user_name}</span>: {comment.content}</p>
                <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
              </div>
            ))}

            {session && (
              <>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Tambah komentar..."
                />
                <button
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleCommentSubmit}
                >
                  Kirim
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showThreadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setShowThreadPopup(false)}>
          <div className="bg-white p-6 rounded relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-xl" onClick={() => setShowThreadPopup(false)}>&times;</button>
            <h2 className="font-bold mb-2">Thread Baru</h2>
            <input
              type="text"
              placeholder="Judul"
              value={newThread.title}
              onChange={e => setNewThread({ ...newThread, title: e.target.value })}
              className="w-full border px-3 py-2 mb-2"
            />
            <textarea
              placeholder="Isi thread"
              value={newThread.content}
              onChange={e => setNewThread({ ...newThread, content: e.target.value })}
              className="w-full border px-3 py-2 mb-2"
            />
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={e => setNewThread({ ...newThread, imageFile: e.target.files?.[0] || null })}
              className="mb-1"
            />
            <p className="text-sm text-gray-500">Hanya file .jpg atau .png</p>
            <button
              onClick={handleCreateThread}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Kirim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
