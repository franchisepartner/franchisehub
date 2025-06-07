import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  FaStore, FaMapMarkerAlt, FaMoneyBillAlt, FaThList,
  FaInfoCircle, FaFileAlt, FaLink, FaCog
} from 'react-icons/fa';

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
  const [listingItems, setListingItems] = useState<any[]>([]);
  const [blogItems, setBlogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // For Mode Operasi info popup
  const [showOpInfo, setShowOpInfo] = useState(false);
  // For modal full image
  const [showModal, setShowModal] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;
    setLoading(true);

    const fetchAll = async () => {
      // Data utama franchise
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

      // Legal Documents
      const { data: docs } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('listing_id', data.id);
      setLegalDocs(docs || []);

      // Cover images (slider)
      const { data: images } = await supabase
        .from('listing_images')
        .select('*')
        .eq('listing_id', data.id)
        .order('id');
      const urls =
        (images || [])
          .filter(img => img.image_url?.startsWith('showcase/'))
          .map(img => supabase.storage.from('listing-images').getPublicUrl(img.image_url).data.publicUrl) || [];
      setShowcaseUrls(urls);

      // --- Showcase Karya, dikelompokkan ---
      // Listings
      const { data: allListings } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, logo_url, slug, created_at')
        .eq('created_by', data.created_by);

      setListingItems(
        (allListings || []).map(item => ({
          ...item,
          type: 'listing',
          title: item.franchise_name,
          image: item.logo_url
            ? supabase.storage.from('listing-images').getPublicUrl(item.logo_url).data.publicUrl
            : '/logo192.png',
          url: `/franchise/${item.slug}`,
          date: item.created_at,
        }))
      );

      // Blogs
      const { data: blogs } = await supabase
        .from('blogs')
        .select('id, title, cover_url, slug, created_at')
        .eq('created_by', data.created_by);

      setBlogItems(
        (blogs || []).map(item => ({
          ...item,
          type: 'blog',
          title: item.title,
          image: item.cover_url
            ? supabase.storage.from('blog-assets').getPublicUrl(item.cover_url).data.publicUrl
            : '/logo192.png',
          url: `/detail/${item.slug}`,
          date: item.created_at,
        }))
      );

      setLoading(false);
    };
    fetchAll();
  }, [slug, router]);

  // Slider otomatis
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
      {/* SLIDER COVER + CLICK FOR FULL IMAGE */}
      {showcaseUrls.length > 0 && (
        <div className="mb-6 relative rounded-2xl shadow overflow-hidden" style={{height: '220px'}}>
          {showcaseUrls.slice(0, 5).map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Cover ${idx + 1}`}
              className={`absolute w-full h-full object-cover transition-opacity duration-500 ${idx === activeSlide ? 'opacity-100 z-10 cursor-zoom-in' : 'opacity-0 z-0'}`}
              style={{borderRadius: 16}}
              onClick={() => {
                setModalImg(url);
                setShowModal(true);
              }}
            />
          ))}
          {/* Dot navigation */}
          <div className="absolute bottom-2 left-1/2 flex gap-2 -translate-x-1/2 z-20">
            {showcaseUrls.slice(0, 5).map((_, idx) => (
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

      {/* MODAL FULL IMAGE (untuk slider/cover dan grid) */}
      {showModal && modalImg && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="relative max-w-3xl w-full px-2" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 z-60 text-white text-3xl bg-black/60 rounded-full px-2"
              onClick={() => setShowModal(false)}
              aria-label="Tutup Gambar"
            >×</button>
            <img
              src={modalImg}
              alt="Gambar Full"
              className="max-h-[90vh] w-auto max-w-full rounded-xl mx-auto shadow-lg"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* INFO UTAMA + ICON */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-3xl font-bold mb-1">
          <FaStore className="inline-block text-blue-500" /> {franchise.franchise_name}
        </div>
        <div className="flex items-center gap-2">
          <FaThList className="inline-block text-blue-400" />
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">{franchise.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="inline-block text-green-600" />
          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">{franchise.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaMoneyBillAlt className="inline-block text-yellow-500" />
          <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm">
            Investasi Mulai Rp {franchise.investment_min.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex items-center gap-2 relative">
          <FaCog className="inline-block text-gray-500" />
          <span className="font-semibold">{franchise.operation_mode === 'autopilot' ? 'Autopilot' : 'Semi Autopilot'}</span>
          <button
            className="ml-2 p-1 rounded-full hover:bg-gray-200 transition"
            onClick={() => setShowOpInfo(val => !val)}
            aria-label="Penjelasan Mode Operasi"
            type="button"
          >
            <FaInfoCircle className="text-blue-500" />
          </button>
          {showOpInfo && (
            <>
              <div
                className="absolute left-10 z-30 mt-2 w-72 bg-white border border-gray-300 rounded-xl shadow-lg p-4 text-sm text-gray-800"
                style={{ top: '100%' }}
              >
                {franchise.operation_mode === 'autopilot' ? (
                  <>
                    <span className="font-bold text-blue-600 mb-1 block">Autopilot</span>
                    Mitra tidak perlu ikut terlibat langsung dalam operasional harian.
                  </>
                ) : (
                  <>
                    <span className="font-bold text-yellow-600 mb-1 block">Semi Autopilot</span>
                    Mitra tetap punya peran namun sebagian operasional dibantu tim pusat.
                  </>
                )}
                <button
                  className="absolute top-1 right-2 text-gray-400 hover:text-red-400 text-lg"
                  onClick={() => setShowOpInfo(false)}
                >×</button>
              </div>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowOpInfo(false)}
                tabIndex={-1}
                aria-hidden="true"
              />
            </>
          )}
        </div>
      </div>

      {/* Deskripsi */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <FaInfoCircle className="text-blue-500" /> Deskripsi
        </h2>
        <div className="bg-gray-50 rounded-xl border px-4 py-3 text-gray-800 leading-relaxed whitespace-pre-line">
          {franchise.description}
        </div>
      </div>

      {/* Status Dokumen Hukum */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <FaFileAlt className="text-green-600" /> Status Dokumen Hukum
        </h2>
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
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <FaLink className="text-gray-700" /> Kontak & Tautan
        </h2>
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
        {franchise.tags && (
          <div>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">#{franchise.tags}</span>
          </div>
        )}
      </div>

      {/* SHOWCASE KARYA FRANCHISOR TERPISAH */}
      {(listingItems.length > 0 || blogItems.length > 0) && (
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaFileAlt className="text-pink-600" /> Showcase Karya Franchisor
          </h2>
          {/* Listing */}
          {listingItems.length > 0 && (
            <>
              <div className="font-semibold mb-2 text-base text-gray-800">Listing</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {listingItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow cursor-pointer hover:shadow-lg transition p-2 flex flex-col items-center"
                    onClick={() => router.push(item.url)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-full object-cover rounded-lg mb-2 bg-gray-100"
                    />
                    <div className="font-bold text-base text-center truncate w-full">{item.title}</div>
                    <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 mt-1">Listing</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* Blog */}
          {blogItems.length > 0 && (
            <>
              <div className="font-semibold mb-2 text-base text-gray-800">Blog</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {blogItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow cursor-pointer hover:shadow-lg transition p-2 flex flex-col items-center"
                    onClick={() => router.push(item.url)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-full object-cover rounded-lg mb-2 bg-gray-100"
                    />
                    <div className="font-bold text-base text-center truncate w-full">{item.title}</div>
                    <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 mt-1">Blog</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
