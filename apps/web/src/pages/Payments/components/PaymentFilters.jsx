import React from 'react';
import { X } from 'lucide-react';
import { ModernButton } from '../../../components/UI/CustomInputs';

const MODE_OPTIONS = [
    { value: '', label: 'All Modes' },
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'voided', label: 'Voided' },
    { value: 'refunded', label: 'Refunded' },
];

const selectClass = "h-9 pl-3 pr-8 bg-background border border-border rounded-xl text-sm text-text-main outline-none focus:border-primary/60 appearance-none cursor-pointer";
const dateClass = "h-9 px-3 bg-background border border-border rounded-xl text-sm text-text-main outline-none focus:border-primary/60";

const PaymentFilters = ({ filters, onChange }) => {
    const hasActive = filters.mode || filters.status || filters.date_from || filters.date_to;
    const set = (key, val) => onChange({ ...filters, [key]: val });

    return (
        <div className="flex flex-wrap items-center gap-3">
            <select value={filters.mode} onChange={e => set('mode', e.target.value)} className={selectClass}>
                {MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filters.status} onChange={e => set('status', e.target.value)} className={selectClass}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex items-center gap-2">
                <input type="date" value={filters.date_from} onChange={e => set('date_from', e.target.value)} className={dateClass} title="From" />
                <span className="text-text-muted text-sm">—</span>
                <input type="date" value={filters.date_to} onChange={e => set('date_to', e.target.value)} className={dateClass} title="To" />
            </div>
            {hasActive && (
                <ModernButton
                    size="sm"
                    variant="ghost"
                    icon={X}
                    onClick={() => onChange({ mode: '', status: '', date_from: '', date_to: '' })}
                >
                    Clear
                </ModernButton>
            )}
        </div>
    );
};

export default PaymentFilters;
