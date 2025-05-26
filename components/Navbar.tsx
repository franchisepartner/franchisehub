import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)

      // Optional: redirect setelah login ke halaman sebelumnya
      const redirectTo = localStorage.getItem('redirectAfterLogin')
      if (data.session && redirectTo) {
        router.replace(redirectTo)
        localStorage.removeItem('redirectAfterLogin')
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    router.push('/') // kembali ke home setelah logout
  }

  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">FranchiseHub</h1>

      <div className="flex items-center gap-4">
        {session ? (
          <button onClick={handleLogout} className="text-red-500">Logout</button>
        ) : (
          <button
            onClick={() => {
              localStorage.setItem('redirectAfterLogin', router.asPath)
              router.push('/login')
            }}
            className="text-blue-600"
          >
            Login
          </button>
        )}
        <p className="text-sm text-gray-600 italic">
          Halo, {session ? 'Franchisee' : 'Calon Franchisee'}!
        </p>
      </div>
    </nav>
  )
}
