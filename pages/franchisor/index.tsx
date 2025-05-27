// pages/franchisor/index.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function FranchisorForm() {
  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    email: '',
    whatsapp: '',
    website: '',
    logo_url: '',
    ktp_url: '',
  })
  const [uploading, setUploading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const uploadFile = async (file: File, type: 'logo' | 'ktp') => {
    if (!session) return

    const fileExt = file.name.split('.').pop()
    const filePath = `${session.user.id}/${type}.${fileExt}`

    const { error } = await supabase.storage
      .from('franchisor-assets')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (error) throw error

    const { data } = supabase.storage
      .from('franchisor-assets')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleUpload = async (e: any, type: 'logo' | 'ktp') => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadFile(file, type)
      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logo_url: url }))
      } else {
        setFormData(prev => ({ ...prev, ktp_url: url }))
      }
    } catch (err) {
      alert('Gagal upload gambar.')
    }
    setUploading(false)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const { error } = await supabase.from('franchisor_applications').insert([
      {
        user_id: session.user.id,
        ...formData,
      },
    ])

    if (error) {
      alert('Gagal menyimpan data.')
    } else {
      alert('Pengajuan berhasil dikirim.')
      router.push('/')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Form Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="brand_name" placeholder="Nama Brand" onChange={handleChange} required className="border w-full p-2" />
        <textarea name="description" placeholder="Deskripsi Usaha" onChange={handleChange} required className="border w-full p-2" />
        <input name="email" placeholder="Email Aktif" onChange={handleChange} required type="email" className="border w-full p-2" />
        <input name="whatsapp" placeholder="No. WhatsApp Aktif" onChange={handleChange} required className="border w-full p-2" />
        <input name="website" placeholder="Link Website / Sosial Media" onChange={handleChange} className="border w-full p-2" />

        <div>
          <label className="block mb-1 font-medium">Upload Logo Usaha</label>
          <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'logo')} className="w-full" />
          {formData.logo_url && <img src={formData.logo_url} alt="Logo" className="mt-2 w-24 h-24 object-contain" />}
        </div>

        <div>
          <label className="block mb-1 font-medium">Upload Foto KTP</label>
          <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'ktp')} className="w-full" />
          {formData.ktp_url && <img src={formData.ktp_url} alt="KTP" className="mt-2 w-24 h-24 object-contain" />}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {uploading ? 'Mengunggah...' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  )
}
