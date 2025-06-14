import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import imageCompression from 'browser-image-compression';

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
      // === COMPRESS imageFile sebelum upload
      let compressedFile = imageFile;
      try {
        compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          initialQuality: 0.85,
        });
      } catch (err) {
        // fallback ke file asli jika gagal compress
        compressedFile = imageFile;
      }
      const { data, error } = await supabase.storage
        .from('announcement-assets')
        .upload(fileName, compressedFile);
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
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6 min-h-screen">
      <div className="mb-8 flex items-center gap-3">
        <span className="text-3xl">📣</span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pengumuman FranchiseNusantara</h1>
      </div>

      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 rounded-2xl shadow-xl border border-blue-100 p-6 mb-10 space-y-4"
        >
          <h2 className="text-lg font-semibold mb-2">Tambah Pengumuman</h2>
          <input
            type="text"
            placeholder="Judul pengumuman"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-lg bg-blue-50 font-semibold"
            required
          />
          <textarea
            placeholder="Isi pengumuman"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none text-base resize-none bg-blue-50"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengirim...' : 'Kirim Pengumuman'}
          </button>
        </form>
      )}

      <div className="space-y-5">
        {announcements.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Tidak ada pengumuman.
          </div>
        )}
        {announcements.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl shadow-md border border-blue-50 p-4 cursor-pointer hover:shadow-2xl transition relative overflow-hidden flex gap-4"
            onClick={() => setSelectedAnnouncement(item)}
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt="Gambar Pengumuman"
                className="w-20 h-20 object-cover rounded-xl border bg-gray-50 shrink-0"
                loading="lazy"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg pr-14 group-hover:text-blue-700 truncate">{item.title}</h3>
              <div className="flex items-center text-xs text-gray-400 mt-0.5 gap-2">
                <span>{new Date(item.created_at).toLocaleString()}</span>
                {item.created_by === session?.user?.id && (
                  <span className="bg-blue-50 text-blue-400 px-2 py-0.5 rounded font-semibold ml-2">Admin</span>
                )}
              </div>
              <p className="text-gray-700 text-sm mt-1 truncate">{item.content.substring(0, 60)}{item.content.length > 60 && '...'}</p>
            </div>
            {isAdmin && (
              <button
                className="absolute top-3 right-4 text-red-500 font-semibold text-xs opacity-0 group-hover:opacity-100 transition"
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
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
              onClick={() => setSelectedAnnouncement(null)}
            >
              &times;
            </button>
            <h2 className="font-bold text-2xl mb-2 pt-2">{selectedAnnouncement.title}</h2>
            <div className="text-xs text-gray-400 mb-2">{new Date(selectedAnnouncement.created_at).toLocaleString()}</div>
            {selectedAnnouncement.image_url && (
              <img
                src={selectedAnnouncement.image_url}
                alt="Gambar Pengumuman"
                className="w-full max-h-80 object-cover mb-4 rounded-xl"
                loading="lazy"
              />
            )}
            <p className="text-gray-700 text-base whitespace-pre-line">{selectedAnnouncement.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
