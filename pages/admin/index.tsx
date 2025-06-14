import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

interface Franchise {
  id: string;
  franchise_name: string;
  category: string;
  investment_min: number;
  location: string;
  logo_url: string;
  slug: string;
}

export default function AdminDashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [refresh, setRefresh] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.push('/');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const currentRole = profile?.role || data.user.user_metadata?.role;
      if (!currentRole || currentRole.toLowerCase() !== 'administrator') {
        router.push('/');
      } else {
        setRole(currentRole);
      }
      setLoading(false);
    };
    checkUserRole();
  }, [router]);

  // Fetch listing franchise
  useEffect(() => {
    if (role?.toLowerCase() === 'administrator') {
      (async () => {
        const { data, error } = await supabase
          .from('franchise_listings')
          .select('id, franchise_name, category, investment_min, location, logo_url, slug')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setFranchises(
            data.map((fr: any) => ({
              ...fr,
              logo_url: fr.logo_url
                ? supabase.storage.from('listing-images').getPublicUrl(fr.logo_url).data.publicUrl
                : '/logo192.png',
            }))
          );
        }
      })();
    }
  }, [role, refresh]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus listing ini? Semua data terkait akan hilang!')) return;
    const { error } = await supabase.from('franchise_listings').delete().eq('id', id);
    if (!error) {
      setRefresh(x => x + 1);
    } else {
      alert('Gagal menghapus listing: ' + error.message);
    }
  };

  if (loading || role?.toLowerCase() !== 'administrator') {
    return <div className="p-8 text-center text-gray-500">Memuat...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Administrator</h1>

      {/* Tombol Fitur Admin */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <a
          href="/admin/manage-homepage-banners"
          className="flex-1 flex items-center justify-center px-5 py-4 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 text-white font-bold shadow-lg hover:scale-105 transition"
        >
          <span className="text-2xl mr-3">🎨</span>
          Kelola Banner Homepage
        </a>
        <a
          href="/admin/franchisor-approvals"
          className="flex-1 flex items-center justify-center px-5 py-4 rounded-lg bg-gradient-to-br from-green-400 to-teal-500 text-white font-bold shadow-lg hover:scale-105 transition"
        >
          <span className="text-2xl mr-3">✅</span>
          Persetujuan Pengajuan Jadi Franchisor
        </a>
      </div>

      {/* Daftar Listing */}
      <div className="bg-white rounded-2xl border shadow-lg px-3 sm:px-6 py-6">
        <h2 className="text-xl font-semibold mb-4">Semua Listing Franchise</h2>
        {franchises.length === 0 ? (
          <div className="text-center text-gray-400 py-10">Tidak ada data franchise.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-50 text-blue-700">
                  <th className="py-3 px-2 rounded-tl-xl">Logo</th>
                  <th className="py-3 px-2">Nama Franchise</th>
                  <th className="py-3 px-2">Kategori</th>
                  <th className="py-3 px-2">Investasi</th>
                  <th className="py-3 px-2">Lokasi</th>
                  <th className="py-3 px-2 rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {franchises.map((fr) => (
                  <tr key={fr.id} className="border-b hover:bg-blue-50 transition">
                    <td className="py-2 px-2">
                      <img src={fr.logo_url} alt={fr.franchise_name} className="w-12 h-12 object-cover rounded border" />
                    </td>
                    <td className="py-2 px-2 font-bold">{fr.franchise_name}</td>
                    <td className="py-2 px-2">{fr.category}</td>
                    <td className="py-2 px-2">Rp {fr.investment_min.toLocaleString('id-ID')}</td>
                    <td className="py-2 px-2">{fr.location}</td>
                    <td className="py-2 px-2">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1 rounded shadow text-xs"
                        onClick={() => handleDelete(fr.id)}
                      >
                        Hapus
                      </button>
                      <a
                        href={`/franchise/${fr.slug}`}
                        className="ml-2 text-blue-500 hover:underline font-bold"
                        target="_blank" rel="noopener noreferrer"
                      >
                        Detail
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
