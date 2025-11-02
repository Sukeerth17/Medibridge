export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to MediBridge</h1>
        <p className="mb-6 text-gray-600">Your prescription app is ready!</p>

        {/* use a normal link (works) but Next Link is used in the header for client navigation */}
        <a
          href="/prescription"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Go to Prescription Page
        </a>
      </div>
    </main>
  )
}

