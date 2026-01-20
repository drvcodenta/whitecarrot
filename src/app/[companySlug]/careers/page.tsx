import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { CareerPage } from '@/components/CareerPage';

// Disable caching so changes appear immediately after publishing
export const dynamic = 'force-dynamic';

export default async function CareersPage({
    params,
}: {
    params: Promise<{ companySlug: string }>;
}) {
    const { companySlug } = await params;
    const supabase = await createServerSupabase();

    // Fetch published company
    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', companySlug)
        .eq('status', 'published')
        .single();

    if (!company) notFound();

    // Fetch active jobs
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true);

    return <CareerPage company={company} jobs={jobs || []} />;
}
