import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

interface Franchise {
  id: string;
  franchise_name: string;
  description: string;
  category: string;
  investment_min: number;
  location: string;
  logo_url: string;
  slug: string;
}

export default function Home() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFranchises = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching franchises:', error);
      } else {
        const franchisesWithImages = data.map((franchise) => ({
          ...franchise,
          logo_url: supabase.storage
            .from('listing-images')
            .getPublicUrl(franchise.logo_url).data.publicUrl,
        }));
        setFranchises(franchisesWithImages);
      }
      setLoading(false);
    };

    fetchFranchises();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daftar Franchise</h1>
      {loading ? (
        <p>Memuat daftar franchise...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {franchises.map((franchise) => (
            <Link key={franchise.id} href={`/franchise/${franchise.slug}`} passHref>
              <div className="border rounded shadow p-4 cursor-pointer hover:shadow-lg transition-shadow">
                <img
                  src={franchise.logo_url}
                  alt={franchise.franchise_name}
                  className="w-full h-40 object-cover rounded"
                />
                <h2 className="text-lg font-semibold mt-2">{franchise.franchise_name}</h2>
                <p className="text-sm text-gray-500">{franchise.category} - {franchise.location}</p>
                <p className="mt-2 text-sm">Investasi Mulai: Rp {franchise.investment_min.toLocaleString('id-ID')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
