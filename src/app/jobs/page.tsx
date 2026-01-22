import { createServerSupabase } from '@/lib/supabase-server';
import { CareerPage } from '@/components/CareerPage';

export const dynamic = 'force-dynamic';

export default async function GlobalJobsPage() {
    const supabase = await createServerSupabase();

    // Fetch all active jobs
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);

    // Fetch the global company record (slug: jobs)
    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', 'jobs')
        .single();

    // Fallback if not yet initialized in DB
    const globalCompany = company || {
        id: 'global',
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
        owner_id: '',
        created_at: new Date().toISOString()
    };

    return <CareerPage company={globalCompany} jobs={jobs || []} />;
}
