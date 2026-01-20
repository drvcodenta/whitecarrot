import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Careers Page Builder</h1>
        <p className="text-gray-600 mb-8">Multi-tenant careers page builder with Supabase</p>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm max-w-md mx-auto">
            <h2 className="font-semibold mb-2">Routes:</h2>
            <ul className="text-left text-sm text-gray-600 space-y-2">
              <li><code>/[slug]/careers</code> - Public careers page</li>
              <li><code>/[slug]/edit</code> - Editor (auth required)</li>
              <li><code>/[slug]/preview</code> - Preview draft</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            Set up your <code>.env.local</code> with Supabase credentials to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
