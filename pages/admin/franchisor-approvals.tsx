import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

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
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*')
    if (data) {
      setApplications(data)
      fetchSignedUrls(data)
    }
    if (error) console.error(error)
  }

  const fetchSignedUrls = async (apps: Application[]) => {
    const paths = apps.flatMap(app => [app.logo_url, app.ktp_url])
    const validPaths = paths.filter(Boolean)

    const { data, error } = await supabase.storage
      .from('franchisor-assets')
      .createSignedUrls(validPaths, 60 * 60)

    const urls: Record<string, string> = {}
    data?.forEach(obj => {
      if (obj.path && obj.signedUrl) {
        urls[obj.path] = obj.signedUrl
      }
    })

    setImageUrls(urls)
  }

  const updateStatus = async (id: number, user_id: string, status: string) => {
    if (status === 'approved') {
      await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { role: 'Franchisor' },
      })
    }

    if (status === 'rejected') {
      await supabase.from('franchisor_applications').delete().eq('user_id', user_id)
    } else {
      await supabase
        .from('franchisor_applications')
        .update({ status })
        .eq('id', id)
    }

    fetchApplications()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Persetujuan Franchisor</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
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
            {applications.map(app => (
              <tr key={app.id}>
                <td className="border px-3 py-2">{app.brand_name}</td>
                <td className="border px-3 py-2">{app.description}</td>
                <td className="border px-3 py-2">{app.email}</td>
                <td className="border px-3 py-2 whitespace-nowrap">{app.whatsapp_number}</td>
                <td className="border px-3 py-2">{app.category}</td>
                <td className="border px-3 py-2">{app.location}</td>
                <td className="border px-3 py-2">
                  {imageUrls[app.logo_url] ? (
                    <a href={imageUrls[app.logo_url]} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrls[app.logo_url]} alt="Logo" className="w-16 h-16 object-cover rounded" />
                    </a>
                  ) : 'Memuat...'}
                </td>
                <td className="border px-3 py-2">
                  {imageUrls[app.ktp_url] ? (
                    <a href={imageUrls[app.ktp_url]} target="_blank" rel="noopener noreferrer">
                      <img src={imageUrls[app.ktp_url]} alt="KTP" className="w-16 h-16 object-cover rounded" />
                    </a>
                  ) : 'Memuat...'}
                </td>
                <td className="border px-3 py-2 flex gap-2">
                  <button
                    onClick={() => updateStatus(app.id, app.user_id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, app.user_id, 'rejected')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
