import React from 'react';
import { Banknote, Smartphone, CreditCard, BookCheck, Building2 } from 'lucide-react';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const MODE_CONFIG = {
    cash: { label: 'Cash', icon: Banknote },
    upi: { label: 'UPI', icon: Smartphone },
    card: { label: 'Card', icon: CreditCard },
    cheque: { label: 'Cheque', icon: BookCheck },
    bank_transfer: { label: 'Bank Transfer', icon: Building2 },
};

const PaymentModeChart = ({ data }) => {
    const breakdownArr = Array.isArray(data?.payment_mode_breakdown) ? data.payment_mode_breakdown : [];
    const breakdown = Object.fromEntries(breakdownArr.map(b => [b.payment_mode, parseFloat(b.total) || 0]));
    const entries = Object.entries(MODE_CONFIG).map(([key, config]) => ({
        key,
        ...config,
        amount: breakdown[key] || 0,
    }));
    const maxAmount = Math.max(...entries.map(e => e.amount), 1);

    return (
        <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col gap-4 h-full">
            <h3 className="font-bold text-text-main tracking-tight">Payment Mode Breakdown</h3>
            <div className="space-y-4">
                {entries.map(({ key, label, icon: Icon, amount }) => {
                    const widthPct = maxAmount > 0 ? Math.round((amount / maxAmount) * 100) : 0;
                    return (
                        <div key={key} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 w-36 shrink-0">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                    <Icon size={14} />
                                </div>
                                <span className="text-sm text-text-secondary font-medium">{label}</span>
                            </div>
                            <div className="flex-1 h-7 bg-background-content/30 rounded-lg overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-lg transition-all duration-700"
                                    style={{ width: `${widthPct}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-text-main w-28 text-right shrink-0">
                                {formatINR(amount)}
                            </span>
                        </div>
                    );
                })}
            </div>
            {breakdownArr.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4 italic">No payment data available</p>
            )}
        </div>
    );
};

export default PaymentModeChart;
