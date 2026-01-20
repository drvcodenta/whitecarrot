import { Job } from '@/lib/types';

const BADGES: Record<string, string> = {
    'full-time': 'bg-green-500',
    'part-time': 'bg-orange-500',
    'remote': 'bg-blue-500',
    'contract': 'bg-purple-500',
    'hybrid': 'bg-teal-500',
};

export function JobCard({ job, primaryColor }: { job: Job; primaryColor?: string }) {
    return (
        <article
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center min-h-[100px]"
            tabIndex={0}
            role="article"
            aria-label={`${job.title} at ${job.location}`}
        >
            <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <span aria-hidden="true">📍</span>
                    <span>{job.location}</span>
                </p>
                <span className={`inline-block mt-2 text-xs text-white px-3 py-1 rounded-full ${BADGES[job.job_type] || 'bg-gray-500'}`}>
                    {job.job_type}
                </span>
            </div>
            <div className="border-l border-gray-200 h-12 mx-4 hidden sm:block" aria-hidden="true" />
            <button
                className="px-6 py-3 rounded-full text-white text-sm font-semibold min-w-[80px] min-h-[44px]"
                style={{ backgroundColor: primaryColor || '#1D4ED8' }}
                aria-label={`Apply for ${job.title}`}
            >
                Apply
            </button>
        </article>
    );
}
