import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Application {
  id: string
  user_id: string
  email: string
  brand_name: string
  description: string
  category: string
  location: string
  whatsapp_number: string
  logo_url: string
  ktp_url: string
  status: string
}

export default function FranchisorApprovals() {
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*')
      .eq('status', 'pending')
    if (error) console.error(error)
    else setApplications(data)
  }

  async function handleApprove(user_id: string, email: string) {
    const res = await fetch('/api/admin/approve-franchisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, email })
    })

    if (res.ok) {
      alert('Berhasil approve.')
      fetchApplications()
    } else {
      alert('Gagal approve.')
    }
  }

  async function handleReject(id: string) {
    await supabase.from('franchisor_applications').delete().eq('id', id)
    alert('Ditolak.')
    fetchApplications()
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Persetujuan Franchisor</h1>
      <table className="min-w-full border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Email</th>
            <th className="border p-2">WhatsApp</th>
            <th className="border p-2">Kategori</th>
            <th className="border p-2">Lokasi</th>
            <th className="border p-2">Logo</th>
            <th className="border p-2">KTP</th>
            <th className="border p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="border p-2">{app.email}</td>
              <td className="border p-2">{app.whatsapp_number}</td>
              <td className="border p-2">{app.category}</td>
              <td className="border p-2">{app.location}</td>
              <td className="border p-2">
                <a href={`https://dtbuiijyevhfxsfzsknr.supabase.co/storage/v1/object/public/franchisor-assets/${app.logo_url}`} target="_blank" rel="noopener noreferrer">
                  <img src={`https://dtbuiijyevhfxsfzsknr.supabase.co/storage/v1/object/public/franchisor-assets/${app.logo_url}`} alt="logo" className="w-10 h-10 object-cover" />
                </a>
              </td>
              <td className="border p-2">
                <a href={`https://dtbuiijyevhfxsfzsknr.supabase.co/storage/v1/object/public/franchisor-assets/${app.ktp_url}`} target="_blank" rel="noopener noreferrer">
                  <img src={`https://dtbuiijyevhfxsfzsknr.supabase.co/storage/v1/object/public/franchisor-assets/${app.ktp_url}`} alt="ktp" className="w-10 h-10 object-cover" />
                </a>
              </td>
              <td className="border p-2">
                <button onClick={() => handleApprove(app.user_id, app.email)} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2">Approve</button>
                <button onClick={() => handleReject(app.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
