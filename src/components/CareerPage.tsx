'use client';

import { useState } from 'react';
import { Company, Job } from '@/lib/types';
import { JobCard } from './JobCard';
import { JobFilters } from './JobFilters';
import { MobileDrawer } from './MobileDrawer';

type CareerPageProps = {
    company: Company;
    jobs: Job[];
};

export function CareerPage({ company, jobs }: CareerPageProps) {
    const [filteredJobs, setFilteredJobs] = useState(jobs);
    const { theme } = company;

    const locations = [...new Set(jobs.map((j) => j.location).filter(Boolean))];
    const departments = [...new Set(jobs.map((j) => j.department).filter(Boolean))];

    const handleFilter = (filters: { location: string; jobType: string; department: string; search: string }) => {
        let result = jobs;
        if (filters.location) result = result.filter((j) => j.location === filters.location);
        if (filters.jobType) result = result.filter((j) => j.job_type === filters.jobType);
        if (filters.department) result = result.filter((j) => j.department === filters.department);
        if (filters.search) result = result.filter((j) => j.title.toLowerCase().includes(filters.search.toLowerCase()));
        setFilteredJobs(result);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: theme.accentColor }}
                        >
                            {company.name[0]}
                        </div>
                        <span className="font-semibold text-gray-800 hidden sm:block">{company.name}</span>
                    </div>
                    <MobileDrawer
                        companyName={company.name}
                        primaryColor={theme.primaryColor}
                        secondaryColor={theme.secondaryColor}
                    />
                </div>
            </header>

            {/* Hero Banner */}
            <section
                className="py-16 text-center text-white"
                style={{ backgroundColor: theme.secondaryColor }}
            >
                <h1 className="text-3xl font-bold mb-2">JOIN OUR TEAM</h1>
                <p className="text-blue-100">Building the future, together.</p>
            </section>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Open Roles Section */}
                <section id="open-roles">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">OPEN ROLES</h2>

                    <JobFilters
                        locations={locations}
                        departments={departments}
                        onFilter={handleFilter}
                    />

                    <div className="space-y-3">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <JobCard key={job.id} job={job} primaryColor={theme.primaryColor} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No jobs match your filters.</p>
                        )}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 py-8 mt-12 border-t">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">FOOTER</p>
                    <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600">
                        <a href="#">About</a>
                        <a href="#">Contact</a>
                        <a href="#">Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
