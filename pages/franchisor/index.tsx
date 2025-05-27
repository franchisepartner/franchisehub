// pages/franchisor/index.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid'

export default function FranchisorForm() {
  const router = useRouter()
  const [brandName, setBrandName] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [website, setWebsite] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    const checkSubmission = async () => {
      const { data: sessionData } = await supabase.auth.getUser()
      const user = sessionData?.user
      if (!user) return
      const { data } = await supabase
        .from('franchisor_applications')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data && data.status === 'pending') {
        setAlreadySubmitted(true)
      }
    }

    checkSubmission()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !brandName || !description || !email || !whatsapp ||
      !website || !category || !location || !logoFile || !ktpFile
    ) {
      alert('Harap isi semua kolom!')
      return
    }

    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user
    if (!user) {
      alert('Anda harus login terlebih dahulu.')
      return
    }

    const logoPath = `logos/${uuidv4()}-${logoFile.name}`
    const ktpPath = `ktps/${uuidv4()}-${ktpFile.name}`

    const { error: logoError } = await supabase.storage
      .from('franchisor-assets')
      .upload(logoPath, logoFile)

    const { error: ktpError } = await supabase.storage
      .from('franchisor-assets')
      .upload(ktpPath, ktpFile)

    if (logoError || ktpError) {
      console.error('Upload error', logoError || ktpError)
      alert('Gagal mengunggah gambar.')
      return
    }

    // Hapus pengajuan sebelumnya jika status rejected
    await supabase
      .from('franchisor_applications')
      .delete()
      .eq('user_id', user.id)
      .eq('status', 'rejected')

    const { error } = await supabase.from('franchisor_applications').insert({
      user_id: user.id,
      email,
      brand_name: brandName,
      description,
      category,
      location,
      website,
      whatsapp_number: whatsapp,
      logo_url: logoPath,
      ktp_url: ktpPath,
      submitted_at: new Date().toISOString(),
      status: 'pending',
    })

    if (error) {
      console.error('Insert error', error)
      alert('Gagal mengirim pengajuan.')
    } else {
      setAlreadySubmitted(true)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Form Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nama Brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} className="w-full p-2 border" />
        <input type="text" placeholder="Deskripsi Usaha" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border" />
        <input type="email" placeholder="Email Aktif" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border" />
        <input type="text" placeholder="Nomor WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full p-2 border" />
        <input type="text" placeholder="Link Website" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full p-2 border" />
        <input type="text" placeholder="Kategori Usaha" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border" />
        <input type="text" placeholder="Lokasi Usaha" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 border" />
        <div>
          <label className="block mb-1">Upload Logo Usaha</label>
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="block mb-1">Upload Foto KTP</label>
          <input type="file" accept="image/*" onChange={(e) => setKtpFile(e.target.files?.[0] || null)} />
        </div>
        <button
          type="submit"
          disabled={alreadySubmitted}
          className={`w-full py-2 text-white rounded ${alreadySubmitted ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {alreadySubmitted ? 'Sedang Diperiksa Administrator' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  )
}
