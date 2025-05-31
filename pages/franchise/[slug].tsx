import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Image from 'next/image';

export default function FranchiseDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [franchise, setFranchise] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (slug) {
        const { data, error } = await supabase
          .from('franchise_listings')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching franchise:', error);
          return;
        }
        setFranchise(data);
      }
    }

    fetchData();

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, [slug]);

  if (!franchise) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{franchise.franchise_name}</h1>

      <div className="mb-6">
        <Image src={franchise.logo_url} alt={franchise.franchise_name} width={400} height={250} className="rounded" />
      </div>

      <p className="mb-4">{franchise.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div><strong>Kategori:</strong> {franchise.category}</div>
        <div><strong>Investasi Minimum:</strong> Rp {franchise.investment_min.toLocaleString()}</div>
        <div><strong>Lokasi:</strong> {franchise.location}</div>
        <div><strong>Mode Operasi:</strong> {franchise.operation_mode}</div>
        <div>
          <strong>Dokumen Hukum:</strong> 
          {franchise.dokumen_hukum_sudah_punya ? " Sudah punya" : ""}
          {franchise.dokumen_hukum_akan_diurus ? " Akan/sedang diurus" : ""}
        </div>
      </div>

      {session ? (
        <div className="bg-green-50 border border-green-300 p-4 rounded">
          <h3 className="font-semibold">Kontak Franchisor:</h3>
          <ul className="list-disc pl-6">
            <li>Email: {franchise.email_contact}</li>
            <li>WhatsApp: {franchise.whatsapp_contact}</li>
            {franchise.website_url && <li><a href={franchise.website_url} target="_blank">Website</a></li>}
          </ul>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-300 p-4 rounded">
          🔒 Silakan login untuk melihat kontak franchisor.
        </div>
      )}

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => router.push('/')}>
        Kembali ke halaman utama
      </button>
    </div>
  );
}
