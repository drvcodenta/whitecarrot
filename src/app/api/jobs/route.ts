import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    let query = supabase.from('jobs').select('*');
    if (companyId) query = query.eq('company_id', companyId);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    const supabase = await createServerSupabase();
    const body = await request.json();

    const { data, error } = await supabase
        .from('jobs')
        .insert(body)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
