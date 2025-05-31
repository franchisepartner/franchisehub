import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

interface Franchise {
  id: string
  franchise_name: string
  description: string
  category: string
  location: string
  min_investment: number
  logo_url: string
  operation_mode: string
  contact_number: string
  has_siup: boolean
  has_npwp: boolean
  has_nib: boolean
  has_sertifikat_halal: boolean
}

export default function FranchiseDetail() {
  const router = useRouter()
  const { id } = router.query
  const [franchise, setFranchise] = useState<Franchise | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!id) return
    fetchFranchise(id as string)
  }, [id])

  const fetchFranchise = async (franchiseId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('franchises')
      .select('*')
      .eq('id', franchiseId)
      .single()

    if (error) {
      console.error('Error fetching franchise:', error)
    } else {
      setFranchise(data)
    }
    setLoading(false)
  }

  if (loading || !franchise) return <div className="text-center mt-10">Memuat...</div>

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <div className="flex items-center space-x-4 mb-4">
        <Image
          src={franchise.logo_url}
          alt={franchise.franchise_name}
          width={120}
          height={120}
          className="rounded"
        />
        <div>
          <h1 className="text-2xl font-bold">{franchise.franchise_name}</h1>
          <p className="text-gray-600">{franchise.category}</p>
          <p className="text-gray-500">{franchise.location}</p>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Deskripsi Franchise</h2>
        <p>{franchise.description}</p>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Informasi Investasi</h2>
        <p className="font-bold">Minimal Investasi: Rp {franchise.min_investment.toLocaleString()}</p>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Mode Operasi</h2>
        <p className="font-medium">{franchise.operation_mode}</p>
        <div className="bg-gray-100 p-2 rounded mt-2">
          {franchise.operation_mode === 'Autopilot' ? (
            <ul className="list-disc pl-4">
              <li>Minim keterlibatan pemilik usaha sehari-hari</li>
              <li>Operasi bisnis sepenuhnya dijalankan tim pusat</li>
              <li>Pemilik mendapatkan laporan secara berkala</li>
            </ul>
          ) : (
            <ul className="list-disc pl-4">
              <li>Pemilik usaha terlibat aktif di operasional harian</li>
              <li>Operasional harian dibantu oleh sistem pusat</li>
              <li>Kontrol penuh atas aktivitas lokal</li>
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold">Dokumen Hukum</h2>
        <table className="w-full mt-2 border-collapse">
          <thead>
            <tr>
              <th className="border py-1">Dokumen</th>
              <th className="border py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'SIUP', value: franchise.has_siup },
              { label: 'NPWP', value: franchise.has_npwp },
              { label: 'NIB', value: franchise.has_nib },
              { label: 'Sertifikat Halal', value: franchise.has_sertifikat_halal },
            ].map(doc => (
              <tr key={doc.label}>
                <td className="border py-1 pl-2">{doc.label}</td>
                <td className={`border py-1 pl-2 font-medium ${doc.value ? 'text-green-600' : 'text-orange-600'}`}>
                  {doc.value ? 'Sudah Punya' : 'Akan/Sedang Diurus'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Kontak Franchise</h2>
        {session ? (
          <p className="text-blue-600 font-bold">{franchise.contact_number}</p>
        ) : (
          <p className="text-gray-500">
            Kontak terkunci. Silakan <Link href="/login" className="text-blue-600 underline">login</Link>.
          </p>
        )}
      </div>
    </div>
  )
}
