'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function fetchCompanies() {
            // Fetch companies that don't have an owner yet
            const { data } = await supabase
                .from('companies')
                .select('id, name, slug')
                .is('owner_id', null);
            if (data) setCompanies(data);
        }
        fetchCompanies();
    }, [supabase]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isRegistering) {
            if (!selectedCompanyId) {
                setError('Please select a company to manage.');
                setLoading(false);
                return;
            }

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
                // Update company with owner_id
                const { data: company, error: companyError } = await supabase
                    .from('companies')
                    .update({ owner_id: authData.user.id })
                    .eq('id', selectedCompanyId)
                    .select('slug')
                    .single();

                if (companyError) {
                    setError('Account created, but company association failed: ' + companyError.message);
                } else {
                    router.push(`/${company.slug}/edit`);
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
                        {isRegistering ? 'Choose a company to manage' : 'Manage your company careers page'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
                            <select
                                required
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white transition-all cursor-pointer"
                            >
                                <option value="">-- Select a company --</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.slug})</option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-gray-500 italic">Only showing companies without an active recruiter.</p>
                        </div>
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
