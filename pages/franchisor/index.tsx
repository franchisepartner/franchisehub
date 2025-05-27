// pages/franchisor/index.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function FranchisorForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    email: '',
    whatsapp: '',
    website: '',
    logo_url: '',
    ktp_url: '',
  })

  const handleUpload = async (file: File, type: 'logo' | 'ktp') => {
    const filePath = `${type}s/${Date.now()}_${file.name}`
    const { error } = await supabase.storage
      .from('franchisor-assets')
      .upload(filePath, file)

    if (error) {
      alert('Upload gagal: ' + error.message)
      return
    }

    const { data } = supabase.storage
      .from('franchisor-assets')
      .getPublicUrl(filePath)

    setFormData(prev => ({
      ...prev,
      [type === 'logo' ? 'logo_url' : 'ktp_url']: data.publicUrl || '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredFields = [
      'brand_name',
      'description',
      'email',
      'whatsapp',
      'website',
      'logo_url',
      'ktp_url',
    ]

    const hasEmpty = requiredFields.some(field => !formData[field as keyof typeof formData])

    if (hasEmpty) {
      alert('Semua kolom wajib diisi.')
      return
    }

    const { error } = await supabase.from('franchisor_applications').insert([formData])

    if (error) {
      alert('Gagal mengirim data: ' + error.message)
    } else {
      alert('Pengajuan berhasil dikirim!')
      router.push('/')
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Form Pengajuan Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nama Brand"
          value={formData.brand_name}
          onChange={e => setFormData({ ...formData, brand_name: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Deskripsi Usaha"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="email"
          placeholder="Email Aktif"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Nomor WhatsApp"
          value={formData.whatsapp}
          onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Link Website/Sosial Media"
          value={formData.website}
          onChange={e => setFormData({ ...formData, website: e.target.value })}
          className="border px-3 py-2 rounded col-span-2"
        />

        {/* Upload Logo */}
        <div className="col-span-2">
          <label className="block mb-1 font-medium">Upload Logo Usaha</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file, 'logo')
            }}
            className="w-full"
          />
        </div>

        {/* Upload KTP */}
        <div className="col-span-2">
          <label className="block mb-1 font-medium">Upload Foto KTP</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file, 'ktp')
            }}
            className="w-full"
          />
        </div>

        <div className="col-span-2 text-center mt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
          >
            Kirim Pengajuan
          </button>
        </div>
      </form>
    </div>
  )
}
