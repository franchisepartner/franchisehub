// pages/franchisor/index.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

interface FormDataType {
  brand_name: string
  description: string
  email: string
  whatsapp: string
  website: string
  logo_url?: string
  ktp_url?: string
}

export default function FranchisorForm() {
  const [formData, setFormData] = useState<FormDataType>({
    brand_name: '',
    description: '',
    email: '',
    whatsapp: '',
    website: '',
  })

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  const uploadFile = async (file: File, type: 'logo' | 'ktp') => {
    const filePath = `${type}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage
      .from('franchisor-assets')
      .upload(filePath, file)

    if (error) {
      alert(`Upload ${type} gagal`)
      return ''
    }

    const { data } = supabase.storage
      .from('franchisor-assets')
      .getPublicUrl(filePath)

    return data?.publicUrl || ''
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'ktp'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = await uploadFile(file, type)
    if (type === 'logo') {
      setFormData(prev => ({ ...prev, logo_url: url }))
    } else {
      setFormData(prev => ({ ...prev, ktp_url: url }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const user_id = session?.user?.id
    const { error } = await supabase.from('franchisor_applications').insert([
      {
        user_id,
        ...formData,
      },
    ])

    setLoading(false)

    if (error) {
      alert('Gagal mengirim pengajuan.')
    } else {
      alert('Pengajuan berhasil dikirim!')
      router.push('/')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Formulir Jadi Franchisor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nama Brand"
          value={formData.brand_name}
          onChange={e =>
            setFormData({ ...formData, brand_name: e.target.value })
          }
          className="border w-full p-2 rounded"
          required
        />

        <textarea
          placeholder="Deskripsi Usaha"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="border w-full p-2 rounded"
          rows={4}
          required
        />

        <input
          type="email"
          placeholder="Email Aktif"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="border w-full p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Nomor WhatsApp"
          value={formData.whatsapp}
          onChange={e =>
            setFormData({ ...formData, whatsapp: e.target.value })
          }
          className="border w-full p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Link Website/Sosial Media"
          value={formData.website}
          onChange={e =>
            setFormData({ ...formData, website: e.target.value })
          }
          className="border w-full p-2 rounded"
        />

        <div>
          <label className="block mb-1 font-medium">Upload Logo Usaha</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
        </div>

        <div>
          <label className="block mb-1 font-medium">Upload Foto KTP</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'ktp')} />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  )
}
