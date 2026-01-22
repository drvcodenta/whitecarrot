import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          Careers Page Builder
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Connect talent with opportunity through custom careers pages.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Job Seeker Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Seekers</h2>
            <p className="text-gray-600 mb-6">
              Discover your next career move. Browse open roles across various locations.
            </p>
            <Link
              href="/jobs"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>

          {/* Admin Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🛠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recruiters & Admins</h2>
            <p className="text-gray-600 mb-6">
              Manage your careers page, add job listings, and customize your brand.
            </p>
            <Link
              href="/admin/login"
              className="inline-block border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Sample companies: <code>/berlin/edit</code>, <code>/riyadh/edit</code></p>
        </div>
      </div>
    </div>
  );
}
