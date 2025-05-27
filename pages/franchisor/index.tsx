import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Application {
  id: number
  user_id: string
  brand_name: string
  short_description: string
  business_category: string
  headquarters_location: string
  website_or_social: string
  whatsapp_number: string
  business_email: string
  logo_url: string
  ktp_url: string
  created_at: string
}

export default function FranchisorPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('franchisor_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setApplications(data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Pengajuan Jadi Franchisor</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : applications.length === 0 ? (
        <p>Belum ada pengajuan.</p>
      ) : (
        <div className="overflow-auto">
          <table className="table-auto w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Brand</th>
                <th className="px-4 py-2 border">Kategori</th>
                <th className="px-4 py-2 border">Lokasi</th>
                <th className="px-4 py-2 border">WA</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Logo</th>
                <th className="px-4 py-2 border">KTP</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="px-4 py-2 border">{app.brand_name}</td>
                  <td className="px-4 py-2 border">{app.business_category}</td>
                  <td className="px-4 py-2 border">{app.headquarters_location}</td>
                  <td className="px-4 py-2 border">{app.whatsapp_number}</td>
                  <td className="px-4 py-2 border">{app.business_email}</td>
                  <td className="px-4 py-2 border">
                    <a href={app.logo_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      Logo
                    </a>
                  </td>
                  <td className="px-4 py-2 border">
                    <a href={app.ktp_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      KTP
                    </a>
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
