import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/UI/Toast';
import {
    Settings as SettingsIcon,
    Globe,
    Database,
    Zap,
    Layout,
    FileText,
    Users,
    CreditCard,
    ShoppingBag,
    Tag,
    Palette,
    Layers,
    MoveUp,
    Hash
} from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import MasterDataSection from './MasterDataSection';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [seeding, setSeeding] = useState(false);
    const { showToast } = useToast();

    const handleSeedDefaults = async () => {
        if (!confirm('This will populate your workspace with default master data (Item Types, Occasions, etc.). Continue?')) return;

        setSeeding(true);
        try {
            await api.post('/masters/seed-defaults');
            showToast('Default data seeded successfully! Please refresh or switch tabs to see changes.', 'success');
        } catch (err) {
            showToast('Failed to seed defaults', 'error');
        } finally {
            setSeeding(seeding);
            setSeeding(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'inquiry-sources', label: 'Inquiry Sources', icon: Zap },
        { id: 'occasions', label: 'Occasions', icon: Palette },
        { id: 'item-types', label: 'Item Types', icon: ShoppingBag },
        { id: 'work-types', label: 'Work Types', icon: Layers },
        { id: 'embellishment-zones', label: 'Embellishment Zones', icon: Layout },
        { id: 'budget-ranges', label: 'Budget Ranges', icon: Tag },
        // { id: 'status-priorities', label: 'Status & Priorities', icon: Hash },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="bg-surface border border-border rounded-[2rem] p-8">
                        <h2 className="text-xl font-bold text-text-main mb-6">Business Profile</h2>
                        <div className="flex items-center justify-center p-12 text-text-muted italic bg-background/50 rounded-2xl border border-dashed border-border">
                            General business settings, logo, and address management (Coming in next release)
                        </div>
                    </div>
                );
            case 'inquiry-sources':
                return (
                    <MasterDataSection
                        type="inquiry-sources"
                        title="Inquiry Sources"
                        description="Define where your inquiries come from (e.g. WhatsApp, Instagram, Walk-in)"
                        columns={[
                            {
                                key: 'icon',
                                label: 'Icon',
                                render: (item) => <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-mono">{item.icon}</span>
                            },
                        ]}
                    />
                );
            case 'occasions':
                return (
                    <MasterDataSection
                        type="occasions"
                        title="Occasions"
                        description="Manage event types for better tracking (e.g. Wedding, Party, Festival)"
                        columns={[
                            {
                                key: 'color',
                                label: 'Color',
                                render: (item) => (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: item.color }}></div>
                                        <span className="font-mono text-[10px]">{item.color}</span>
                                    </div>
                                )
                            },
                        ]}
                    />
                );
            case 'item-types':
                return (
                    <MasterDataSection
                        type="item-types"
                        title="Item Types"
                        description="Manage the types of garments you handle (e.g. Gown, Saree, Lehenga)"
                        columns={[
                            { key: 'hsn_code', label: 'HSN Code' },
                            {
                                key: 'gst_rate',
                                label: 'GST Rate',
                                render: (item) => `${item.gst_rate}%`
                            },
                        ]}
                    />
                );
            case 'work-types':
                return (
                    <MasterDataSection
                        type="work-types"
                        title="Work Types"
                        description="Define various types of hand-work and embroidery"
                        columns={[]}
                    />
                );
            case 'embellishment-zones':
                return (
                    <MasterDataSection
                        type="embellishment-zones"
                        title="Embellishment Zones"
                        description="Standard body sections for embroidery work"
                        columns={[]}
                    />
                );
            case 'budget-ranges':
                return (
                    <MasterDataSection
                        type="budget-ranges"
                        title="Budget Ranges"
                        description="Categorize customers by their budget expectations"
                        columns={[
                            {
                                key: 'range',
                                label: 'Range',
                                render: (item) => (
                                    <span className="font-bold">
                                        {item.min_amount.toLocaleString('en-IN')} - {item.max_amount ? item.max_amount.toLocaleString('en-IN') : '∞'}
                                    </span>
                                )
                            },
                        ]}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Workspace Settings"
                subtitle="Manage your organization's preferences and master data"
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-72 flex-shrink-0">
                    <div className="bg-surface border border-border rounded-[2rem] p-4 sticky top-6">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-soft'
                                        : 'text-text-muted hover:bg-background hover:text-text-main'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-6 pt-6 border-t border-border px-2">
                            <button
                                onClick={handleSeedDefaults}
                                disabled={seeding}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-primary hover:bg-primary/5 transition-all border border-dashed border-primary/30 disabled:opacity-50"
                            >
                                <Zap size={16} />
                                {seeding ? 'Seeding...' : 'Initialize Defaults'}
                            </button>
                            <p className="mt-2 text-[10px] text-text-muted px-2 italic">
                                Populates your workspace with suggested categories and types.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
