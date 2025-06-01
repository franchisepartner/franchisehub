import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Franchise {
  id: string;
  franchise_name: string;
  description: string;
  category: string;
  investment_min: number;
  location: string;
  logo_url: string;
  cover_url: string;
  operation_mode: string;
  whatsapp_contact: string;
  email_contact: string;
  website_url?: string;
  slug: string;
  google_maps_url?: string;
  notes?: string;
  tags?: string;
}

export default function FranchiseDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;

    const fetchFranchise = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        console.error('Error fetching franchise:', error);
        router.replace('/404');
      } else {
        const logoPublicUrl = supabase.storage
          .from('listing-images')
          .getPublicUrl(`logo/${data.logo_url}`).data.publicUrl;

        const coverPublicUrl = supabase.storage
          .from('listing-images')
          .getPublicUrl(`cover/${data.cover_url}`).data.publicUrl;

        setFranchise({ ...data, logo_url: logoPublicUrl, cover_url: coverPublicUrl });

        // Tambahkan log berikut untuk melihat URL
        console.log('Logo URL:', logoPublicUrl);
        console.log('Cover URL:', coverPublicUrl);
      }
      setLoading(false);
    };

    fetchFranchise();
  }, [slug, router]);

  if (loading) {
    return <div className="p-6">Memuat detail franchise...</div>;
  }

  if (!franchise) {
    return <div className="p-6">Franchise tidak ditemukan.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{franchise.franchise_name}</h1>
      <img src={franchise.logo_url} alt={franchise.franchise_name} className="w-48 h-48 object-cover rounded mb-4" />
      <img src={franchise.cover_url} alt={`${franchise.franchise_name} cover`} className="w-full h-auto object-cover rounded mb-4" />
      <p className="mb-2"><strong>Deskripsi:</strong> {franchise.description}</p>
      <p className="mb-2"><strong>Kategori:</strong> {franchise.category}</p>
      <p className="mb-2"><strong>Minimal Investasi:</strong> Rp. {franchise.investment_min.toLocaleString('id-ID')}</p>
      <p className="mb-2"><strong>Lokasi:</strong> {franchise.location}</p>
      <p className="mb-2"><strong>Mode Operasi:</strong> {franchise.operation_mode}</p>
      {franchise.website_url && <a href={franchise.website_url} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Website</a>}
      {franchise.google_maps_url && <a href={franchise.google_maps_url} className="text-blue-500 underline ml-4" target="_blank" rel="noopener noreferrer">Google Maps</a>}

      <div className="mt-4">
        <strong>Kontak:</strong>
        <ul className="list-disc pl-5">
          <li>WhatsApp: {franchise.whatsapp_contact}</li>
          <li>Email: {franchise.email_contact}</li>
        </ul>
      </div>

      {franchise.notes && <p className="mt-4"><strong>Catatan:</strong> {franchise.notes}</p>}
      {franchise.tags && <p className="mt-4"><strong>Tag:</strong> {franchise.tags}</p>}
    </div>
  );
}
