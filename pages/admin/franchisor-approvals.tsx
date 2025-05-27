// pages/admin/franchisor-approvals.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

interface Application {
  id: number
  user_id: string
  brand_name: string
  description: string
  email: string
  whatsapp: string
  website: string
  logo_url: string
  ktp_url: string
  category: string
  location: string
  status: string
}

export default function FranchisorApprovals() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const role = data.session?.user?.user_metadata?.role
      if (role !== 'Administrator') {
        router.replace('/')
      } else {
        fetchApplications()
      }
    })
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase.from('franchisor_applications').select('*')
    if (data) setApplications(data)
    if (error) console.error(error)
    setLoading(false)
  }

  const updateStatus = async (id: number, user_id: string, status: string) => {
    if (status === 'approved') {
      await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { role: 'Franchisor' },
      })
      await supabase.from('franchisor_applications').update({ status }).eq('id', id)
    }

    if (status === 'rejected') {
      await supabase.from('franchisor_applications').delete().eq('user_id', user_id)
    }

    fetchApplications()
  }

  if (loading) return <p className="p-4">Memuat data...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Brand</th>
            <th className="border px-3 py-2">Deskripsi</th>
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">WhatsApp</th>
            <th className="border px-3 py-2">Kategori</th>
            <th className="border px-3 py-2">Lokasi</th>
            <th className="border px-3 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="border px-3 py-2">{app.brand_name}</td>
              <td className="border px-3 py-2">{app.description}</td>
              <td className="border px-3 py-2">{app.email}</td>
              <td className="border px-3 py-2">{app.whatsapp}</td>
              <td className="border px-3 py-2">{app.category}</td>
              <td className="border px-3 py-2">{app.location}</td>
              <td className="border px-3 py-2 flex gap-2">
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
