// pages/franchisor/index.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'

export default function FranchisorForm() {
  const [brand_name, setBrandName] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [website, setWebsite] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'approved'>('idle')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 🔁 Tambahkan pengecekan apakah user punya entry di tabel profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile && !profileError) {
      await supabase.from('profiles').insert({
        id: user.id,
        role: 'franchisee'
      })
    }

    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (data?.status === 'pending') {
      setStatus('pending')
    } else if (data?.status === 'approved') {
      setStatus('approved')
    }
  }

  const handleSubmit = async () => {
    if (
      !brand_name || !description || !email || !whatsapp || !website ||
      !category || !location || !logoFile || !ktpFile
    ) {
      alert('Harap isi semua kolom!')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const logoPath = `logos/${uuidv4()}_${logoFile.name}`
    const ktpPath = `ktps/${uuidv4()}_${ktpFile.name}`

    const { error: logoError } = await supabase
      .storage
      .from('franchisor-assets')
      .upload(logoPath, logoFile)

    const { error: ktpError } = await supabase
      .storage
      .from('franchisor-assets')
      .upload(ktpPath, ktpFile)

    if (logoError || ktpError) {
      alert('Gagal mengunggah gambar.')
      setLoading(false)
      return
    }

    await supabase
      .from('franchisor_applications')
      .delete()
      .eq('user_id', user.id)

    const { error } = await supabase.from('franchisor_applications').insert({
      user_id: user.id,
      email,
      brand_name,
      description,
      category,
      location,
      website,
      whatsapp_number: whatsapp,
      logo_url: logoPath,
      ktp_url: ktpPath,
      submitted_at: new Date(),
      status: 'pending',
    })

    if (error) {
      alert('Gagal mengirim pengajuan.')
    } else {
      setStatus('pending')
    }

    setLoading(false)
  }

  const handlePaymentComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'franchisor' })
      .eq('id', user.id)

    if (error) {
      alert('Gagal mengubah role. Coba lagi.')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Form Pengajuan Jadi Franchisor</h1>

      {status === 'approved' ? (
        <div className="bg-green-100 border border-green-300 p-4 rounded mb-4">
          <p className="text-green-700 font-medium mb-2">
            ✅ Pendaftaran anda telah disetujui Administrator FranchiseHub.
            <br />
            Silahkan lakukan pembayaran paket pilihan anda untuk mendapatkan akses role Franchisor.
          </p>
          <button
            onClick={handlePaymentComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            Login sebagai Franchisor
          </button>
        </div>
      ) : status === 'pending' ? (
        <button className="bg-gray-400 text-white w-full py-2 rounded cursor-not-allowed" disabled>
          Sedang Diperiksa Administrator
        </button>
      ) : (
        <>
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Nama Brand" value={brand_name} onChange={(e) => setBrandName(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Deskripsi Usaha" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Email Aktif" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Nomor WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Link Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Kategori Usaha" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-4" placeholder="Lokasi Usaha" value={location} onChange={(e) => setLocation(e.target.value)} />

          <div className="mb-4">
            <label className="block mb-1">Upload Logo Usaha</label>
            <input type="file" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </div>

          <div className="mb-6">
            <label className="block mb-1">Upload Foto KTP</label>
            <input type="file" onChange={(e) => setKtpFile(e.target.files?.[0] || null)} />
          </div>

          <button
            onClick={handleSubmit}
            className={`w-full py-2 text-white rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
            disabled={loading}
          >
            {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </>
      )}
    </div>
  )
}
