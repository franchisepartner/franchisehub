import { useEffect, useState, useRef, FormEvent, ChangeEvent } from 'react';
import { NextPage } from 'next';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

type Profile = {
  full_name: string;
  is_admin: boolean;
};

type Comment = {
  id: string;
  content: string;
  user_id: string;
  thread_id: string;
  created_at: string;
  profiles: Profile;
};

type Thread = {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  profiles: Profile;
};

const ForumGlobalPage: NextPage = () => {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);

  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadFile, setNewThreadFile] = useState<File | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setCurrentUserProfile(data);
      }
    };

    const fetchThreads = async () => {
      const { data } = await supabase
        .from('threads')
        .select('*, profiles(full_name, is_admin)')
        .order('created_at', { ascending: false });
      if (data) setThreads(data);
    };

    fetchProfile();
    fetchThreads();
  }, [user]);

  useEffect(() => {
    const fetchComments = async () => {
      if (selectedThread) {
        const { data } = await supabase
          .from('comments')
          .select('*, profiles(full_name, is_admin)')
          .eq('thread_id', selectedThread.id)
          .order('created_at', { ascending: true });
        if (data) setComments(data);
      }
    };
    fetchComments();
  }, [selectedThread]);

  const handleAddThread = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newThreadTitle) return;

    let image_url = null;
    if (newThreadFile) {
      const fileName = `${Date.now()}_${newThreadFile.name}`;
      await supabase.storage.from('forum-images').upload(fileName, newThreadFile);
      image_url = supabase.storage.from('forum-images').getPublicUrl(fileName).data.publicUrl;
    }

    const { data } = await supabase
      .from('threads')
      .insert({ title: newThreadTitle, content: newThreadContent, image_url, user_id: user.id })
      .select('*, profiles(full_name, is_admin)')
      .single();

    if (data) setThreads([data, ...threads]);
    setNewThreadTitle('');
    setNewThreadContent('');
    setNewThreadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selectedThread || !newCommentContent) return;

    const { data } = await supabase
      .from('comments')
      .insert({ content: newCommentContent, thread_id: selectedThread.id, user_id: user.id })
      .select('*, profiles(full_name, is_admin)')
      .single();

    if (data) setComments([...comments, data]);
    setNewCommentContent('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Forum Global 🌎</h2>

      <form onSubmit={handleAddThread} className="mb-6">
        <input
          type="text"
          value={newThreadTitle}
          onChange={(e) => setNewThreadTitle(e.target.value)}
          placeholder="Judul Thread"
          className="border rounded w-full p-2 mb-2"
        />
        <textarea
          value={newThreadContent}
          onChange={(e) => setNewThreadContent(e.target.value)}
          placeholder="Konten"
          className="border rounded w-full p-2 mb-2"
        ></textarea>
        <input type="file" ref={fileInputRef} onChange={(e) => setNewThreadFile(e.target.files?.[0] || null)} />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Tambah Thread</button>
      </form>

      <div>
        {threads.map((thread) => (
          <div key={thread.id} className="border p-4 rounded mb-2 cursor-pointer" onClick={() => setSelectedThread(thread)}>
            <h3 className="font-bold">{thread.title}</h3>
            <p>{thread.content}</p>
            {thread.image_url && <img src={thread.image_url} className="mt-2 max-h-64" alt="Thread" />}
            <small>{thread.profiles.full_name} - {new Date(thread.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>

      {selectedThread && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-bold text-lg">Komentar</h4>
          {comments.map(c => (
            <div key={c.id} className="border-b py-2">
              <p>{c.content}</p>
              <small>{c.profiles.full_name} - {new Date(c.created_at).toLocaleString()}</small>
            </div>
          ))}
          <form onSubmit={handleAddComment} className="mt-4">
            <textarea
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              className="border w-full p-2 rounded"
              placeholder="Tulis komentar..."
            />
            <button type="submit" className="mt-2 bg-green-500 text-white p-2 rounded">Tambah Komentar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ForumGlobalPage;
