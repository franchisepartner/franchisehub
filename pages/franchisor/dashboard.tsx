// pages/franchisor/dashboard.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function FranchisorDashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }

    fetchUser()
  }, [router])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard Franchisor</h1>

      {user && (
        <div>
          <p className="mb-4">Selamat datang, <strong>{user.user_metadata?.full_name}</strong>!</p>

          <div className="space-y-3">
            <Link href="/franchisor/listings" className="block px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
              Kelola Listing Franchise Anda
            </Link>

            <Link href="/franchisor/profile" className="block px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700">
              Edit Profil Anda
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
