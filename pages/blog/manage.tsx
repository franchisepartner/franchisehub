import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

const templates = [
  {
    label: "Analisis Peluang Waralaba",
    content: `## Latar Belakang\nTuliskan mengapa waralaba ini menarik untuk dianalisis.\n\n## Kelebihan Model Bisnis\n\n## Tantangan dan Solusi\n\n## Kesimpulan\n`
  },
  {
    label: "Studi Kasus Franchise",
    content: `## Nama Brand dan Profil\n\n## Strategi Pertumbuhan\n\n## Prestasi dan Capaian\n\n## Insight untuk Franchisor Lain\n`
  },
  {
    label: "Panduan Langkah Awal",
    content: `## Kenapa Memulai Franchise\n\n## Langkah 1: Validasi Ide\n\n## Langkah 2: Legalitas\n\n## Langkah 3: Pemasaran Awal\n\n## Penutup\n`
  }
];

export default function BlogManage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Manage state
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) fetchProfile(data.session.user.id);
    });
    supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) fetchProfile(sess.user.id);
    });
  }, []);

  async function fetchProfile(id: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    setProfile(data);
    fetchBlogs(data);
  }

  async function fetchBlogs(profileData: any) {
    setLoadingBlogs(true);
    let query = supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (profileData && profileData.role !== 'administrator') {
      query = query.eq('created_by', profileData.id);
    }
    const { data, error } = await query;
    if (!error && data) setBlogs(data);
    setLoadingBlogs(false);
  }

  function slugify(str: string) {
    return str
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  // --- AUTO-COMPRESS COVER BLOG ---
  async function handleUploadCover(file: File) {
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    // compress file sebelum upload
    let compressedFile = file;
    try {
      compressedFile = await imageCompression(file, {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        initialQuality: 0.85,
      });
    } catch (err) {
      compressedFile = file;
    }
    const { data, error } = await supabase
      .storage
      .from('blog-assets')
      .upload(filename, compressedFile);
    if (error) throw error;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-assets/${filename}`;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!profile || !['franchisor', 'administrator'].includes(profile.role)) {
      setLoading(false);
      return alert("Hanya franchisor dan admin yang bisa membuat blog.");
    }
    if (!title.trim() || !category.trim() || !content.trim() || !author.trim()) {
      setLoading(false);
      return alert("Semua field wajib diisi!");
    }
    setLoading(true);
    let imageUrl = coverUrl;
    if (coverFile) {
      try {
        imageUrl = await handleUploadCover(coverFile);
        setCoverUrl(imageUrl);
      } catch (err) {
        setLoading(false);
        return alert("Gagal upload cover: " + (err as any).message);
      }
    }
    const slug = slugify(title);

    if (editId) {
      // Update blog
      const { error } = await supabase.from('blogs').update({
        title,
        slug,
        category,
        author,
        created_by: profile.id,
        cover_url: imageUrl,
        content,
      }).eq('id', editId);
      setLoading(false);
      if (error) {
        return alert("Gagal update blog: " + error.message);
      }
      alert("Blog berhasil diperbarui!");
      setEditId(null);
    } else {
      // Insert new blog
      const { error } = await supabase.from('blogs').insert({
        title,
        slug,
        category,
        author,
        created_by: profile.id,
        cover_url: imageUrl,
        content,
      });
      setLoading(false);
      if (error) {
        return alert("Gagal simpan blog: " + error.message);
      }
      alert("Blog berhasil ditambahkan!");
    }
    resetForm();
    fetchBlogs(profile);
  }

  function resetForm() {
    setEditId(null);
    setTitle('');
    setCategory('');
    setAuthor('');
    setContent('');
    setCoverFile(null);
    setCoverUrl('');
  }

  // Edit
  function handleEdit(blog: any) {
    setEditId(blog.id);
    setTitle(blog.title);
    setCategory(blog.category);
    setAuthor(blog.author);
    setContent(blog.content);
    setCoverUrl(blog.cover_url);
    setCoverFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete
  async function handleDelete(blog: any) {
    if (!window.confirm('Yakin ingin menghapus blog ini?')) return;
    setLoading(true);
    const { error } = await supabase.from('blogs').delete().eq('id', blog.id);
    setLoading(false);
    if (error) {
      return alert("Gagal hapus blog: " + error.message);
    }
    alert("Blog dihapus.");
    fetchBlogs(profile);
    if (editId === blog.id) resetForm();
  }

  // Preview cover image
  useEffect(() => {
    if (coverFile) {
      const reader = new FileReader();
      reader.onload = e => {
        setCoverUrl(e.target?.result as string);
      };
      reader.readAsDataURL(coverFile);
    }
  }, [coverFile]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{editId ? 'Edit Blog' : 'Buat Blog Baru'}</h1>

      {/* Template Pilihan */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">Pilih template penulisan (opsional):</div>
        <div className="flex gap-2 flex-wrap">
          {templates.map(tpl => (
            <button
              key={tpl.label}
              type="button"
              className="border rounded px-3 py-2 bg-gray-50 hover:bg-blue-50 text-xs"
              onClick={() => setContent(tpl.content)}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Judul Blog</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Kategori</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            placeholder="Contoh: Tips, Studi Kasus, Panduan"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Penulis</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            required
            placeholder="Nama penulis"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Gambar Cover</label>
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={e => setCoverFile(e.target.files?.[0] || null)}
            className="mb-1"
          />
          <p className="text-xs text-gray-500 mb-2">Hanya file .jpg atau .png. Disarankan ukuran horizontal.</p>
          {coverUrl && (
            <img src={coverUrl} alt="Preview" className="w-full rounded mb-2" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Isi Konten</label>
          <textarea
            className="border rounded px-3 py-2 w-full min-h-[160px]"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            placeholder="Tulis konten blog di sini..."
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className={`py-2 px-4 rounded text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading ? (editId ? 'Menyimpan Perubahan...' : 'Menyimpan...') : (editId ? 'Simpan Perubahan' : 'Simpan Blog')}
          </button>
          <button
            type="button"
            className="py-2 px-4 rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
            onClick={() => setShowPreview(true)}
            disabled={loading}
          >
            Preview
          </button>
          {editId && (
            <button
              type="button"
              className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
              onClick={resetForm}
            >
              Batal Edit
            </button>
          )}
        </div>
      </form>

      {/* Daftar Blog */}
      <div className="mt-10">
        <h2 className="font-semibold mb-3">Blog Anda</h2>
        {loadingBlogs ? (
          <p>Memuat blog...</p>
        ) : blogs.length === 0 ? (
          <p>Belum ada blog.</p>
        ) : (
          <div className="space-y-4">
            {blogs.map(blog => (
              <div
                key={blog.id}
                className="border p-3 rounded flex flex-col md:flex-row md:items-center gap-3 bg-white hover:bg-gray-50 cursor-pointer transition relative group"
                onClick={() => router.push(`/detail/${blog.slug}`)}
              >
                {blog.cover_url && (
                  <img src={blog.cover_url} alt={blog.title} className="h-16 w-28 object-cover rounded" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{blog.title}</div>
                  <div className="text-xs text-gray-500">{blog.category} • {new Date(blog.created_at).toLocaleDateString('id-ID')}</div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0 z-10">
                  {(profile.role === 'administrator' || blog.created_by === profile.id) && (
                    <button
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(blog);
                      }}
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PREVIEW */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowPreview(false)}>
          <div
            className="bg-white max-w-3xl w-full rounded-lg shadow-xl p-6 relative overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-xl text-gray-600 hover:text-red-500"
              onClick={() => setShowPreview(false)}
              aria-label="Close preview"
            >
              &times;
            </button>
            <h1 className="text-3xl font-bold mb-2">{title || <span className="italic text-gray-400">[Judul belum diisi]</span>}</h1>
            <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-x-3">
              <span className="font-medium">{category || <span className="italic text-gray-400">[Kategori]</span>}</span>
              <span>|</span>
              <span>{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>|</span>
              <span>{author || <span className="italic text-gray-400">[Penulis]</span>}</span>
            </div>
            <hr className="border-black mb-6" />
            {coverUrl && (
              <img
                src={coverUrl}
                alt="Cover"
                className="w-full rounded-lg mb-6 max-h-[420px] object-cover"
              />
            )}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
