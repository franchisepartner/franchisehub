import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()

  const handleLoginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      console.error('Login error:', error.message)
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        // Optional: redirect to page before login
        const back = localStorage.getItem('redirectAfterLogin') || '/'
        router.replace(back)
      }
    }
    checkSession()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Login dengan Google</h2>
        <button
          onClick={handleLoginWithGoogle}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Masuk dengan Google
        </button>
      </div>
    </div>
  )
}
