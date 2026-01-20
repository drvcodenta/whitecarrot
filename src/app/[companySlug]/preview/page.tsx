import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { CareerPage } from '@/components/CareerPage';

// Preview page - same as careers but shows draft content
export default async function PreviewPage({
    params,
}: {
    params: Promise<{ companySlug: string }>;
}) {
    const { companySlug } = await params;
    const supabase = await createServerSupabase();

    // Fetch company regardless of status (for preview)
    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', companySlug)
        .single();

    if (!company) notFound();

    // Fetch all jobs
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company.id);

    return (
        <div>
            <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm font-medium">
                Preview Mode - This is how your page will look when published
            </div>
            <CareerPage company={company} jobs={jobs || []} />
        </div>
    );
}
