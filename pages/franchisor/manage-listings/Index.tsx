import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function ManageListings() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('franchise_listings')
      .select('id, franchise_name, location, operation_mode, created_at, slug')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching listings:', error)
      setListings([])
    } else {
      setListings(data)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="p-6">Memuat listing Anda...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Kelola Listing Franchise Anda</h1>

      <Link href="/franchisor/manage-listings/new">
        <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
          ➕ Tambah Listing Baru
        </button>
      </Link>

      {listings.length === 0 ? (
        <p>Anda belum memiliki listing franchise.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2">Nama Franchise</th>
              <th className="border border-gray-300 px-3 py-2">Lokasi</th>
              <th className="border border-gray-300 px-3 py-2">Mode Operasi</th>
              <th className="border border-gray-300 px-3 py-2">Tanggal Dibuat</th>
              <th className="border border-gray-300 px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="border border-gray-300 px-3 py-2">{listing.franchise_name}</td>
                <td className="border border-gray-300 px-3 py-2">{listing.location}</td>
                <td className="border border-gray-300 px-3 py-2">{listing.operation_mode}</td>
                <td className="border border-gray-300 px-3 py-2">
                  {new Date(listing.created_at).toLocaleDateString('id-ID')}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  <Link href={`/franchisor/manage-listings/edit/${listing.id}`}>
                    <button className="px-3 py-1 bg-green-600 text-white rounded">
                      ✏️ Edit
                    </button>
                  </Link>
                  <Link href={`/franchise/${listing.slug}`}>
                    <button className="ml-2 px-3 py-1 bg-gray-500 text-white rounded">
                      🔗 Lihat
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
