import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Image from 'next/image'

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
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('*')

    if (data) {
      setApplications(data)

      // Ambil URL gambar secara signed
      const paths = data.flatMap((item) => [item.logo_url, item.ktp_url])
      const { data: signedData } = await supabase.storage
        .from('franchisor-assets')
        .createSignedUrls(paths, 60 * 60)

      const urls: Record<string, string> = {}
      signedData?.forEach(obj => {
        if (obj.path && obj.signedUrl) {
          urls[obj.path] = obj.signedUrl
        }
      })

      setImageUrls(urls)
    }

    if (error) console.error(error)
    setLoading(false)
  }

  const updateStatus = async (id: number, user_id: string, status: string) => {
    try {
      if (status === 'approved') {
        await fetch('/api/admin/approve-franchisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id }),
        })
      }

      if (status === 'rejected') {
        await supabase.from('franchisor_applications').delete().eq('user_id', user_id)
      } else {
        await supabase.from('franchisor_applications')
          .update({ status })
          .eq('id', id)
      }

      fetchApplications()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard Administrator: Persetujuan Franchisor</h1>
      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <table className="min-w-full table-auto border border-gray-300 text-sm">
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
              <tr key={app.id}>
                <td className="border px-2 py-1">{app.brand_name}</td>
                <td className="border px-2 py-1">{app.description}</td>
                <td className="border px-2 py-1">{app.email}</td>
                <td className="border px-2 py-1">{app.whatsapp}</td>
                <td className="border px-2 py-1">{app.category}</td>
                <td className="border px-2 py-1">{app.location}</td>
                <td className="border px-2 py-1">
                  {imageUrls[app.logo_url] ? (
                    <a href={imageUrls[app.logo_url]} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={imageUrls[app.logo_url]}
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    </a>
                  ) : 'Memuat...'}
                </td>
                <td className="border px-2 py-1">
                  {imageUrls[app.ktp_url] ? (
                    <a href={imageUrls[app.ktp_url]} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={imageUrls[app.ktp_url]}
                        alt="KTP"
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    </a>
                  ) : 'Memuat...'}
                </td>
                <td className="border px-2 py-1 space-y-1">
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
      )}
    </div>
  )
}
