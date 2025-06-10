import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'
import { FiLock, FiLoader } from 'react-icons/fi'

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
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session?.user) {
        await checkStatus(session.user)
        await fetchAdminMessage(session.user.id)
      }
    }
    init()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        checkStatus(session.user)
        fetchAdminMessage(session.user.id)
      } else {
        setStatus('idle')
        setAdminMessage('')
      }
    })
    return () => listener?.subscription.unsubscribe()
    // eslint-disable-next-line
  }, [])

  // Cek status pengajuan franchisor
  const checkStatus = async (user: any) => {
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
    const { data } = await supabase
      .from('franchisor_applications')
      .select('status')
      .eq('user_id', user.id)
      .single()
    if (data?.status === 'pending') setStatus('pending')
    else if (data?.status === 'approved') setStatus('approved')
    else setStatus('idle')
  }

  // Ambil pesan admin terakhir dari tabel morgan_messages
  const fetchAdminMessage = async (userId: string) => {
    const { data } = await supabase
      .from('morgan_messages')
      .select('message')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    setAdminMessage(data?.message || '')
  }

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
      status: 'pending'
    })

    if (error) {
      alert('Gagal mengirim pengajuan.')
    } else {
      setStatus('pending')
      await fetchAdminMessage(user.id)
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

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-cyan-50 flex items-center justify-center py-8">
      <div className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-xl px-8 py-10 border border-blue-100">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 tracking-tight text-center">
          Form Pengajuan <span className="text-cyan-600">Franchisor</span>
        </h1>
        <p className="text-center text-gray-500 mb-8">Daftarkan usahamu & tingkatkan peluang sukses!</p>

        {/* Kolom pesan admin */}
        {adminMessage && (
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-xl mb-6 shadow-sm">
            <strong>Pesan Administrator:</strong>
            <div className="mt-1 whitespace-pre-line">{adminMessage}</div>
          </div>
        )}

        {/* Belum login */}
        {!session ? (
          <div className="flex flex-col items-center justify-center py-14">
            <FiLock size={56} className="text-blue-400 mb-4" />
            <p className="text-lg text-gray-700 mb-4 text-center font-semibold">
              Anda harus login untuk mengajukan menjadi Franchisor.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-7 py-3 rounded-full shadow-xl font-bold text-lg flex items-center gap-2 transition"
            >
              <FiLock className="inline mr-1" /> Login untuk Melanjutkan
            </button>
          </div>
        ) : status === 'approved' ? (
          <div className="bg-green-50 border border-green-400 p-5 rounded-xl mb-6 shadow">
            <p className="text-green-700 font-semibold mb-3 text-center">
              ✅ Pendaftaran anda telah <span className="font-bold">disetujui Administrator</span> FranchiseNusantara.<br />
              Silahkan lakukan pembayaran paket pilihan anda untuk mendapatkan akses role Franchisor.
            </p>
            <button
              onClick={handlePaymentComplete}
              className="block mx-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-7 py-2.5 rounded-full font-bold shadow-lg transition"
            >
              Login sebagai Franchisor
            </button>
          </div>
        ) : status === 'pending' ? (
          <div className="mb-6 flex flex-col items-center gap-2">
            <button className="bg-gray-400 text-white w-full py-3 rounded-lg font-bold cursor-not-allowed" disabled>
              <FiLoader className="inline mr-2 animate-spin" /> Sedang Diperiksa Administrator
            </button>
            <span className="text-sm text-gray-400">Mohon tunggu, pengajuan anda sedang diproses.</span>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
            autoComplete="off"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <input className="w-full border px-4 py-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base font-semibold" placeholder="Nama Brand" value={brand_name} onChange={(e) => setBrandName(e.target.value)} />
              <input className="w-full border px-4 py-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base" placeholder="Kategori Usaha" value={category} onChange={(e) => setCategory(e.target.value)} />
              <input className="w-full border px-4 py-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base" placeholder="Lokasi Usaha" value={location} onChange={(e) => setLocation(e.target.value)} />
              <input className="w-full border px-4 py-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base" placeholder="Email Aktif" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="w-full border px-4 py-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base" placeholder="Nomor WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              <input className="w-full border px-4 py-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base" placeholder="Link Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <textarea className="w-full border px-4 py-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base" rows={3} placeholder="Deskripsi Usaha" value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Upload Logo Usaha</label>
                <input type="file" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="w-full border px-2 py-2 rounded bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Upload Foto KTP</label>
                <input type="file" onChange={(e) => setKtpFile(e.target.files?.[0] || null)} className="w-full border px-2 py-2 rounded bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold" />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-lg font-bold rounded-full transition shadow-lg 
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white'}`}
              disabled={loading}
            >
              {loading ? <span className="flex items-center justify-center"><FiLoader className="animate-spin mr-2" /> Mengirim...</span> : 'Kirim Pengajuan'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
