'use client';

import { useState } from 'react';

type FilterProps = {
    locations: string[];
    departments: string[];
    onFilter: (filters: { location: string; jobType: string; department: string; search: string }) => void;
};

export function JobFilters({ locations, departments, onFilter }: FilterProps) {
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('');
    const [department, setDepartment] = useState('');
    const [search, setSearch] = useState('');

    const handleChange = (key: string, value: string) => {
        const newFilters = { location, jobType, department, search, [key]: value };
        if (key === 'location') setLocation(value);
        if (key === 'jobType') setJobType(value);
        if (key === 'department') setDepartment(value);
        if (key === 'search') setSearch(value);
        onFilter(newFilters);
    };

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <select
                value={location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="px-3 py-2 rounded-full border border-gray-200 text-sm bg-white"
            >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                ))}
            </select>

            <select
                value={jobType}
                onChange={(e) => handleChange('jobType', e.target.value)}
                className="px-3 py-2 rounded-full border border-gray-200 text-sm bg-white"
            >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
            </select>

            <select
                value={department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="px-3 py-2 rounded-full border border-gray-200 text-sm bg-white"
            >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                ))}
            </select>

            <input
                type="text"
                placeholder="Search job titles..."
                value={search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="px-3 py-2 rounded-full border border-gray-200 text-sm bg-white flex-1 min-w-[200px]"
            />
        </div>
    );
}
