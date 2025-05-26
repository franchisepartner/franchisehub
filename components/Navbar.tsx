import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import BurgerMenu from './BurgerMenu'

export default function Navbar() {
  const [session, setSession] = useState<any>(null)
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

  return (
    <>
      <nav className="w-full bg-white shadow-md px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-2 relative z-50">
        {/* Kiri: Logo + ☰ */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link href="/" className="text-xl font-bold text-blue-600">FranchiseHub</Link>
          <button
            onClick={() => {
              const menu = document.getElementById('burger-menu')
              if (menu) {
                menu.classList.toggle('translate-x-full')
              }
            }}
            className="text-2xl md:hidden"
          >
            ☰
          </button>
        </div>

        {/* Tengah: Search */}
        <input
          type="text"
          placeholder="Cari franchise..."
          className="px-3 py-1 border rounded w-full md:w-64"
        />

        {/* Kanan: Login / Logout + Sapaan */}
        <div className="flex flex-col md:flex-row items-center gap-2">
          {session ? (
            <button onClick={handleLogout} className="text-red-500 font-medium">Logout</button>
          ) : (
            <button onClick={handleLogin} className="text-blue-600 font-medium">Login</button>
          )}
          <p className="text-sm text-gray-500 italic">
            Halo, {session ? 'Franchisee' : 'Calon Franchisee'}!
          </p>
        </div>
      </nav>

      {/* Burger Menu slide-in */}
      <BurgerMenu />
    </>
  )
}
