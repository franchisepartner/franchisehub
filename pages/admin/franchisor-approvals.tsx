// pages/admin/franchisor-approvals.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Application {
  id: number
  user_id: string
  brand_name: string
  description: string
  email: string
  whatsapp_number: string
  category: string
  location: string
  logo_url: string
  ktp_url: string
  status: string
}

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*')
    if (data) setApplications(data)
    if (error) console.error(error)
  }

  const updateStatus = async (id: number, user_id: string, status: string) => {
    if (status === 'approved') {
      await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { role: 'Franchisor' },
      })
      await supabase
        .from('franchisor_applications')
        .update({ status })
        .eq('id', id)
    } else if (status === 'rejected') {
      await supabase.from('franchisor_applications').delete().eq('user_id', user_id)
    }

    fetchApplications()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
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
            <tr key={app.id} className="text-sm">
              <td className="border px-2 py-1">{app.brand_name}</td>
              <td className="border px-2 py-1">{app.description}</td>
              <td className="border px-2 py-1">{app.email}</td>
              <td className="border px-2 py-1">{app.whatsapp_number}</td>
              <td className="border px-2 py-1">{app.category}</td>
              <td className="border px-2 py-1">{app.location}</td>
              <td className="border px-2 py-1">
                {app.logo_url && (
                  <a href={app.logo_url} target="_blank" rel="noopener noreferrer">
                    <img src={app.logo_url} alt="Logo" className="h-8 w-8 object-cover rounded" />
                  </a>
                )}
              </td>
              <td className="border px-2 py-1">
                {app.ktp_url && (
                  <a href={app.ktp_url} target="_blank" rel="noopener noreferrer">
                    <img src={app.ktp_url} alt="KTP" className="h-8 w-8 object-cover rounded" />
                  </a>
                )}
              </td>
              <td className="border px-2 py-1 flex gap-1 justify-center">
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(app.id, app.user_id, 'rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
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
