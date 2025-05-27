// pages/franchisor/index.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid'

export default function FranchisorForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    email: '',
    whatsapp: '',
    website: '',
    category: '',
    location: '',
    logo_url: '',
    ktp_url: '',
  })

  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('franchisor_applications')
        .select('status')
        .eq('user_id', user?.id)
        .single()
      if (data?.status) setStatus(data.status)
    }

    checkStatus()
  }, [])

  const handleUpload = async (e: any, field: 'logo_url' | 'ktp_url') => {
    const file = e.target.files[0]
    if (!file) return
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${field}/${fileName}`

    const { error } = await supabase.storage
      .from('franchisor-assets')
      .upload(filePath, file)

    if (!error) {
      const path = filePath
      setFormData(prev => ({ ...prev, [field]: path }))
    } else {
      alert('Gagal upload file')
    }
  }

  const handleSubmit = async () => {
    const {
      brand_name,
      description,
      email,
      whatsapp,
      website,
      category,
      location,
      logo_url,
      ktp_url
    } = formData

    if (
      !brand_name || !description || !email || !whatsapp ||
      !website || !category || !location || !logo_url || !ktp_url
    ) {
      alert('Harap isi semua kolom!')
      return
    }

    setIsSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('franchisor_applications')
      .insert({
        user_id: user?.id,
        email,
        brand_name,
        description,
        whatsapp,
        website,
        category,
        location,
        logo_url,
        ktp_url,
        status: 'pending'
      })

    if (!error) {
      setStatus('pending')
    } else {
      alert('Gagal mengirim data.')
    }

    setIsSubmitting(false)
  }

  if (status === 'pending') {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-700">
          Pengajuan kamu sedang diperiksa oleh Administrator.
        </h1>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Form Pengajuan Jadi Franchisor</h1>
      
      {Object.entries({
        brand_name: 'Nama Brand',
        description: 'Deskripsi Usaha',
        email: 'Email Aktif',
        whatsapp: 'Nomor WhatsApp',
        website: 'Link Website/Sosial Media',
        category: 'Kategori Usaha',
        location: 'Lokasi Usaha',
      }).map(([field, label]) => (
        <div key={field}>
          <label className="block mb-1 font-medium">{label}</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded"
            value={(formData as any)[field]}
            onChange={(e) =>
              setFormData({ ...formData, [field]: e.target.value })
            }
          />
        </div>
      ))}

      <div>
        <label className="block mb-1 font-medium">Upload Logo Usaha</label>
        <input type="file" onChange={(e) => handleUpload(e, 'logo_url')} />
      </div>

      <div>
        <label className="block mb-1 font-medium">Upload Foto KTP</label>
        <input type="file" onChange={(e) => handleUpload(e, 'ktp_url')} />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
      </button>
    </div>
  )
}
