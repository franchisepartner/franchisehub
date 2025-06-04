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
  profiles?: { full_name: string; role: string };
}

interface Comment {
  id: string;
  thread_id: string;
  content: string;
  created_by: string;
  created_at: string;
  user_role?: string;
  user_name?: string;
}

export default function ForumGlobal() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [newThread, setNewThread] = useState({ title: '', content: '', imageFile: null as File | null });
  const [newComment, setNewComment] = useState('');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [showThreadPopup, setShowThreadPopup] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      fetchThreads();
    })();

    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  async function fetchThreads() {
    setLoading(true);
    const { data, error } = await supabase
      .from('threads')
      .select('*, profiles(full_name, role)')
      .order('created_at', { ascending: false });

    if (error) return console.error('Error fetching threads:', error);
    setThreads(data || []);
    setLoading(false);
  }

  async function fetchComments(threadId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from('thread_comments')
      .select('*, profiles(role, full_name)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) return console.error('Error fetching comments:', error);

    setComments(data?.map(c => ({
      id: c.id,
      thread_id: c.thread_id,
      content: c.content,
      created_by: c.created_by,
      created_at: c.created_at,
      user_role: c.profiles?.role,
      user_name: c.profiles?.full_name,
    })) || []);

    setLoading(false);
  }

  async function handleCreateThread() {
    if (!session?.user?.id) return alert('Login dahulu!');

    let image_url = '';
    if (newThread.imageFile) {
      const fileName = `${Date.now()}_${newThread.imageFile.name}`;
      const { data, error } = await supabase.storage.from('forum-images').upload(fileName, newThread.imageFile);
      if (error) return alert('Gagal unggah gambar.');
      image_url = supabase.storage.from('forum-images').getPublicUrl(data.path).data.publicUrl;
    }

    await supabase.from('threads').insert({
      title: newThread.title,
      content: newThread.content,
      image_url,
      created_by: session.user.id,
    });

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
    });

    setNewComment('');
    fetchComments(selectedThread.id);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 relative">
      <Image src="/pattern.jpg" alt="Decorative Corner" width={100} height={100} className="absolute top-0 left-0 -z-10 opacity-20" />
      <h1 className="text-2xl font-bold mb-6">Forum Global 🌐</h1>
      {session && <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowThreadPopup(true)}>Buat Thread Baru</button>}

      {loading && <p>Loading...</p>}
      {!loading && threads.map(thread => (
        <div key={thread.id} className="border p-4 rounded hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedThread(thread); fetchComments(thread.id); }}>
          <h3 className="font-semibold text-lg">{thread.title}</h3>
          <p className="text-sm text-gray-500">{new Date(thread.created_at).toLocaleString()} oleh {thread.profiles?.full_name || 'Anonim'}</p>
        </div>
      ))}

      {selectedThread && (
        <div className="mt-6 border p-4 rounded">
          <h2 className="font-bold text-xl mb-2">{selectedThread.title}</h2>
          {selectedThread.image_url && <img src={selectedThread.image_url} className="w-full rounded mb-2" />}
          <p className="mb-4">{selectedThread.content}</p>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Komentar:</h3>
            {comments.map(c => (
              <div key={c.id} className="border-b py-2">
                <p><span className="font-semibold">{c.user_name || 'Anonim'} ({c.user_role || '-'})</span>: {c.content}</p>
                <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</p>
              </div>
            ))}

            {session && (
              <>
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Tambah komentar..." />
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleCommentSubmit}>Kirim</button>
              </>
            )}
          </div>
        </div>
      )}

      {showThreadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setShowThreadPopup(false)}>
          <div className="bg-white p-6 rounded relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-xl" onClick={() => setShowThreadPopup(false)}>&times;</button>
            <input type="text" placeholder="Judul" value={newThread.title} onChange={e => setNewThread({ ...newThread, title: e.target.value })} className="w-full border px-3 py-2 mb-2" />
            <textarea placeholder="Isi thread" value={newThread.content} onChange={e => setNewThread({ ...newThread, content: e.target.value })} className="w-full border px-3 py-2 mb-2" />
            <input type="file" onChange={e => setNewThread({ ...newThread, imageFile: e.target.files?.[0] || null })} />
            <button onClick={handleCreateThread} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Kirim</button>
          </div>
        </div>
      )}
    </div>
  );
}
