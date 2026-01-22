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
        redirect('/admin/login');
    }

    // Fetch company (RLS will check ownership)
    const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', companySlug)
        .single();

    if (!company || error) notFound();

    return <Editor company={company} />;
}
