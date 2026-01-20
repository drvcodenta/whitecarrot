'use client';

import { useState, useEffect, useRef } from 'react';

type Props = {
    locations: string[];
    departments: string[];
    onFilter: (f: { location: string; jobType: string; department: string; search: string }) => void;
};

const JOB_TYPES = ['full-time', 'part-time', 'remote', 'hybrid', 'contract'];

export function FilterDrawer({ locations, departments, onFilter }: Props) {
    const [open, setOpen] = useState(false);
    const [loc, setLoc] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [depts, setDepts] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

    const apply = () => {
        onFilter({
            location: loc[0] || '',
            jobType: types[0] || '',
            department: depts[0] || '',
            search
        });
        setOpen(false);
    };

    const clear = () => { setLoc([]); setTypes([]); setDepts([]); setSearch(''); };

    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        if (open) document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [open]);

    useEffect(() => {
        if (open) ref.current?.focus();
    }, [open]);

    const activeCount = loc.length + types.length + depts.length + (search ? 1 : 0);

    return (
        <>
            {/* Search + Filter Bar */}
            <div className="flex gap-2 mb-4">
                <input
                    type="search"
                    placeholder="Search job titles..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); onFilter({ location: loc[0] || '', jobType: types[0] || '', department: depts[0] || '', search: e.target.value }); }}
                    className="flex-1 px-4 py-3 rounded-full border text-sm min-h-[44px]"
                    aria-label="Search jobs"
                />
                <button
                    onClick={() => setOpen(true)}
                    className="px-4 py-3 rounded-full border text-sm flex items-center gap-2 min-h-[44px] min-w-[44px]"
                    aria-label="Open filters"
                    aria-expanded={open}
                >
                    <span>🔍</span>
                    <span className="hidden sm:inline">Filters</span>
                    {activeCount > 0 && <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">{activeCount}</span>}
                </button>
            </div>

            {/* Overlay */}
            {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />}

            {/* Drawer */}
            <div
                ref={ref}
                role="dialog"
                aria-modal="true"
                aria-label="Filter results"
                tabIndex={-1}
                className={`fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 transform transition-transform ${open ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ maxHeight: '80vh' }}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Filter Results</h2>
                    <button onClick={() => setOpen(false)} className="text-2xl p-2 min-w-[44px] min-h-[44px]" aria-label="Close">×</button>
                </div>

                <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
                    {/* Location */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Location</h3>
                        <div className="flex flex-wrap gap-2">
                            <Chip label="All Locations" active={loc.length === 0} onClick={() => setLoc([])} />
                            {locations.map(l => (
                                <Chip key={l} label={l} active={loc.includes(l)} onClick={() => setLoc(toggle(loc, l))} />
                            ))}
                        </div>
                    </div>

                    {/* Job Type */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Job Type</h3>
                        <div className="flex flex-wrap gap-2">
                            <Chip label="All Types" active={types.length === 0} onClick={() => setTypes([])} />
                            {JOB_TYPES.map(t => (
                                <Chip key={t} label={t} active={types.includes(t)} onClick={() => setTypes(toggle(types, t))} />
                            ))}
                        </div>
                    </div>

                    {/* Department */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Department</h3>
                        <div className="space-y-2">
                            {departments.map(d => (
                                <label key={d} className="flex items-center gap-3 min-h-[44px]">
                                    <input type="checkbox" checked={depts.includes(d)} onChange={() => setDepts(toggle(depts, d))}
                                        className="w-5 h-5 rounded" />
                                    <span>{d}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t flex justify-between items-center">
                    <button onClick={clear} className="text-blue-600 font-medium min-h-[44px] px-4">Clear All</button>
                    <button onClick={apply} className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium min-h-[44px]">Apply Filters</button>
                </div>
            </div>
        </>
    );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm min-h-[44px] ${active ? 'bg-blue-600 text-white' : 'border bg-white'}`}
            aria-pressed={active}
        >
            {active && '✓ '}{label}
        </button>
    );
}
