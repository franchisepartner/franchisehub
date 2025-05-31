// pages/franchisor/manage-listings/new.tsx
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function NewListing() {
  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    investment_min: 0,
    operation_mode: 'Autopilot',
    location: '',
    category: '',
    dokumen_hukum_sudah_punya: false,
    logo_url: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoFile(e.target.files ? e.target.files[0] : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let logo_url = '';
    if (logoFile) {
      const fileName = `${Date.now()}_${logoFile.name}`;
      const { data, error } = await supabase.storage.from('franchise-logos').upload(fileName, logoFile);
      if (error) {
        alert('Gagal mengunggah logo');
        return;
      }
      logo_url = data.path;
    }

    const { error: insertError } = await supabase.from('franchise_listings').insert({
      ...formData,
      logo_url,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    if (insertError) {
      alert('Gagal menambahkan listing');
      return;
    }

    router.push('/franchisor/manage-listings');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Listing Franchise Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="franchise_name" placeholder="Nama Franchise" required className="border p-2 w-full" onChange={handleChange} />
        <textarea name="description" placeholder="Deskripsi Franchise" required className="border p-2 w-full" onChange={handleChange}></textarea>
        <input name="investment_min" type="number" placeholder="Investasi Minimum" required className="border p-2 w-full" onChange={handleChange} />

        <select name="operation_mode" className="border p-2 w-full" onChange={handleChange}>
          <option value="Autopilot">Autopilot</option>
          <option value="Semi Autopilot">Semi Autopilot</option>
        </select>

        <input name="location" placeholder="Lokasi Franchise" required className="border p-2 w-full" onChange={handleChange} />
        <input name="category" placeholder="Kategori Franchise" required className="border p-2 w-full" onChange={handleChange} />

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="dokumen_hukum_sudah_punya" onChange={handleChange} />
          <span>Sudah Punya Dokumen Hukum</span>
        </label>

        <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 w-full" required />

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Tambah Listing</button>
      </form>
    </div>
  );
}
