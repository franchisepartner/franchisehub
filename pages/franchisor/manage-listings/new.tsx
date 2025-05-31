// pages/franchisor/manage-listings/new.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function NewListing() {
  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    investment: '',
    location: '',
    mode: 'autopilot',
    has_license: false,
    has_legal_entity: false,
    has_halal_certification: false,
    logoFile: null as File | null,
    coverFile: null as File | null,
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const logoPath = formData.logoFile ? `logos/${uuidv4()}_${formData.logoFile.name}` : null;
    const coverPath = formData.coverFile ? `covers/${uuidv4()}_${formData.coverFile.name}` : null;

    if (formData.logoFile) {
      const { error: logoError } = await supabase.storage
        .from('franchise-assets')
        .upload(logoPath!, formData.logoFile);

      if (logoError) alert('Gagal upload logo: ' + logoError.message);
    }

    if (formData.coverFile) {
      const { error: coverError } = await supabase.storage
        .from('franchise-assets')
        .upload(coverPath!, formData.coverFile);

      if (coverError) alert('Gagal upload cover: ' + coverError.message);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('User tidak ditemukan.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('franchises').insert({
      user_id: user.id,
      franchise_name: formData.franchise_name,
      description: formData.description,
      investment: formData.investment,
      location: formData.location,
      mode: formData.mode,
      has_license: formData.has_license,
      has_legal_entity: formData.has_legal_entity,
      has_halal_certification: formData.has_halal_certification,
      logo_url: logoPath,
      cover_url: coverPath,
    });

    if (error) {
      alert('Gagal menambahkan listing: ' + error.message);
    } else {
      router.push('/franchisor/manage-listings');
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Listing Franchise Baru</h1>
      <form onSubmit={handleSubmit}>
        <input name="franchise_name" placeholder="Nama Franchise" required className="border p-2 w-full mb-2" onChange={handleChange}/>
        <textarea name="description" placeholder="Deskripsi" required className="border p-2 w-full mb-2" onChange={handleChange}/>
        <input name="investment" placeholder="Investasi Minimal" type="number" required className="border p-2 w-full mb-2" onChange={handleChange}/>
        <input name="location" placeholder="Lokasi" required className="border p-2 w-full mb-2" onChange={handleChange}/>

        <select name="mode" className="border p-2 w-full mb-2" onChange={handleChange}>
          <option value="autopilot">Autopilot</option>
          <option value="semi">Semi Autopilot</option>
        </select>

        <label className="flex items-center mb-2">
          <input type="checkbox" name="has_license" className="mr-2" onChange={handleChange}/> Lisensi Resmi
        </label>
        <label className="flex items-center mb-2">
          <input type="checkbox" name="has_legal_entity" className="mr-2" onChange={handleChange}/> Badan Hukum
        </label>
        <label className="flex items-center mb-2">
          <input type="checkbox" name="has_halal_certification" className="mr-2" onChange={handleChange}/> Sertifikat Halal
        </label>

        <label>Logo Franchise:</label>
        <input type="file" name="logoFile" required onChange={handleFileChange}/>

        <label>Cover Franchise:</label>
        <input type="file" name="coverFile" required onChange={handleFileChange}/>

        <button disabled={loading} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          {loading ? 'Mengirim...' : 'Tambah Listing'}
        </button>
      </form>
    </div>
  );
}
