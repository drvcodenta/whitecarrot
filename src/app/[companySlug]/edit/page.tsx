import { notFound, redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { Editor } from '@/components/Editor';

export default async function EditPage({
    params,
}: {
    params: Promise<{ companySlug: string }>;
}) {
    const { companySlug } = await params;
    const supabase = await createServerSupabase();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Fetch company and strictly check ownership
    const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', companySlug)
        .eq('owner_id', user.id) // Ensure the logged-in user is the actual recruiter for this company
        .single();

    if (error || !company) {
        // If company exists but owned by someone else, or doesn't exist at all
        redirect('/login');
    }

    return <Editor company={company} />;
}
