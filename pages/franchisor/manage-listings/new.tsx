import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@supabase/supabase-js';

export default function NewListing() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      else router.push('/login');
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked, files } = target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files![0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadImage = async (file: File, pathPrefix: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}/${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage.from('listing-images').upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const logoPath = form.logo_file ? await uploadImage(form.logo_file, 'logo') : null;
      const coverPath = form.cover_file ? await uploadImage(form.cover_file, 'cover') : null;

      const slug = form.franchise_name.toLowerCase().replace(/\s+/g, '-');

      const { error } = await supabase.from('franchise_listings').insert({
        user_id: user?.id,
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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tambah Listing Franchise</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <table className="w-full table-auto border-separate border-spacing-y-4">
          <tbody>
            <tr>
              <td className="w-1/3 font-medium">Nama Franchise</td>
              <td><input required name="franchise_name" value={form.franchise_name} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Kategori</td>
              <td><input required name="category" value={form.category} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Investasi Minimal</td>
              <td><div className="flex items-center gap-2"><span>Rp</span><input required type="number" name="investment_min" value={form.investment_min} onChange={handleChange} className="input w-full" /></div></td>
            </tr>
            <tr>
              <td className="font-medium">Lokasi</td>
              <td><input required name="location" value={form.location} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">No WhatsApp</td>
              <td><input required name="whatsapp_contact" value={form.whatsapp_contact} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Email Kontak</td>
              <td><input required name="email_contact" value={form.email_contact} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Website (opsional)</td>
              <td><input name="website_url" value={form.website_url} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Google Maps URL (opsional)</td>
              <td><input name="google_maps_url" value={form.google_maps_url} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Tag</td>
              <td><input name="tags" value={form.tags} onChange={handleChange} className="input w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium align-top pt-2">Deskripsi</td>
              <td><textarea required name="description" value={form.description} onChange={handleChange} className="textarea w-full" rows={4} /></td>
            </tr>
            <tr>
              <td className="font-medium">Mode Operasional</td>
              <td>
                <select required name="operation_mode" value={form.operation_mode} onChange={handleChange} className="select w-full">
                  <option value="">Pilih...</option>
                  <option value="autopilot">Autopilot</option>
                  <option value="semi">Semi Autopilot</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">Autopilot berarti mitra tidak perlu ikut terlibat langsung dalam operasional harian. Semi-autopilot berarti mitra tetap punya peran namun sebagian operasional dibantu tim pusat.</p>
              </td>
            </tr>
            <tr>
              <td className="font-medium align-top">Dokumen Hukum</td>
              <td>
                <label className="flex items-start gap-2 mb-2">
                  <input type="checkbox" name="dokumen_hukum_sudah_punya" checked={form.dokumen_hukum_sudah_punya} onChange={handleChange} />
                  <span>Sudah punya perjanjian waralaba notariil sesuai UU No. 42 Tahun 2007</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" name="dokumen_hukum_akan_diurus" checked={form.dokumen_hukum_akan_diurus} onChange={handleChange} />
                  <span>Akan mengurus perjanjian waralaba sesuai peraturan perundang-undangan</span>
                </label>
              </td>
            </tr>
            <tr>
              <td className="font-medium">Catatan Tambahan</td>
              <td><textarea name="notes" value={form.notes} onChange={handleChange} className="textarea w-full" rows={3} /></td>
            </tr>
            <tr>
              <td className="font-medium">Upload Logo</td>
              <td><input required type="file" name="logo_file" onChange={handleChange} className="file-input file-input-bordered w-full" /></td>
            </tr>
            <tr>
              <td className="font-medium">Upload Cover</td>
              <td><input required type="file" name="cover_file" onChange={handleChange} className="file-input file-input-bordered w-full" /></td>
            </tr>
          </tbody>
        </table>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Menyimpan...' : 'Tambah Listing'}
        </button>
      </form>
    </div>
  );
}
