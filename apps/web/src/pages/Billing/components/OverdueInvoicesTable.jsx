import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { getOverdueInvoices } from '../services/billingService';
import { ModernButton } from '../../../components/UI/CustomInputs';
import RecordPaymentModal from '../../Payments/components/RecordPaymentModal';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const OverdueInvoicesTable = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentTarget, setPaymentTarget] = useState(null);

    const fetchOverdue = async () => {
        setLoading(true);
        try {
            const res = await getOverdueInvoices({ per_page: 10 });
            const list = res.data?.data || res.data || [];
            setInvoices(Array.isArray(list) ? list : []);
        } catch {
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverdue();
    }, []);

    const skeletonRows = [...Array(4)].map((_, i) => (
        <tr key={i}>
            {[...Array(7)].map((__, j) => (
                <td key={j} className="px-5 py-3.5">
                    <div className="h-4 bg-background-content rounded w-3/4 animate-shimmer" />
                </td>
            ))}
        </tr>
    ));

    return (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle size={18} className="text-red-500" />
                </div>
                <h3 className="font-bold text-text-main tracking-tight">Overdue Invoices</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-background-content/50 border-b border-border">
                        <tr>
                            {['Invoice #', 'Customer', 'Order #', 'Due Date', 'Days Overdue', 'Amount Pending', 'Action'].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? skeletonRows : invoices.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-14 text-center">
                                    <div className="flex flex-col items-center gap-3 text-text-muted">
                                        <div className="p-4 bg-green-500/10 rounded-2xl">
                                            <CheckCircle size={36} className="text-green-500" />
                                        </div>
                                        <p className="font-semibold text-text-main">No overdue invoices</p>
                                        <p className="text-xs">All invoices are up to date.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-background-content/20 transition-colors">
                                    <td className="px-5 py-3.5 font-medium text-text-main whitespace-nowrap">
                                        {inv.invoice_number}
                                    </td>
                                    <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">
                                        {inv.customer?.name || 'N/A'}
                                    </td>
                                    <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">
                                        {inv.order?.order_number || 'N/A'}
                                    </td>
                                    <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={13} className="text-text-muted" />
                                            {inv.due_date || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-500">
                                            {inv.days_overdue ?? '—'} days
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-red-600 whitespace-nowrap">
                                        {formatINR(inv.pending_amount)}
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <ModernButton
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setPaymentTarget(inv)}
                                        >
                                            Record Payment
                                        </ModernButton>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <RecordPaymentModal
                isOpen={!!paymentTarget}
                onClose={() => setPaymentTarget(null)}
                onSuccess={() => {
                    setPaymentTarget(null);
                    fetchOverdue();
                }}
                orderId={paymentTarget?.order?.id}
                invoiceId={paymentTarget?.id}
                orderNumber={paymentTarget?.order?.order_number}
                pendingAmount={paymentTarget?.pending_amount}
            />
        </div>
    );
};

export default OverdueInvoicesTable;
