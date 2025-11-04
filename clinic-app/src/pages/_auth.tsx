import type { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('jwt_token')
    const publicPaths = ['/login']
    
    if (!token && !publicPaths.includes(router.pathname)) {
      router.push('/login')
    } else if (token) {
      setIsAuthenticated(true)
    }
    
    setIsLoading(false)
  }, [router.pathname])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Public pages (login)
  if (router.pathname === '/login') {
    return <Component {...pageProps} />
  }

  // Protected pages
  return (
    <>
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/prescription" className="text-xl font-bold text-indigo-600">
              MediBridge
            </Link>
            <nav className="flex gap-3">
              <Link 
                href="/prescription" 
                className="px-3 py-2 rounded hover:bg-gray-100 transition"
              >
                Prescription
              </Link>
              <Link 
                href="/patients" 
                className="px-3 py-2 rounded hover:bg-gray-100 transition"
              >
                Patients
              </Link>
            </nav>
          </div>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <Component {...pageProps} />
    </>
  )
}