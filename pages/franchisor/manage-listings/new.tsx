// pages/franchisor/manage-listings/new.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

export default function NewFranchiseListing() {
  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    min_investment: '',
    operation_mode: 'Autopilot',
    location: '',
    category: 'F&B',
    whatsapp: '',
    email: '',
    website: '',
    slug: '',
    has_legal_docs: false,
    legal_docs: [],
    notes: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      slug: formData.franchise_name.toLowerCase().replace(/\s+/g, '-')
    }))
  }, [formData.franchise_name]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLegalDocCheck = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      legal_docs: checked
        ? [...prev.legal_docs, value]
        : prev.legal_docs.filter(doc => doc !== value),
    }));
  };

  const handleFileUpload = (setter) => (e) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const logoPath = `listing-assets/${uuidv4()}_${logoFile.name}`;
    const coverPath = `listing-assets/${uuidv4()}_${coverFile.name}`;

    await supabase.storage.from('listing-assets').upload(logoPath, logoFile);
    await supabase.storage.from('listing-assets').upload(coverPath, coverFile);

    const { data, error } = await supabase.from('listings').insert({
      ...formData,
      logo_url: logoPath,
      cover_url: coverPath,
      user_id: (await supabase.auth.getUser()).data.user.id,
      created_at: new Date(),
    });

    setLoading(false);

    if (error) {
      alert('Terjadi kesalahan, coba lagi');
    } else {
      router.push('/franchisor/manage-listings');
    }
  };

  return (
    <form className="max-w-2xl mx-auto p-6 bg-white rounded shadow-md" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold mb-6">Tambah Listing Franchise Baru</h1>

      <label>Nama Franchise</label>
      <input name="franchise_name" className="input" onChange={handleChange} required />

      <label>Deskripsi Franchise</label>
      <textarea name="description" className="input" onChange={handleChange} required />

      <label>Investasi Minimum (Rp)</label>
      <input name="min_investment" type="number" className="input" onChange={handleChange} required />

      <label>Mode Operasi</label>
      <select name="operation_mode" className="input" onChange={handleChange}>
        <option>Autopilot</option>
        <option>Semi Autopilot</option>
      </select>

      <label>Lokasi Franchise</label>
      <input name="location" className="input" onChange={handleChange} required />

      <label>Kategori Franchise</label>
      <select name="category" className="input" onChange={handleChange}>
        <option>F&B</option>
        <option>Retail</option>
      </select>

      <label>WhatsApp</label>
      <input name="whatsapp" className="input" onChange={handleChange} required />

      <label>Email</label>
      <input name="email" type="email" className="input" onChange={handleChange} required />

      <label>Website (opsional)</label>
      <input name="website" className="input" onChange={handleChange} />

      <label>Slug URL</label>
      <input name="slug" value={formData.slug} className="input" disabled />

      <label>Logo Franchise</label>
      <input type="file" onChange={handleFileUpload(setLogoFile)} required />

      <label>Gambar Cover Franchise</label>
      <input type="file" onChange={handleFileUpload(setCoverFile)} required />

      <label>
        <input type="checkbox" name="has_legal_docs" onChange={handleChange} /> Sudah Punya Dokumen Hukum
      </label>
      {formData.has_legal_docs && (
        <div>
          {['STPW', 'Perjanjian Waralaba', 'SIUP', 'SITU', 'Akta Pendirian Usaha'].map(doc => (
            <label key={doc}><input type="checkbox" value={doc} onChange={handleLegalDocCheck} /> {doc}</label>
          ))}
        </div>
      )}
      {!formData.has_legal_docs && <p>Sedang dalam proses pengurusan</p>}

      <label>Catatan Tambahan (opsional)</label>
      <textarea name="notes" className="input" onChange={handleChange} />

      <button className="btn-primary mt-4" disabled={loading}>
        {loading ? 'Mengirim...' : 'Tambah Listing'}
      </button>
    </form>
  );
}
