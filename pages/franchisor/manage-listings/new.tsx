import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function NewListing() {
  const user = useUser();
  const router = useRouter();

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
    dokumen_hukum_sudah_punya: false,
    dokumen_hukum_akan_diurus: false,
    notes: '',
    tags: '',
    logo_file: null,
    cover_file: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadImage = async (file, pathPrefix) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}/${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const logoPath = form.logo_file ? await uploadImage(form.logo_file, 'logo') : null;
      const coverPath = form.cover_file ? await uploadImage(form.cover_file, 'cover') : null;

      const slug = form.franchise_name.toLowerCase().replace(/\s+/g, '-');

      const { error } = await supabase.from('franchise_listings').insert({
        user_id: user.id,
        franchise_name: form.franchise_name,
        description: form.description,
        category: form.category,
        investment_min: parseInt(form.investment_min),
        location: form.location,
        operation_mode: form.operation_mode,
        whatsapp_contact: form.whatsapp_contact,
        email_contact: form.email_contact,
        website_url: form.website_url,
        google_maps_url: form.google_maps_url,
        dokumen_hukum_sudah_punya: form.dokumen_hukum_sudah_punya,
        dokumen_hukum_akan_diurus: form.dokumen_hukum_akan_diurus,
        notes: form.notes,
        tags: form.tags,
        slug,
        logo_url: logoPath,
        cover_url: coverPath,
      });

      if (error) throw error;
      alert('Listing berhasil ditambahkan');
      router.push('/franchisor/manage-listings');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tambah Listing Franchise</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required name="franchise_name" value={form.franchise_name} onChange={handleChange} placeholder="Nama Franchise" className="input" />
        <textarea required name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi" className="textarea" />
        <input required name="category" value={form.category} onChange={handleChange} placeholder="Kategori" className="input" />
        <input required type="number" name="investment_min" value={form.investment_min} onChange={handleChange} placeholder="Investasi Minimal" className="input" />
        <input required name="location" value={form.location} onChange={handleChange} placeholder="Lokasi" className="input" />

        <div>
          <label className="block font-semibold">Mode Operasional</label>
          <select required name="operation_mode" value={form.operation_mode} onChange={handleChange} className="select">
            <option value="">Pilih...</option>
            <option value="autopilot">Autopilot</option>
            <option value="semi">Semi Autopilot</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">Autopilot berarti mitra tidak perlu ikut terlibat langsung dalam operasional harian. Semi-autopilot berarti mitra tetap punya peran namun sebagian operasional dibantu tim pusat.</p>
        </div>

        <input required name="whatsapp_contact" value={form.whatsapp_contact} onChange={handleChange} placeholder="No WhatsApp" className="input" />
        <input required name="email_contact" value={form.email_contact} onChange={handleChange} placeholder="Email Kontak" className="input" />
        <input name="website_url" value={form.website_url} onChange={handleChange} placeholder="Website (opsional)" className="input" />
        <input name="google_maps_url" value={form.google_maps_url} onChange={handleChange} placeholder="Google Maps URL (opsional)" className="input" />

        <div className="flex gap-4">
          <label><input type="checkbox" name="dokumen_hukum_sudah_punya" checked={form.dokumen_hukum_sudah_punya} onChange={handleChange} /> Sudah punya dokumen hukum</label>
          <label><input type="checkbox" name="dokumen_hukum_akan_diurus" checked={form.dokumen_hukum_akan_diurus} onChange={handleChange} /> Akan diurus</label>
        </div>

        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Catatan Tambahan (opsional)" className="textarea" />
        <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tag (pisahkan dengan koma)" className="input" />

        <div>
          <label className="block">Upload Logo (wajib)</label>
          <input required type="file" name="logo_file" onChange={handleChange} />
        </div>

        <div>
          <label className="block">Upload Cover (opsional)</label>
          <input type="file" name="cover_file" onChange={handleChange} />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Menyimpan...' : 'Tambah Listing'}
        </button>
      </form>
    </div>
  );
}
