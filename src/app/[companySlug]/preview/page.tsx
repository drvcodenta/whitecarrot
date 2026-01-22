import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { CareerPage } from '@/components/CareerPage';

export default async function PreviewPage({
    params,
}: {
    params: Promise<{ companySlug: string }>;
}) {
    const { companySlug } = await params;
    const supabase = await createServerSupabase();

    // Fetch company (any status for preview)
    const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', companySlug)
        .single();

    if (!company || error) notFound();

    // Fetch jobs for this company
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company.id);

    return (
        <div className="relative">
            <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm font-bold sticky top-0 z-50 border-b border-yellow-200">
                PREVIEW MODE • This is how your page will look to candidates
            </div>
            <CareerPage company={company} jobs={jobs || []} />
        </div>
    );
}
