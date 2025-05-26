import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

interface Props {
  open: boolean
  onClose: () => void
}

export default function BurgerMenu({ open, onClose }: Props) {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  const userGreeting = session
    ? `${session.user?.user_metadata?.full_name || 'User'}_${session.user?.user_metadata?.role || 'Franchisee'}`
    : 'Calon Franchisee'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onClose()
    location.href = '/'
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Menu</h2>
        <button onClick={onClose} className="text-xl font-bold">&times;</button>
      </div>

      <ul className="flex flex-col space-y-4 p-4 text-sm">
        <li><Link href="/" onClick={onClose}>Home</Link></li>
        <li><Link href="/blog" onClick={onClose}>Blog Franchaisor</Link></li>
        <li><Link href="/forum" onClick={onClose}>Forum Global</Link></li>
        <li><Link href="/announcement" onClick={onClose}>Pengumuman Administrator</Link></li>
        <li><Link href="/help" onClick={onClose}>Pusat Bantuan</Link></li>
        <li><Link href="/terms" onClick={onClose}>Syarat & Ketentuan</Link></li>
        <li><Link href="/privacy" onClick={onClose}>Kebijakan Privasi</Link></li>

        {session ? (
          <li>
            <button onClick={handleLogout} className="text-red-500 font-medium">Logout</button>
          </li>
        ) : (
          <li>
            <Link href="/login" onClick={onClose} className="text-blue-600 font-medium">Login</Link>
          </li>
        )}

        <li className="mt-2 text-sm italic text-gray-600">Halo, {userGreeting}!</li>
      </ul>
    </div>
  )
}
