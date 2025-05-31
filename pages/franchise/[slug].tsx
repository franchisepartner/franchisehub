import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

interface Franchise {
  id: string
  franchise_name: string
  description: string
  category: string
  investment_start: number
  location: string
  logo_url: string
  mode_operasi: 'Autopilot' | 'Semi Autopilot'
  dokumen_hukum_sudah_punya: boolean
  dokumen_hukum_akan_diurus: boolean
  whatsapp_contact: string
  email_contact: string
  created_at: string
}

export default function FranchiseDetailPage() {
  const router = useRouter()
  const { slug } = router.query

  const [franchise, setFranchise] = useState<Franchise | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFranchise()
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [slug])

  const fetchFranchise = async () => {
    if (!slug) return
    setLoading(true)
    const { data, error } = await supabase
      .from('franchise_listings')
      .select('*')
      .eq('slug', slug)
      .single()

    if (data) {
      setFranchise(data)
    } else {
      console.error(error)
    }
    setLoading(false)
  }

  if (loading) return <p className="text-center my-10">Loading data franchise...</p>
  if (!franchise) return <p className="text-center my-10">Franchise tidak ditemukan.</p>

  const userLoggedIn = !!session

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/" className="text-sm text-blue-600">&larr; Kembali ke daftar</Link>

      <h1 className="text-3xl font-bold mt-4">{franchise.franchise_name}</h1>

      <img
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/franchise-logos/${franchise.logo_url}`}
        alt={franchise.franchise_name}
        className="w-full rounded-lg shadow mt-4"
      />

      <p className="mt-4 text-gray-700">{franchise.description}</p>

      <table className="w-full table-auto mt-6 bg-gray-50 rounded-lg shadow">
        <tbody>
          <tr className="border-b">
            <th className="text-left p-3">Investasi Minimal</th>
            <td className="p-3">Rp. {franchise.investment_start.toLocaleString('id-ID')}</td>
          </tr>
          <tr className="border-b">
            <th className="text-left p-3">Lokasi Usaha</th>
            <td className="p-3">{franchise.location}</td>
          </tr>
          <tr className="border-b">
            <th className="text-left p-3">Mode Operasi</th>
            <td className="p-3">{franchise.mode_operasi}</td>
          </tr>
          <tr>
            <th className="text-left p-3">Status Dokumen Hukum</th>
            <td className="p-3">
              {franchise.dokumen_hukum_sudah_punya ? '✅ Sudah Punya' : '🕒 Akan/Sedang Diurus'}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mt-6">Kontak Franchisor</h2>
      <div className="mt-3 bg-gray-100 p-4 rounded-lg shadow text-center">
        {userLoggedIn ? (
          <>
            <p>📞 WhatsApp: <a href={`https://wa.me/${franchise.whatsapp_contact}`} className="text-green-700 font-semibold">{franchise.whatsapp_contact}</a></p>
            <p>📧 Email: <a href={`mailto:${franchise.email_contact}`} className="text-blue-700 font-semibold">{franchise.email_contact}</a></p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-gray-700">Silahkan login terlebih dahulu untuk melihat kontak franchisor.</p>
            <Link href="/login">
              <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded">Login</button>
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Penjelasan Mode Operasi</h3>
        <table className="w-full text-sm bg-gray-50 rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Autopilot</th>
              <th className="p-2 border">Semi Autopilot</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Franchisor mengelola sepenuhnya bisnis, franchisee menerima hasil secara pasif.</td>
              <td className="p-2 border">Franchisee terlibat aktif dalam pengelolaan operasional sehari-hari, franchisor memberikan sistem dan support.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
