// pages/admin/franchisor-approvals.tsx
import { useEffect, useState } from 'react'
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
  const [applications, setApplications] = useState<Application[]>([])
  const [signedUrls, setSignedUrls] = useState<Record<number, { logo: string; ktp: string }>>({})

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase.from('franchisor_applications').select('*')
    if (data) {
      setApplications(data)
      data.forEach(async (app) => {
        const logoRes = await fetch(`/api/admin/get-signed-url?path=${encodeURIComponent(app.logo_url)}`)
        const logoData = await logoRes.json()

        const ktpRes = await fetch(`/api/admin/get-signed-url?path=${encodeURIComponent(app.ktp_url)}`)
        const ktpData = await ktpRes.json()

        setSignedUrls((prev) => ({
          ...prev,
          [app.id]: {
            logo: logoData.url || '',
            ktp: ktpData.url || ''
          }
        }))
      })
    }
    if (error) console.error(error)
  }

  const updateStatus = async (id: number, user_id: string, status: string) => {
    if (status === 'approved') {
      await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { role: 'Franchisor' }
      })
      await supabase.from('franchisor_applications').update({ status }).eq('id', id)
    }

    if (status === 'rejected') {
      await supabase.from('franchisor_applications').delete().eq('user_id', user_id)
    }

    fetchApplications()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-sm">
            <th className="border px-3 py-2">Brand</th>
            <th className="border px-3 py-2">Deskripsi</th>
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">WhatsApp</th>
            <th className="border px-3 py-2">Kategori</th>
            <th className="border px-3 py-2">Lokasi</th>
            <th className="border px-3 py-2">Logo</th>
            <th className="border px-3 py-2">KTP</th>
            <th className="border px-3 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="text-sm">
              <td className="border px-3 py-2">{app.brand_name}</td>
              <td className="border px-3 py-2">{app.description}</td>
              <td className="border px-3 py-2">{app.email}</td>
              <td className="border px-3 py-2">{app.whatsapp}</td>
              <td className="border px-3 py-2">{app.category}</td>
              <td className="border px-3 py-2">{app.location}</td>
              <td className="border px-3 py-2">
                {signedUrls[app.id]?.logo ? (
                  <a href={signedUrls[app.id].logo} target="_blank" rel="noopener noreferrer">
                    <img src={signedUrls[app.id].logo} alt="Logo" className="h-12 rounded" />
                  </a>
                ) : (
                  'Memuat...'
                )}
              </td>
              <td className="border px-3 py-2">
                {signedUrls[app.id]?.ktp ? (
                  <a href={signedUrls[app.id].ktp} target="_blank" rel="noopener noreferrer">
                    <img src={signedUrls[app.id].ktp} alt="KTP" className="h-12 rounded" />
                  </a>
                ) : (
                  'Memuat...'
                )}
              </td>
              <td className="border px-3 py-2 flex flex-col gap-2">
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
