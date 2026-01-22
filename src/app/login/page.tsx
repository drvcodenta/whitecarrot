'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [companySlug, setCompanySlug] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isRegistering) {
            // Sign up
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            if (authData.user) {
                // Create company
                const { error: companyError } = await supabase
                    .from('companies')
                    .insert({
                        name: companyName,
                        slug: companySlug.toLowerCase().replace(/\s+/g, '-'),
                        owner_id: authData.user.id,
                        status: 'draft'
                    });

                if (companyError) {
                    setError('Account created, but company setup failed: ' + companyError.message);
                } else {
                    router.push(`/${companySlug}/edit`);
                }
            }
        } else {
            // Sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                const { data: company } = await supabase
                    .from('companies')
                    .select('slug')
                    .eq('owner_id', data.user.id)
                    .single();

                if (company) {
                    router.push(`/${company.slug}/edit`);
                } else {
                    router.push('/');
                }
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{isRegistering ? 'Recruiter Sign Up' : 'Recruiter Login'}</h1>
                    <p className="text-gray-500 mt-2">
                        {isRegistering ? 'Create your company careers page' : 'Manage your company careers page'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    {isRegistering && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Acme Inc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={companySlug}
                                    onChange={(e) => setCompanySlug(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="acme-inc"
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="recruiter@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-sm text-blue-600 hover:underline font-medium"
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
