'use client';

import { useState } from 'react';
import { Company, Section } from '@/lib/types';
import { createClient } from '@/lib/supabase';

type EditorProps = {
    company: Company;
};

const sectionTypes = ['header', 'about', 'life', 'team', 'values', 'jobs', 'footer'] as const;

export function Editor({ company: initialCompany }: EditorProps) {
    const [company, setCompany] = useState(initialCompany);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    const addSection = (type: Section['type']) => {
        const newSection: Section = {
            id: crypto.randomUUID(),
            type,
            order: company.sections.length,
            content: {},
        };
        setCompany({ ...company, sections: [...company.sections, newSection] });
    };

    const removeSection = (id: string) => {
        setCompany({
            ...company,
            sections: company.sections.filter((s) => s.id !== id),
        });
    };

    const moveSection = (id: string, direction: 'up' | 'down') => {
        const sections = [...company.sections];
        const index = sections.findIndex((s) => s.id === id);
        if (direction === 'up' && index > 0) {
            [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
        } else if (direction === 'down' && index < sections.length - 1) {
            [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
        }
        setCompany({ ...company, sections });
    };

    const save = async () => {
        setSaving(true);
        await supabase
            .from('companies')
            .update({ sections: company.sections })
            .eq('id', company.id);
        setSaving(false);
    };

    const publish = async () => {
        setSaving(true);
        await supabase
            .from('companies')
            .update({ sections: company.sections, status: 'published' })
            .eq('id', company.id);
        setSaving(false);
        window.location.href = `/${company.slug}/careers`;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Bar */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="font-semibold text-gray-800">Careers Page Builder</h1>
                    <div className="flex gap-2">
                        <a
                            href={`/${company.slug}/preview`}
                            target="_blank"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            Preview
                        </a>
                        <button
                            onClick={save}
                            disabled={saving}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button
                            onClick={publish}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                        >
                            Publish
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6">
                {/* Company Info */}
                <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                    <h2 className="font-medium text-gray-800 mb-2">Company: {company.name}</h2>
                    <p className="text-sm text-gray-500">
                        Status: <span className={company.status === 'published' ? 'text-green-600' : 'text-yellow-600'}>
                            {company.status}
                        </span>
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-3">
                    {company.sections.map((section, index) => (
                        <div key={section.id} className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-sm">{index + 1}</span>
                                <span className="font-medium capitalize">{section.type}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => moveSection(section.id, 'up')} className="p-1 text-gray-400 hover:text-gray-600">↑</button>
                                <button onClick={() => moveSection(section.id, 'down')} className="p-1 text-gray-400 hover:text-gray-600">↓</button>
                                <button onClick={() => removeSection(section.id)} className="p-1 text-red-400 hover:text-red-600">×</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Section */}
                <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-3">Add new section:</p>
                    <div className="flex flex-wrap gap-2">
                        {sectionTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => addSection(type)}
                                className="px-3 py-1 border border-gray-200 rounded-full text-sm capitalize hover:bg-gray-50"
                            >
                                + {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
