import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import BurgerMenu from './BurgerMenu'

export default function Navbar() {
  const [session, setSession] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  const userGreeting = session ? 'Franchisee' : 'Calon Franchisee'

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex flex-wrap items-center justify-between gap-2 relative z-50">
        {/* Logo dan tombol burger */}
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="text-xl font-bold text-blue-600">FranchiseHub</Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-2xl"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Cari franchise..."
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {/* Sapaan */}
        <div className="w-full flex justify-end items-center text-sm">
          <p className="italic text-gray-500">Halo, {userGreeting}!</p>
        </div>
      </nav>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
