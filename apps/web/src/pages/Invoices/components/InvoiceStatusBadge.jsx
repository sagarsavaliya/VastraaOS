import React from 'react';

const STATUS_CONFIG = {
    draft: { label: 'Draft', classes: 'bg-background-content text-text-secondary border-border' },
    issued: { label: 'Issued', classes: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    partial: { label: 'Partial', classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    paid: { label: 'Paid', classes: 'bg-green-500/10 text-green-500 border-green-500/20' },
    overdue: { label: 'Overdue', classes: 'bg-red-500/10 text-red-500 border-red-500/20' },
    cancelled: { label: 'Cancelled', classes: 'bg-red-500/10 text-red-500 border-red-500/20 line-through' },
};

const InvoiceStatusBadge = ({ status, className = '' }) => {
    const config = STATUS_CONFIG[status?.toLowerCase()] || { label: status || 'Unknown', classes: 'bg-background-content text-text-secondary border-border' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.classes} ${className}`}>
            {config.label}
        </span>
    );
};

export default InvoiceStatusBadge;
