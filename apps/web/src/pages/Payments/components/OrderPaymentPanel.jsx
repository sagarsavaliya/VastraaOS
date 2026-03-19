import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, Banknote, Smartphone, CreditCard, BookCheck, Building2 } from 'lucide-react';
import { ModernButton } from '../../../components/UI/CustomInputs';
import { getOrderPaymentSummary } from '../services/paymentService';
import RecordPaymentModal from './RecordPaymentModal';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const MODE_ICONS = {
    cash: Banknote,
    upi: Smartphone,
    card: CreditCard,
    cheque: BookCheck,
    bank_transfer: Building2,
};

const PAYMENT_STATUS_STYLES = {
    unpaid: 'bg-background-content text-text-secondary',
    partial: 'bg-amber-500/10 text-amber-500',
    paid: 'bg-green-500/10 text-green-500',
    overdue: 'bg-red-500/10 text-red-500',
};

const OrderPaymentPanel = ({ orderId }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recordOpen, setRecordOpen] = useState(false);

    const fetchSummary = useCallback(async () => {
        if (!orderId) return;
        setLoading(true);
        try {
            const res = await getOrderPaymentSummary(orderId);
            setSummary(res.data || res);
        } catch {
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-background-content rounded-xl animate-shimmer" />
                ))}
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="flex flex-col items-center gap-3 py-8 text-text-muted">
                <div className="p-3 bg-background rounded-xl">
                    <Wallet size={28} className="opacity-30" />
                </div>
                <p className="text-sm font-medium">No payments recorded yet</p>
            </div>
        );
    }

    const paymentStatusLabel = summary.payment_status || 'unpaid';

    return (
        <div className="space-y-4">
            {/* 3 Stat Cells */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-background-content/30 rounded-xl p-3 border border-border text-center">
                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Invoiced</p>
                    <p className="text-sm font-bold text-text-main">{formatINR(summary.total_invoiced)}</p>
                </div>
                <div className="bg-background-content/30 rounded-xl p-3 border border-border text-center">
                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Paid</p>
                    <p className="text-sm font-bold text-success">{formatINR(summary.paid_amount)}</p>
                </div>
                <div className="bg-background-content/30 rounded-xl p-3 border border-border text-center">
                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Outstanding</p>
                    <p className="text-sm font-bold text-amber-600">{formatINR(summary.pending_amount)}</p>
                </div>
            </div>

            {/* Status + Record Button */}
            <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${PAYMENT_STATUS_STYLES[paymentStatusLabel] || 'bg-background-content text-text-secondary'}`}>
                    {paymentStatusLabel}
                </span>
                <ModernButton size="sm" variant="primary" onClick={() => setRecordOpen(true)}>
                    Record Payment
                </ModernButton>
            </div>

            {/* Payment List */}
            {summary.payments?.length > 0 ? (
                <div className="space-y-2">
                    {summary.payments.map(pmt => {
                        const ModeIcon = MODE_ICONS[pmt.payment_mode] || CreditCard;
                        return (
                            <div key={pmt.id} className="flex items-center justify-between bg-background-content/20 rounded-xl px-4 py-3 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                        <ModeIcon size={13} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-text-main">{pmt.payment_date}</p>
                                        <p className="text-[10px] text-text-muted capitalize">{pmt.payment_mode?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-text-main">{formatINR(pmt.amount)}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${pmt.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-background-content text-text-muted'}`}>
                                        {pmt.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-text-muted">
                    <Wallet size={24} className="opacity-30" />
                    <p className="text-xs">No payments recorded yet</p>
                </div>
            )}

            <RecordPaymentModal
                isOpen={recordOpen}
                onClose={() => setRecordOpen(false)}
                onSuccess={() => {
                    setRecordOpen(false);
                    fetchSummary();
                }}
                orderId={orderId}
                pendingAmount={summary.pending_amount}
            />
        </div>
    );
};

export default OrderPaymentPanel;
