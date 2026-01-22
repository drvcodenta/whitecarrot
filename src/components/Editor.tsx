'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Company, Section } from '@/lib/types';
import { createClient } from '@/lib/supabase';
import { getYouTubeVideoId } from '@/lib/utils';

type Props = { company: Company };
type Tab = 'settings' | 'structure' | 'preview';

const SECTION_TYPES: Section['type'][] = ['header', 'about', 'life', 'team', 'values', 'jobs', 'footer', 'video'];
// COLORS constant
const COLORS = ['#1D4ED8', '#0EA5E9', '#059669', '#F59E0B', '#EF4444', '#EC4899'];

export function Editor({ company: init }: Props) {
    const [c, setC] = useState(init);
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [lifeImages, setLifeImages] = useState<(string | null)[]>([null, null, null]);
    const [activeTab, setActiveTab] = useState<Tab>('structure');
    const logoRef = useRef<HTMLInputElement>(null);
    const lifeImageRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);
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

    const handleLifeImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setLifeImages(prev => {
                    const newImages = [...prev];
                    newImages[index] = base64;
                    return newImages;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLifeImage = (index: number) => {
        setLifeImages(prev => {
            const newImages = [...prev];
            newImages[index] = null;
            return newImages;
        });
    };

    useEffect(() => {
        const lifeSection = c.sections.find(s => s.type === 'life');
        if (lifeSection?.content?.images) {
            const imgs = lifeSection.content.images as (string | null)[];
            setLifeImages(imgs.length < 3 ? [...imgs, ...Array(3 - imgs.length).fill(null)] : imgs.slice(0, 3));
        }
    }, []);

    const save = async () => {
        setSaving(true);
        const updatedSections = c.sections.map(s =>
            s.type === 'life' ? { ...s, content: { ...s.content, images: lifeImages } } : s
        );
        const { error } = await sb.from('companies').update({
            sections: updatedSections,
            theme: c.theme,
            seo_meta: c.seo_meta,
            youtube_url: c.youtube_url,
            banner_url: c.banner_url
        }).eq('id', c.id);
        setSaving(false);
        if (error) {
            alert('Save failed: ' + error.message);
        } else {
            alert('Saved!');
        }
    };

    const publish = async () => {
        setSaving(true);
        const updatedSections = c.sections.map(s =>
            s.type === 'life' ? { ...s, content: { ...s.content, images: lifeImages } } : s
        );
        const { error } = await sb.from('companies').update({
            sections: updatedSections,
            theme: c.theme,
            seo_meta: c.seo_meta,
            youtube_url: c.youtube_url,
            banner_url: c.banner_url,
            status: 'published'
        }).eq('id', c.id);
        setSaving(false);
        if (error) {
            alert('Publish failed: ' + error.message);
        } else {
            window.location.href = `/${c.slug}/careers`;
        }
    };

    // Keyboard navigation for tabs
    const handleTabKeyDown = useCallback((e: React.KeyboardEvent, tabs: Tab[]) => {
        const currentIndex = tabs.indexOf(activeTab);
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            setActiveTab(tabs[newIndex]);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            setActiveTab(tabs[newIndex]);
        }
    }, [activeTab]);

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'structure', label: 'Structure', icon: '📋' },
        { id: 'preview', label: 'Preview', icon: '👁️' },
    ];

    // Settings Panel Content - defined as inline JSX to prevent re-render issues
    const settingsPanelContent = (
        <div className="p-4 pb-24 md:pb-4">
            <h2 className="font-semibold mb-4 text-lg">Company Settings</h2>

            <div className="mb-6">
                <label className="text-sm text-gray-600 block mb-2 font-medium">Primary Color</label>
                <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Primary color selection">
                    {COLORS.map(clr => (
                        <button
                            key={clr}
                            onClick={() => updTheme('primaryColor', clr)}
                            className={`w-12 h-12 rounded-lg transition-transform active:scale-95 ${c.theme.primaryColor === clr ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                            style={{ backgroundColor: clr }}
                            aria-label={`Set primary color to ${clr}`}
                            aria-pressed={c.theme.primaryColor === clr}
                            role="radio"
                            aria-checked={c.theme.primaryColor === clr}
                        />
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="text-sm text-gray-600 block mb-2 font-medium">Secondary Color</label>
                <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Secondary color selection">
                    {COLORS.map(clr => (
                        <button
                            key={clr}
                            onClick={() => updTheme('secondaryColor', clr)}
                            className={`w-12 h-12 rounded-lg transition-transform active:scale-95 ${c.theme.secondaryColor === clr ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                            style={{ backgroundColor: clr }}
                            aria-label={`Set secondary color to ${clr}`}
                            aria-pressed={c.theme.secondaryColor === clr}
                            role="radio"
                            aria-checked={c.theme.secondaryColor === clr}
                        />
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="text-sm text-gray-600 block mb-2 font-medium">Upload Logo</label>
                <input type="file" ref={logoRef} accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                <button
                    onClick={() => logoRef.current?.click()}
                    className="w-full min-h-[80px] border-2 border-dashed rounded-xl p-4 text-center text-gray-400 text-base hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Upload company logo"
                >
                    {logoPreview ? <img src={logoPreview} alt="Company logo preview" className="h-16 mx-auto" /> : '📤 Upload logo'}
                </button>
            </div>

            <div className="mb-6">
                <label htmlFor="typography-select" className="text-sm text-gray-600 block mb-2 font-medium">Typography</label>
                <select
                    id="typography-select"
                    value={c.theme.fontFamily || 'Inter'}
                    onChange={e => updTheme('fontFamily', e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                </select>
            </div>

            <div className="mb-6">
                <label className="text-sm text-gray-600 block mb-2 font-medium">Banner URL</label>
                <input
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={c.banner_url || ''}
                    onChange={e => upd({ banner_url: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Banner image URL"
                />
            </div>

            <div className="mb-6">
                <label className="text-sm text-gray-600 block mb-2 font-medium">SEO & Tagline</label>
                <input
                    type="text"
                    placeholder="Title / Tagline"
                    value={c.seo_meta?.title || ''}
                    onChange={e => updSeo('title', e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 text-base mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="SEO title"
                />
                <textarea
                    placeholder="Description"
                    value={c.seo_meta?.description || ''}
                    onChange={e => updSeo('description', e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    aria-label="SEO description"
                />
            </div>
        </div>
    );

    // Structure Panel Content - defined as inline JSX to prevent re-render issues
    const structurePanelContent = (
        <div className="p-4 pb-24 md:pb-4">
            <h2 className="font-semibold mb-4 text-lg">Page Structure</h2>
            <div className="space-y-3 mb-6" role="list" aria-label="Page sections">
                {c.sections.map((s, i) => (
                    <div key={s.id}>
                        <div
                            className="bg-white rounded-xl border shadow-sm p-3 flex justify-between items-center"
                            role="listitem"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-lg" aria-hidden="true">☰</span>
                                <span className="font-medium capitalize text-base">{s.type === 'video' ? '📹 Video' : s.type}</span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => moveSection(s.id, 'up')}
                                    disabled={i === 0}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label={`Move ${s.type} section up`}
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => moveSection(s.id, 'down')}
                                    disabled={i === c.sections.length - 1}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label={`Move ${s.type} section down`}
                                >
                                    ↓
                                </button>
                                <button
                                    onClick={() => rmSection(s.id)}
                                    className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                    aria-label={`Remove ${s.type} section`}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        {/* YouTube URL input for video sections */}
                        {s.type === 'video' && (
                            <div className="bg-white rounded-xl border shadow-sm p-3 mt-2">
                                <label className="text-xs text-gray-500 block mb-1">YouTube URL</label>
                                <input
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={(s.content?.youtubeUrl as string) || ''}
                                    onChange={e => {
                                        setC(prev => ({
                                            ...prev,
                                            sections: prev.sections.map(sec =>
                                                sec.id === s.id
                                                    ? { ...sec, content: { ...sec.content, youtubeUrl: e.target.value } }
                                                    : sec
                                            )
                                        }));
                                    }}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {(s.content?.youtubeUrl as string) && getYouTubeVideoId(s.content.youtubeUrl as string) && (
                                    <p className="text-xs text-green-600 mt-1">✓ Valid YouTube URL</p>
                                )}
                                {(s.content?.youtubeUrl as string) && !getYouTubeVideoId(s.content.youtubeUrl as string) && (
                                    <p className="text-xs text-red-500 mt-1">⚠ Invalid YouTube URL format</p>
                                )}
                            </div>
                        )}
                        {/* Life at Company image upload for life sections */}
                        {s.type === 'life' && (
                            <div className="bg-white rounded-xl border shadow-sm p-4 mt-2">
                                <label className="text-xs text-gray-500 block mb-3 font-medium uppercase tracking-wider">Section Images (Max 3)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[0, 1, 2].map(index => (
                                        <div key={index} className="relative aspect-square">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={el => { lifeImageRefs.current[index] = el; }}
                                                onChange={e => handleLifeImageChange(index, e)}
                                            />
                                            {lifeImages[index] ? (
                                                <div className="group relative w-full h-full">
                                                    <img src={lifeImages[index]!} alt={`Life ${index}`} className="w-full h-full object-cover rounded-lg border shadow-sm" />
                                                    <button
                                                        onClick={() => removeLifeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => lifeImageRefs.current[index]?.click()}
                                                    className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all bg-gray-50 group"
                                                >
                                                    <span className="text-xl group-hover:scale-125 transition-transform">+</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-tight">Upload</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <p className="text-sm text-gray-500 mb-3">Add section:</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Add new section">
                {SECTION_TYPES.filter(t => !c.sections.find(s => s.type === t)).map(t => (
                    <button
                        key={t}
                        onClick={() => addSection(t)}
                        className="px-4 py-2 border rounded-full text-sm capitalize hover:bg-white active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    >
                        + {t}
                    </button>
                ))}
            </div>
        </div>
    );

    // Preview Panel Content - defined as inline JSX to prevent re-render issues
    const previewPanelContent = (
        <div className="p-4 pb-24 md:pb-4">
            <h2 className="font-semibold mb-4 text-lg">Live Preview</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
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
                                <h3 className="font-semibold mb-3">Life at Company</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="bg-gray-100 aspect-square rounded-lg border overflow-hidden flex items-center justify-center text-gray-400">
                                            {lifeImages[i] ? (
                                                <img src={lifeImages[i]!} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg">📷</span>
                                            )}
                                        </div>
                                    ))}
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
                                <div className="flex gap-2 text-xs flex-wrap">
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
                        {s.type === 'video' && (
                            <div className="p-4 border-b">
                                <h3 className="font-semibold mb-3">Company Video</h3>
                                {(s.content?.youtubeUrl as string) && getYouTubeVideoId(s.content.youtubeUrl as string) ? (
                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                        <iframe
                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(s.content.youtubeUrl as string)}`}
                                            title="Company Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-gray-200 aspect-video rounded-lg flex items-center justify-center text-gray-400">
                                        <span>📹 Add YouTube URL in Structure panel</span>
                                    </div>
                                )}
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
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <span className="text-base md:text-lg font-semibold truncate">Careers page builder</span>
                    <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded truncate max-w-[80px] md:max-w-none">{c.name}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={save}
                        disabled={saving}
                        className="px-3 py-2 border rounded-lg text-sm min-h-[44px] hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        onClick={publish}
                        disabled={saving}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm min-h-[44px] hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        Publish
                    </button>
                </div>
            </header>

            {/* Desktop: Three-column layout */}
            <div className="hidden md:flex flex-1 overflow-hidden">
                <aside className="w-72 bg-white border-r overflow-y-auto shrink-0">
                    {settingsPanelContent}
                </aside>
                <main className="w-80 overflow-y-auto border-r bg-gray-50 shrink-0">
                    {structurePanelContent}
                </main>
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {previewPanelContent}
                </div>
            </div>

            {/* Mobile: Single panel with tab navigation */}
            <div className="md:hidden flex-1 overflow-y-auto bg-gray-50">
                {activeTab === 'settings' && settingsPanelContent}
                {activeTab === 'structure' && structurePanelContent}
                {activeTab === 'preview' && previewPanelContent}
            </div>

            {/* Mobile: Bottom Tab Bar */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg"
                role="tablist"
                aria-label="Editor sections"
            >
                <div className="flex">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`${tab.id}-panel`}
                            onClick={() => setActiveTab(tab.id)}
                            onKeyDown={(e) => handleTabKeyDown(e, tabs.map(t => t.id))}
                            className={`flex-1 py-4 flex flex-col items-center gap-1 text-sm transition-colors focus:outline-none focus:bg-gray-100 ${activeTab === tab.id
                                ? 'text-blue-600 bg-blue-50 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-xl" aria-hidden="true">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
