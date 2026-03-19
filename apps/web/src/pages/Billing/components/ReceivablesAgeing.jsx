import React from 'react';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const BUCKET_CONFIG = [
    { label: '0–30 Days', colorBg: 'bg-green-500/10', colorBorder: 'border-green-500/20', colorText: 'text-green-500', colorBadge: 'bg-green-500/10 text-green-500' },
    { label: '31–60 Days', colorBg: 'bg-amber-500/10', colorBorder: 'border-amber-500/20', colorText: 'text-amber-500', colorBadge: 'bg-amber-500/10 text-amber-500' },
    { label: '61–90 Days', colorBg: 'bg-orange-500/10', colorBorder: 'border-orange-500/20', colorText: 'text-orange-500', colorBadge: 'bg-orange-500/10 text-orange-500' },
    { label: '90+ Days', colorBg: 'bg-red-500/10', colorBorder: 'border-red-500/20', colorText: 'text-red-500', colorBadge: 'bg-red-500/10 text-red-500' },
];

const ReceivablesAgeing = ({ ageing }) => {
    const buckets = ageing?.buckets || [];

    return (
        <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col gap-4">
            <h3 className="font-bold text-text-main tracking-tight">Receivables Ageing</h3>
            <div className="grid grid-cols-2 gap-3">
                {BUCKET_CONFIG.map((cfg, i) => {
                    const bucket = buckets[i] || {};
                    return (
                        <div
                            key={cfg.label}
                            className={`rounded-xl border p-4 ${cfg.colorBg} ${cfg.colorBorder} flex flex-col gap-2`}
                        >
                            <span className={`text-xs font-bold uppercase tracking-wider ${cfg.colorText}`}>
                                {cfg.label}
                            </span>
                            <span className={`inline-flex items-center justify-center w-fit px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.colorBadge}`}>
                                {bucket.count || 0} invoices
                            </span>
                            <p className={`text-base font-bold ${cfg.colorText}`}>
                                {formatINR(bucket.amount)}
                            </p>
                        </div>
                    );
                })}
            </div>
            {buckets.length === 0 && (
                <p className="text-sm text-text-muted text-center py-2 italic">No receivables data available</p>
            )}
        </div>
    );
};

export default ReceivablesAgeing;
