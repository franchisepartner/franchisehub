import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function DashboardFranchisor() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
      } else {
        setUser(user)
      }
    }
    fetchUser()
  }, [router])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Franchisor</h1>
      {user && (
        <p className="mb-6">
          Selamat datang, <strong>{user.user_metadata?.full_name || 'Franchisor'}!</strong>
        </p>
      )}
      <div className="flex flex-col gap-3">
        <Link
          href="/franchisor/manage-listings"
          className="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition"
        >
          ✅ Kelola Listing Franchise Anda
        </Link>

        <Link
          href="/franchisor/manage-listings/new"
          className="bg-orange-600 text-white px-4 py-2 rounded text-center hover:bg-orange-700 transition"
        >
          ➕ Tambah Listing Franchise Baru
        </Link>

        <Link
          href="/franchisor/edit-profile"
          className="bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700 transition"
        >
          ✏️ Edit Profil Anda
        </Link>
      </div>
    </div>
  )
}
