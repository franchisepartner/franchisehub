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
  const [newThread, setNewThread] = useState<{
    title: string;
    content: string;
    imageFile: File | null;
  }>({ title: '', content: '', imageFile: null });
  const [newComment, setNewComment] = useState('');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [showThreadPopup, setShowThreadPopup] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    fetchSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchThreads();
  }, []);

  // PERBAIKAN DI SINI: supabase.from<'threads', Thread>
  async function fetchThreads() {
    const { data: threadsData } = await supabase
      .from<'threads', Thread>('threads')
      .select('*')
      .order('created_at', { ascending: false });

    setThreads(threadsData || []);
  }

  async function fetchComments(threadId: string) {
    const { data: commentsData } = await supabase
      .from('thread_comments')
      .select('*, profiles(role, full_name)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    setComments(
      commentsData
        ? commentsData.map((c: any) => ({
            id: c.id,
            thread_id: c.thread_id,
            content: c.content,
            created_by: c.created_by,
            created_at: c.created_at,
            user_role: c.profiles.role,
            user_name: c.profiles.full_name,
          }))
        : []
    );
  }

  async function handleCreateThread() {
    if (!session?.user?.id) {
      alert('Login dahulu!');
      return;
    }

    let image_url = '';
    if (newThread.imageFile) {
      const fileName = `${Date.now()}_${newThread.imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('thread-images')
        .upload(fileName, newThread.imageFile);

      if (uploadError) {
        console.error(uploadError);
      } else if (uploadData) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('thread-images').getPublicUrl(uploadData.path);
        image_url = publicUrl;
      }
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
    if (!selectedThread?.id || !session?.user?.id) {
      alert('Pilih thread atau login dahulu!');
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
        <button
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setShowThreadPopup(true)}
        >
          Buat Thread Baru
        </button>
      )}

      <div className="space-y-4">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className="border p-4 rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              setSelectedThread(thread);
              fetchComments(thread.id);
            }}
          >
            <h3 className="font-semibold text-lg">{thread.title}</h3>
            <p className="text-sm text-gray-500">
              {new Date(thread.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {selectedThread && (
        <div className="mt-6 border p-4 rounded">
          <h2 className="font-bold text-xl mb-2">{selectedThread.title}</h2>

          {selectedThread.image_url && (
            <img
              src={selectedThread.image_url}
              alt="Thread Image"
              className="w-full rounded mb-2"
            />
          )}

          <p className="mb-4">{selectedThread.content}</p>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Komentar:</h3>

            {comments.map((comment) => (
              <div key={comment.id} className="border-b py-2">
                <p>
                  <span className="font-semibold">
                    {comment.user_name} ({comment.user_role})
                  </span>
                  : {comment.content}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
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
                <button
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleCommentSubmit}
                >
                  Kirim
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm italic">
                Silakan login untuk berkomentar.
              </p>
            )}
          </div>
        </div>
      )}

      {showThreadPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowThreadPopup(false)}
        >
          <div
            className="bg-white p-6 rounded relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowThreadPopup(false)}
            >
              &times;
            </button>

            <h2 className="font-bold mb-2">Thread Baru</h2>
            <input
              type="text"
              placeholder="Judul"
              value={newThread.title}
              onChange={(e) =>
                setNewThread({ ...newThread, title: e.target.value })
              }
              className="w-full border px-3 py-2 mb-2"
            />
            <textarea
              placeholder="Isi thread"
              value={newThread.content}
              onChange={(e) =>
                setNewThread({ ...newThread, content: e.target.value })
              }
              className="w-full border px-3 py-2 mb-2"
            />
            <input
              type="file"
              onChange={(e) =>
                setNewThread({
                  ...newThread,
                  imageFile: e.target.files?.[0] || null,
                })
              }
            />
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
