import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function EditBlog() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    title: '',
    category: '',
    content: '',
    cover_url: '',
    slug: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [oldCoverUrl, setOldCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      // Get session user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUser(user);

      // Fetch blog
      const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
      if (error || !data) {
        alert('Blog tidak ditemukan');
        router.push('/franchisor/manage-listings');
        return;
      }
      setForm({
        title: data.title || '',
        category: data.category || '',
        content: data.content || '',
        cover_url: data.cover_url || '',
        slug: data.slug || '',
      });
      setOldCoverUrl(data.cover_url || '');

      // Hanya admin/pemilik yang boleh edit
      if (data.created_by !== user.id && !(user.user_metadata?.role?.includes('admin') || user.user_metadata?.is_admin)) {
        alert('Anda tidak punya akses edit blog ini!');
        router.push('/franchisor/manage-listings');
      }
    };
    fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCoverFile(e.target.files[0]);
  };

  const handleRemoveCover = async () => {
    if (!form.cover_url) return;
    if (!window.confirm('Hapus cover blog ini?')) return;
    setLoading(true);
    await supabase.storage.from('blog-assets').remove([form.cover_url]);
    setForm(prev => ({ ...prev, cover_url: '' }));
    setCoverFile(null);
    setOldCoverUrl('');
    setLoading(false);
  };

  const uploadCover = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `cover/${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from('blog-assets').upload(fileName, file);
    if (error) throw error;
    return fileName; // <-- yang disimpan ke DB hanya "cover/xxxx.jpg"
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let newCoverPath = form.cover_url;
      // Upload cover baru
      if (coverFile) {
        // Hapus cover lama jika ada
        if (oldCoverUrl) {
          await supabase.storage.from('blog-assets').remove([oldCoverUrl]);
        }
        newCoverPath = await uploadCover(coverFile);
      }

      // Update data
      const { error } = await supabase
        .from('blogs')
        .update({
          ...form,
          cover_url: newCoverPath,
        })
        .eq('id', id);
      if (error) throw error;

      alert('Blog berhasil diupdate!');
      // Redirect ke halaman detail
      router.push(`/detail/${form.slug || form.title.toLowerCase().replace(/\s+/g, '-')}`);
    } catch (err: any) {
      alert('Error updating blog: ' + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  // Untuk render img dengan fallback jika gagal
  const renderCoverImg = (coverUrl: string) => {
    if (!coverUrl) return null;
    const url = supabase.storage.from('blog-assets').getPublicUrl(coverUrl).data.publicUrl;
    return (
      <div className="mb-2 relative flex flex-col items-start">
        <img
          src={url}
          alt="Cover"
          className="w-32 h-24 object-cover rounded border"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
        />
        <button
          type="button"
          className="absolute top-0 right-0 bg-white rounded-full shadow px-2 text-lg text-red-600 hover:bg-red-100"
          style={{ fontWeight: 'bold', lineHeight: '1' }}
          onClick={handleRemoveCover}
          disabled={loading}
          title="Hapus cover"
        >
          ×
        </button>
        <div className="text-xs text-gray-500 mt-1">Cover saat ini, upload baru untuk mengganti.</div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Blog Bisnis</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-bold mb-1 block">Judul Blog</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
            placeholder="Judul blog"
          />
        </div>
        <div>
          <label className="font-bold mb-1 block">Kategori</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
            placeholder="Kategori blog"
          />
        </div>
        <div>
          <label className="font-bold mb-1 block">Cover (opsional)</label>
          {form.cover_url && renderCoverImg(form.cover_url)}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="file-input file-input-bordered w-full max-w-xs"
            disabled={loading}
          />
        </div>
        <div>
          <label className="font-bold mb-1 block">Konten</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={10}
            className="border p-2 w-full rounded"
            placeholder="Konten blog (bisa pakai markdown, HTML, atau teks biasa)"
          />
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Update Blog'}
        </button>
      </form>
    </div>
  );
}
