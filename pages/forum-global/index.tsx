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
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);

  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadFile, setNewThreadFile] = useState<File | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCurrentUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, is_admin')
      .eq('id', userId)
      .single();
    if (data) setCurrentUserProfile(data);
  };

  const fetchThreads = async () => {
    setLoadingThreads(true);
    const { data, error } = await supabase
      .from('threads')
      .select(`id, title, content, image_url, user_id, created_at, profiles(full_name, is_admin)`)
      .order('created_at', { ascending: false });
    if (data) setThreads(data as Thread[]);
    setLoadingThreads(false);
  };

  const fetchComments = async (threadId: string) => {
    setLoadingComments(true);
    const { data } = await supabase
      .from('comments')
      .select(`id, content, user_id, thread_id, created_at, profiles(full_name, is_admin)`)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    if (data) setComments(data as Comment[]);
    setLoadingComments(false);
  };

  useEffect(() => {
    if (user) {
      fetchCurrentUserProfile(user.id);
      fetchThreads();
    } else {
      setThreads([]);
      setSelectedThread(null);
      setComments([]);
    }
  }, [user]);

  useEffect(() => {
    if (selectedThread) fetchComments(selectedThread.id);
  }, [selectedThread]);

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewThreadFile(file);
  };

  const handleAddThread = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newThreadTitle.trim()) return;

    let imageUrl: string | null = null;
    if (newThreadFile) {
      const fileExt = newThreadFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData } = await supabase.storage.from('forum-images').upload(fileName, newThreadFile);
      if (uploadData) imageUrl = supabase.storage.from('forum-images').getPublicUrl(uploadData.path).data.publicUrl;
    }

    const { data: newThread } = await supabase
      .from('threads')
      .insert({ title: newThreadTitle, content: newThreadContent, image_url: imageUrl, user_id: user.id })
      .select(`id, title, content, image_url, user_id, created_at, profiles(full_name, is_admin)`)
      .single();

    if (newThread) setThreads(prev => [newThread as Thread, ...prev]);
    setNewThreadTitle('');
    setNewThreadContent('');
    setNewThreadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selectedThread || !newCommentContent.trim()) return;

    const { data: newComment } = await supabase
      .from('comments')
      .insert({ content: newCommentContent, thread_id: selectedThread.id, user_id: user.id })
      .select(`id, content, user_id, thread_id, created_at, profiles(full_name, is_admin)`)
      .single();

    if (newComment) setComments(prev => [...prev, newComment as Comment]);
    setNewCommentContent('');
  };

  return (
    <div>
      {/* Tambahkan implementasi UI minimal di sini atau gunakan yang sudah ada sebelumnya */}
    </div>
  );
};

export default ForumGlobalPage;
