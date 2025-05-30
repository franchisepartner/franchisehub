// pages/franchisor/index.tsx
import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function FranchisorPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUserAndProfile = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) return

      setUser(authData.user)

      // Cek apakah profil sudah ada
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Gagal memeriksa profil:', profileError)
        return
      }

      if (!profiles || profiles.length === 0) {
        // Buat profil baru default dengan role franchisee
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: authData.user.id, role: 'franchisee' })

        if (insertError) {
          console.error('Gagal membuat profil default:', insertError)
        }
      }
    }

    checkUserAndProfile()
  }, [])

  const handlePaymentComplete = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'franchisor' })
      .eq('id', user.id)

    if (error) {
      console.error('Gagal mengubah role:', error)
    } else {
      alert('Berhasil upgrade ke Franchisor.')
      router.push('/')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Selesaikan Pembayaran</h1>
      <p className="mb-4 text-gray-700">
        Klik tombol di bawah ini untuk menyelesaikan proses menjadi Franchisor.
      </p>
      <form onSubmit={handlePaymentComplete}>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Login sebagai Franchisor
        </button>
      </form>
    </div>
  )
}
