import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables!');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface JobCSVRow {
    title: string;
    work_policy: string;
    location: string;
    department: string;
    employment_type: string;
    experience_level: string;
    job_type: string;
    salary_range: string;
    job_slug: string;
    posted_days_ago: string;
}

function parseCSV(content: string): JobCSVRow[] {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''));

    const rows: JobCSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (const char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/\r/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim().replace(/\r/g, ''));

        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        rows.push(row as unknown as JobCSVRow);
    }

    return rows;
}

function getCompanyFromLocation(location: string): { slug: string; name: string } {
    // Extract city name from location for company slug
    const city = location.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
    const countryPart = location.split(',').slice(1).join(',').trim();

    return {
        slug: city,
        name: `${location.split(',')[0].trim()} Office`
    };
}

async function seed() {
    console.log('🌱 Starting database seed...\n');

    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'data', 'jobs.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const jobs = parseCSV(csvContent);

    console.log(`📄 Found ${jobs.length} jobs in CSV\n`);

    // Extract unique locations to create companies
    const uniqueLocations = [...new Set(jobs.map(j => j.location))];
    console.log(`🏢 Creating ${uniqueLocations.length} companies...\n`);

    const companyMap: Record<string, string> = {}; // location -> company_id

    for (const location of uniqueLocations) {
        const { slug, name } = getCompanyFromLocation(location);

        // Check if company already exists
        const { data: existingCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('slug', slug)
            .single();

        if (existingCompany) {
            companyMap[location] = existingCompany.id;
            console.log(`  ⏭️  Company "${slug}" already exists`);
        } else {
            const { data: newCompany, error } = await supabase
                .from('companies')
                .insert({
                    slug,
                    name,
                    status: 'published',
                    theme: {
                        primaryColor: '#1D4ED8',
                        secondaryColor: '#1E3A5F',
                        accentColor: '#0EA5E9'
                    },
                    sections: []
                })
                .select('id')
                .single();

            if (error) {
                console.error(`  ❌ Failed to create company "${slug}":`, error.message);
                continue;
            }

            companyMap[location] = newCompany.id;
            console.log(`  ✅ Created company: ${name} (${slug})`);
        }
    }

    console.log(`\n💼 Inserting ${jobs.length} jobs...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const job of jobs) {
        const companyId = companyMap[job.location];

        if (!companyId) {
            console.error(`  ❌ No company found for location: ${job.location}`);
            errorCount++;
            continue;
        }

        const { error } = await supabase
            .from('jobs')
            .insert({
                company_id: companyId,
                title: job.title,
                location: job.location,
                work_policy: job.work_policy,
                department: job.department,
                employment_type: job.employment_type,
                experience_level: job.experience_level,
                job_type: job.job_type,
                salary_range: job.salary_range,
                job_slug: job.job_slug,
                is_active: true
            });

        if (error) {
            // Handle duplicate job_slug by appending a random suffix
            if (error.code === '23505') {
                const uniqueSlug = `${job.job_slug}-${Date.now()}`;
                const { error: retryError } = await supabase
                    .from('jobs')
                    .insert({
                        company_id: companyId,
                        title: job.title,
                        location: job.location,
                        work_policy: job.work_policy,
                        department: job.department,
                        employment_type: job.employment_type,
                        experience_level: job.experience_level,
                        job_type: job.job_type,
                        salary_range: job.salary_range,
                        job_slug: uniqueSlug,
                        is_active: true
                    });

                if (retryError) {
                    console.error(`  ❌ Failed to insert job "${job.title}":`, retryError.message);
                    errorCount++;
                } else {
                    successCount++;
                }
            } else {
                console.error(`  ❌ Failed to insert job "${job.title}":`, error.message);
                errorCount++;
            }
        } else {
            successCount++;
        }
    }

    console.log(`\n✨ Seed complete!`);
    console.log(`   ✅ ${successCount} jobs inserted successfully`);
    if (errorCount > 0) {
        console.log(`   ❌ ${errorCount} jobs failed`);
    }

    console.log(`\n🚀 You can now visit:`);
    for (const location of uniqueLocations.slice(0, 5)) {
        const { slug } = getCompanyFromLocation(location);
        console.log(`   http://localhost:3000/${slug}/careers`);
    }
    console.log(`   ... and more!`);
}

seed().catch(console.error);
