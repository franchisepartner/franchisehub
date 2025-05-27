// pages/admin/franchisor-approvals.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

interface Application {
  id: string
  user_id: string
  brand_name: string
  description: string
  email: string
  whatsapp_number: string
  website: string
  category: string
  location: string
  logo_url: string
  ktp_url: string
  status: string
}

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<Application[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*')

    if (error) {
      console.error('Error fetching:', error)
    } else {
      setApplications(data as Application[])
    }
  }

  const updateStatus = async (
    id: string,
    user_id: string,
    status: 'approved' | 'rejected'
  ) => {
    if (status === 'approved') {
      await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { role: 'Franchisor' }
      })

      await supabase
        .from('franchisor_applications')
        .update({ status })
        .eq('id', id)
    } else {
      await supabase
        .from('franchisor_applications')
        .delete()
        .eq('user_id', user_id)
    }

    fetchApplications()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <table className="min-w-full table-auto border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Brand</th>
            <th className="border px-2 py-1">Deskripsi</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">WhatsApp</th>
            <th className="border px-2 py-1">Kategori</th>
            <th className="border px-2 py-1">Lokasi</th>
            <th className="border px-2 py-1">Logo</th>
            <th className="border px-2 py-1">KTP</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="text-center">
              <td className="border px-2 py-1">{app.brand_name}</td>
              <td className="border px-2 py-1">{app.description}</td>
              <td className="border px-2 py-1">{app.email}</td>
              <td className="border px-2 py-1">{app.whatsapp_number}</td>
              <td className="border px-2 py-1">{app.category}</td>
              <td className="border px-2 py-1">{app.location}</td>
              <td className="border px-2 py-1">
                <a href={app.logo_url} target="_blank" rel="noopener noreferrer">
                  <img src={app.logo_url} alt="Logo" className="w-8 h-8 mx-auto rounded" />
                </a>
              </td>
              <td className="border px-2 py-1">
                <a href={app.ktp_url} target="_blank" rel="noopener noreferrer">
                  <img src={app.ktp_url} alt="KTP" className="w-8 h-8 mx-auto rounded" />
                </a>
              </td>
              <td className="border px-2 py-1 space-x-1">
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
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
