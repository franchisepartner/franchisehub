import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { FaTrash, FaPen, FaEye, FaFileAlt, FaListAlt } from 'react-icons/fa';

export default function ManageListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  // Ambil user & role
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Cek role di profiles (role/is_admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', user.id)
        .single();
      if (profile?.role === 'administrator' || profile?.is_admin) setIsAdmin(true);

      // --- AMBIL LISTING ---
      let query = supabase.from('franchise_listings').select('*').order('created_at', { ascending: false });
      if (!profile?.is_admin && profile?.role !== 'administrator') query = query.eq('user_id', user.id);
      const { data: listingsData } = await query;
      setListings(listingsData || []);

      // --- AMBIL BLOG ---
      let blogQuery = supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (!profile?.is_admin && profile?.role !== 'administrator') blogQuery = blogQuery.eq('created_by', user.id);
      const { data: blogData } = await blogQuery;
      setBlogs(blogData || []);
    };
    fetchData();
  }, [router]);

  // Hapus listing
  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus listing ini?')) return;
    setLoadingId(id);
    await supabase.from('franchise_listings').delete().eq('id', id);
    setListings(prev => prev.filter(item => item.id !== id));
    setLoadingId(null);
  };

  // Hapus blog
  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus blog ini?')) return;
    setLoadingId(id);
    await supabase.from('blogs').delete().eq('id', id);
    setBlogs(prev => prev.filter(item => item.id !== id));
    setLoadingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><FaListAlt /> Listing Franchise Anda</h2>
      {listings.length === 0 ? (
        <p className="mt-4">Anda belum punya listing franchise.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {listings.map((listing) => (
            <li key={listing.id} className="p-4 border rounded shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FaListAlt className="text-blue-600" />
                  {listing.franchise_name}
                </h3>
                <p>{listing.category} - {listing.location}</p>
                <p className="text-sm text-gray-600">Investasi: Rp {listing.investment_min}</p>
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={() => router.push(`/franchise/${listing.slug}`)}
                  className="p-2 bg-gray-100 rounded hover:bg-blue-100 transition"
                  title="Lihat Detail"
                >
                  <FaEye className="text-blue-700" />
                </button>
                {(isAdmin || user?.id === listing.user_id) && (
                  <>
                    <button
                      onClick={() => router.push(`/franchisor/manage-listings/edit/${listing.id}`)}
                      className="p-2 bg-gray-100 rounded hover:bg-yellow-100 transition"
                      title="Edit"
                    >
                      <FaPen className="text-yellow-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="p-2 bg-gray-100 rounded hover:bg-red-100 transition"
                      disabled={loadingId === listing.id}
                      title="Hapus"
                    >
                      <FaTrash className="text-red-600" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl font-bold mt-10 mb-2 flex items-center gap-2"><FaFileAlt /> Blog Bisnis Anda</h2>
      {blogs.length === 0 ? (
        <p className="mt-4">Anda belum punya blog bisnis.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {blogs.map((blog) => (
            <li key={blog.id} className="p-4 border rounded shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FaFileAlt className="text-green-600" />
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600">{blog.category}</p>
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={() => router.push(`/detail/${blog.slug}`)}
                  className="p-2 bg-gray-100 rounded hover:bg-blue-100 transition"
                  title="Lihat Detail"
                >
                  <FaEye className="text-blue-700" />
                </button>
                {(isAdmin || user?.id === blog.created_by) && (
                  <>
                    <button
                      onClick={() => router.push(`/blog/manage/edit/${blog.id}`)}
                      className="p-2 bg-gray-100 rounded hover:bg-yellow-100 transition"
                      title="Edit"
                    >
                      <FaPen className="text-yellow-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="p-2 bg-gray-100 rounded hover:bg-red-100 transition"
                      disabled={loadingId === blog.id}
                      title="Hapus"
                    >
                      <FaTrash className="text-red-600" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
