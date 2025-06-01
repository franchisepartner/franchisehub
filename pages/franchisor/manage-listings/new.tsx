import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'

const legalDocsList = [
  { key: 'stpw', label: 'STPW' },
  { key: 'perjanjian', label: 'Perjanjian Waralaba' },
  { key: 'siup', label: 'SIUP' },
  { key: 'situ', label: 'SITU' },
  { key: 'akta', label: 'Akta Pendirian Usaha' }
] as const;

type LegalDocKey = typeof legalDocsList[number]['key'];

export default function NewFranchiseListing() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [investment, setInvestment] = useState('')
  const [operationMode, setOperationMode] = useState('Autopilot')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('F&B')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [slug, setSlug] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [hasLegalDocs, setHasLegalDocs] = useState(false)
  const [legalDocs, setLegalDocs] = useState<Record<LegalDocKey, boolean>>(
    legalDocsList.reduce((acc, doc) => ({ ...acc, [doc.key]: false }), {} as Record<LegalDocKey, boolean>)
  )
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setSlug(name.trim().toLowerCase().replace(/\s+/g, '-'))
  }, [name])

  const handleLegalDocsChange = (key: LegalDocKey) => (checked: boolean) => {
    setLegalDocs(prev => ({ ...prev, [key]: checked }))
  }

  const handleSubmit = async () => {
    if (!name || !description || !investment || !location || !whatsapp || !email || !logoFile || !coverFile) {
      alert('Harap isi semua kolom wajib!')
      return
    }

    setLoading(true)
    console.log('Mulai submit...')

    const logoPath = `logos/${uuidv4()}_${logoFile.name}`
    const coverPath = `covers/${uuidv4()}_${coverFile.name}`

    console.log('Uploading files...')
    const { error: logoError } = await supabase.storage
      .from('franchisor-assets')
      .upload(logoPath, logoFile)

    const { error: coverError } = await supabase.storage
      .from('franchisor-assets')
      .upload(coverPath, coverFile)

    if (logoError || coverError) {
      console.log('Logo error:', logoError)
      console.log('Cover error:', coverError)
      alert('Gagal mengunggah logo atau cover.')
      setLoading(false)
      return
    }

    console.log('Files uploaded, inserting data to Supabase...')
    const { error } = await supabase.from('franchise_listings').insert({
      name,
      description,
      investment,
      operation_mode: operationMode,
      location,
      category,
      whatsapp,
      email,
      website,
      slug,
      logo_url: logoPath,
      cover_url: coverPath,
      legal_docs: hasLegalDocs ? legalDocs : null,
      notes,
      created_at: new Date(),
    })

    if (error) {
      console.log('Supabase insert error:', error)
      alert('Gagal mengirim listing.')
      setLoading(false)
    } else {
      console.log('Insert berhasil.')
      setSubmitted(true)
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <p className="mb-4 text-green-600 font-semibold">✅ Listing Berhasil Ditambahkan!</p>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded"
          onClick={() => router.push('/franchisor/manage-listings')}
        >
          Lihat Franchise Anda
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5">Tambah Listing Franchise Baru</h1>

      {/* input form tetap sama seperti sebelumnya */}

      <button className="bg-blue-600 text-white px-6 py-2 rounded" disabled={loading} onClick={handleSubmit}>
        {loading ? 'Mengirim...' : 'Tambah Listing'}
      </button>
    </div>
  )
}
