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
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [newThread, setNewThread] = useState({ title: '', content: '', imageFile: null as File | null });
  const [newComment, setNewComment] = useState('');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [showThreadPopup, setShowThreadPopup] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) fetchRole(data.session.user.id);
      fetchThreads();
    };

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    initSession();
  }, []);

  async function fetchRole(userId: string) {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setRole(data.role);
  }

  async function fetchThreads() {
    setLoading(true);
    const { data, error } = await supabase.from('threads').select('*').order('created_at', { ascending: false });
    if (error) return console.error('Error fetching threads:', error);
    setThreads(data || []);
    setLoading(false);
  }

  async function fetchComments(threadId: string) {
    setLoading(true);
    const { data, error } = await supabase.from('thread_comments').select('*').eq('thread_id', threadId).order('created_at', { ascending: true });
    if (error) return console.error('Error fetching comments:', error);
    setComments(data || []);
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
      user_name: session.user.user_metadata.full_name,
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
      user_name: session.user.user_metadata.full_name,
    });

    setNewComment('');
    fetchComments(selectedThread.id);
  }

  async function handleDeleteThread(threadId: string) {
    await supabase.from('threads').delete().eq('id', threadId);
    fetchThreads();
  }

  async function handleDeleteComment(commentId: string) {
    await supabase.from('thread_comments').delete().eq('id', commentId);
    fetchComments(selectedThread!.id);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 relative">
      <Image src="/pattern.jpg" alt="Decorative Corner" width={100} height={100} className="absolute top-0 left-0 -z-10 opacity-20" />
      <h1 className="text-2xl font-bold mb-6">Forum Global 🌐</h1>
      {session && (
        <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowThreadPopup(true)}>
          Buat Thread Baru
        </button>
      )}

      {loading && <p>Loading...</p>}
      {!loading &&
        threads.map(thread => (
          <div key={thread.id} className="border p-4 rounded hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedThread(thread); fetchComments(thread.id); }}>
            <h3 className="font-semibold text-lg">{thread.title}</h3>
            <p className="text-sm text-gray-500">{new Date(thread.created_at).toLocaleString()} oleh {thread.user_name}</p>
            {(role === 'administrator' || session?.user.id === thread.created_by) && (
              <button className="text-red-500 text-sm" onClick={(e) => { e.stopPropagation(); handleDeleteThread(thread.id); }}>Hapus</button>
            )}
          </div>
        ))}

      {showThreadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setShowThreadPopup(false)}>
          <div className="bg-white p-6 rounded relative" onClick={(e) => e.stopPropagation()}>
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
