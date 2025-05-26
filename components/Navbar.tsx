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

  const handleLogin = () => {
    localStorage.setItem('redirectAfterLogin', router.asPath)
    router.push('/login')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    router.push('/')
  }

  const userGreeting = session ? 'Franchisee' : 'Calon Franchisee'

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex flex-row justify-between items-center gap-4 relative z-50">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">FranchiseHub</Link>

        {/* Search bar (menyesuaikan lebar) */}
        <input
          type="text"
          placeholder="Cari franchise..."
          className="flex-1 px-3 py-1 border rounded max-w-[400px]"
        />

        {/* Login + Sapaan */}
        <div className="flex flex-col text-right">
          {session ? (
            <button onClick={handleLogout} className="text-red-500 font-medium">Logout</button>
          ) : (
            <button onClick={handleLogin} className="text-blue-600 font-medium">Login</button>
          )}
          <p className="text-sm text-gray-500 italic">Halo, {userGreeting}!</p>
        </div>

        {/* Burger Menu tombol – selalu tampil */}
        <button
          onClick={() => setMenuOpen(true)}
          className="text-2xl"
          aria-label="Open menu"
        >
          ☰
        </button>
      </nav>

      {/* Burger Menu muncul dari kanan */}
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
