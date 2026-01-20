import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { Editor } from '@/components/Editor';

export default async function EditPage({
    params,
}: {
    params: Promise<{ companySlug: string }>;
}) {
    const { companySlug } = await params;
    const supabase = await createServerSupabase();

    // Fetch company (RLS will check ownership)
    const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', companySlug)
        .single();

    if (!company || error) notFound();

    return <Editor company={company} />;
}
