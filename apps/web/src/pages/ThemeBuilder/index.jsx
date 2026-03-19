import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Palette, Type, Layout, Sliders, Sun, Moon,
    RefreshCw, Save, Check, ChevronDown, Eye, AlertCircle
} from 'lucide-react';
import { ModernButton } from '../../components/UI/CustomInputs';

// ─── Preset colors used in color picker ──────────────────────────────────────
const PRESET_COLORS = [
    '#3e41df','#4f46e5','#6366f1','#818cf8',
    '#ec4899','#f472b6',
    '#22c55e','#16a34a',
    '#eab308','#f97316',
    '#ef4444','#dc2626',
    '#3b82f6','#0ea5e9',
    '#ffffff','#f8fafc','#e2e8f0','#94a3b8',
    '#64748b','#334155','#1e293b','#0f172a','#000000',
    '#0d1117','#161b27','#21262d',
];

// ─── Helper: get readable text color for a bg ─────────────────────────────────
const getContrastColor = (hex) => {
    try {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return (r*299 + g*587 + b*114) / 1000 > 128 ? '#000000' : '#ffffff';
    } catch { return '#ffffff'; }
};

// ─── ColorSwatch with popover ─────────────────────────────────────────────────
const ColorSwatch = ({ label, variable, handleChange, currentTheme }) => {
    const [open, setOpen] = useState(false);
    const [hexInput, setHexInput] = useState('');
    const containerRef = useRef(null);
    const rawColor = currentTheme[variable] || '#000000';
    // Native color input only supports #rrggbb (6 char), strip alpha if present
    const color = /^#[0-9a-fA-F]{6}$/.test(rawColor) ? rawColor : rawColor.slice(0, 7);

    useEffect(() => { setHexInput(color); }, [color]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleHexChange = (val) => {
        setHexInput(val);
        if (/^#[0-9a-fA-F]{6}$/.test(val)) handleChange(variable, val);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-background transition-all text-left"
            >
                <div
                    className="w-8 h-8 rounded-lg border border-border flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-text-main">{label}</div>
                    <div className="text-[10px] text-text-muted font-mono">{color}</div>
                </div>
                <ChevronDown size={12} className={`text-text-muted transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div
                    className="absolute z-[9999] top-full left-0 mt-1 w-60 bg-surface border border-border rounded-2xl shadow-2xl p-4 space-y-3"
                    onMouseDown={e => e.stopPropagation()}
                >
                    {/* Color preview + native picker (overlaid opacity-0 over a colored block) */}
                    <div className="relative w-full h-14 rounded-xl overflow-hidden border border-border cursor-pointer">
                        <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: color }} />
                        <input
                            type="color"
                            value={color}
                            onChange={e => { handleChange(variable, e.target.value); setHexInput(e.target.value); }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Open color picker"
                        />
                        <span
                            className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest pointer-events-none select-none"
                            style={{ color: getContrastColor(color) }}
                        >
                            Click to pick
                        </span>
                    </div>

                    {/* Hex input */}
                    <input
                        type="text"
                        value={hexInput}
                        onChange={e => handleHexChange(e.target.value)}
                        onKeyDown={e => e.stopPropagation()}
                        className="w-full h-9 px-3 text-xs font-mono bg-background border border-border rounded-xl text-text-main outline-none focus:border-primary transition-colors"
                        placeholder="#000000"
                        maxLength={7}
                        spellCheck={false}
                    />

                    {/* Preset swatches */}
                    <div>
                        <div className="text-[9px] text-text-muted mb-2 font-bold uppercase tracking-wider">Presets</div>
                        <div className="flex flex-wrap gap-1.5">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => { handleChange(variable, c); setHexInput(c); }}
                                    className={`w-5 h-5 rounded-md border-2 transition-transform hover:scale-125 ${color === c ? 'border-primary scale-125' : 'border-transparent hover:border-border'}`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Slider control ───────────────────────────────────────────────────────────
const SliderControl = ({ label, variable, min, max, step = 1, unit, currentTheme, handleChange }) => {
    const raw = currentTheme[variable] || '0';
    const val = parseFloat(raw) || 0;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary">{label}</span>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                    {currentTheme[variable]}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={val}
                onChange={e => handleChange(variable, `${e.target.value}${unit}`)}
                className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary"
            />
            <div className="flex justify-between text-[9px] text-text-muted font-bold">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
};

// ─── Select control ───────────────────────────────────────────────────────────
const SelectControl = ({ label, variable, options, currentTheme, handleChange }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-text-secondary">{label}</label>
        <select
            value={currentTheme[variable]}
            onChange={e => handleChange(variable, e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-surface text-text-main">
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

// ─── Section card (matches Settings page SectionCard) ─────────────────────────
const SectionCard = ({ title, description, children }) => (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-text-main">{title}</h3>
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
        {children}
    </div>
);

// ─── ColorGroup: a grid of ColorSwatches ─────────────────────────────────────
const ColorGroup = ({ swatches, currentTheme, handleChange }) => (
    <div className="space-y-1">
        {swatches.map(s => (
            <ColorSwatch
                key={s.variable}
                label={s.label}
                variable={s.variable}
                currentTheme={currentTheme}
                handleChange={handleChange}
            />
        ))}
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ThemeBuilder = ({ embedded = false }) => {
    const { mode, toggleTheme, themeConfig, updateThemeVariable, saveTheme, resetTheme, hasUnsavedChanges } = useTheme();
    const currentTheme = themeConfig[mode];
    const [activeTab, setActiveTab] = useState('colors');
    const [saved, setSaved] = useState(false);

    const handleChange = (key, value) => updateThemeVariable(key, value);

    const handleSave = () => {
        saveTheme();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        if (confirm('Reset all theme customizations to defaults? This cannot be undone.')) {
            resetTheme();
        }
    };

    const tabs = [
        { id: 'colors', label: 'Colors', icon: Palette },
        { id: 'typography', label: 'Typography', icon: Type },
        { id: 'shape', label: 'Shape & Spacing', icon: Layout },
        { id: 'effects', label: 'Effects', icon: Sliders },
        { id: 'preview', label: 'Preview', icon: Eye },
    ];

    return (
        <div className={embedded ? 'space-y-4' : 'p-6 space-y-6'}>
            {/* Controls bar — title shown only when standalone */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {!embedded && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-main tracking-tight">Theme Builder</h1>
                            <p className="text-text-secondary text-sm mt-0.5">Customize colors, typography, shapes and effects</p>
                        </div>
                    </div>
                )}

                <div className={`flex items-center gap-3 ${embedded ? 'flex-wrap' : ''}`}>
                    {/* Unsaved indicator */}
                    {hasUnsavedChanges && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-xl text-xs font-bold border border-amber-500/20">
                            <AlertCircle size={12} />
                            Unsaved changes
                        </div>
                    )}

                    {/* Light/Dark toggle */}
                    <div className="flex bg-background border border-border rounded-xl p-1">
                        <button
                            onClick={() => mode === 'dark' && toggleTheme()}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'light' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            <Sun size={13} />Light
                        </button>
                        <button
                            onClick={() => mode === 'light' && toggleTheme()}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'dark' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            <Moon size={13} />Dark
                        </button>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={handleReset}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all border border-border"
                        title="Reset to defaults"
                    >
                        <RefreshCw size={15} />
                    </button>

                    {/* Save */}
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${saved ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary text-white hover:bg-primary-hover shadow-sm'}`}
                    >
                        {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Theme</>}
                    </button>
                </div>
            </div>

            {/* Two-col layout */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Sidebar nav — matches Settings page exactly */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-surface border border-border rounded-[2rem] p-4 sticky top-6">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-text-muted hover:bg-background hover:text-text-main'
                                    }`}
                                >
                                    <tab.icon size={17} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        {/* Mode indicator */}
                        <div className="mt-5 pt-5 border-t border-border">
                            <div className="px-3 py-2 rounded-xl bg-background">
                                <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Editing mode</div>
                                <div className="text-xs font-bold text-text-main capitalize flex items-center gap-1.5">
                                    {mode === 'dark' ? <Moon size={12} className="text-primary" /> : <Sun size={12} className="text-amber-400" />}
                                    {mode} theme
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content area */}
                <div className="flex-grow space-y-4">

                    {/* ── COLORS ── */}
                    {activeTab === 'colors' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SectionCard title="Brand Colors" description="Primary and secondary brand identity">
                                    <ColorGroup handleChange={handleChange} currentTheme={currentTheme} swatches={[
                                        { label: 'Primary', variable: '--color-primary' },
                                        { label: 'Primary Hover', variable: '--color-primary-hover' },
                                        { label: 'Secondary', variable: '--color-secondary' },
                                        { label: 'Secondary Hover', variable: '--color-secondary-hover' },
                                    ]} />
                                </SectionCard>

                                <SectionCard title="Status Colors" description="Semantic colors for feedback and alerts">
                                    <ColorGroup handleChange={handleChange} currentTheme={currentTheme} swatches={[
                                        { label: 'Success', variable: '--color-success' },
                                        { label: 'Warning', variable: '--color-warning' },
                                        { label: 'Error', variable: '--color-error' },
                                        { label: 'Info', variable: '--color-info' },
                                    ]} />
                                </SectionCard>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SectionCard title="Backgrounds" description="Page and content backgrounds">
                                    <ColorGroup handleChange={handleChange} currentTheme={currentTheme} swatches={[
                                        { label: 'Background', variable: '--color-background' },
                                        { label: 'Background Content', variable: '--color-background-content' },
                                    ]} />
                                </SectionCard>

                                <SectionCard title="Surfaces" description="Card and panel surfaces">
                                    <ColorGroup handleChange={handleChange} currentTheme={currentTheme} swatches={[
                                        { label: 'Surface', variable: '--color-surface' },
                                        { label: 'Surface Hover', variable: '--color-surface-hover' },
                                    ]} />
                                </SectionCard>

                                <SectionCard title="Borders" description="Dividers and outlines">
                                    <ColorGroup handleChange={handleChange} currentTheme={currentTheme} swatches={[
                                        { label: 'Border', variable: '--color-border' },
                                        { label: 'Border Hover', variable: '--color-border-hover' },
                                    ]} />
                                </SectionCard>
                            </div>

                            <SectionCard title="Text Colors" description="Font colors for hierarchy and contrast">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {[
                                        { label: 'Primary Text', variable: '--color-text-main' },
                                        { label: 'Secondary Text', variable: '--color-text-secondary' },
                                        { label: 'Muted Text', variable: '--color-text-muted' },
                                    ].map(s => (
                                        <ColorSwatch key={s.variable} {...s} currentTheme={currentTheme} handleChange={handleChange} />
                                    ))}
                                </div>
                            </SectionCard>
                        </>
                    )}

                    {/* ── TYPOGRAPHY ── */}
                    {activeTab === 'typography' && (
                        <>
                            <SectionCard title="Font Families" description="Base and heading typefaces">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SelectControl
                                        label="Body Font"
                                        variable="--font-family-base"
                                        currentTheme={currentTheme}
                                        handleChange={handleChange}
                                        options={[
                                            { label: 'Inter (Default)', value: '"Inter", system-ui, sans-serif' },
                                            { label: 'Roboto', value: '"Roboto", sans-serif' },
                                            { label: 'System Default', value: 'system-ui, -apple-system, sans-serif' },
                                            { label: 'Georgia (Serif)', value: 'Georgia, serif' },
                                            { label: 'Courier (Mono)', value: '"Courier New", monospace' },
                                        ]}
                                    />
                                    <SelectControl
                                        label="Heading Font"
                                        variable="--font-family-heading"
                                        currentTheme={currentTheme}
                                        handleChange={handleChange}
                                        options={[
                                            { label: 'Inter (Default)', value: '"Inter", system-ui, sans-serif' },
                                            { label: 'Roboto', value: '"Roboto", sans-serif' },
                                            { label: 'Playfair Display (Serif)', value: '"Playfair Display", serif' },
                                            { label: 'Georgia (Serif)', value: 'Georgia, serif' },
                                        ]}
                                    />
                                </div>
                            </SectionCard>

                            <SectionCard title="Font Sizes" description="Scale affects text-base utility class globally">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SliderControl label="XS — Labels, badges" variable="--font-size-xs" min={10} max={14} unit="px" currentTheme={currentTheme} handleChange={handleChange} />
                                    <SliderControl label="SM — Secondary text" variable="--font-size-sm" min={12} max={16} unit="px" currentTheme={currentTheme} handleChange={handleChange} />
                                    <SliderControl label="Base — Body text" variable="--font-size-base" min={14} max={20} unit="px" currentTheme={currentTheme} handleChange={handleChange} />
                                    <SliderControl label="LG — Subheadings" variable="--font-size-lg" min={16} max={24} unit="px" currentTheme={currentTheme} handleChange={handleChange} />
                                    <SliderControl label="XL — Headings" variable="--font-size-xl" min={18} max={32} unit="px" currentTheme={currentTheme} handleChange={handleChange} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Line Height & Spacing" description="Readability and vertical rhythm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SliderControl label="Line Height" variable="--line-height-base" min={1} max={2.5} step={0.1} unit="" currentTheme={currentTheme} handleChange={handleChange} />
                                </div>
                            </SectionCard>

                            {/* Live type preview */}
                            <SectionCard title="Live Typography Preview" description="See your changes applied">
                                <div className="space-y-4 p-4 bg-background rounded-xl border border-border">
                                    <div style={{ fontFamily: currentTheme['--font-family-heading'], fontSize: currentTheme['--font-size-xl'] }} className="font-bold text-text-main">Heading XL — Naari Arts</div>
                                    <div style={{ fontFamily: currentTheme['--font-family-heading'], fontSize: currentTheme['--font-size-lg'] }} className="font-bold text-text-main">Heading LG — Order Management</div>
                                    <div style={{ fontFamily: currentTheme['--font-family-base'], fontSize: currentTheme['--font-size-base'], lineHeight: currentTheme['--line-height-base'] }} className="text-text-secondary">Body text — This is how your regular body text will look. Each garment passes through 21 stages of careful craftsmanship before delivery.</div>
                                    <div style={{ fontFamily: currentTheme['--font-family-base'], fontSize: currentTheme['--font-size-sm'] }} className="text-text-muted">Small text — Invoice #GST-2526-0042 · Due 15 Apr 2026</div>
                                    <div style={{ fontFamily: currentTheme['--font-family-base'], fontSize: currentTheme['--font-size-xs'] }} className="text-text-muted uppercase tracking-wider font-bold">XS Label — Status · Created By · Last Updated</div>
                                </div>
                            </SectionCard>
                        </>
                    )}

                    {/* ── SHAPE & SPACING ── */}
                    {activeTab === 'shape' && (
                        <>
                            <SectionCard title="Border Radius" description="Controls rounded corners on cards, buttons, inputs (affects Tailwind rounded-sm/md/lg/xl classes)">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SliderControl label="SM — Tags, badges" variable="--border-radius-sm" min={0} max={1} step={0.125} unit="rem" currentTheme={currentTheme} handleChange={handleChange} />
                                    <SliderControl label="MD — Inputs, small cards" variable="--border-radius-md" min={0} max={1.5} step={0.125} unit="rem" currentTheme={currentTheme} handleChange={handleChange} />
                                    <SliderControl label="LG — Buttons, panels" variable="--border-radius-lg" min={0} max={2} step={0.25} unit="rem" currentTheme={currentTheme} handleChange={handleChange} />
                                    <SliderControl label="XL — Cards, modals" variable="--border-radius-xl" min={0} max={3} step={0.25} unit="rem" currentTheme={currentTheme} handleChange={handleChange} />
                                </div>

                                {/* Radius preview */}
                                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-border">
                                    {['--border-radius-sm','--border-radius-md','--border-radius-lg','--border-radius-xl'].map((v, i) => (
                                        <div key={v} className="flex flex-col items-center gap-2">
                                            <div className="w-14 h-14 bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-[9px] font-bold text-primary" style={{ borderRadius: currentTheme[v] }}>
                                                {['SM','MD','LG','XL'][i]}
                                            </div>
                                            <span className="text-[9px] text-text-muted font-mono">{currentTheme[v]}</span>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard title="Layout Dimensions" description="Controls sidebar width and topbar height">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SliderControl label="Sidebar Width" variable="--sidebar-width" min={200} max={360} step={4} unit="px" currentTheme={currentTheme} handleChange={handleChange} />
                                    <SliderControl label="Sidebar Collapsed" variable="--sidebar-collapsed-width" min={48} max={96} step={4} unit="px" currentTheme={currentTheme} handleChange={handleChange} />
                                    <SliderControl label="Topbar Height" variable="--topbar-height" min={48} max={80} step={4} unit="px" currentTheme={currentTheme} handleChange={handleChange} />
                                </div>
                            </SectionCard>
                        </>
                    )}

                    {/* ── EFFECTS ── */}
                    {activeTab === 'effects' && (
                        <>
                            <SectionCard title="Opacity" description="Transparency levels for UI states">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SliderControl label="Disabled state opacity" variable="--opacity-disabled" min={0.1} max={0.9} step={0.05} unit="" currentTheme={currentTheme} handleChange={handleChange} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Transitions" description="Animation speed for hover and state changes">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SliderControl label="Transition Speed (ms)" variable="--transition-speed" min={50} max={600} step={25} unit="ms" currentTheme={currentTheme} handleChange={handleChange} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Shadow Preview" description="Box shadows scale with depth (values controlled via CSS)">
                                <div className="grid grid-cols-3 gap-4 p-4 bg-background rounded-xl">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-surface rounded-xl shadow-sm flex items-center justify-center text-xs font-bold text-text-muted">SM</div>
                                        <span className="text-[9px] text-text-muted uppercase tracking-wider">Subtle</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-surface rounded-xl shadow-md flex items-center justify-center text-xs font-bold text-text-secondary">MD</div>
                                        <span className="text-[9px] text-text-muted uppercase tracking-wider">Elevated</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-surface rounded-xl shadow-lg flex items-center justify-center text-xs font-bold text-text-main">LG</div>
                                        <span className="text-[9px] text-text-muted uppercase tracking-wider">Floating</span>
                                    </div>
                                </div>
                            </SectionCard>
                        </>
                    )}

                    {/* ── PREVIEW ── */}
                    {activeTab === 'preview' && (
                        <>
                            <SectionCard title="Button Variations" description="All button styles as they appear with current theme">
                                <div className="flex flex-wrap gap-3 p-4 bg-background rounded-xl">
                                    <ModernButton variant="primary">Primary Action</ModernButton>
                                    <ModernButton variant="secondary">Secondary</ModernButton>
                                    <ModernButton variant="outline">Outline</ModernButton>
                                    <ModernButton variant="ghost">Ghost</ModernButton>
                                    <ModernButton variant="danger">Danger</ModernButton>
                                    <ModernButton variant="success">Success</ModernButton>
                                </div>
                                <div className="flex flex-wrap gap-3 p-4 bg-background rounded-xl">
                                    <ModernButton variant="primary" size="sm">Small</ModernButton>
                                    <ModernButton variant="primary" size="md">Medium</ModernButton>
                                    <ModernButton variant="primary" size="lg">Large</ModernButton>
                                    <ModernButton variant="primary" disabled>Disabled</ModernButton>
                                    <ModernButton variant="primary" loading>Loading</ModernButton>
                                </div>
                            </SectionCard>

                            <SectionCard title="Color Swatches" description="All theme colors at a glance">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Primary', var: '--color-primary' },
                                        { label: 'Secondary', var: '--color-secondary' },
                                        { label: 'Success', var: '--color-success' },
                                        { label: 'Warning', var: '--color-warning' },
                                        { label: 'Error', var: '--color-error' },
                                        { label: 'Info', var: '--color-info' },
                                        { label: 'Background', var: '--color-background' },
                                        { label: 'Surface', var: '--color-surface' },
                                        { label: 'Text Main', var: '--color-text-main' },
                                        { label: 'Text Secondary', var: '--color-text-secondary' },
                                        { label: 'Border', var: '--color-border' },
                                        { label: 'Background Content', var: '--color-background-content' },
                                    ].map(({ label, var: v }) => (
                                        <div key={v} className="flex items-center gap-2 p-2 bg-background rounded-xl border border-border">
                                            <div className="w-8 h-8 rounded-lg border border-border flex-shrink-0" style={{ backgroundColor: currentTheme[v] }} />
                                            <div>
                                                <div className="text-[10px] font-bold text-text-main">{label}</div>
                                                <div className="text-[9px] font-mono text-text-muted">{currentTheme[v]}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard title="Form Elements" description="Inputs and controls with current theme">
                                <div className="space-y-3 p-4 bg-background rounded-xl">
                                    <input placeholder="Text input placeholder..." className="w-full h-10 px-4 rounded-xl border border-border bg-background-content/10 text-sm text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                                    <select className="w-full h-10 px-4 rounded-xl border border-border bg-background-content/10 text-sm text-text-main outline-none focus:border-primary transition-all">
                                        <option>Select an option...</option>
                                        <option>Lehenga Choli</option>
                                        <option>Saree</option>
                                    </select>
                                    <textarea placeholder="Multi-line textarea..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background-content/10 text-sm text-text-main outline-none focus:border-primary transition-all resize-none" />
                                </div>
                            </SectionCard>

                            <SectionCard title="Cards & Badges" description="Component containers and status indicators">
                                <div className="space-y-3 p-4 bg-background rounded-xl">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">In Progress</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500">Completed</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500">Pending</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500">Overdue</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500">Draft</span>
                                    </div>
                                    <div className="bg-surface border border-border rounded-xl p-4">
                                        <div className="text-sm font-bold text-text-main">Sample Card</div>
                                        <div className="text-xs text-text-secondary mt-1">This shows how cards look with the current border-radius and surface color.</div>
                                    </div>
                                </div>
                            </SectionCard>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ThemeBuilder;
