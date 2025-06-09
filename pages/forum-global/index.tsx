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
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-8 min-h-screen relative">
      <Image
        src="/pattern.jpg"
        alt="Decorative Corner"
        width={100}
        height={100}
        className="absolute top-0 left-0 -z-10 opacity-10 pointer-events-none select-none"
      />
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900">Forum Global 🌐</h1>
        {session && (
          <button
            className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold px-5 py-2 rounded-full shadow-lg hover:scale-105 transition"
            onClick={() => setShowThreadPopup(true)}
          >
            + Thread Baru
          </button>
        )}
      </div>

      {/* List Thread */}
      {loading && <p className="text-center py-12 text-gray-400">Memuat diskusi...</p>}
      {!loading && threads.length === 0 && (
        <div className="text-center text-gray-400 py-12">Belum ada diskusi. Jadilah yang pertama!</div>
      )}
      {!loading && threads.map(thread => (
        <div
          key={thread.id}
          className="group bg-white rounded-2xl border border-blue-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition p-5 mb-4 cursor-pointer relative"
          onClick={() => { setSelectedThread(thread); fetchComments(thread.id); }}
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-lg font-semibold text-blue-700 group-hover:underline">{thread.title}</span>
            <span className="bg-blue-50 text-blue-400 font-bold px-3 py-0.5 rounded-full text-xs">{thread.user_name}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400 gap-2 mb-2">
            <span>{new Date(thread.created_at).toLocaleString()}</span>
            {thread.image_url && (
              <span className="ml-1 px-2 py-0.5 rounded bg-gray-100 text-blue-500 text-[10px]">+ gambar</span>
            )}
          </div>
          <p className="text-gray-700 text-sm line-clamp-2">{thread.content}</p>
        </div>
      ))}

      {/* Thread Detail & Komentar */}
      {selectedThread && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3 py-8"
          onClick={() => setSelectedThread(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-6 relative animate-fade-in border border-blue-100
              max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-5 text-xl text-gray-400 hover:text-red-600"
              onClick={() => setSelectedThread(null)}
              aria-label="Tutup"
            >&times;</button>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-extrabold text-blue-900 flex-1">{selectedThread.title}</h2>
              {(session?.user?.id === selectedThread.created_by || role === 'administrator') && (
                <button
                  onClick={() => handleDeleteThread(selectedThread.id)}
                  className="text-red-600 hover:underline text-xs font-bold"
                >
                  Hapus
                </button>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-400 gap-2 mb-2">
              <span>{selectedThread.user_name}</span>
              <span>•</span>
              <span>{new Date(selectedThread.created_at).toLocaleString()}</span>
            </div>
            {selectedThread.image_url && (
              <img
                src={selectedThread.image_url}
                className="w-full rounded-xl mb-3 border"
                alt="Thread Image"
              />
            )}
            <p className="mb-3 text-gray-800">{selectedThread.content}</p>
            <div className="border-t pt-4">
              <h3 className="font-bold text-blue-600 mb-3">Komentar</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold text-blue-700">{comment.user_name}</span>: {comment.content}
                    </div>
                    <div className="text-[11px] text-gray-400">{new Date(comment.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              {session && (
                <div className="flex gap-2 mt-4">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="w-full border border-blue-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-sm resize-none"
                    placeholder="Tambah komentar..."
                  />
                  <button
                    className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition disabled:opacity-50"
                    onClick={handleCommentSubmit}
                  >
                    Kirim
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Thread Baru */}
      {showThreadPopup && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-3 py-8"
          onClick={() => setShowThreadPopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-7 max-w-md w-full relative border border-blue-100 animate-fade-in
              max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-2 right-3 text-xl text-gray-400 hover:text-red-600" onClick={() => setShowThreadPopup(false)}>&times;</button>
            <h2 className="font-bold mb-3 text-blue-700 text-lg">Buat Thread Baru</h2>
            <input
              type="text"
              placeholder="Judul"
              value={newThread.title}
              onChange={e => setNewThread({ ...newThread, title: e.target.value })}
              className="w-full border border-blue-200 rounded-xl px-4 py-2 mb-2 focus:ring-2 focus:ring-blue-400 outline-none font-semibold"
            />
            <textarea
              placeholder="Isi thread"
              value={newThread.content}
              onChange={e => setNewThread({ ...newThread, content: e.target.value })}
              className="w-full border border-blue-200 rounded-xl px-4 py-2 mb-2 focus:ring-2 focus:ring-blue-400 outline-none"
              rows={4}
            />
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={e => setNewThread({ ...newThread, imageFile: e.target.files?.[0] || null })}
              className="mb-2 text-sm"
            />
            <p className="text-xs text-gray-400 mb-2">Hanya file .jpg atau .png, maksimal 5MB</p>
            <button
              onClick={handleCreateThread}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold py-2 rounded-xl mt-2 shadow-lg hover:scale-105 transition"
            >
              Kirim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
