import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const currentRole = data?.user?.user_metadata?.role
      if (currentRole !== 'Administrator') {
        router.push('/')
      } else {
        setRole(currentRole)
      }
    })
  }, [])

  if (role !== 'Administrator') return null

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Administrator</h1>
      <ul className="space-y-4">
        <li>
          <a href="/admin/franchisor-approvals" className="text-blue-600 underline">
            Persetujuan Pengajuan Jadi Franchisor
          </a>
        </li>
      </ul>
    </div>
  )
}
