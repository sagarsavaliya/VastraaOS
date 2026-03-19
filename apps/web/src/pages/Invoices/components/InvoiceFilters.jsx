import React from 'react';
import { X } from 'lucide-react';
import { ModernButton } from '../../../components/UI/CustomInputs';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'issued', label: 'Issued' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'gst', label: 'GST Invoice' },
    { value: 'simple', label: 'Simple Invoice' },
];

const selectClass = "h-9 pl-3 pr-8 bg-background border border-border rounded-xl text-sm text-text-main outline-none focus:border-primary/60 appearance-none cursor-pointer";
const dateClass = "h-9 px-3 bg-background border border-border rounded-xl text-sm text-text-main outline-none focus:border-primary/60";

const InvoiceFilters = ({ filters, onChange }) => {
    const hasActiveFilters = filters.status || filters.invoice_type || filters.date_from || filters.date_to;

    const handleChange = (key, value) => onChange({ ...filters, [key]: value });

    const clearAll = () => onChange({ status: '', invoice_type: '', date_from: '', date_to: '' });

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
                <select
                    value={filters.status}
                    onChange={e => handleChange('status', e.target.value)}
                    className={selectClass}
                >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            <div className="relative">
                <select
                    value={filters.invoice_type}
                    onChange={e => handleChange('invoice_type', e.target.value)}
                    className={selectClass}
                >
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={filters.date_from}
                    onChange={e => handleChange('date_from', e.target.value)}
                    className={dateClass}
                    title="From date"
                />
                <span className="text-text-muted text-sm">—</span>
                <input
                    type="date"
                    value={filters.date_to}
                    onChange={e => handleChange('date_to', e.target.value)}
                    className={dateClass}
                    title="To date"
                />
            </div>

            {hasActiveFilters && (
                <ModernButton
                    size="sm"
                    variant="ghost"
                    icon={X}
                    onClick={clearAll}
                >
                    Clear
                </ModernButton>
            )}
        </div>
    );
};

export default InvoiceFilters;
