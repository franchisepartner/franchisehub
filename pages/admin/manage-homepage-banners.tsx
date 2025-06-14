import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import imageCompression from 'browser-image-compression';

export default function ManageHomepageBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Cek role admin
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return window.location.href = '/login';
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setIsAdmin(data?.role === 'administrator');
      if (data?.role === 'administrator') fetchBanners();
    })();
  }, []);

  // Fetch list file di bucket homepage-banners
  async function fetchBanners() {
    const { data, error } = await supabase.storage.from('homepage-banners').list('', { limit: 20 });
    if (error) return alert('Gagal mengambil daftar banner.');
    setBanners(data || []);
  }

  // Upload file ke bucket homepage-banners (auto-compress!)
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    const fileName = `${Date.now()}-${selectedFile.name}`;
    // ==== COMPRESS BEFORE UPLOAD ====
    let compressedFile = selectedFile;
    try {
      compressedFile = await imageCompression(selectedFile, {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.85,
      });
    } catch (err) {
      compressedFile = selectedFile;
    }
    const { error } = await supabase.storage.from('homepage-banners').upload(fileName, compressedFile);
    setUploading(false);
    if (error) return alert('Gagal upload: ' + error.message);
    setSelectedFile(null);
    fetchBanners();
  }

  // Hapus file dari bucket
  async function handleDelete(fileName: string) {
    if (!window.confirm('Yakin hapus banner ini?')) return;
    const { error } = await supabase.storage.from('homepage-banners').remove([fileName]);
    if (error) return alert('Gagal hapus banner: ' + error.message);
    fetchBanners();
  }

  if (!isAdmin) return <div className="p-8 text-center">Hanya administrator yang bisa mengakses.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Kelola Slider Homepage</h1>
      
      {/* Form Upload */}
      <form onSubmit={handleUpload} className="mb-8 flex gap-4 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 px-5 py-2 rounded text-white font-semibold shadow hover:bg-blue-700"
          disabled={uploading}
        >
          {uploading ? 'Mengupload...' : 'Upload Banner'}
        </button>
      </form>

      {/* Preview Gambar yang dipilih */}
      {selectedFile && (
        <div className="mb-6">
          <strong>Preview:</strong>
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="preview"
            className="rounded mt-2 w-full max-h-48 object-contain"
            style={{ maxWidth: 320 }}
            loading="lazy"
          />
        </div>
      )}

      {/* List Banner */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {banners.map(b => (
          <div key={b.name} className="bg-white rounded-lg border shadow p-2 flex flex-col items-center">
            <img
              src={supabase.storage.from('homepage-banners').getPublicUrl(b.name).data.publicUrl}
              alt={b.name}
              className="rounded w-full h-28 object-cover mb-2"
              loading="lazy"
            />
            <span className="block truncate text-xs mb-2">{b.name}</span>
            <button
              className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
              onClick={() => handleDelete(b.name)}
            >Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}
