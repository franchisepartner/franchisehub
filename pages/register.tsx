import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function RegisterFranchisor() {
  const [session, setSession] = useState<any>(null)
  const [formData, setFormData] = useState({
    brand: '',
    description: '',
    category: '',
    location: '',
    website: '',
    wa: '',
    email: '',
    logo: null as File | null,
    ktp: null as File | null,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setFormData(prev => ({
        ...prev,
        email: data.session?.user?.email || ''
      }))
    })
  }, [])

  const handleChange = (e: any) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    // Upload logo
    const logoPath = `logo/${Date.now()}_${formData.logo?.name}`
    const { error: logoError } = await supabase.storage
      .from('franchisor')
      .upload(logoPath, formData.logo!)

    if (logoError) {
      alert('Upload logo gagal.')
      setLoading(false)
      return
    }

    // Upload KTP
    const ktpPath = `ktp/${Date.now()}_${formData.ktp?.name}`
    const { error: ktpError } = await supabase.storage
      .from('franchisor')
      .upload(ktpPath, formData.ktp!)

    if (ktpError) {
      alert('Upload KTP gagal.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('franchisor_applications').insert([
      {
        brand: formData.brand,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        website: formData.website,
        wa: formData.wa,
        email: formData.email,
        logo_url: logoPath,
        ktp_url: ktpPath,
        user_id: session.user.id,
      }
    ])

    if (error) {
      alert('Gagal menyimpan data.')
    } else {
      alert('Pengajuan berhasil!')
      router.push('/')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="brand" placeholder="Nama Brand Franchise" required onChange={handleChange} className="w-full border px-3 py-2" />
        <textarea name="description" placeholder="Deskripsi Singkat" required onChange={handleChange} className="w-full border px-3 py-2" />
        <input type="text" name="category" placeholder="Kategori Usaha" required onChange={handleChange} className="w-full border px-3 py-2" />
        <input type="text" name="location" placeholder="Lokasi Pusat" required onChange={handleChange} className="w-full border px-3 py-2" />
        <input type="text" name="website" placeholder="Link Website/Sosial Media" required onChange={handleChange} className="w-full border px-3 py-2" />
        <input type="text" name="wa" placeholder="Nomor WhatsApp Aktif" required onChange={handleChange} className="w-full border px-3 py-2" />
        <input type="email" name="email" value={formData.email} disabled className="w-full border px-3 py-2 bg-gray-100" />
        <input type="file" name="logo" accept="image/*" required onChange={handleChange} className="w-full" />
        <input type="file" name="ktp" accept="image/*" required onChange={handleChange} className="w-full" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  )
}
