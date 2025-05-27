// pages/register.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function RegisterFranchisor() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    brand_name: '',
    description: '',
    category: '',
    location: '',
    website: '',
    whatsapp: '',
    email: '',
    logo: null as File | null,
    ktp: null as File | null
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        setForm((prev) => ({
          ...prev,
          email: data.session.user.email || ''
        }))
      }
    })
  }, [])

  const handleChange = (e: any) => {
    const { name, value, files } = e.target
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const uploadFile = async (file: File, path: string) => {
    const fileName = `${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('franchise_files')
      .upload(`${path}/${fileName}`, file)

    if (error) throw error
    return data.path
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const logoPath = form.logo ? await uploadFile(form.logo, 'logo') : ''
      const ktpPath = form.ktp ? await uploadFile(form.ktp, 'ktp') : ''

      const { error } = await supabase.from('franchisor_applications').insert([
        {
          user_id: session.user.id,
          brand_name: form.brand_name,
          description: form.description,
          category: form.category,
          location: form.location,
          website: form.website,
          whatsapp_number: form.whatsapp,
          email: form.email,
          logo_url: logoPath,
          ktp_url: ktpPath
        }
      ])

      if (error) throw error

      alert('Pengajuan berhasil dikirim!')
      router.push('/')
    } catch (err: any) {
      alert('Gagal mengirim: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="brand_name" placeholder="Nama Brand Franchise" onChange={handleChange} required className="input" />
        <textarea name="description" placeholder="Deskripsi Singkat" onChange={handleChange} required className="input" />
        <input name="category" placeholder="Kategori Usaha" onChange={handleChange} required className="input" />
        <input name="location" placeholder="Lokasi Pusat" onChange={handleChange} required className="input" />
        <input name="website" placeholder="Link Website/Sosial Media" onChange={handleChange} required className="input" />
        <input name="whatsapp" placeholder="Nomor WhatsApp Aktif" onChange={handleChange} required className="input" />
        <input name="email" value={form.email} disabled className="input bg-gray-100" />
        <div>
          <label>Upload Logo Usaha</label>
          <input name="logo" type="file" accept="image/*" onChange={handleChange} required />
        </div>
        <div>
          <label>Upload Foto KTP</label>
          <input name="ktp" type="file" accept="image/*" onChange={handleChange} required />
        </div>

        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  )
}
