// pages/franchisor/manage-listings/new.tsx
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function NewFranchiseListing() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    investment_min: '',
    operation_mode: 'Autopilot',
    location: '',
    category: 'F&B',
    whatsapp_contact: '',
    email_contact: '',
    website_url: '',
    slug: '',
    has_legal_docs: false,
    legal_docs: [],
    notes: '',
    logo: null as File | null,
    cover: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = (await supabase.auth.getUser()).data.user;

    const uploadFile = async (file: File, folder: string) => {
      const filePath = `${user!.id}/${folder}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('franchise-listing-assets')
        .upload(filePath, file);

      if (error) throw error;
      return supabase.storage.from('franchise-listing-assets').getPublicUrl(data.path).data.publicUrl;
    };

    try {
      const logo_url = formData.logo ? await uploadFile(formData.logo, 'logos') : null;
      const cover_url = formData.cover ? await uploadFile(formData.cover, 'covers') : null;

      const { error } = await supabase.from('franchise_listings').insert({
        franchise_name: formData.franchise_name,
        description: formData.description,
        investment_min: parseInt(formData.investment_min),
        operation_mode: formData.operation_mode,
        location: formData.location,
        category: formData.category,
        whatsapp_contact: formData.whatsapp_contact,
        email_contact: formData.email_contact,
        website_url: formData.website_url,
        slug: formData.franchise_name.toLowerCase().replace(/\s+/g, '-'),
        has_legal_docs: formData.has_legal_docs,
        notes: formData.notes,
        logo_url,
        cover_url,
      });

      if (error) throw error;
      alert('Listing berhasil ditambahkan!');
      router.push('/franchisor/manage-listings');

    } catch (error: any) {
      alert('Terjadi kesalahan: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5">Tambah Listing Franchise Baru</h1>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <input name="franchise_name" placeholder="Nama Franchise" className="w-full border p-2 rounded" onChange={handleChange} />
        <textarea name="description" placeholder="Deskripsi Franchise" className="w-full border p-2 rounded" rows={2} onChange={handleChange}/>
        <input name="investment_min" type="number" placeholder="Investasi Minimum (Rp)" className="w-full border p-2 rounded" onChange={handleChange} />
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
        <input name="whatsapp_contact" placeholder="WhatsApp" className="w-full border p-2 rounded" onChange={handleChange} />
        <input name="email_contact" placeholder="Email" className="w-full border p-2 rounded" onChange={handleChange} />
        <input name="website_url" placeholder="Website" className="w-full border p-2 rounded" onChange={handleChange}/>
        <input type="file" name="logo" onChange={handleFileChange} />
        <input type="file" name="cover" onChange={handleFileChange} />
        <button className="bg-blue-600 text-white px-6 py-2 rounded">Tambah Listing</button>
      </form>
    </div>
  );
}
