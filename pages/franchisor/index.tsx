import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function FranchisorPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('franchisor_applications').select('*').order('created_at', { ascending: false })
      if (error) console.error('Error fetching applications:', error)
      else setApplications(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pengajuan Jadi Franchisor</h1>

      {loading ? (
        <p>Memuat data...</p>
      ) : applications.length === 0 ? (
        <p>Tidak ada pengajuan saat ini.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Nama Brand</th>
                <th className="border px-3 py-2">Deskripsi</th>
                <th className="border px-3 py-2">Kategori</th>
                <th className="border px-3 py-2">Lokasi</th>
                <th className="border px-3 py-2">Link Sosial</th>
                <th className="border px-3 py-2">No. WhatsApp</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Logo</th>
                <th className="border px-3 py-2">KTP</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => (
                <tr key={idx} className="text-sm text-center">
                  <td className="border px-2 py-1">{app.brand_name}</td>
                  <td className="border px-2 py-1">{app.description}</td>
                  <td className="border px-2 py-1">{app.category}</td>
                  <td className="border px-2 py-1">{app.headquarters}</td>
                  <td className="border px-2 py-1">
                    <a href={app.website_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Kunjungi
                    </a>
                  </td>
                  <td className="border px-2 py-1">{app.whatsapp}</td>
                  <td className="border px-2 py-1">{app.email}</td>
                  <td className="border px-2 py-1">
                    <img src={app.logo_url} alt="Logo" className="h-10 mx-auto" />
                  </td>
                  <td className="border px-2 py-1">
                    <img src={app.ktp_url} alt="KTP" className="h-10 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
