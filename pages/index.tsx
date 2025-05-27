import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setListings(data)
      }
    }

    fetchListings()
  }, [])

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold"></h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listing/${listing.id}`}
            className="border rounded-md p-4 shadow hover:shadow-md transition"
          >
            <img
              src={listing.image_url}
              alt={listing.brand_name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h2 className="text-lg font-semibold">{listing.brand_name}</h2>
            <p className="text-sm text-gray-600 truncate">{listing.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
