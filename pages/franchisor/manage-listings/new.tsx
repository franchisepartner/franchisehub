import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

export default function NewListing() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    category: '',
    location: '',
    investment: '',
    operation_mode: 'autopilot',
    logo: null as File | null,
    cover_image: null as File | null,
    legal_documents: {
      surat_izin_usaha: false,
      sertifikat_halal: false,
      izin_lingkungan: false,
      bpom: false,
      npwp: false,
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      legal_documents: {
        ...formData.legal_documents,
        [name]: checked,
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files?.[0] || null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const logoPath = `logos/${uuidv4()}_${formData.logo?.name}`;
    const coverPath = `covers/${uuidv4()}_${formData.cover_image?.name}`;

    await supabase.storage.from('franchise-assets').upload(logoPath, formData.logo!);
    await supabase.storage.from('franchise-assets').upload(coverPath, formData.cover_image!);

    const { error } = await supabase.from('franchises').insert({
      franchise_name: formData.franchise_name,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      investment: formData.investment,
      operation_mode: formData.operation_mode,
      logo_url: logoPath,
      cover_image_url: coverPath,
      legal_documents: formData.legal_documents,
    });

    if (!error) router.push('/franchisor/manage-listings');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Listing Franchise Baru</h1>

      <form onSubmit={handleSubmit}>
        <input name="franchise_name" placeholder="Nama Franchise" required className="border p-2 w-full mb-2" onChange={handleChange} />
        <textarea name="description" placeholder="Deskripsi" required className="border p-2 w-full mb-2" onChange={handleChange} />
        <input name="category" placeholder="Kategori" required className="border p-2 w-full mb-2" onChange={handleChange} />
        <input name="location" placeholder="Lokasi" required className="border p-2 w-full mb-2" onChange={handleChange} />
        <input name="investment" placeholder="Investasi Minimal" required className="border p-2 w-full mb-2" onChange={handleChange} />

        <select name="operation_mode" required className="border p-2 w-full mb-4" onChange={handleChange}>
          <option value="autopilot">Autopilot</option>
          <option value="semi-autopilot">Semi Autopilot</option>
        </select>

        <input type="file" name="logo" required className="mb-4" onChange={handleFileChange} />
        <input type="file" name="cover_image" required className="mb-4" onChange={handleFileChange} />

        <h2 className="font-semibold">Dokumen Hukum (centang jika sudah ada atau sedang diurus):</h2>
        {Object.keys(formData.legal_documents).map(doc => (
          <div key={doc} className="mb-2">
            <label>
              <input type="checkbox" name={doc} checked={formData.legal_documents[doc as keyof typeof formData.legal_documents]} onChange={handleCheckboxChange} />
              {doc.replace(/_/g, ' ').toUpperCase()}
            </label>
          </div>
        ))}

        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
          Tambah Listing
        </button>
      </form>
    </div>
  );
}
