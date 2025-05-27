// pages/franchisor/index.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function FranchisorForm() {
  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    email: '',
    whatsapp: '',
    website: '',
    logo_url: '',
    ktp_url: ''
  })
  const [session, setSession] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user.id) {
        checkIfAlreadySubmitted(data.session.user.id)
      }
    })
  }, [])

  const checkIfAlreadySubmitted = async (userId: string) => {
    const { data, error } = await supabase
      .from('franchisor_applications')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (data) {
      setAlreadySubmitted(true)
    }
  }

  const uploadFile = async (file: File, type: 'logo' | 'ktp') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${type}_${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('franchisor-assets')
      .upload(fileName, file)

    if (error) {
      alert('Gagal upload file.')
      return null
    }

    const url = supabase.storage
      .from('franchisor-assets')
      .getPublicUrl(fileName).data.publicUrl

    return url
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'ktp') => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = await uploadFile(file, type)
    if (url) {
      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'ktp_url']: url
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    const { brand_name, description, email, whatsapp, website, logo_url, ktp_url } = formData
    if (!brand_name || !description || !email || !whatsapp || !website || !logo_url || !ktp_url) {
      alert('Semua kolom wajib diisi.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from('franchisor_applications').insert({
      user_id: session.user.id,
      brand_name,
      description,
      email,
      whatsapp,
      website,
      logo_url,
      ktp_url
    })

    setIsSubmitting(false)

    if (!error) {
      setAlreadySubmitted(true)
    } else {
      alert('Gagal mengirim data.')
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Form Pengajuan Jadi Franchisor</h1>

      {alreadySubmitted ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded text-center">
          Sedang Diperiksa Administrator
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nama Brand"
            value={formData.brand_name}
            onChange={e => setFormData({ ...formData, brand_name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Deskripsi"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email Usaha/Aktif"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Nomor WhatsApp"
            value={formData.whatsapp}
            onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Link Website/Sosial Media"
            value={formData.website}
            onChange={e => setFormData({ ...formData, website: e.target.value })}
            className="w-full p-2 border rounded"
          />

          {/* Upload Logo */}
          <div>
            <label className="block font-medium mb-1">Upload Logo Usaha</label>
            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
            {formData.logo_url && (
              <p className="text-sm text-green-600">Logo berhasil diupload.</p>
            )}
          </div>

          {/* Upload KTP */}
          <div>
            <label className="block font-medium mb-1">Upload Foto KTP</label>
            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'ktp')} />
            {formData.ktp_url && (
              <p className="text-sm text-green-600">Foto KTP berhasil diupload.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </form>
      )}
    </div>
  )
}
