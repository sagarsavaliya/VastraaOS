import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Palette, Type, Layout, BoxSelect, RefreshCw, Sun, Moon,
    Check, ChevronDown, Sliders, Zap, Sparkles, Wand2
} from 'lucide-react';
import { ModernButton } from '../../components/UI/CustomInputs';

const ThemeBuilder = () => {
    const { mode, toggleTheme, themeConfig, updateThemeVariable } = useTheme();
    const currentTheme = themeConfig[mode];
    const [activeTab, setActiveTab] = useState('colors');

    const handleChange = (key, value) => {
        updateThemeVariable(key, value);
    };

    // --- UI Components ---

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                relative w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 overflow-hidden group
                ${activeTab === id
                    ? 'bg-primary text-white shadow-[0_20px_40px_-12px_rgba(var(--color-primary-rgb),0.4)] scale-[1.02]'
                    : 'text-text-muted hover:bg-background-content/10 hover:text-text-main'}
            `}
        >
            {activeTab === id && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-in slide-in-from-left duration-500" />
            )}
            <Icon size={20} className={`transition-transform duration-500 ${activeTab === id ? 'rotate-12 scale-110' : 'group-hover:scale-110'}`} />
            <span className="uppercase tracking-[0.2em] italic">{label}</span>
        </button>
    );

    const SectionHeader = ({ title, description }) => (
        <div className="mb-10">
            <h3 className="text-2xl font-black text-text-main tracking-tighter italic uppercase flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded-full" />
                {title}
            </h3>
            {description && <p className="text-xs font-bold text-text-muted mt-2 uppercase tracking-widest">{description}</p>}
        </div>
    );

    const ControlGroup = ({ label, children }) => (
        <div className="bg-background-content/10 backdrop-blur-md p-8 rounded-[2rem] border border-border/50 hover:border-primary/30 transition-all duration-500 group shadow-lg">
            <label className="text-[10px] font-black text-text-muted mb-6 block uppercase tracking-[0.3em] group-hover:text-primary transition-colors">{label}</label>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const ColorSwatch = ({ label, variable }) => (
        <div className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-border/30">
            <div className="relative w-14 h-14 rounded-2xl shadow-2xl ring-2 ring-white/10 overflow-hidden shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">
                <input
                    type="color"
                    value={currentTheme[variable]}
                    onChange={(e) => handleChange(variable, e.target.value)}
                    className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 p-0 border-0 cursor-pointer"
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-text-main truncate uppercase tracking-wider">{label}</div>
                <div className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 italic">{currentTheme[variable]}</div>
            </div>
        </div>
    );

    const SliderControl = ({ label, variable, min = 0, max = 100, step = 1, unit = 'px' }) => {
        const val = parseFloat(currentTheme[variable]) || 0;

        const handleSliderChange = (e) => {
            handleChange(variable, `${e.target.value}${unit}`);
        };

        return (
            <div className="mb-6 last:mb-0">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">{label}</span>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 tracking-widest">
                        {currentTheme[variable]}
                    </span>
                </div>
                <div className="relative group">
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={val}
                        onChange={handleSliderChange}
                        className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-xl [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(0,0,0,0.5)] [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                    />
                </div>
            </div>
        );
    };

    const SelectControl = ({ label, variable, options }) => (
        <div className="mb-6 last:mb-0 group">
            <div className="text-[10px] font-black text-text-muted mb-3 uppercase tracking-widest italic">{label}</div>
            <div className="relative">
                <select
                    value={currentTheme[variable]}
                    onChange={(e) => handleChange(variable, e.target.value)}
                    className="w-full appearance-none bg-background/50 text-text-main text-xs font-bold px-5 py-4 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer uppercase tracking-widest"
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-surface text-text-main">{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-primary transition-colors">
                    <ChevronDown size={18} />
                </div>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-1000">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/30 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px] animate-pulse duration-[8s]" />
            </div>

            <div className="max-w-[1600px] mx-auto p-8 md:p-16 relative z-10">
                {/* --- Header --- */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Wand2 className="text-primary animate-bounce" size={24} />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">System Aesthetics Core</span>
                        </div>
                        <h1 className="text-7xl font-black text-text-main tracking-tighter mb-4 italic uppercase">
                            Theme<span className="text-primary italic">Studio</span>
                        </h1>
                        <p className="text-text-muted text-lg font-bold max-w-2xl uppercase tracking-widest opacity-60">
                            Engineering the visual architecture of your enterprise ecosystem.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 bg-surface/30 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl">
                        {/* Mode Switcher */}
                        <div className="flex bg-background/50 rounded-2xl p-1.5 border border-white/5 shadow-inner">
                            <button
                                onClick={() => mode === 'dark' && toggleTheme()}
                                className={`
                                    flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all duration-500 uppercase tracking-widest
                                    ${mode === 'light'
                                        ? 'bg-white text-gray-900 shadow-[0_8px_20px_rgba(255,255,255,0.2)] scale-105'
                                        : 'text-text-muted hover:text-white'}
                                `}
                            >
                                <Sun size={16} fill={mode === 'light' ? 'currentColor' : 'none'} />
                                Daylight
                            </button>
                            <button
                                onClick={() => mode === 'light' && toggleTheme()}
                                className={`
                                    flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all duration-500 uppercase tracking-widest
                                    ${mode === 'dark'
                                        ? 'bg-slate-800 text-white shadow-[0_8px_20px_rgba(0,0,0,0.5)] scale-105'
                                        : 'text-text-muted hover:text-white'}
                                `}
                            >
                                <Moon size={16} fill={mode === 'dark' ? 'currentColor' : 'none'} />
                                Midnight
                            </button>
                        </div>

                        <div className="w-px h-10 bg-white/10" />

                        <button
                            onClick={() => window.location.reload()}
                            className="w-14 h-14 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all duration-500 flex items-center justify-center shadow-lg hover:rotate-180"
                            title="Purge Modifications"
                        >
                            <RefreshCw size={24} />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-12">

                    {/* --- Sidebar Navigation --- */}
                    <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-12 space-y-12">
                            <nav className="space-y-4">
                                <TabButton id="colors" label="Neural Colors" icon={Palette} />
                                <TabButton id="typography" label="Type Matrix" icon={Type} />
                                <TabButton id="layout" label="Spatial Flow" icon={Layout} />
                                <TabButton id="effects" label="Visual Depth" icon={BoxSelect} />
                            </nav>

                            {/* Render Engine Card */}
                            <div className="p-10 bg-surface/20 backdrop-blur-3xl rounded-[3rem] border border-white/10 hidden lg:block shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity duration-1000">
                                    <Sparkles size={48} className="text-primary rotate-12" />
                                </div>
                                <h4 className="text-[10px] font-black text-text-muted mb-8 flex items-center gap-3 uppercase tracking-[0.4em]">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                    Live Render Engine
                                </h4>
                                <div className="space-y-6">
                                    <ModernButton
                                        variant="primary"
                                        className="w-full !rounded-[1.5rem] !py-5 shadow-2xl shadow-primary/20 scale-105"
                                    >
                                        PRIMARY ACTION
                                    </ModernButton>
                                    <ModernButton
                                        variant="ghost"
                                        className="w-full !rounded-[1.5rem] !py-5 border-2 border-primary/30"
                                    >
                                        SECONDARY FLOW
                                    </ModernButton>
                                    <div className="pt-4 p-6 bg-background/40 rounded-3xl border border-white/5">
                                        <p className="text-sm font-bold text-text-main leading-relaxed tracking-tight italic">
                                            "The <span className="text-primary">convergence</span> of fabric and intelligence creates the next generation of industrial design."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Main Configuration Area --- */}
                    <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                        <div className="bg-surface/10 backdrop-blur-3xl rounded-[4rem] border border-white/5 shadow-[0_64px_128px_-24px_rgba(0,0,0,0.4)] p-12 lg:p-20 animate-in fade-in slide-in-from-right-12 duration-1000">

                            {/* COLORS */}
                            {activeTab === 'colors' && (
                                <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <section>
                                        <SectionHeader title="Core Identity Matrix" description="Regulate the fundamental frequencies of your brand." />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <ControlGroup label="Primary Spectrum">
                                                <ColorSwatch label="Base Frequency" variable="--color-primary" />
                                                <ColorSwatch label="Hover State" variable="--color-primary-hover" />
                                            </ControlGroup>
                                            <ControlGroup label="Secondary Array">
                                                <ColorSwatch label="Accent Core" variable="--color-secondary" />
                                                <ColorSwatch label="Accent Pulse" variable="--color-secondary-hover" />
                                            </ControlGroup>
                                        </div>
                                    </section>

                                    <section>
                                        <SectionHeader title="Status Protocols" description="Semantic signals for system communication." />
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <ControlGroup label="Success"><ColorSwatch label="Positive" variable="--color-success" /></ControlGroup>
                                            <ControlGroup label="Warning"><ColorSwatch label="Caution" variable="--color-warning" /></ControlGroup>
                                            <ControlGroup label="Error"><ColorSwatch label="Critical" variable="--color-error" /></ControlGroup>
                                            <ControlGroup label="Info"><ColorSwatch label="Neutral" variable="--color-info" /></ControlGroup>
                                        </div>
                                    </section>

                                    <section>
                                        <SectionHeader title="The Void & Surface" description="Atmospheric depth and information containers." />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <ControlGroup label="Atmosphere">
                                                <ColorSwatch label="Base Void" variable="--color-background" />
                                                <ColorSwatch label="Work Area" variable="--color-background-content" />
                                                <ColorSwatch label="Material" variable="--color-surface" />
                                            </ControlGroup>
                                            <ControlGroup label="Intelligence">
                                                <ColorSwatch label="Primary Intel" variable="--color-text-main" />
                                                <ColorSwatch label="Secondary" variable="--color-text-secondary" />
                                                <ColorSwatch label="Muted Data" variable="--color-text-muted" />
                                            </ControlGroup>
                                            <ControlGroup label="Boundaries">
                                                <ColorSwatch label="Static Line" variable="--color-border" />
                                                <ColorSwatch label="Active Link" variable="--color-border-hover" />
                                            </ControlGroup>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* TYPOGRAPHY */}
                            {activeTab === 'typography' && (
                                <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <section>
                                        <SectionHeader title="Font Topography" description="Establish the legibility matrix for your interface." />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <ControlGroup label="Body Logic">
                                                <SelectControl
                                                    label="Base Typeface"
                                                    variable="--font-family-base"
                                                    options={[
                                                        { label: 'Inter Paradigm', value: '"Inter", system-ui, sans-serif' },
                                                        { label: 'Roboto Core', value: '"Roboto", sans-serif' },
                                                        { label: 'Neural System', value: 'system-ui, -apple-system, sans-serif' },
                                                        { label: 'Antique Serif', value: 'Georgia, serif' },
                                                    ]}
                                                />
                                            </ControlGroup>
                                            <ControlGroup label="Identity Type">
                                                <SelectControl
                                                    label="Heading Matrix"
                                                    variable="--font-family-heading"
                                                    options={[
                                                        { label: 'Inter Bold', value: '"Inter", system-ui, sans-serif' },
                                                        { label: 'Roboto Bold', value: '"Roboto", sans-serif' },
                                                        { label: 'Playfair Luxe', value: '"Playfair Display", serif' },
                                                    ]}
                                                />
                                            </ControlGroup>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* LAYOUT */}
                            {activeTab === 'layout' && (
                                <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <section>
                                        <SectionHeader title="Structural Ratios" description="Control the dimensional flow of system modules." />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <ControlGroup label="Sidebar Extension">
                                                <SliderControl label="Standard Span" variable="--sidebar-width" min={200} max={400} />
                                                <SliderControl label="Collapsed Core" variable="--sidebar-collapsed-width" min={48} max={100} />
                                            </ControlGroup>
                                            <ControlGroup label="Curvature Logic">
                                                <SliderControl label="Atomic (sm)" variable="--border-radius-sm" min={0} max={4} unit="rem" step={0.25} />
                                                <SliderControl label="Standard (md)" variable="--border-radius-md" min={0} max={6} unit="rem" step={0.25} />
                                                <SliderControl label="Complex (lg)" variable="--border-radius-lg" min={0} max={8} unit="rem" step={0.25} />
                                                <SliderControl label="Extreme (xl)" variable="--border-radius-xl" min={0} max={12} unit="rem" step={0.25} />
                                            </ControlGroup>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* EFFECTS */}
                            {activeTab === 'effects' && (
                                <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <section>
                                        <SectionHeader title="Quantum Shadows" description="Regulation of perceived depth and layering." />
                                        <div className="p-20 bg-background/20 rounded-[4rem] border border-white/5 flex flex-wrap gap-20 justify-center">
                                            <div className="w-48 h-48 bg-surface/40 backdrop-blur-md rounded-[2.5rem] shadow-sm flex items-center justify-center text-text-muted border border-white/10 font-black uppercase tracking-widest text-[10px]">
                                                Surface
                                            </div>
                                            <div className="w-48 h-48 bg-surface/60 backdrop-blur-md rounded-[2.5rem] shadow-xl shadow-black/40 flex items-center justify-center text-text-main border border-white/20 font-black uppercase tracking-widest text-[10px] scale-105">
                                                Elevated
                                            </div>
                                            <div className="w-48 h-48 bg-primary rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(var(--color-primary-rgb),0.5)] flex items-center justify-center text-white font-black uppercase tracking-widest text-[10px] scale-110">
                                                Peak
                                            </div>
                                        </div>
                                        <div className="mt-12 text-center text-text-muted text-xs font-bold uppercase tracking-[0.5em] opacity-40">
                                            Shadow algorithms are currently hardcoded in core CSS.
                                        </div>
                                    </section>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeBuilder;
