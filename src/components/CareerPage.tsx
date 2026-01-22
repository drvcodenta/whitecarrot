'use client';

import { useState } from 'react';
import { Company, Job, Section } from '@/lib/types';
import { JobCard } from './JobCard';
import { FilterDrawer } from './FilterDrawer';
import { MobileDrawer } from './MobileDrawer';
import { getYouTubeVideoId } from '@/lib/utils';

type Props = { company: Company; jobs: Job[] };

export function CareerPage({ company, jobs }: Props) {
    const [filtered, setFiltered] = useState(jobs);
    const { theme, sections } = company;

    const locs = [...new Set(jobs.map(j => j.location).filter(Boolean))];
    const depts = [...new Set(jobs.map(j => j.department).filter(Boolean))];

    const handleFilter = (f: {
        location: string;
        jobType: string;
        department: string;
        workPolicy: string;
        employmentType: string;
        experienceLevel: string;
        search: string
    }) => {
        // Redirection logic for global jobs page
        if (company.slug === 'jobs' && f.location) {
            // Map location to slug (simple slugify for now)
            const targetSlug = f.location.split(',')[0].toLowerCase().trim();
            window.location.href = `/${targetSlug}/careers`;
            return;
        }

        let r = jobs;
        if (f.location) r = r.filter(j => j.location === f.location);
        if (f.jobType) r = r.filter(j => j.job_type === f.jobType);
        if (f.department) r = r.filter(j => j.department === f.department);
        if (f.workPolicy) r = r.filter(j => j.work_policy === f.workPolicy);
        if (f.employmentType) r = r.filter(j => j.employment_type === f.employmentType);
        if (f.experienceLevel) r = r.filter(j => j.experience_level === f.experienceLevel);
        if (f.search) r = r.filter(j => j.title.toLowerCase().includes(f.search.toLowerCase()));
        setFiltered(r);
    };

    const hasSection = (type: Section['type']) => sections?.some(s => s.type === type);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - always shown */}
            <header className="sticky top-0 z-30 bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="w-10 h-10 rounded" />
                        ) : (
                            <div className="w-10 h-10 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: theme.primaryColor }}>
                                {company.name[0]}
                            </div>
                        )}
                        <span className="font-semibold text-gray-800 hidden sm:block">{company.name}</span>
                    </div>
                    <MobileDrawer companyName={company.name} primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
                </div>
            </header>

            {/* Render sections in order from database */}
            {sections?.map(s => (
                <div key={s.id}>
                    {s.type === 'header' && (
                        <section className="relative overflow-hidden text-center text-white min-h-[300px] flex flex-col items-center justify-center p-8" style={{ backgroundColor: theme.secondaryColor }}>
                            {company.banner_url && (
                                <img src={company.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                            )}
                            <div className="relative z-10">
                                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                                    {(s.content?.title as string) || 'JOIN OUR TEAM'}
                                </h1>
                                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                                    {(s.content?.subtitle as string) || company.seo_meta?.title || 'Building the future, together.'}
                                </p>
                            </div>
                        </section>
                    )}

                    {s.type === 'about' && (
                        <section className="max-w-4xl mx-auto px-4 py-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">ABOUT US</h2>
                            <p className="text-gray-600">Welcome to {company.name}. We're building the future, together.</p>
                        </section>
                    )}

                    {s.type === 'life' && (
                        <section className="max-w-4xl mx-auto px-4 py-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase">Life at {company.name}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {(s.content?.images as string[] || [null, null, null]).slice(0, 3).map((img, i) => (
                                    <div key={i} className="bg-gray-100 rounded-xl aspect-square overflow-hidden shadow-sm border border-gray-200 flex items-center justify-center text-gray-400">
                                        {img ? (
                                            <img src={img} alt={`Life at ${company.name} ${i + 1}`} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 opacity-50">
                                                <span className="text-2xl">📷</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {s.type === 'team' && (
                        <section className="max-w-4xl mx-auto px-4 py-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">OUR TEAM</h2>
                            <div className="flex gap-4 flex-wrap">
                                {['CEO', 'CTO', 'Designer'].map(role => (
                                    <div key={role} className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-2">👤</div>
                                        <p className="text-sm text-gray-600">{role}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {s.type === 'values' && (
                        <section className="max-w-4xl mx-auto px-4 py-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">OUR VALUES</h2>
                            <div className="flex gap-3 flex-wrap">
                                {['Innovation', 'Integrity', 'Growth', 'Community'].map(v => (
                                    <span key={v} className="px-4 py-2 rounded-full text-sm" style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}>{v}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {s.type === 'jobs' && (
                        <main className="max-w-4xl mx-auto px-4 py-8" id="open-roles">
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
                    )}

                    {s.type === 'footer' && (
                        <footer className="bg-gray-100 py-8 border-t">
                            <div className="max-w-4xl mx-auto px-4 text-center">
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
                    )}
                    {s.type === 'video' && (
                        <section className="max-w-4xl mx-auto px-4 py-8">
                            {(() => {
                                const videoId = getYouTubeVideoId(s.content?.youtubeUrl as string);
                                if (!videoId) return null;
                                return (
                                    <>
                                        <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase">Company Video</h2>
                                        <div className="relative w-full overflow-hidden rounded-xl shadow-lg border bg-black" style={{ paddingBottom: '56.25%' }}>
                                            <iframe
                                                className="absolute top-0 left-0 w-full h-full"
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title="Company Video"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    </>
                                );
                            })()}
                        </section>
                    )}
                </div>
            ))}

            {/* Fallback if no sections defined */}
            {(!sections || sections.length === 0) && (
                <>
                    <section className="py-12 md:py-16 text-center text-white" style={{ backgroundColor: theme.secondaryColor }}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">JOIN OUR TEAM</h1>
                        <p className="opacity-80">Building the future, together.</p>
                    </section>
                    <main className="max-w-4xl mx-auto px-4 py-8" id="open-roles">
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
                </>
            )}
        </div>
    );
}
