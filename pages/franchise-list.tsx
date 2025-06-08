import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { FaRedo } from 'react-icons/fa';

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

  useEffect(() => {
    const fetchFranchises = async () => {
      const { data, error } = await supabase
        .from('franchise_listings')
        .select('id, franchise_name, description, category, investment_min, location, logo_url, slug')
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
        f.franchise_name.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-7 gap-4">
          <h1 className="text-3xl font-bold mb-1 md:mb-0 text-center md:text-left">
            Semua Listing Franchise
          </h1>
          <button
            onClick={handleReset}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-full border hover:bg-gray-200 transition self-center md:self-auto"
            title="Reset Filter & Sort"
          >
            <FaRedo className="mr-2" /> Reset
          </button>
        </div>

        {/* FILTER & SORT */}
        <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-3 mb-8">
          <input
            className="w-full md:w-1/3 border rounded-lg px-4 py-2"
            placeholder="Cari nama franchise..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2 w-full md:w-1/5"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="border rounded-lg px-3 py-2 w-full md:w-1/5"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* GRID LISTING */}
        {loading ? (
          <div className="text-center text-gray-500 py-16 text-lg">Memuat semua franchise...</div>
        ) : franchises.length === 0 ? (
          <div className="text-center text-gray-400 py-16">Tidak ditemukan franchise yang sesuai.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {franchises.map((fr) => (
              <Link href={`/franchise/${fr.slug}`} key={fr.id} passHref>
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer flex flex-col h-full border border-gray-100 hover:border-blue-200">
                  <div className="relative h-40">
                    <img
                      src={fr.logo_url}
                      alt={fr.franchise_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-yellow-400 text-xs font-semibold text-black px-2 py-1 rounded">
                      {fr.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{fr.franchise_name}</h3>
                    <p className="text-xs text-gray-500">{fr.location}</p>
                    <p className="mt-2 text-sm text-gray-700 flex-1 line-clamp-2">{fr.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                        Rp {fr.investment_min.toLocaleString('id-ID')}
                      </span>
                      <span className="text-gray-400 text-xs ml-auto">Lihat detail →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
