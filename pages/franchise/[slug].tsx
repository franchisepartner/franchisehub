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
  created_by: string;
}

interface LegalDoc {
  id: string;
  listing_id: string;
  document_type: string;
  status: string;
}

interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
}

const DOC_LABELS: Record<string, string> = {
  stpw: 'STPW',
  legalitas: 'Legalitas Badan Usaha',
  merek: 'Sertifikat Merek',
  prospektus: 'Prospektus Penawaran',
  perjanjian: 'Perjanjian Waralaba',
};

function formatRupiah(num: number) {
  return num.toLocaleString('id-ID');
}

export default function FranchiseDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [legalDocs, setLegalDocs] = useState<LegalDoc[]>([]);
  const [showcaseUrls, setShowcaseUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;
    setLoading(true);

    const fetchAll = async () => {
      // 1. Franchise data
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        router.replace('/404');
        return;
      }

      // 2. Public url logo, cover
      const logoUrl = data.logo_url
        ? supabase.storage.from('listing-images').getPublicUrl(data.logo_url).data.publicUrl
        : '';
      const coverUrl = data.cover_url
        ? supabase.storage.from('listing-images').getPublicUrl(data.cover_url).data.publicUrl
        : '';

      setFranchise({ ...data, logo_url: logoUrl, cover_url: coverUrl });

      // 3. Legal Documents
      const { data: docs } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('listing_id', data.id);

      setLegalDocs(docs || []);

      // 4. Showcase images
      const { data: images } = await supabase
        .from('listing_images')
        .select('*')
        .eq('listing_id', data.id)
        .order('id');
      // Get public url
      const urls =
        (images || []).map(img =>
          supabase.storage.from('listing-images').getPublicUrl(img.image_url).data.publicUrl
        ) || [];
      setShowcaseUrls(urls);

      setLoading(false);
    };
    fetchAll();
  }, [slug, router]);

  if (loading) return <div className="p-8 text-center">Memuat detail franchise...</div>;
  if (!franchise) return <div className="p-8 text-center text-red-500">Franchise tidak ditemukan.</div>;

  return (
    <div className="max-w-3xl mx-auto px-2 py-8">
      {/* 1. Cover */}
      {franchise.cover_url && (
        <div className="mb-6">
          <img
            src={franchise.cover_url}
            alt={`${franchise.franchise_name} Cover`}
            className="w-full max-h-72 object-cover rounded-2xl shadow"
          />
        </div>
      )}

      {/* 2. Logo & Nama */}
      <div className="flex items-center gap-4 mb-3">
        {franchise.logo_url && (
          <img
            src={franchise.logo_url}
            alt={`${franchise.franchise_name} Logo`}
            className="w-16 h-16 sm:w-24 sm:h-24 object-contain rounded-xl bg-white border"
          />
        )}
        <h1 className="text-2xl sm:text-3xl font-bold">{franchise.franchise_name}</h1>
      </div>

      {/* 3. Badge info */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">{franchise.category}</span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">{franchise.location}</span>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm">Investasi Mulai Rp {formatRupiah(franchise.investment_min)}</span>
      </div>

      {/* 4. Deskripsi */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Deskripsi</h2>
        <div className="bg-gray-50 rounded-xl border px-4 py-3 text-gray-800 leading-relaxed whitespace-pre-line">
          {franchise.description}
        </div>
      </div>

      {/* 5. Checklist Dokumen Hukum */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Status Dokumen Hukum</h2>
        <table className="w-full border rounded-lg text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left rounded-tl-lg">Dokumen</th>
              <th className="py-2 px-4 text-left rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {LEGAL_DOCUMENTS.map(doc => {
              const found = legalDocs.find(d => d.document_type === doc.key);
              return (
                <tr key={doc.key} className="border-t">
                  <td className="py-2 px-4">{doc.label}</td>
                  <td className="py-2 px-4">
                    {found ? (
                      found.status === 'sudah' ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Sudah Memiliki</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Akan/Sedang Diurus</span>
                      )
                    ) : (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. Showcase Galeri */}
      {showcaseUrls.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1">Galeri Showcase</h2>
          <div className="flex gap-3 overflow-x-auto py-2">
            {showcaseUrls.map((url, idx) => (
              <img key={idx} src={url} className="w-40 h-28 object-cover rounded-xl shadow" alt={`Showcase ${idx+1}`} />
            ))}
          </div>
        </div>
      )}

      {/* 7. Mode Operasional */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Mode Operasional</h2>
        <div>
          <span className="font-semibold">{franchise.operation_mode === 'autopilot' ? 'Autopilot' : 'Semi Autopilot'}</span>
          {franchise.operation_mode === 'autopilot' ? (
            <span className="text-gray-600"> — Mitra tidak perlu ikut terlibat langsung dalam operasional harian.</span>
          ) : (
            <span className="text-gray-600"> — Mitra tetap punya peran namun sebagian operasional dibantu tim pusat.</span>
          )}
        </div>
      </div>

      {/* 8. Tag, Website, Google Maps */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        {franchise.tags && (
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">#{franchise.tags}</span>
        )}
        {franchise.website_url && (
          <a href={franchise.website_url} className="text-blue-500 underline text-sm" target="_blank" rel="noopener noreferrer">
            Website
          </a>
        )}
        {franchise.google_maps_url && (
          <a href={franchise.google_maps_url} className="text-blue-500 underline text-sm" target="_blank" rel="noopener noreferrer">
            Google Maps
          </a>
        )}
      </div>

      {/* 9. Kontak Franchisor */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Kontak Franchisor</h2>
        <div className="flex flex-wrap items-center gap-4">
          {franchise.whatsapp_contact && (
            <a
              href={`https://wa.me/${franchise.whatsapp_contact.replace(/^0/, '62')}`}
              className="px-4 py-2 bg-green-600 text-white rounded-full font-semibold shadow hover:bg-green-700"
              target="_blank" rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          )}
          {franchise.email_contact && (
            <a
              href={`mailto:${franchise.email_contact}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700"
              target="_blank" rel="noopener noreferrer"
            >
              Email
            </a>
          )}
        </div>
      </div>

      {/* 10. Catatan Tambahan */}
      {franchise.notes && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold mb-1">Catatan Tambahan</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 px-4 py-2 rounded">
            {franchise.notes}
          </div>
        </div>
      )}

    </div>
  );
}
