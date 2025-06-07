import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function ManageListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Ambil user & cek role admin
  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Cek role di tabel profiles (pakai kolom role atau is_admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', user.id)
        .single();
      if (profile?.role === 'administrator' || profile?.is_admin) setIsAdmin(true);

      // Ambil listing
      let query = supabase.from('franchise_listings').select('*').order('created_at', { ascending: false });
      // Jika bukan admin, filter hanya miliknya sendiri
      if (!profile?.is_admin && profile?.role !== 'administrator') {
        query = query.eq('user_id', user.id);
      }
      const { data, error } = await query;
      if (error) {
        alert('Gagal memuat data listing');
        return;
      }
      setListings(data || []);
    };

    fetchUserAndRole();
  }, [router]);

  // Tombol hapus listing
  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus listing ini?')) return;
    setLoading(true);
    const { error } = await supabase.from('franchise_listings').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus listing');
    } else {
      setListings((prev) => prev.filter((item) => item.id !== id));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">Listing Franchise Anda</h2>
      {listings.length === 0 ? (
        <p className="mt-4">Anda belum punya listing franchise.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {listings.map((listing) => (
            <li key={listing.id} className="p-4 border rounded shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{listing.franchise_name}</h3>
                <p>{listing.category} - {listing.location}</p>
                <p className="text-sm text-gray-600">Investasi: Rp {listing.investment_min}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => router.push(`/franchise/${listing.slug}`)}
                  className="btn btn-primary"
                >
                  Lihat Detail
                </button>
                {/* Edit hanya untuk admin atau pemilik */}
                {(isAdmin || user?.id === listing.user_id) && (
                  <button
                    onClick={() => router.push(`/franchisor/manage-listings/edit/${listing.id}`)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                )}
                {/* Hapus hanya untuk admin atau pemilik */}
                {(isAdmin || user?.id === listing.user_id) && (
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="btn btn-error"
                    disabled={loading}
                  >
                    {loading ? 'Menghapus...' : 'Hapus'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
