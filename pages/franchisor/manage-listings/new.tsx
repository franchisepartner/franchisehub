// pages/franchisor/manage-listings/new.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function NewListing() {
  const [formData, setFormData] = useState({
    franchise_name: '',
    description: '',
    category: '',
    investment_min: 0,
    location: '',
    mode: '',
    dokumen_hukum_sudah_punya: false,
    dokumen_hukum_akan_diurus: false,
    whatsapp_contact: '',
    email_contact: '',
    website_url: '',
    slug: '',
    google_maps_url: '',
    notes: '',
    tags: '',
    logo: null as File | null,
  })

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleChange = (e: any) => {
    const { name, value, type, checked, files } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value,
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const user = await supabase.auth.getUser()

    if (!user.data.user) {
      alert('User belum login')
      setLoading(false)
      return
    }

    const logoPath = `logos/${uuidv4()}_${formData.logo?.name}`

    const { error: logoError } = await supabase.storage
      .from('franchise-assets')
      .upload(logoPath, formData.logo!)

    if (logoError) {
      alert('Upload logo gagal!')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('franchise_listings').insert({
      ...formData,
      logo_url: logoPath,
      user_id: user.data.user.id,
      operation_mode: formData.mode,
    })

    if (error) {
      alert('Gagal menambahkan listing')
    } else {
      alert('Listing berhasil ditambahkan!')
      router.push('/franchisor/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Listing Franchise Baru</h1>
      <form onSubmit={handleSubmit}>
        <input name="franchise_name" placeholder="Nama Franchise" required className="border p-2 w-full mb-2" onChange={handleChange}/>
        <textarea name="description" placeholder="Deskripsi" required className="border p-2 w-full mb-2" onChange={handleChange}/>
        <input name="category" placeholder="Kategori" required className="border p-2 w-full mb-2" onChange={handleChange}/>
        <input name="investment_min" placeholder="Investasi Minimal" type="number" required className="border p-2 w-full mb-2" onChange={handleChange}/>
        <input name="location" placeholder="Lokasi" required className="border p-2 w-full mb-2" onChange={handleChange}/>

        <select name="mode" required className="border p-2 w-full mb-2" onChange={handleChange}>
          <option
