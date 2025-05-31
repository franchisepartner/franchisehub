import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function NewListing() {
  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    investasi_minimum: '',
    mode_operasi: 'Autopilot',
    lokasi: '',
    kategori: '',
    whatsapp: '',
    email: '',
    website: '',
    logoFile: null as File | null,
    coverFile: null as File | null,
    sudah_punya_dokumen: false,
    dokumen_hukum: [] as string[],
    catatan: '',
  });

  const router = useRouter();

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      slug: formData.franchise_name.toLowerCase().replace(/\s+/g, '-'),
    }));
  }, [formData.franchise_name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: file,
    }));
  };

  const handleDokumenHukumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      dokumen_hukum: checked
        ? [...prev.dokumen_hukum, value]
        : prev.dokumen_hukum.filter(doc => doc !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const logoPath = formData.logoFile ? `listing-assets/logos/${Date.now()}_${formData.logoFile.name}` : '';
    const coverPath = formData.coverFile ? `listing-assets/covers/${Date.now()}_${formData.coverFile.name}` : '';

    if (formData.logoFile) {
      await supabase.storage.from('franchise-listing-assets').upload(logoPath, formData.logoFile);
    }

    if (formData.coverFile) {
      await supabase.storage.from('franchise-listing-assets').upload(coverPath, formData.coverFile);
    }

    const { error } = await supabase.from('listings').insert({
      ...formData,
      logo: logoPath,
      cover: coverPath,
      user_id: user.id,
    });

    if (error) {
      alert('Gagal menambahkan listing!');
    } else {
      router.push('/franchisor/manage-listings');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Listing Franchise Baru</h1>

      <input name="franchise_name" placeholder="Nama Franchise" className="border p-2 w-full mb-2" onChange={handleChange} required />

      <textarea name="description" placeholder="Deskripsi Franchise" className="border p-2 w-full mb-2" onChange={handleChange} required />

      <input name="investasi_minimum" placeholder="Investasi Minimum (Rp)" className="border p-2 w-full mb-2" onChange={handleChange} required />

      <select name="mode_operasi" className="border p-2 w-full mb-2" onChange={handleChange}>
        <option value="Autopilot">Autopilot</option>
        <option value="Semi Autopilot">Semi Autopilot</option>
      </select>

      <input name="lokasi" placeholder="Lokasi Franchise" className="border p-2 w-full mb-2" onChange={handleChange} required />

      <input name="kategori" placeholder="Kategori Franchise" className="border p-2 w-full mb-2" onChange={handleChange} required />

      <input name="whatsapp" placeholder="Kontak WhatsApp Franchise" className="border p-2 w-full mb-2" onChange={handleChange} required />

      <input name="email" placeholder="Kontak Email Franchise" className="border p-2 w-full mb-2" onChange={handleChange} required />

      <input name="website" placeholder="Website Franchise (opsional)" className="border p-2 w-full mb-2" onChange={handleChange} />

      <input type="file" name="logoFile" className="border p-2 w-full mb-2" onChange={handleFileChange} required />

      <input type="file" name="coverFile" className="border p-2 w-full mb-2" onChange={handleFileChange} required />

      <label>
        <input type="checkbox" name="sudah_punya_dokumen" onChange={handleChange} />
        Sudah Punya Dokumen Hukum
      </label>

      {formData.sudah_punya_dokumen && (
        <div>
          {['STPW', 'Perjanjian Waralaba', 'SIUP', 'SITU', 'Akta Pendirian Usaha'].map(doc => (
            <label key={doc}>
              <input type="checkbox" value={doc} onChange={handleDokumenHukumChange} />
              {doc}
            </label>
          ))}
        </div>
      )}

      {!formData.sudah_punya_dokumen && (
        <p>Sedang dalam proses pengurusan</p>
      )}

      <textarea name="catatan" placeholder="Catatan Tambahan (opsional)" className="border p-2 w-full mb-2" onChange={handleChange} />

      <button className="bg-blue-500 text-white p-2 rounded" type="submit">
        Tambah Listing
      </button>
    </form>
  );
}
