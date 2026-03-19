import React from 'react';
import { Eye, Download, Send, XCircle } from 'lucide-react';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import { getInvoicePdfUrl } from '../services/invoiceService';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const InvoiceListTable = ({ invoice, onView, onIssue, onCancel, isOwner }) => {
    const isGst = invoice.invoice_type === 'gst';
    const canIssue = invoice.status === 'draft';
    const canCancel = !['paid', 'cancelled'].includes(invoice.status) && isOwner;

    return (
        <tr
            key={invoice.id}
            onClick={() => onView(invoice)}
            className="hover:bg-background-content/30 transition-colors group text-sm cursor-pointer"
        >
            <td className="px-6 py-4 whitespace-nowrap font-medium text-text-main group-hover:text-primary">
                {invoice.invoice_number}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                {invoice.customer?.name || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                {invoice.order?.order_number || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${isGst ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-background-content text-text-secondary border-border'}`}>
                    {isGst ? 'GST' : 'Simple'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{invoice.invoice_date || '—'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{invoice.due_date || '—'}</td>
            <td className="px-6 py-4 whitespace-nowrap font-semibold text-text-main">
                {formatINR(invoice.grand_total)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <InvoiceStatusBadge status={invoice.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 text-text-muted">
                    <button
                        onClick={() => onView(invoice)}
                        className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Invoice"
                    >
                        <Eye size={15} />
                    </button>
                    <button
                        onClick={() => window.open(getInvoicePdfUrl(invoice.id), '_blank')}
                        className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Download PDF"
                    >
                        <Download size={15} />
                    </button>
                    {canIssue && (
                        <button
                            onClick={() => onIssue(invoice)}
                            className="p-1.5 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Issue Invoice"
                        >
                            <Send size={15} />
                        </button>
                    )}
                    {canCancel && (
                        <button
                            onClick={() => onCancel(invoice)}
                            className="p-1.5 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="Cancel Invoice"
                        >
                            <XCircle size={15} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default InvoiceListTable;
