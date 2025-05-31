// pages/franchisor/manage-listings/new.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'

export default function NewListing() {
  const [formData, setFormData] = useState<any>({
    franchise_name: '',
    description: '',
    min_investment: '',
    operation_mode: 'Autopilot',
    location: '',
    category: 'F&B',
    whatsapp: '',
    email: '',
    website: '',
    has_legal_docs: false,
    legal_docs: [],
    additional_notes: '',
    logo: null,
    cover: null,
  })

  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    setFormData((prev: any) => ({
      ...prev,
      [e.target.name]: file,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const logoPath = formData.logo ? `franchise-logos/${uuidv4()}_${formData.logo.name}` : ''
    const coverPath = formData.cover ? `franchise-covers/${uuidv4()}_${formData.cover.name}` : ''

    if (formData.logo) {
      await supabase.storage.from('franchise-assets').upload(logoPath, formData.logo)
    }

    if (formData.cover) {
      await supabase.storage.from('franchise-assets').upload(coverPath, formData.cover)
    }

    const { error } = await supabase.from('listings').insert({
      franchise_name: formData.franchise_name,
      description: formData.description,
      min_investment: formData.min_investment,
      operation_mode: formData.operation_mode,
      location: formData.location,
      category: formData.category,
      whatsapp: formData.whatsapp,
      email: formData.email,
      website: formData.website,
      has_legal_docs: formData.has_legal_docs,
      legal_docs: formData.legal_docs,
      additional_notes: formData.additional_notes,
      logo_url: logoPath,
      cover_url: coverPath,
      created_by: user.id,
    })

    if (error) {
      alert('Gagal menambah listing!')
      console.error(error)
    } else {
      router.push('/franchisor/manage-listings')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Listing Franchise Baru</h1>

      <form onSubmit={handleSubmit}>
        <input name="franchise_name" placeholder="Nama Franchise" required className="border p-2 w-full mb-2" onChange={handleChange} />

        <textarea name="description" placeholder="Deskripsi Franchise" required className="border p-2 w-full mb-2" onChange={handleChange} />

        <input name="min_investment" type="number" placeholder="Investasi Minimum" required className="border p-2 w-full mb-2" onChange={handleChange} />

        <select name="operation_mode" className="border p-2 w-full mb-2" onChange={handleChange}>
          <option value="Autopilot">Autopilot</option>
          <option value="Semi Autopilot">Semi Autopilot</option>
        </select>

        <input name="location" placeholder="Lokasi Franchise" required className="border p-2 w-full mb-2" onChange={handleChange} />

        <select name="category" className="border p-2 w-full mb-2" onChange={handleChange}>
          <option value="F&B">F&B</option>
          <option value="Retail">Retail</option>
          <option value="Lainnya">Lainnya</option>
        </select>

        <input name="whatsapp" placeholder="Kontak WhatsApp Franchise" required className="border p-2 w-full mb-2" onChange={handleChange} />

        <input name="email" type="email" placeholder="Kontak Email Franchise" required className="border p-2 w-full mb-2" onChange={handleChange} />

        <input name="website" placeholder="Website Franchise (opsional)" className="border p-2 w-full mb-2" onChange={handleChange} />

        <label>
          <input type="checkbox" name="has_legal_docs" onChange={handleChange} /> Sudah Punya Dokumen Hukum
        </label>

        <input name="logo" type="file" required className="border p-2 w-full mb-2" onChange={handleFileChange} />
        <input name="cover" type="file" required className="border p-2 w-full mb-2" onChange={handleFileChange} />

        <textarea name="additional_notes" placeholder="Catatan Tambahan (opsional)" className="border p-2 w-full mb-2" onChange={handleChange} />

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
          Tambah Listing
        </button>
      </form>
    </div>
  )
}
