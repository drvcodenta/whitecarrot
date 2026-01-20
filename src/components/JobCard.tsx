import { Job } from '@/lib/types';

const badgeColors: Record<string, string> = {
    'full-time': 'bg-green-500',
    'part-time': 'bg-orange-500',
    'remote': 'bg-blue-500',
    'contract': 'bg-purple-500',
};

export function JobCard({ job, primaryColor }: { job: Job; primaryColor?: string }) {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <span>📍</span> {job.location}
                </p>
                <span className={`inline-block mt-2 text-xs text-white px-2 py-1 rounded-full ${badgeColors[job.job_type] || 'bg-gray-500'}`}>
                    {job.job_type}
                </span>
            </div>
            <button
                className="px-4 py-2 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor || '#1D4ED8' }}
            >
                Apply
            </button>
        </div>
    );
}
