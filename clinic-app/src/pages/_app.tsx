import type { AppProps } from 'next/app'
import Link from 'next/link'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">MediBridge</Link>
          <nav className="flex gap-3">
            <Link href="/" className="px-3 py-1 rounded hover:bg-gray-100">Home</Link>
            <Link href="/patients" className="px-3 py-1 rounded hover:bg-gray-100">Patients</Link>
            <Link href="/prescription" className="px-3 py-1 rounded hover:bg-gray-100">Prescription</Link>
          </nav>
        </div>
      </header>

      <Component {...pageProps} />
    </>
  )
}
