import React, { useState, useEffect, useCallback } from 'react';
import { Building2, MapPin, Receipt, FileDigit, Globe2, FileText } from 'lucide-react';
import { ModernInput, ModernTextArea, ModernButton } from '../../../components/UI/CustomInputs';
import { useToast } from '../../../components/UI/Toast';
import { getTenantSettings, updateTenantSettings } from '../services/settingsService';

const MONTH_NAMES = [
    { value: 1, label: 'January (1)' },
    { value: 2, label: 'February (2)' },
    { value: 3, label: 'March (3)' },
    { value: 4, label: 'April (4)' },
    { value: 5, label: 'May (5)' },
    { value: 6, label: 'June (6)' },
    { value: 7, label: 'July (7)' },
    { value: 8, label: 'August (8)' },
    { value: 9, label: 'September (9)' },
    { value: 10, label: 'October (10)' },
    { value: 11, label: 'November (11)' },
    { value: 12, label: 'December (12)' },
];

const SectionCard = ({ icon: Icon, title, description, children }) => (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3 pb-2 border-b border-border">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={16} className="text-primary" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-text-main">{title}</h3>
                {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
            </div>
        </div>
        {children}
    </div>
);

const NativeSelect = ({ label, value, onChange, options, disabled = false }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && (
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                {label}
            </label>
        )}
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="h-11 px-4 rounded-xl border border-border bg-background-content/10 text-sm text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-border-hover hover:bg-background-content/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface text-text-main">
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between gap-4">
        <div>
            <p className="text-sm font-bold text-text-main">{label}</p>
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                checked ? 'bg-primary shadow-[0_0_12px_rgba(99,102,241,0.35)]' : 'bg-border'
            }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                    checked ? 'translate-x-6' : 'translate-x-0'
                }`}
            />
        </button>
    </div>
);

const SegmentedControl = ({ value, onChange, options }) => (
    <div className="flex gap-1 p-1 bg-background rounded-xl border border-border">
        {options.map((opt) => (
            <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                    value === opt.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-muted hover:text-text-main'
                }`}
            >
                {opt.label}
            </button>
        ))}
    </div>
);

const flattenSettings = (data) => {
    if (!data) return {};
    const { tenant = {}, settings = {} } = data;
    return {
        business_name: tenant.business_name ?? '',
        display_name: tenant.display_name ?? '',
        email: tenant.email ?? '',
        mobile: tenant.mobile ?? '',
        address: tenant.address ?? '',
        city: tenant.city ?? '',
        state: tenant.state ?? '',
        state_code: tenant.state_code ?? '',
        pincode: tenant.pincode ?? '',
        gst_module_enabled: settings.gst_module_enabled ?? false,
        gst_number: settings.gst_number ?? '',
        gst_registered_name: settings.gst_registered_name ?? '',
        pan_number: settings.pan_number ?? '',
        hidden_gst_percentage: settings.hidden_gst_percentage ?? 12,
        gst_invoice_prefix: settings.gst_invoice_prefix ?? 'GST',
        non_gst_invoice_prefix: settings.non_gst_invoice_prefix ?? 'INV',
        order_prefix: settings.order_prefix ?? 'ORD',
        financial_year_start: settings.financial_year_start ?? 4,
        currency: settings.currency ?? 'INR',
        timezone: settings.timezone ?? 'Asia/Kolkata',
        date_format: settings.date_format ?? 'd M Y',
        measurement_unit: settings.measurement_unit ?? 'inches',
        terms_and_conditions: settings.terms_and_conditions ?? '',
        invoice_notes: settings.invoice_notes ?? '',
    };
};

const diffFields = (original, current) => {
    const changed = {};
    for (const key of Object.keys(current)) {
        if (current[key] !== original[key]) {
            changed[key] = current[key];
        }
    }
    return changed;
};

