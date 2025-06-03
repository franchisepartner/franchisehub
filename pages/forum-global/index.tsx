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

export default function ForumGlobal() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [session, setSession] = useState<Session | null>(null);

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

  async function fetchThreads() { 
    const { data } = await supabase
      .from('threads')
      .select('*')
      .order('created_at', { ascending: false });

    setThreads(data || []);

  }

  async function fetchComments(threadId: string) {
    const { data } = await supabase
      .from('thread_comments')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    setComments(data);
  }

  async function handleCreateThread(threadId: string) {
    let image_url = '';
    if (newThread.imageFile) {
      const fileName = `${Date.now()}_${newThread.imageFile.name}`;
      const { data } = await supabase.storage
        .from('thread-images')
        .upload(fileName, newThread.imageFile);
      if (data) image_url = supabase.storage.from('thread-images').getPublicUrl(data.path).data.publicUrl;
    }

    await supabase.from('threads').insert({
      title: newThread.title,
      content: newThread.content,
      image_url,
      created_by: session.user.id,
    });

    setNewThread({ title: '', content: '', imageFile: null });
  }

  async function handleCommentSubmit(threadId: string) {
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
        src="/pattern.jpeg"
        alt="Decorative Corner"
        width={100}
        height={100}
        className="absolute top-0 left-0"
      />

      <h1 className="text-2xl font-bold mb-6">Forum Global 🌐</h1>

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
            <img src={selectedThread.image_url} alt="Thread image" className="w-full rounded mb-2" />
          )}
          <p className="mb-4">{selectedThread.content}</p>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Komentar:</h3>
            {comments.map((comment) => (
              <div key={comment.id} className="border-b py-2">
                <p>{comment.content}</p>
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
              <p className="mt-4 text-sm italic">Silahkan login untuk berkomentar.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
