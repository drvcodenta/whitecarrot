'use client';

import { useState, useRef } from 'react';
import { Company, Section } from '@/lib/types';
import { createClient } from '@/lib/supabase';

type Props = { company: Company };

const SECTION_TYPES: Section['type'][] = ['header', 'about', 'life', 'team', 'values', 'jobs', 'footer'];
const COLORS = ['#1D4ED8', '#0EA5E9', '#059669', '#F59E0B', '#EF4444', '#EC4899'];

export function Editor({ company: init }: Props) {
    const [c, setC] = useState(init);
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const logoRef = useRef<HTMLInputElement>(null);
    const sb = createClient();

    const upd = (p: Partial<Company>) => setC(prev => ({ ...prev, ...p }));
    const updTheme = (k: string, v: string) => setC(prev => ({ ...prev, theme: { ...prev.theme, [k]: v } }));
    const updSeo = (k: string, v: string) => setC(prev => ({ ...prev, seo_meta: { ...prev.seo_meta, [k]: v } }));

    const addSection = (t: Section['type']) => {
        const s: Section = { id: crypto.randomUUID(), type: t, order: c.sections.length, content: {} };
        setC(prev => ({ ...prev, sections: [...prev.sections, s] }));
    };

    const rmSection = (id: string) => setC(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));

    const moveSection = (id: string, dir: 'up' | 'down') => {
        setC(prev => {
            const arr = [...prev.sections];
            const i = arr.findIndex(s => s.id === id);
            if (dir === 'up' && i > 0) [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
            else if (dir === 'down' && i < arr.length - 1) [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
            return { ...prev, sections: arr };
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setLogoPreview(url);
        }
    };

    const save = async () => {
        setSaving(true);
        const { error } = await sb.from('companies').update({ sections: c.sections, theme: c.theme, seo_meta: c.seo_meta }).eq('id', c.id);
        setSaving(false);
        if (error) {
            alert('Save failed: ' + error.message);
            console.error('Save error:', error);
        } else {
            alert('Saved!');
        }
    };

    const publish = async () => {
        setSaving(true);
        const { error } = await sb.from('companies').update({ sections: c.sections, theme: c.theme, seo_meta: c.seo_meta, status: 'published' }).eq('id', c.id);
        setSaving(false);
        if (error) {
            alert('Publish failed: ' + error.message);
            console.error('Publish error:', error);
        } else {
            window.location.href = `/${c.slug}/careers`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-4 py-2 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold">Careers page builder</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{c.name}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={save} disabled={saving} className="px-3 py-1.5 border rounded text-sm">{saving ? 'Saving...' : 'Save Draft'}</button>
                    <button onClick={publish} disabled={saving} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Publish</button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Brand Settings */}
                <aside className="w-64 bg-white border-r p-4 overflow-y-auto shrink-0">
                    <h2 className="font-semibold mb-4">Company Settings</h2>

                    <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">Primary Color</label>
                        <div className="flex gap-1 mb-2">
                            {COLORS.map(clr => (
                                <button key={clr} onClick={() => updTheme('primaryColor', clr)}
                                    className={`w-6 h-6 rounded ${c.theme.primaryColor === clr ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                                    style={{ backgroundColor: clr }} aria-label={`Set primary color to ${clr}`} />
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">Secondary Color</label>
                        <div className="flex gap-1 mb-2">
                            {COLORS.map(clr => (
                                <button key={clr} onClick={() => updTheme('secondaryColor', clr)}
                                    className={`w-6 h-6 rounded ${c.theme.secondaryColor === clr ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                                    style={{ backgroundColor: clr }} aria-label={`Set secondary color to ${clr}`} />
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">Upload logo</label>
                        <input type="file" ref={logoRef} accept="image/*" onChange={handleLogoChange} className="hidden" />
                        <button onClick={() => logoRef.current?.click()}
                            className="w-full border-2 border-dashed rounded p-4 text-center text-gray-400 text-sm hover:bg-gray-50">
                            {logoPreview ? <img src={logoPreview} alt="Logo" className="h-12 mx-auto" /> : '📤 Upload logo'}
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">Typography</label>
                        <select value={c.theme.fontFamily || 'Inter'} onChange={e => updTheme('fontFamily', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm">
                            <option>Inter</option>
                            <option>Roboto</option>
                            <option>Open Sans</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">SEO meta tags</label>
                        <input type="text" placeholder="Title" value={c.seo_meta?.title || ''} onChange={e => updSeo('title', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm mb-2" />
                        <textarea placeholder="Description" value={c.seo_meta?.description || ''} onChange={e => updSeo('description', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm resize-none" rows={3} />
                    </div>
                </aside>

                {/* Center - Page Structure */}
                <main className="w-80 p-4 overflow-y-auto border-r bg-gray-50 shrink-0">
                    <h2 className="font-semibold mb-4">Page Structure</h2>
                    <div className="space-y-2 mb-4">
                        {c.sections.map((s, i) => (
                            <div key={s.id} className="bg-white rounded-lg border p-2 flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">☰</span>
                                    <span className="font-medium capitalize">{s.type}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => moveSection(s.id, 'up')} disabled={i === 0}
                                        className="px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" aria-label="Move up">↑</button>
                                    <button onClick={() => moveSection(s.id, 'down')} disabled={i === c.sections.length - 1}
                                        className="px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" aria-label="Move down">↓</button>
                                    <button onClick={() => rmSection(s.id)} className="px-1 text-red-400 hover:text-red-600" aria-label="Remove">×</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">Add section:</p>
                    <div className="flex flex-wrap gap-1">
                        {SECTION_TYPES.filter(t => !c.sections.find(s => s.type === t)).map(t => (
                            <button key={t} onClick={() => addSection(t)}
                                className="px-2 py-1 border rounded-full text-xs capitalize hover:bg-white">+ {t}</button>
                        ))}
                    </div>
                </main>

                {/* Right - Live Preview */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <h2 className="font-semibold mb-4">Live Preview</h2>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto border">
                        {c.sections.map(s => (
                            <div key={s.id}>
                                {s.type === 'header' && (
                                    <div className="p-4 text-white flex items-center gap-3" style={{ backgroundColor: c.theme.secondaryColor }}>
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-10 h-10 rounded" />
                                        ) : (
                                            <div className="w-10 h-10 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: c.theme.primaryColor }}>
                                                {c.name[0]}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold">{c.name}</div>
                                            <div className="text-xs opacity-80">Tagline goes here</div>
                                        </div>
                                    </div>
                                )}
                                {s.type === 'about' && (
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold mb-2">About Us</h3>
                                        <p className="text-sm text-gray-600">Company description text would go here...</p>
                                    </div>
                                )}
                                {s.type === 'life' && (
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold mb-2">Life at Company</h3>
                                        <div className="grid grid-cols-2 gap-1">
                                            {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-200 aspect-square rounded text-center text-gray-400 text-xs flex items-center justify-center">📷</div>)}
                                        </div>
                                    </div>
                                )}
                                {s.type === 'team' && (
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold mb-2">Team</h3>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-12 h-12 rounded-full bg-gray-200 text-center text-gray-400 text-xs flex items-center justify-center">👤</div>)}
                                        </div>
                                    </div>
                                )}
                                {s.type === 'values' && (
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold mb-2">Values</h3>
                                        <div className="flex gap-2 text-xs">
                                            {['Innovation', 'Integrity', 'Growth'].map(v => (
                                                <span key={v} className="px-2 py-1 rounded" style={{ backgroundColor: c.theme.primaryColor + '20', color: c.theme.primaryColor }}>{v}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {s.type === 'jobs' && (
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold mb-2">Open Roles</h3>
                                        <div className="space-y-2">
                                            {['Software Engineer', 'Product Manager'].map(j => (
                                                <div key={j} className="border rounded p-2 flex justify-between items-center text-sm">
                                                    <span>{j}</span>
                                                    <button className="px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: c.theme.primaryColor }}>Apply</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {s.type === 'footer' && (
                                    <div className="p-4 bg-gray-100 text-center text-xs text-gray-500">
                                        Footer • About • Contact • Privacy
                                    </div>
                                )}
                            </div>
                        ))}
                        {c.sections.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                Add sections to see preview
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
