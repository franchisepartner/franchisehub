import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';

const LEGAL_DOCUMENTS = [
  { key: 'stpw', label: 'STPW (Surat Tanda Pendaftaran Waralaba)' },
  { key: 'legalitas', label: 'Legalitas Badan Usaha (PT/CV, NIB, NPWP)' },
  { key: 'merek', label: 'Sertifikat Merek' },
  { key: 'prospektus', label: 'Prospektus Penawaran' },
  { key: 'perjanjian', label: 'Perjanjian Waralaba' }
] as const;

interface Franchise {
  id: string;
  franchise_name: string;
  description: string;
  category: string;
  investment_min: number;
  location: string;
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

export default function FranchiseDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [legalDocs, setLegalDocs] = useState<LegalDoc[]>([]);
  const [showcaseUrls, setShowcaseUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;
    setLoading(true);

    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        router.replace('/404');
        return;
      }
      setFranchise(data);

      const { data: docs } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('listing_id', data.id);
      setLegalDocs(docs || []);

      const { data: images } = await supabase
        .from('listing_images')
        .select('*')
        .eq('listing_id', data.id)
        .order('id')
        .limit(5);
      const urls =
        (images || [])
          .filter(img => img.image_url?.startsWith('showcase/'))
          .map(img => supabase.storage.from('listing-images').getPublicUrl(img.image_url).data.publicUrl) || [];
      setShowcaseUrls(urls);

      setLoading(false);
    };
    fetchAll();
  }, [slug, router]);

  useEffect(() => {
    if (showcaseUrls.length < 2) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveSlide(prev => (prev + 1 >= showcaseUrls.length ? 0 : prev + 1));
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [showcaseUrls]);

  if (loading) return <div className="p-8 text-center">Memuat detail franchise...</div>;
  if (!franchise) return <div className="p-8 text-center text-red-500">Franchise tidak ditemukan.</div>;

  return (
    <div className="max-w-3xl mx-auto px-2 py-8">
      {/* COVER SLIDER */}
      {showcaseUrls.length > 0 && (
        <div className="mb-6 relative rounded-2xl shadow overflow-hidden" style={{height: '220px'}}>
          {showcaseUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Cover ${idx + 1}`}
              className={`absolute w-full h-full object-cover transition-opacity duration-500 ${idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              style={{borderRadius: 16}}
            />
          ))}
          <div className="absolute bottom-2 left-1/2 flex gap-2 -translate-x-1/2 z-20">
            {showcaseUrls.map((_, idx) => (
              <button
                key={idx}
                className={`w-2.5 h-2.5 rounded-full ${idx === activeSlide ? 'bg-white/90 border border-gray-500' : 'bg-gray-300/70'}`}
                onClick={() => setActiveSlide(idx)}
                style={{ outline: 'none', border: 0 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* --- STRUKTUR SESUAI PERMINTAAN --- */}
      <div className="mb-4">
        {/* Nama Franchise */}
        <h1 className="text-3xl font-bold mb-1">{franchise.franchise_name}</h1>
        {/* Kategori */}
        <div className="mb-1">
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm mr-2">{franchise.category}</span>
        </div>
        {/* Lokasi */}
        <div className="mb-1">
          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm mr-2">{franchise.location}</span>
        </div>
        {/* Minimal Investasi */}
        <div className="mb-1">
          <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm">Investasi Mulai Rp {franchise.investment_min.toLocaleString('id-ID')}</span>
        </div>
        {/* Model Usaha */}
        <div className="mb-2">
          <span className="font-semibold">{franchise.operation_mode === 'autopilot' ? 'Autopilot' : 'Semi Autopilot'}</span>
          {franchise.operation_mode === 'autopilot' ? (
            <span className="text-gray-600"> — Mitra tidak perlu ikut terlibat langsung dalam operasional harian.</span>
          ) : (
            <span className="text-gray-600"> — Mitra tetap punya peran namun sebagian operasional dibantu tim pusat.</span>
          )}
        </div>
      </div>

      {/* Deskripsi */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Deskripsi</h2>
        <div className="bg-gray-50 rounded-xl border px-4 py-3 text-gray-800 leading-relaxed whitespace-pre-line">
          {franchise.description}
        </div>
      </div>

      {/* Status Dokumen Hukum */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Status Dokumen Hukum</h2>
        <table className="w-full border rounded-lg text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left rounded-tl-lg">Dokumen</th>
              <th className="py-2 px-4 text-center">Sudah Punya</th>
              <th className="py-2 px-4 text-center rounded-tr-lg">Akan/Sedang Diurus</th>
            </tr>
          </thead>
          <tbody>
            {LEGAL_DOCUMENTS.map(doc => {
              const found = legalDocs.find(d => d.document_type === doc.key);
              return (
                <tr key={doc.key} className="border-t">
                  <td className="py-2 px-4">{doc.label}</td>
                  <td className="py-2 px-4 text-center">
                    {found?.status === 'sudah' && (
                      <span className="inline-block w-6 h-6 bg-green-500 rounded-full text-white font-bold">✓</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {found?.status === 'sedang' && (
                      <span className="inline-block w-6 h-6 bg-yellow-400 rounded-full text-white font-bold">⏳</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Kontak & Tautan */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Kontak & Tautan</h2>
        <div className="flex flex-wrap gap-3 items-center mb-3">
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
          {franchise.website_url && (
            <a href={franchise.website_url} className="px-4 py-2 bg-gray-300 text-blue-700 rounded-full font-semibold shadow hover:bg-blue-200" target="_blank" rel="noopener noreferrer">
              Website
            </a>
          )}
          {franchise.google_maps_url && (
            <a href={franchise.google_maps_url} className="px-4 py-2 bg-gray-300 text-blue-700 rounded-full font-semibold shadow hover:bg-blue-200" target="_blank" rel="noopener noreferrer">
              Google Maps
            </a>
          )}
        </div>
        {/* Tag */}
        {franchise.tags && (
          <div>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">#{franchise.tags}</span>
          </div>
        )}
      </div>
    </div>
  );
}
