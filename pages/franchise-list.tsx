import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { FaRedo, FaCogs } from 'react-icons/fa';

interface Franchise {
  id: string;
  franchise_name: string;
  description: string;
  category: string;
  investment_min: number;
  location: string;
  logo_url: string;
  slug: string;
  operation_mode?: string;
  tags?: string;
}

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Terbaru' },
  { value: 'created_asc', label: 'Terlama' },
  { value: 'investasi_desc', label: 'Investasi Tertinggi' },
  { value: 'investasi_asc', label: 'Investasi Terendah' },
  { value: 'nama_asc', label: 'Nama A-Z' },
];

export default function FranchiseList() {
  const [allFranchises, setAllFranchises] = useState<Franchise[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('created_desc');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // PAGINATION RESPONSIVE
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    function updatePerPage() {
      if (window.innerWidth < 768) setPerPage(10);
      else setPerPage(20);
    }
    updatePerPage();
    window.addEventListener('resize', updatePerPage);
    return () => window.removeEventListener('resize', updatePerPage);
  }, []);
  const totalPages = Math.ceil(franchises.length / perPage);
  const pagedFranchises = franchises.slice((currentPage - 1) * perPage, currentPage * perPage);
  useEffect(() => { setCurrentPage(1); }, [franchises.length, perPage]);

  useEffect(() => {
    const fetchFranchises = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug, operation_mode, tags')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const allData = data.map((franchise) => ({
          ...franchise,
          logo_url: franchise.logo_url
            ? supabase.storage.from('listing-images').getPublicUrl(franchise.logo_url).data.publicUrl
            : '/logo192.png',
        }));
        setAllFranchises(allData);
        setCategories(Array.from(new Set(allData.map((f) => f.category).filter(Boolean))));
      }
      setLoading(false);
    };
    fetchFranchises();
  }, []);

  useEffect(() => {
    let filtered = [...allFranchises];
    if (search) {
      filtered = filtered.filter((f) =>
        f.franchise_name.toLowerCase().includes(search.toLowerCase()) ||
        (f.tags || '').toLowerCase().split(',').some(tag =>
          tag.trim().includes(search.toLowerCase())
        )
      );
    }
    if (category) {
      filtered = filtered.filter((f) => f.category === category);
    }
    switch (sort) {
      case 'created_asc':
        filtered.sort((a, b) => (a.id > b.id ? 1 : -1));
        break;
      case 'investasi_desc':
        filtered.sort((a, b) => b.investment_min - a.investment_min);
        break;
      case 'investasi_asc':
        filtered.sort((a, b) => a.investment_min - b.investment_min);
        break;
      case 'nama_asc':
        filtered.sort((a, b) => a.franchise_name.localeCompare(b.franchise_name));
        break;
      default:
        filtered.sort((a, b) => (a.id < b.id ? 1 : -1));
    }
    setFranchises(filtered);
  }, [allFranchises, sort, search, category]);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setSort('created_desc');
  };

  const modeBadge = (mode?: string) => {
    if (mode === 'autopilot') {
      return (
        <span className="flex items-center gap-1 mt-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide w-fit">
          <FaCogs className="text-white opacity-80" /> Autopilot
        </span>
      );
    }
    if (mode === 'semi') {
      return (
        <span className="flex items-center gap-1 mt-1 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide w-fit">
          <FaCogs className="text-gray-700 opacity-70" /> Semi Autopilot
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f0fd] via-white to-[#f7fafc] py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-7 gap-4">
          <h1 className="text-3xl font-bold mb-1 md:mb-0 text-center md:text-left text-[#11356a] tracking-tight drop-shadow-sm">
            Semua Listing Franchise
          </h1>
          <button
            onClick={handleReset}
            className="flex items-center px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-blue-50 hover:text-blue-600 shadow transition self-center md:self-auto"
            title="Reset Filter & Sort"
          >
            <FaRedo className="mr-2" /> Reset
          </button>
        </div>

        {/* FILTER & SORT */}
        <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-3 mb-8">
          <input
            className="w-full md:w-1/3 border-2 border-blue-200 rounded-xl px-4 py-2 shadow-sm focus:border-blue-500"
            placeholder="Cari nama franchise atau tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border-2 border-blue-200 rounded-xl px-3 py-2 w-full md:w-1/5 shadow-sm"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="border-2 border-blue-200 rounded-xl px-3 py-2 w-full md:w-1/5 shadow-sm"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* GRID LISTING + PAGINATION */}
        {loading ? (
          <div className="text-center text-gray-500 py-16 text-lg">Memuat semua franchise...</div>
        ) : franchises.length === 0 ? (
          <div className="text-center text-gray-400 py-16">Tidak ditemukan franchise yang sesuai.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {pagedFranchises.map((fr) => (
                <Link href={`/franchise/${fr.slug}`} key={fr.id} passHref>
                  <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden cursor-pointer flex flex-col h-full border border-gray-100 hover:border-blue-400 ring-1 ring-blue-50 hover:ring-blue-300">
                    <div className="relative h-40">
                      <img
                        src={fr.logo_url}
                        alt={fr.franchise_name}
                        className="w-full h-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Kategori */}
                      <span className="absolute top-3 left-3 bg-yellow-400 text-xs font-bold text-black px-2 py-1 rounded-xl shadow">
                        {fr.category}
                      </span>
                      {/* Mode Operasi */}
                      <span className="absolute left-3 top-10 z-10">{modeBadge(fr.operation_mode)}</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-blue-900 truncate drop-shadow-sm">
                        {fr.franchise_name}
                      </h3>
                      <p className="text-xs text-gray-500">{fr.location}</p>
                      <p className="mt-2 text-sm text-gray-700 flex-1 line-clamp-2">
                        {fr.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold shadow">
                          Rp {fr.investment_min.toLocaleString('id-ID')}
                        </span>
                        <span className="text-gray-400 text-xs ml-auto group-hover:text-blue-500 transition">
                          Lihat detail →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* PAGINATION BUTTONS */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-full font-bold border transition
                      ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
