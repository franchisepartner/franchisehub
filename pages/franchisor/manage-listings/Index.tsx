// pages/franchisor/manage-listings.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function ManageListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('*')
        .eq('user_id', user.id);

      if (!error) setListings(data);
      else alert('Terjadi kesalahan saat mengambil data.');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Anda yakin ingin menghapus listing ini?')) {
      const { error } = await supabase
        .from('franchise_listings')
        .delete()
        .eq('id', id);

      if (error) alert('Gagal menghapus listing');
      else fetchListings();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Kelola Listing Franchise Anda</h1>

      <Link href="/franchisor/manage-listings/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow">
        ➕ Tambah Listing Baru
      </Link>

      {loading ? (
        <p>Memuat data...</p>
      ) : listings.length > 0 ? (
        <table className="w-full table-auto border-collapse mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Nama Franchise</th>
              <th className="border px-4 py-2">Kategori</th>
              <th className="border px-4 py-2">Investasi Minimal</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="border px-4 py-2">{listing.franchise_name}</td>
                <td className="border px-4 py-2">{listing.category}</td>
                <td className="border px-4 py-2">Rp {listing.investment_min.toLocaleString('id-ID')}</td>
                <td className="border px-4 py-2 flex gap-2 justify-center">
                  <Link
                    href={`/franchisor/manage-listings/edit/${listing.id}`}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4">Anda belum memiliki listing franchise.</p>
      )}
    </div>
  );
}
