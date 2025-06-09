// pages/franchisor/index.tsx

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'
import { FiLock } from 'react-icons/fi'

export default function FranchisorForm() {
  const [brand_name, setBrandName] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [website, setWebsite] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'approved'>('idle')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [adminMessage, setAdminMessage] = useState<string>('')
  const [pendingDeleted, setPendingDeleted] = useState(false)
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Cek login & status pengajuan saat mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session?.user) {
        await checkStatus(session.user)
      }
    }
    init()
    // Listen auth state
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) checkStatus(session.user)
      else {
        setStatus('idle')
        setAdminMessage('')
      }
    })
    return () => listener?.subscription.unsubscribe()
    // eslint-disable-next-line
  }, [])

  // Cek status pengajuan franchisor + admin message
  const checkStatus = async (user: any) => {
    // Cek & buat profil jika belum ada
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile && !profileError) {
      await supabase.from('profiles').insert({
        id: user.id,
        role: 'franchisee'
      })
    }
    // Cek status pengajuan
    const { data } = await supabase
      .from('franchisor_applications')
      .select('status, admin_message')
      .eq('user_id', user.id)
      .single()
    if (data?.status === 'pending') setStatus('pending')
    else if (data?.status === 'approved') setStatus('approved')
    else setStatus('idle')
    setAdminMessage(data?.admin_message || '')
  }

  // Hapus otomatis pengajuan jika pending+ada pesan admin (dalam 60 detik)
  useEffect(() => {
    if (
      session?.user &&
      status === 'pending' &&
      adminMessage &&
      !pendingDeleted
    ) {
      // Jalankan timer hapus data setelah 60 detik
      deleteTimeoutRef.current = setTimeout(async () => {
        await supabase
          .from('franchisor_applications')
          .delete()
          .eq('user_id', session.user.id)
        setPendingDeleted(true)
        setStatus('idle')
        setAdminMessage('')
      }, 60000)
      return () => {
        if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current)
      }
    }
    // eslint-disable-next-line
  }, [session, status, adminMessage, pendingDeleted])

  // Submit pengajuan
  const handleSubmit = async () => {
    if (
      !brand_name || !description || !email || !whatsapp || !website ||
      !category || !location || !logoFile || !ktpFile
    ) {
      alert('Harap isi semua kolom!')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const logoPath = `logos/${uuidv4()}_${logoFile.name}`
    const ktpPath = `ktps/${uuidv4()}_${ktpFile.name}`

    const { error: logoError } = await supabase.storage
      .from('franchisor-assets')
      .upload(logoPath, logoFile)

    const { error: ktpError } = await supabase.storage
      .from('franchisor-assets')
      .upload(ktpPath, ktpFile)

    if (logoError || ktpError) {
      alert('Gagal mengunggah gambar.')
      setLoading(false)
      return
    }

    // Hapus pengajuan lama jika ada
    await supabase
      .from('franchisor_applications')
      .delete()
      .eq('user_id', user.id)

    const { error } = await supabase.from('franchisor_applications').insert({
      user_id: user.id,
      email,
      brand_name,
      description,
      category,
      location,
      website,
      whatsapp_number: whatsapp,
      logo_url: logoPath,
      ktp_url: ktpPath,
      submitted_at: new Date(),
      status: 'pending',
      admin_message: null // reset message setiap submit
    })

    if (error) {
      alert('Gagal mengirim pengajuan.')
    } else {
      setStatus('pending')
      setAdminMessage('')
      setPendingDeleted(false)
    }

    setLoading(false)
  }

  // Ubah role jadi franchisor setelah payment
  const handlePaymentComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'franchisor' })
      .eq('id', user.id)

    if (error) {
      alert(`Gagal mengubah role: ${error.message}`)
    } else {
      router.push('/')
    }
  }

  // ==== UI ====
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Form Pengajuan Jadi Franchisor</h1>

      {/* Belum login */}
      {!session ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FiLock size={56} className="text-blue-500 mb-4" />
          <p className="text-lg text-gray-700 mb-4 text-center font-medium">
            Anda harus login untuk mengajukan menjadi Franchisor.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow font-bold text-lg flex items-center gap-2"
          >
            <FiLock className="inline mr-1" /> Login untuk Melanjutkan
          </button>
        </div>
      ) : status === 'approved' ? (
        <div className="bg-green-100 border border-green-300 p-4 rounded mb-4">
          <p className="text-green-700 font-medium mb-2">
            ✅ Pendaftaran anda telah disetujui Administrator FranchiseHub.
            <br />
            Silahkan lakukan pembayaran paket pilihan anda untuk mendapatkan akses role Franchisor.
          </p>
          <button
            onClick={handlePaymentComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            Login sebagai Franchisor
          </button>
        </div>
      ) : status === 'pending' && !pendingDeleted ? (
        <>
          <button className="bg-gray-400 text-white w-full py-2 rounded cursor-not-allowed mb-4" disabled>
            Sedang Diperiksa Administrator
          </button>
          {adminMessage && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded mb-4">
              <strong>Pesan Administrator:</strong>
              <div className="mt-1 whitespace-pre-line">{adminMessage}</div>
              <div className="mt-2 text-xs text-gray-600 font-semibold">
                Data pengajuan Anda akan dihapus otomatis dalam 60 detik.<br />
                Silakan perbaiki data dan ajukan ulang.
              </div>
            </div>
          )}
        </>
      ) : status === 'pending' && pendingDeleted ? (
        <div className="bg-yellow-100 border border-yellow-300 p-4 rounded mb-4 text-yellow-700">
          Data pengajuan telah dihapus otomatis. Silakan mengajukan ulang.
        </div>
      ) : (
        <>
          {adminMessage && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded mb-4">
              <strong>Pesan Administrator:</strong>
              <div className="mt-1 whitespace-pre-line">{adminMessage}</div>
            </div>
          )}
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Nama Brand" value={brand_name} onChange={(e) => setBrandName(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Deskripsi Usaha" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Email Aktif" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Nomor WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Link Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Kategori Usaha" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-4" placeholder="Lokasi Usaha" value={location} onChange={(e) => setLocation(e.target.value)} />

          <div className="mb-4">
            <label>Upload Logo Usaha</label>
            <input type="file" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </div>

          <div className="mb-6">
            <label>Upload Foto KTP</label>
            <input type="file" onChange={(e) => setKtpFile(e.target.files?.[0] || null)} />
          </div>

          <button
            onClick={handleSubmit}
            className={`w-full py-2 text-white rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
            disabled={loading}
          >
            {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </>
      )}
    </div>
  )
}
