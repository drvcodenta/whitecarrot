'use client';

import { useState } from 'react';

type MobileDrawerProps = {
    companyName: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
};

export function MobileDrawer({ companyName, logoUrl, primaryColor, secondaryColor }: MobileDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { label: 'Home', icon: '🏠' },
        { label: 'About Us', icon: '👤' },
        { label: 'Life at Company', icon: '❤️' },
        { label: 'Open Roles', icon: '💼' },
        { label: 'Team', icon: '👥' },
        { label: 'Values', icon: '⭐' },
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 text-gray-600"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
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
                        <button onClick={() => setIsOpen(false)} className="text-white text-2xl">&times;</button>
                    </div>
                </div>

                {/* Menu */}
                <nav className="p-4">
                    <p className="text-xs text-gray-400 uppercase mb-2">Primary Navigation</p>
                    {menuItems.map((item) => (
                        <a
                            key={item.label}
                            href={`#${item.label.toLowerCase().replace(/\s/g, '-')}`}
                            className="flex items-center gap-3 py-2 text-gray-700 hover:text-blue-600"
                            onClick={() => setIsOpen(false)}
                        >
                            <span>{item.icon}</span> {item.label}
                        </a>
                    ))}

                    <div className="mt-6">
                        <button
                            className="w-full py-2 rounded-full text-white font-medium"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Search Jobs
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
}
