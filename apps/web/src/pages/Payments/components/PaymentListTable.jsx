import React from 'react';
import { Banknote, Smartphone, CreditCard, BookCheck, Building2, XOctagon, RotateCcw } from 'lucide-react';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const MODE_ICONS = {
    cash: { icon: Banknote, label: 'Cash' },
    upi: { icon: Smartphone, label: 'UPI' },
    card: { icon: CreditCard, label: 'Card' },
    cheque: { icon: BookCheck, label: 'Cheque' },
    bank_transfer: { icon: Building2, label: 'Bank Transfer' },
};

const STATUS_STYLES = {
    completed: 'bg-green-500/10 text-green-500',
    pending: 'bg-amber-500/10 text-amber-500',
    voided: 'bg-background-content text-text-muted line-through',
    refunded: 'bg-blue-500/10 text-blue-500',
};

const PaymentListTable = ({ payment, onVoid, onRefund, isOwner }) => {
    const { icon: ModeIcon, label: modeLabel } = MODE_ICONS[payment.payment_mode] || { icon: CreditCard, label: payment.payment_mode };
    const canVoid = payment.status === 'completed' && isOwner;
    const canRefund = payment.status === 'completed' && isOwner;

    return (
        <tr className="hover:bg-background-content/30 transition-colors text-sm group">
            <td className="px-6 py-4 whitespace-nowrap font-medium text-text-main">
                {payment.payment_number || `PMT-${payment.id}`}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                {payment.order?.order_number || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                {payment.customer?.name || payment.order?.customer?.name || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                {payment.payment_date}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-primary/10 rounded-md text-primary">
                        <ModeIcon size={13} />
                    </div>
                    <span className="text-text-secondary">{modeLabel}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap font-semibold text-text-main">
                {formatINR(payment.amount)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[payment.status] || 'bg-background-content text-text-muted'}`}>
                    {payment.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 text-text-muted">
                    {canVoid && (
                        <button
                            onClick={() => onVoid(payment)}
                            className="p-1.5 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="Void Payment"
                        >
                            <XOctagon size={15} />
                        </button>
                    )}
                    {canRefund && (
                        <button
                            onClick={() => onRefund(payment)}
                            className="p-1.5 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Refund Payment"
                        >
                            <RotateCcw size={15} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default PaymentListTable;
