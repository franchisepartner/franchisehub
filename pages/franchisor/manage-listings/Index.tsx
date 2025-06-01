import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function ManageListings() {
  const [listings, setListings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchListings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('franchise_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        alert('Gagal memuat data listing');
        return;
      }
      setListings(data);
    };

    fetchListings();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold">Listing Franchise Anda</h2>
      {listings.length === 0 ? (
        <p className="mt-4">Anda belum punya listing franchise.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {listings.map((listing) => (
            <li key={listing.id} className="p-4 border rounded shadow-sm">
              <h3 className="text-xl font-semibold">{listing.franchise_name}</h3>
              <p>{listing.category} - {listing.location}</p>
              <p className="text-sm text-gray-600">Investasi: Rp {listing.investment_min}</p>
              <button 
                onClick={() => router.push(`/franchise/${listing.slug}`)}
                className="btn btn-primary mt-2"
              >
                Lihat Detail
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
