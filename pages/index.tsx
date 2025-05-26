import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import Link from 'next/link'

export default function Home() {
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('franchise_listings')
        .select('*')
        .order('popularity', { ascending: false })
      setListings(data || [])
    }
    fetchListings()
  }, [])

  return (
    <div>
      <Navbar />
      <div className="p-4 max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="Cari franchise..."
          className="w-full px-4 py-2 mb-4 border rounded"
        />
        <div className="space-y-4">
          {listings.map((item) => (
            <Link key={item.id} href={`/listing/${item.id}`}>
              <div className="p-4 bg-white rounded shadow hover:bg-gray-50">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p>{item.description.slice(0, 100)}...</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
