import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';

export default function NewFranchiseListing() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    investment: '',
    operation_mode: 'Autopilot',
    location: '',
    category: 'F&B',
    whatsapp: '',
    email: '',
    website: '',
    slug: '',
    logo: null,
    cover: null,
    legalDocs: false,
    legalDocDetails: {},
    notes: ''
  });

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const uploadFile = async (file, folder) => {
    const filename = `${folder}/${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('franchisor-assets')
      .upload(filename, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const logoPath = await uploadFile(formData.logo, 'logos');
      const coverPath = await uploadFile(formData.cover, 'covers');

      const { data, error } = await supabase
        .from('franchise_listings')
        .insert({
          ...formData,
          logo: logoPath,
          cover: coverPath
        });

      if (error) throw error;

      alert('Listing berhasil ditambahkan!');
      router.push('/franchisor/manage-listings');
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat upload: ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5">Tambah Listing Franchise Baru</h1>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <input name="name" placeholder="Nama Franchise" className="w-full border p-2 rounded" onChange={handleChange}/>
        <textarea name="description" placeholder="Deskripsi Franchise" className="w-full border p-2 rounded" onChange={handleChange}/>
        <input name="investment" type="number" placeholder="Investasi Minimum (Rp)" className="w-full border p-2 rounded" onChange={handleChange}/>
        <select name="operation_mode" className="w-full border p-2 rounded" onChange={handleChange}>
          <option>Autopilot</option>
          <option>Semi Autopilot</option>
        </select>
        <input name="location" placeholder="Lokasi Franchise" className="w-full border p-2 rounded" onChange={handleChange}/>
        <select name="category" className="w-full border p-2 rounded" onChange={handleChange}>
          <option>F&B</option>
          <option>Retail</option>
          <option>Jasa</option>
          <option>Kesehatan & Kecantikan</option>
        </select>
        <input name="whatsapp" placeholder="Kontak WhatsApp Franchise" className="w-full border p-2 rounded" onChange={handleChange}/>
        <input name="email" type="email" placeholder="Kontak Email Franchise" className="w-full border p-2 rounded" onChange={handleChange}/>
        <input name="website" placeholder="Website Franchise (opsional)" className="w-full border p-2 rounded" onChange={handleChange}/>
        <input name="slug" placeholder="Slug URL (otomatis)" className="w-full border p-2 rounded bg-gray-100" disabled/>
        <input name="logo" type="file" className="block mt-2" onChange={handleChange}/>
        <input name="cover" type="file" className="block mt-2" onChange={handleChange}/>

        <label className="block font-semibold">
          <input type="checkbox" name="legalDocs" onChange={handleChange}/> Sudah Punya Dokumen Hukum
        </label>

        <textarea name="notes" placeholder="Catatan Tambahan (opsional)" className="w-full border p-2 rounded" rows={2} onChange={handleChange}/>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Tambah Listing</button>
      </form>
    </div>
  );
}
