'use client';

import { useState } from 'react';
import { Company, Job } from '@/lib/types';
import { JobCard } from './JobCard';
import { FilterDrawer } from './FilterDrawer';
import { MobileDrawer } from './MobileDrawer';

type Props = { company: Company; jobs: Job[] };

export function CareerPage({ company, jobs }: Props) {
    const [filtered, setFiltered] = useState(jobs);
    const { theme } = company;

    const locs = [...new Set(jobs.map(j => j.location).filter(Boolean))];
    const depts = [...new Set(jobs.map(j => j.department).filter(Boolean))];

    const handleFilter = (f: { location: string; jobType: string; department: string; search: string }) => {
        let r = jobs;
        if (f.location) r = r.filter(j => j.location === f.location);
        if (f.jobType) r = r.filter(j => j.job_type === f.jobType);
        if (f.department) r = r.filter(j => j.department === f.department);
        if (f.search) r = r.filter(j => j.title.toLowerCase().includes(f.search.toLowerCase()));
        setFiltered(r);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="w-10 h-10 rounded" />
                        ) : (
                            <div className="w-10 h-10 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: theme.accentColor }}>
                                {company.name[0]}
                            </div>
                        )}
                        <span className="font-semibold text-gray-800 hidden sm:block">{company.name}</span>
                    </div>
                    <MobileDrawer companyName={company.name} primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
                </div>
            </header>

            {/* Hero */}
            <section className="py-12 md:py-16 text-center text-white" style={{ backgroundColor: theme.secondaryColor }}>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">JOIN OUR TEAM</h1>
                <p className="text-blue-100">Building the future, together.</p>
            </section>

            {/* Life at Company */}
            <section className="max-w-4xl mx-auto px-4 py-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4">LIFE AT COMPANY</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center text-gray-400">
                            📷
                        </div>
                    ))}
                </div>
            </section>

            {/* Open Roles */}
            <main className="max-w-4xl mx-auto px-4 pb-8" id="open-roles">
                <h2 className="text-lg font-bold text-gray-800 mb-4">OPEN ROLES</h2>
                <FilterDrawer locations={locs} departments={depts} onFilter={handleFilter} />
                <div className="space-y-3" role="list">
                    {filtered.length > 0 ? (
                        filtered.map(job => <JobCard key={job.id} job={job} primaryColor={theme.primaryColor} />)
                    ) : (
                        <p className="text-gray-500 text-center py-8">No jobs match your filters.</p>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 py-8 border-t">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm mb-4">FOOTER</p>
                    <div className="flex justify-center gap-3 mb-4">
                        <a href="#" className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center" aria-label="Facebook">f</a>
                        <a href="#" className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center" aria-label="Twitter">X</a>
                        <a href="#" className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center" aria-label="LinkedIn">in</a>
                    </div>
                    <nav className="flex justify-center gap-4 text-sm text-gray-600">
                        <a href="#">About</a>
                        <a href="#">Contact</a>
                        <a href="#">Privacy</a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
