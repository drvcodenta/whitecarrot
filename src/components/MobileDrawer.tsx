'use client';

import { useState, useEffect } from 'react';

type Props = { companyName: string; logoUrl?: string; primaryColor: string; secondaryColor: string };

const NAV = [
    { label: 'Home', icon: '🏠' },
    { label: 'About Us', icon: '👤' },
    { label: 'Life at [Company]', icon: '❤️' },
    { label: 'Open Roles', icon: '💼' },
    { label: 'Team', icon: '👥' },
    { label: 'Values', icon: '⭐' },
];

export function MobileDrawer({ companyName, logoUrl, primaryColor, secondaryColor }: Props) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        if (open) document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [open]);

    return (
        <>
            <button onClick={() => setOpen(true)} className="md:hidden p-2 min-w-[44px] min-h-[44px]" aria-label="Open navigation menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />}

            <div
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-4 text-white" style={{ backgroundColor: secondaryColor }}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt={companyName} className="w-10 h-10 rounded" />
                            ) : (
                                <div className="w-10 h-10 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: primaryColor }}>
                                    {companyName[0]}
                                </div>
                            )}
                            <span className="font-semibold">{companyName}</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white text-2xl p-2 min-w-[44px] min-h-[44px]" aria-label="Close menu">×</button>
                    </div>
                </div>

                <nav className="p-4">
                    <p className="text-xs text-gray-400 uppercase mb-2">Primary Navigation</p>
                    {NAV.map(item => (
                        <a key={item.label} href={`#${item.label.toLowerCase().replace(/\s/g, '-')}`}
                            className="flex items-center gap-3 py-3 text-gray-700 hover:text-blue-600 min-h-[44px]"
                            onClick={() => setOpen(false)}>
                            <span aria-hidden="true">{item.icon}</span>
                            <span>{item.label.replace('[Company]', companyName)}</span>
                        </a>
                    ))}

                    <div className="mt-4">
                        <p className="text-xs text-gray-400 uppercase mb-2">Quick links</p>
                        <button className="w-full py-3 rounded-full text-white font-medium min-h-[44px]" style={{ backgroundColor: primaryColor }}>
                            Search Jobs
                        </button>
                    </div>

                    <div className="mt-6">
                        <p className="text-xs text-gray-400 uppercase mb-2">Contact</p>
                        <a href="#" className="flex items-center gap-3 py-2 text-gray-700 min-h-[44px]">
                            <span aria-hidden="true">✉️</span> Careers Team
                        </a>
                        <a href="#" className="flex items-center gap-3 py-2 text-gray-700 min-h-[44px]">
                            <span aria-hidden="true">📞</span> Contact Us
                        </a>
                    </div>

                    <div className="mt-6">
                        <p className="text-xs text-gray-400 uppercase mb-2">Legal</p>
                        <a href="#" className="block py-2 text-gray-500 text-sm min-h-[44px]">Privacy Policy</a>
                        <a href="#" className="block py-2 text-gray-500 text-sm min-h-[44px]">Terms of Use</a>
                        <a href="#" className="block py-2 text-gray-500 text-sm min-h-[44px]">Accessibility</a>
                    </div>
                </nav>
            </div>
        </>
    );
}
