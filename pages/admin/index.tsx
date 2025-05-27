// pages/admin/index.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    const checkRole = async () => {
      const { data } = await supabase.auth.getUser()
      const role = data.user?.user_metadata?.role
      if (role !== 'Administrator') {
        router.push('/')
      }
    }
    checkRole()
  }, [router])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Administrator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/admin/franchisor-approvals')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded shadow text-left"
        >
          Lihat Pengajuan Jadi Franchisor
        </button>

        {/* Tambahkan fitur admin lainnya di sini */}
      </div>
    </div>
  )
}
