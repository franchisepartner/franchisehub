import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function EditListing() {
  const [form, setForm] = useState({
    franchise_name: '',
    description: '',
    category: '',
    investment_min: '',
    location: '',
    operation_mode: '',
    whatsapp_contact: '',
    email_contact: '',
    website_url: '',
    google_maps_url: '',
    notes: '',
    tags: '',
    logo_url: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showcaseFiles, setShowcaseFiles] = useState<File[]>([]);
  const [showcaseUrls, setShowcaseUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { id } = router.query;

  // Fetch data listing dan showcase
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      // Franchise Listing
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        alert('Error fetching data');
        return;
      }
      setForm({
        franchise_name: data.franchise_name || '',
        description: data.description || '',
        category: data.category || '',
        investment_min: data.investment_min ? String(data.investment_min) : '',
        location: data.location || '',
        operation_mode: data.operation_mode || '',
        whatsapp_contact: data.whatsapp_contact || '',
        email_contact: data.email_contact || '',
        website_url: data.website_url || '',
        google_maps_url: data.google_maps_url || '',
        notes: data.notes || '',
        tags: data.tags || '',
        logo_url: data.logo_url || '',
      });

      // Showcase images
      const { data: images } = await supabase
        .from('listing_images')
        .select('image_url')
        .eq('listing_id', id)
        .order('id')
        .limit(5);
      if (images && images.length > 0) {
        setShowcaseUrls(
          images.map((img) =>
            supabase.storage.from('listing-images').getPublicUrl(img.image_url).data.publicUrl
          )
        );
      }
    };
    fetchData();
  }, [id]);

  // Handler input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Upload logo baru (replace logo lama)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  // Upload showcase baru (replace semua showcase lama)
  const handleShowcaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setShowcaseFiles(files.slice(0, 5));
  };

  const uploadLogoImage = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `logo/${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  const uploadShowcaseImage = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `showcase/${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let logoPath = form.logo_url;
      // Jika user upload logo baru
      if (logoFile) {
        logoPath = await uploadLogoImage(logoFile);
      }

      // 1. Update listing
      const { error } = await supabase
        .from('franchise_listings')
        .update({
          ...form,
          investment_min: parseInt(form.investment_min),
          logo_url: logoPath,
        })
        .eq('id', id);

      if (error) throw error;

      // 2. Jika upload showcase baru, replace semua showcase lama!
      if (showcaseFiles.length > 0) {
        // Hapus semua listing_images lama
        await supabase.from('listing_images').delete().eq('listing_id', id);
        // Upload dan insert baru
        for (const file of showcaseFiles) {
          const url = await uploadShowcaseImage(file);
          await supabase.from('listing_images').insert({
            listing_id: id,
            image_url: url,
            type: 'showcase',
          });
        }
      }

      alert('Listing berhasil diupdate!');
      router.push('/franchisor/manage-listings');
    } catch (err: any) {
      alert('Error updating listing: ' + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Listing Franchise</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="franchise_name"
          placeholder="Nama Franchise"
          required
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.franchise_name}
        />
        <textarea
          name="description"
          placeholder="Deskripsi"
          required
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.description}
          rows={3}
        />
        <input
          name="category"
          placeholder="Kategori"
          required
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.category}
        />
        <input
          name="investment_min"
          placeholder="Investasi Minimal"
          type="number"
          required
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.investment_min}
        />
        <input
          name="location"
          placeholder="Lokasi"
          required
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.location}
        />

        <select
          name="operation_mode"
          required
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.operation_mode}
        >
          <option value="">Pilih Mode Operasional</option>
          <option value="autopilot">Autopilot</option>
          <option value="semi">Semi Autopilot</option>
        </select>
        <div className="text-xs text-gray-500 mt-1 mb-3">
          <div className="mb-1 font-bold">Autopilot:</div>
          <ul className="list-disc pl-5 mb-2">
            <li>Mitra tidak perlu terlibat langsung dalam operasional harian.</li>
            <li>Aktivitas dijalankan tim pusat/franchisor, mitra terima laporan & hasil.</li>
          </ul>
          <div className="mb-1 font-bold">Semi Autopilot:</div>
          <ul className="list-disc pl-5">
            <li>Mitra menjalankan operasional harian sendiri.</li>
            <li>Franchisor sebagai pemberi dukungan teknis, pelatihan, dan pemasaran pusat.</li>
          </ul>
        </div>

        <input
          name="whatsapp_contact"
          placeholder="No WhatsApp"
          required
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.whatsapp_contact}
        />
        <input
          name="email_contact"
          placeholder="Email Kontak"
          required
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.email_contact}
        />
        <input
          name="website_url"
          placeholder="Website (opsional)"
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.website_url}
        />
        <input
          name="google_maps_url"
          placeholder="Google Maps URL (opsional)"
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.google_maps_url}
        />
        <input
          name="tags"
          placeholder="Tag (pisahkan dengan koma)"
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.tags}
        />
        <textarea
          name="notes"
          placeholder="Catatan (opsional)"
          className="border p-2 w-full rounded"
          onChange={handleChange}
          value={form.notes}
          rows={2}
        />

        {/* LOGO SECTION */}
        <div>
          <label className="block font-semibold mb-1">Logo Franchise</label>
          {form.logo_url && (
            <div className="mb-2">
              <img
                src={supabase.storage.from('listing-images').getPublicUrl(form.logo_url).data.publicUrl}
                alt="Logo"
                className="w-24 h-24 object-contain rounded mb-2 border"
              />
              <div className="text-xs text-gray-500 mb-1">
                Logo saat ini, upload baru untuk mengganti.
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="file-input file-input-bordered w-full max-w-xs"
          />
        </div>

        {/* SHOWCASE SECTION */}
        <div>
          <label className="block font-semibold mb-1">Showcase (max 5 gambar)</label>
          {showcaseUrls.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {showcaseUrls.map((url, idx) => (
                <img key={idx} src={url} className="w-20 h-16 object-cover rounded border" alt="Showcase" />
              ))}
              <div className="w-full text-xs text-gray-500 mt-1">
                Gambar saat ini, upload baru untuk mengganti semua showcase.
              </div>
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleShowcaseChange}
            className="file-input file-input-bordered w-full max-w-xs"
          />
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Update Listing'}
        </button>
      </form>
    </div>
  );
}
