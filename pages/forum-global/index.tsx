import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';

interface Thread {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_by: string;
  created_at: string;
}

interface Comment {
  id: string;
  thread_id: string;
  content: string;
  created_by: string;
  created_at: string;
  profiles?: {
    role: string;
    full_name: string;
  };
}

export default function ForumGlobal() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    imageFile: null as File | null,
  });
  const [newComment, setNewComment] = useState('');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [showThreadPopup, setShowThreadPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchThreads();

    const threadSubscription = supabase
      .channel('threads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, fetchThreads)
      .subscribe();

    return () => {
      threadSubscription.unsubscribe();
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => setIsAdmin(data?.is_admin || false));
    }
  }, [session]);

  async function fetchThreads() {
    const { data } = await supabase.from('threads').select('*').order('created_at', { ascending: false });
    setThreads(data || []);
  }

  async function fetchComments(threadId: string) {
    const { data } = await supabase
      .from('thread_comments')
      .select('*,profiles(full_name, role)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    setComments(data || []);
  }

  async function handleCreateThread() {
    if (!session?.user?.id) {
      alert('Anda harus login terlebih dahulu!');
      return;
    }

    let image_url = '';
    if (newThread.imageFile) {
      const fileName = `${Date.now()}_${newThread.imageFile.name}`;
      const { data } = await supabase.storage.from('thread-images').upload(fileName, newThread.imageFile);
      if (data) image_url = supabase.storage.from('thread-images').getPublicUrl(data.path).data.publicUrl;
    }

    await supabase.from('threads').insert({
      title: newThread.title,
      content: newThread.content,
      image_url,
      created_by: session.user.id,
    });

    setNewThread({ title: '', content: '', imageFile: null });
    setShowThreadPopup(false);
  }

  async function handleCommentSubmit() {
    if (!selectedThread?.id || !session?.user?.id) {
      alert('Silakan pilih thread dan pastikan anda sudah login!');
      return;
    }

    await supabase.from('thread_comments').insert({
      thread_id: selectedThread.id,
      content: newComment,
      created_by: session.user.id,
    });

    setNewComment('');
    fetchComments(selectedThread.id);
  }

  async function handleDeleteComment(id: string) {
    await supabase.from('thread_comments').delete().eq('id', id);
    if (selectedThread) fetchComments(selectedThread.id);
  }

  async function handleDeleteThread(id: string) {
    await supabase.from('threads').delete().eq('id', id);
    fetchThreads();
    setSelectedThread(null);
  }

  const handleClickOutside = (e: any) => {
    if (popupRef.current && !(popupRef.current as any).contains(e.target)) {
      setShowThreadPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 relative">
      <Image
        src="/pattern.jpg"
        alt="Decorative Corner"
        width={100}
        height={100}
        className="absolute top-0 left-0 -z-10 opacity-20"
      />

      <h1 className="text-2xl font-bold mb-6">Forum Global 🌐</h1>

      {session && (
        <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowThreadPopup(true)}>
          Buat Thread Baru
        </button>
      )}

      <div className="space-y-4">
        {threads.map((thread) => (
          <div key={thread.id} className="border p-4 rounded hover:bg-gray-50 relative">
            <div
              className="cursor-pointer"
              onClick={() => {
                setSelectedThread(thread);
                fetchComments(thread.id);
              }}
            >
              <h3 className="font-semibold text-lg">{thread.title}</h3>
              <p className="text-sm text-gray-500">{new Date(thread.created_at).toLocaleString()}</p>
            </div>
            {session?.user.id === thread.created_by || isAdmin ? (
              <button className="absolute top-2 right-2 text-red-500 text-sm" onClick={() => handleDeleteThread(thread.id)}>
                Hapus
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {selectedThread && (
        <div className="mt-6 border p-4 rounded">
          <h2 className="font-bold text-xl mb-2">{selectedThread.title}</h2>
          {selectedThread.image_url && (
            <img src={selectedThread.image_url} alt="Thread image" className="w-full rounded mb-2" />
          )}
          <p className="mb-4">{selectedThread.content}</p>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Komentar:</h3>
            {comments.map((comment) => (
              <div key={comment.id} className="border-b py-2">
                <div className="flex justify-between items-center">
                  <Link href={`/profil/${comment.created_by}`} className="text-blue-600 hover:underline">
                    {comment.profiles?.full_name || 'Anon'} <span className="text-xs text-gray-500">({comment.profiles?.role})</span>
                  </Link>
                  {(session?.user.id === comment.created_by || isAdmin) && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 text-xs">
                      Hapus
                    </button>
                  )}
                </div>
                <p>{comment.content}</p>
                <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
              </div>
            ))}

            {session ? (
              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Tambah komentar..."
                />
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleCommentSubmit}>
                  Kirim
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm italic">Silakan login untuk berkomentar.</p>
            )}
          </div>
        </div>
      )}

      {showThreadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded relative" ref={popupRef}>
            <button className="absolute top-2 right-2" onClick={() => setShowThreadPopup(false)}>
              &times;
            </button>

            <h2 className="font-bold mb-2">Thread Baru</h2>
            <input type="text" placeholder="Judul" value={newThread.title} onChange={(e) => setNewThread({ ...newThread, title: e.target.value })} className="w-full border px-3 py-2 mb-2" />
            <textarea placeholder="Isi thread" value={newThread.content} onChange={(e) => setNewThread({ ...newThread, content: e.target.value })} className="w-full border px-3 py-2 mb-2" />
            <input type="file" onChange={(e) => setNewThread({ ...newThread, imageFile: e.target.files?.[0] || null })} />
            <button onClick={handleCreateThread} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Kirim</button>
          </div>
        </div>
      )}
    </div>
  );
}
