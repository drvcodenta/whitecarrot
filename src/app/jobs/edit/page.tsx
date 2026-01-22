import { notFound, redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { Editor } from '@/components/Editor';

export default async function GlobalEditPage() {
    const supabase = await createServerSupabase();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/admin/login');
    }

    // Fetch the global company record (slug: jobs)
    let { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', 'jobs')
        .single();

    // If it doesn't exist, create a default one
    if (!company || error) {
        const { data: newCompany, error: createError } = await supabase
            .from('companies')
            .insert({
                slug: 'jobs',
                name: 'WhiteCarrot Careers',
                status: 'published',
                theme: {
                    primaryColor: '#1D4ED8',
                    secondaryColor: '#1E3A5F',
                    accentColor: '#0EA5E9',
                },
                sections: [
                    { id: 'h1', type: 'header', order: 0, content: {} },
                    { id: 'j1', type: 'jobs', order: 1, content: {} },
                    { id: 'f1', type: 'footer', order: 2, content: {} }
                ],
                owner_id: user.id
            })
            .select()
            .single();

        if (createError) {
            return (
                <div className="p-8 text-center">
                    <h1 className="text-xl font-bold text-red-600">Failed to initialize global careers page</h1>
                    <p className="text-gray-600 mt-2">{createError.message}</p>
                </div>
            );
        }
        company = newCompany;
    }

    return <Editor company={company} />;
}
