import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Image from 'next/image'

interface Application {
  id: number
  user_id: string
  brand_name: string
  description: string
  email: string
  whatsapp_number: string
  website: string
  logo_url: string
  ktp_url: string
  category: string
  location: string
  status: string
}

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase.from('franchisor_applications').select('*')
    if (data) setApplications(data)
    if (error) console.error(error)
  }

  const approveApplication = async (id: number, user_id: string) => {
    try {
      const response = await fetch('/api/admin/approve-franchisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      fetchApplications()
    } catch (err) {
      alert('Gagal menyetujui: ' + err)
    }
  }

  const rejectApplication = async (user_id: string) => {
    await supabase.from('franchisor_applications').delete().eq('user_id', user_id)
    fetchApplications()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
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
            <tr key={app.id}>
              <td className="border px-3 py-2">{app.email}</td>
              <td className="border px-3 py-2">{app.whatsapp_number}</td>
              <td className="border px-3 py-2">{app.category}</td>
              <td className="border px-3 py-2">{app.location}</td>
              <td className="border px-3 py-2">
                {app.logo_url ? (
                  <Image src={app.logo_url} alt="Logo" width={50} height={50} />
                ) : (
                  'Logo'
                )}
              </td>
              <td className="border px-3 py-2">
                {app.ktp_url ? (
                  <Image src={app.ktp_url} alt="KTP" width={50} height={50} />
                ) : (
                  'KTP'
                )}
              </td>
              <td className="border px-3 py-2 space-x-2">
                <button
                  onClick={() => approveApplication(app.id, app.user_id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectApplication(app.user_id)}
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
