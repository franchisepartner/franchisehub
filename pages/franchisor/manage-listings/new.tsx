// pages/franchisor/manage-listings/new.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';

export default function NewFranchiseListing() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    investment_min: '',
    operation_mode: 'autopilot',
    location: '',
    category: '',
    has_permit: 'akan/sedang diurus',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Harap login terlebih dahulu.');
      return;
    }

    const { error } = await supabase.from('franchises').insert({
      franchisor_id: user.id,
      ...formData,
    });

    if (error) {
      alert(`Gagal menambahkan listing: ${error.message}`);
    } else {
      router.push('/franchisor/dashboard');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Listing Franchise Baru</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="franchise_name"
          placeholder="Nama Franchise"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Deskripsi Franchise"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />
        <input
          name="investment_min"
          placeholder="Investasi Minimum"
          type="number"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />
        <select
          name="operation_mode"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
          value={formData.operation_mode}
        >
          <option value="autopilot">Autopilot</option>
          <option value="semi-autopilot">Semi-Autopilot</option>
        </select>
        <input
          name="location"
          placeholder="Lokasi Franchise"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />
        <input
          name="category"
          placeholder="Kategori Franchise"
          required
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />
        <select
          name="has_permit"
          className="border p-2 w-full mb-4"
          onChange={handleChange}
          value={formData.has_permit}
        >
          <option value="sudah punya">Sudah Punya</option>
          <option value="akan/sedang diurus">Akan/Sedang Diurus</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Tambah Listing
        </button>
      </form>
    </div>
  );
}