const BusinessProfileSection = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [original, setOriginal] = useState({});
    const [form, setForm] = useState({});

    const loadSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await getTenantSettings();
            const flat = flattenSettings(data.data ?? data);
            setOriginal(flat);
            setForm(flat);
        } catch {
            showToast('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const set = (field) => (e) => {
        const val = e && e.target !== undefined ? e.target.value : e;
        setForm((prev) => ({ ...prev, [field]: val }));
    };

    const handleReset = () => setForm(original);

    const handleSave = async () => {
        const diff = diffFields(original, form);
        if (Object.keys(diff).length === 0) {
            showToast('No changes to save', 'info');
            return;
        }
        setSaving(true);
        try {
            await updateTenantSettings(diff);
            setOriginal(form);
            showToast('Settings saved successfully', 'success');
        } catch (err) {
            showToast(err?.response?.data?.message ?? 'Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-surface border border-border rounded-2xl p-6 animate-pulse">
                        <div className="h-4 bg-background-content/30 rounded-lg w-1/3 mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-11 bg-background-content/20 rounded-xl" />
                            <div className="h-11 bg-background-content/20 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Section 1: Business Profile */}
            <SectionCard
                icon={Building2}
                title="Business Profile"
                description="Your business identity displayed on invoices and communications"
            >
                <div className="grid grid-cols-2 gap-4">
                    <ModernInput
                        label="Business Name"
                        value={form.business_name}
                        onChange={set('business_name')}
                        placeholder="Naari Arts"
                        required
                    />
                    <ModernInput
                        label="Display Name"
                        value={form.display_name}
                        onChange={set('display_name')}
                        placeholder="Naari Arts Surat"
                    />
                    <ModernInput
                        label="Business Email"
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="hello@naarirts.com"
                        required
                    />
                    <ModernInput
                        label="Mobile Number"
                        value={form.mobile}
                        onChange={set('mobile')}
                        placeholder="+91 98765 43210"
                    />
                </div>
            </SectionCard>

            {/* Section 2: Location */}
            <SectionCard
                icon={MapPin}
                title="Location"
                description="Business address for invoices and legal documents"
            >
                <ModernInput
                    label="Address"
                    value={form.address}
                    onChange={set('address')}
                    placeholder="Shop No. 12, Textile Market"
                />
                <div className="grid grid-cols-2 gap-4">
                    <ModernInput
                        label="City"
                        value={form.city}
                        onChange={set('city')}
                        placeholder="Surat"
                    />
                    <ModernInput
                        label="State"
                        value={form.state}
                        onChange={set('state')}
                        placeholder="Gujarat"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <ModernInput
                        label="State Code"
                        value={form.state_code}
                        onChange={set('state_code')}
                        placeholder="24"
                    />
                    <ModernInput
                        label="Pincode"
                        value={form.pincode}
                        onChange={set('pincode')}
                        placeholder="395003"
                    />
                </div>
            </SectionCard>

            {/* Section 3: GST & Tax */}
            <SectionCard
                icon={Receipt}
                title="GST & Tax Settings"
                description="Configure tax registration details and GST invoice behavior"
            >
                <ToggleSwitch
                    checked={form.gst_module_enabled}
                    onChange={(val) => setForm((prev) => ({ ...prev, gst_module_enabled: val }))}
                    label="GST Module Enabled"
                    description="Enable to generate GST-compliant invoices with tax breakdowns"
                />
                {form.gst_module_enabled && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <ModernInput
                            label="GST Number"
                            value={form.gst_number}
                            onChange={set('gst_number')}
                            placeholder="22AAAAA0000A1Z5"
                            maxLength={15}
                        />
                        <ModernInput
                            label="GST Registered Name"
                            value={form.gst_registered_name}
                            onChange={set('gst_registered_name')}
                            placeholder="Naari Arts LLP"
                        />
                        <ModernInput
                            label="PAN Number"
                            value={form.pan_number}
                            onChange={set('pan_number')}
                            placeholder="AAAAA0000A"
                            maxLength={10}
                        />
                        <ModernInput
                            label="Hidden GST % (0–28)"
                            type="number"
                            value={form.hidden_gst_percentage}
                            onChange={set('hidden_gst_percentage')}
                            placeholder="12"
                            min={0}
                            max={28}
                        />
                    </div>
                )}
            </SectionCard>

            {/* Section 4: Invoice & Numbering */}
            <SectionCard
                icon={FileDigit}
                title="Invoice & Numbering"
                description="Customize invoice number prefixes and financial year settings"
            >
                <div className="grid grid-cols-2 gap-4">
                    <ModernInput
                        label="GST Invoice Prefix"
                        value={form.gst_invoice_prefix}
                        onChange={set('gst_invoice_prefix')}
                        placeholder="GST"
                        maxLength={20}
                    />
                    <ModernInput
                        label="Non-GST Invoice Prefix"
                        value={form.non_gst_invoice_prefix}
                        onChange={set('non_gst_invoice_prefix')}
                        placeholder="INV"
                        maxLength={20}
                    />
                    <ModernInput
                        label="Order Prefix"
                        value={form.order_prefix}
                        onChange={set('order_prefix')}
                        placeholder="ORD"
                        maxLength={20}
                    />
                    <NativeSelect
                        label="Financial Year Start"
                        value={form.financial_year_start}
                        onChange={set('financial_year_start')}
                        options={MONTH_NAMES}
                    />
                </div>
            </SectionCard>

            {/* Section 5: Localization */}
            <SectionCard
                icon={Globe2}
                title="Localization"
                description="Regional preferences for measurements, currency and time"
            >
                <div className="grid grid-cols-3 gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                            Measurement Unit
                        </label>
                        <SegmentedControl
                            value={form.measurement_unit}
                            onChange={(val) => setForm((prev) => ({ ...prev, measurement_unit: val }))}
                            options={[
                                { value: 'inches', label: 'Inches' },
                                { value: 'cm', label: 'Centimetres' },
                            ]}
                        />
                    </div>
                    <ModernInput
                        label="Currency"
                        value={form.currency}
                        onChange={set('currency')}
                        disabled
                    />
                    <ModernInput
                        label="Timezone"
                        value={form.timezone}
                        onChange={set('timezone')}
                        readOnly
                    />
                </div>
            </SectionCard>

            {/* Section 6: Invoice Templates */}
            <SectionCard
                icon={FileText}
                title="Invoice Templates"
                description="Default text printed on invoices and order documents"
            >
                <div className="grid grid-cols-2 gap-4">
                    <ModernTextArea
                        label="Terms & Conditions"
                        value={form.terms_and_conditions}
                        onChange={set('terms_and_conditions')}
                        placeholder="Goods once sold will not be taken back..."
                        rows={4}
                    />
                    <ModernTextArea
                        label="Invoice Notes"
                        value={form.invoice_notes}
                        onChange={set('invoice_notes')}
                        placeholder="Thank you for your business!"
                        rows={3}
                    />
                </div>
            </SectionCard>

            {/* Bottom action bar */}
            <div className="flex justify-end gap-3 pt-2 pb-2 border-t border-border">
                <ModernButton variant="secondary" onClick={handleReset}>
                    Reset
                </ModernButton>
                <ModernButton variant="primary" onClick={handleSave} loading={saving}>
                    Save Changes
                </ModernButton>
            </div>
        </div>
    );
};

export default BusinessProfileSection;
