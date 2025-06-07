// pages/franchisor/manage-listings/new.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';

export default function NewListingStep1() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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
    notes: '',
    tags: '',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
      else router.push('/login');
    });
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = form.franchise_name.toLowerCase().replace(/\s+/g, '-');
      const { data, error } = await supabase.from('franchise_listings').insert([{
        ...form,
        investment_min: parseInt(form.investment_min) || 0,
        slug,
        user_id: user?.id,
      }]).select('id').single();
      if (error) throw error;
      router.push(`/franchisor/manage-listings/upload-images?listing_id=${data.id}`);
    } catch (err) {
      alert('Gagal menambahkan data. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tambah Listing Franchise (1/2)</h1>
      <form onSubmit={handleNext} className="space-y-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        {/* ...input fields, tanpa input file, pakai style biasa... */}
        <div className="mb-4">
          <label className="font-medium text-gray-700">Nama Franchise</label>
          <input name="franchise_name" value={form.franchise_name} onChange={handleChange}
            className="block w-full py-2 px-2 rounded border border-gray-300 transition mt-1" required />
        </div>
        <div className="mb-4">
          <label className="font-medium text-gray-700">Deskripsi</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            className="block w-full py-2 px-2 rounded border border-gray-300 transition mt-1" required />
        </div>
        {/* ...repeat for all fields... */}
        <div className="mb-4">
          <label className="font-medium text-gray-700">Mode Operasional</label>
          <select name="operation_mode" value={form.operation_mode} onChange={handleChange}
            className="block w-full py-2 px-2 rounded border border-gray-300 transition mt-1" required>
            <option value="">Pilih...</option>
            <option value="autopilot">Autopilot</option>
            <option value="semi">Semi Autopilot</option>
          </select>
        </div>
        {/* ...tambahkan field lain sesuai kebutuhan... */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-full bg-green-600 text-white font-semibold shadow transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {loading ? 'Menyimpan...' : 'Lanjutkan ke Upload Gambar'}
        </button>
      </form>
    </div>
  );
}
