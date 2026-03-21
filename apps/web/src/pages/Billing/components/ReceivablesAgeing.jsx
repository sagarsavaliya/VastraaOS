import React from 'react';
import { TrendingUp } from 'lucide-react';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const BUCKET_CONFIG = [
    { label: '0–30 Days', risk: 'Fresh', colorBg: 'bg-green-500/10', colorBorder: 'border-green-500/25', colorText: 'text-green-400', colorBar: 'bg-green-500', colorBadge: 'bg-green-500/15 text-green-400' },
    { label: '31–60 Days', risk: 'Aging', colorBg: 'bg-amber-500/10', colorBorder: 'border-amber-500/25', colorText: 'text-amber-400', colorBar: 'bg-amber-500', colorBadge: 'bg-amber-500/15 text-amber-400' },
    { label: '61–90 Days', risk: 'Late', colorBg: 'bg-orange-500/10', colorBorder: 'border-orange-500/25', colorText: 'text-orange-400', colorBar: 'bg-orange-500', colorBadge: 'bg-orange-500/15 text-orange-400' },
    { label: '90+ Days', risk: 'Critical', colorBg: 'bg-red-500/10', colorBorder: 'border-red-500/25', colorText: 'text-red-400', colorBar: 'bg-red-500', colorBadge: 'bg-red-500/15 text-red-400' },
];

const ReceivablesAgeing = ({ ageing, loading }) => {
    const buckets = ageing?.buckets || [];
    const totalAmount = buckets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const maxAmount = Math.max(...buckets.map(b => parseFloat(b.amount) || 0), 1);

    return (
        <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-text-main tracking-tight">Receivables Ageing</h3>
                {totalAmount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary bg-background-content/50 rounded-xl px-3 py-1.5 border border-border">
                        <TrendingUp size={13} className="text-primary" />
                        Total: <span className="text-text-main">{formatINR(totalAmount)}</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-2.5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-background-content/20 animate-pulse h-16" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2.5">
                    {BUCKET_CONFIG.map((cfg, i) => {
                        const bucket = buckets[i] || {};
                        const amount = parseFloat(bucket.amount) || 0;
                        const count = bucket.count || 0;
                        const barWidth = totalAmount > 0 ? Math.round((amount / maxAmount) * 100) : 0;

                        return (
                            <div
                                key={cfg.label}
                                className={`rounded-xl border px-3 py-2.5 ${cfg.colorBg} ${cfg.colorBorder} flex flex-col gap-1`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.colorText}`}>
                                        {cfg.label}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${cfg.colorBadge}`}>
                                        {cfg.risk}
                                    </span>
                                </div>

                                <p className={`text-sm font-black ${cfg.colorText}`}>
                                    {formatINR(amount)}
                                </p>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-0.5 bg-black/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${cfg.colorBar}`}
                                            style={{ width: `${barWidth}%`, opacity: 0.7 }}
                                        />
                                    </div>
                                    <span className={`text-[9px] font-bold ${cfg.colorText} opacity-70 shrink-0`}>
                                        {count} inv
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && buckets.length === 0 && (
                <p className="text-sm text-text-muted text-center py-2 italic">No receivables data available</p>
            )}
        </div>
    );
};

export default ReceivablesAgeing;
