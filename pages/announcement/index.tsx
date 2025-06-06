import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Image from 'next/image';

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => setIsAdmin(data?.is_admin === true));
    }
  }, [session]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (!error) setAnnouncements(data);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    let image_url = '';

    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from('announcement-assets')
        .upload(fileName, imageFile);
      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage
          .from('announcement-assets')
          .getPublicUrl(data.path);
        image_url = publicUrlData?.publicUrl || '';
      }
    }

    await supabase.from('announcements').insert({
      title,
      content,
      image_url,
      created_by: session.user.id,
      status: 'published',
    });

    setTitle('');
    setContent('');
    setImageFile(null);
    fetchAnnouncements();
    setLoading(false);
  }

  async function deleteAnnouncement(id: number) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) fetchAnnouncements();
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pengumuman Administrator 📣</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 mb-8">
          <h2 className="text-lg font-semibold">Tambah Pengumuman</h2>
          <input
            type="text"
            placeholder="Judul"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2"
            required
          />
          <textarea
            placeholder="Isi pengumuman"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border px-3 py-2"
            required
          ></textarea>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Mengirim...' : 'Kirim Pengumuman'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="border p-3 rounded cursor-pointer hover:shadow-lg relative"
            onClick={() => setSelectedAnnouncement(item)}
          >
            <h3 className="font-bold pr-16">{item.title}</h3>
            <p className="text-gray-500 text-sm">
              {new Date(item.created_at).toLocaleString()}
            </p>
            <p className="text-gray-700 text-sm truncate">
              {item.content.substring(0, 20)}...
            </p>
            {isAdmin && (
              <button
                className="absolute top-2 right-2 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAnnouncement(item.id);
                }}
              >
                Hapus
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedAnnouncement && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="bg-white p-4 rounded max-w-full md:max-w-lg w-full shadow-lg overflow-auto max-h-screen relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-red-500 text-xl"
              onClick={() => setSelectedAnnouncement(null)}
            >
              &times;
            </button>
            <h2 className="font-bold text-xl mb-2 pt-4">{selectedAnnouncement.title}</h2>
            <p className="text-sm text-gray-500 mb-2">
              {new Date(selectedAnnouncement.created_at).toLocaleString()}
            </p>
            {selectedAnnouncement.image_url && (
              <img
                src={selectedAnnouncement.image_url}
                alt="Gambar Pengumuman"
                className="w-full max-h-80 object-cover mb-4 rounded"
              />
            )}
            <p className="break-words whitespace-pre-wrap">{selectedAnnouncement.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
