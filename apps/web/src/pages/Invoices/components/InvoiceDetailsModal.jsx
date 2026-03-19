import React, { useState, useEffect } from 'react';
import { Download, Send, XCircle, CreditCard, Banknote, Smartphone, BookCheck, Building2, CheckCircle } from 'lucide-react';
import Modal from '../../../components/UI/Modal';
import { ModernButton } from '../../../components/UI/CustomInputs';
import { getInvoice, sendInvoice, updateInvoiceStatus, getInvoicePdfUrl } from '../services/invoiceService';
import { useToast } from '../../../components/UI/Toast';
import { useAuth } from '../../../contexts/AuthContext';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import RecordPaymentModal from '../../Payments/components/RecordPaymentModal';

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

const amountToWords = (amount) => {
    if (!amount) return 'Zero Rupees Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertGroup = (n) => {
        if (n === 0) return '';
        if (n < 20) return ones[n] + ' ';
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' ';
        return ones[Math.floor(n / 100)] + ' Hundred ' + convertGroup(n % 100);
    };

    let num = Math.floor(amount);
    if (num === 0) return 'Zero Rupees Only';
    let words = '';

    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;

    if (crore) words += convertGroup(crore) + 'Crore ';
    if (lakh) words += convertGroup(lakh) + 'Lakh ';
    if (thousand) words += convertGroup(thousand) + 'Thousand ';
    words += convertGroup(num);

    return `Rupees ${words.trim()} Only`;
};

const InvoiceDetailsModal = ({ isOpen, onClose, invoiceId, onCancelClick, onRefresh }) => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const isOwner = user?.roles?.includes('owner') || user?.role === 'owner';

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);

    useEffect(() => {
        if (isOpen && invoiceId) fetchInvoice();
    }, [isOpen, invoiceId]);

    const fetchInvoice = async () => {
        setLoading(true);
        try {
            const res = await getInvoice(invoiceId);
            setInvoice(res.data || res);
        } catch {
            showToast('Failed to load invoice', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleIssue = async () => {
        setActionLoading(true);
        try {
            await updateInvoiceStatus(invoice.id, 'issued');
            showToast('Invoice issued', 'success');
            fetchInvoice();
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to issue invoice', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSend = async () => {
        setActionLoading(true);
        try {
            await sendInvoice(invoice.id);
            showToast('Invoice sent to customer', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to send invoice', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        window.open(getInvoicePdfUrl(invoice.id), '_blank');
    };

    const isGst = invoice?.invoice_type === 'gst';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={loading ? 'Loading...' : `Invoice ${invoice?.invoice_number || ''}`} size="xl">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            ) : invoice ? (
                <div className="space-y-6">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border">
                        <div>
                            <h2 className="text-2xl font-bold text-text-main">{invoice.invoice_number}</h2>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="text-sm text-text-muted">{invoice.invoice_date}</span>
                                <InvoiceStatusBadge status={invoice.status} />
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isGst ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-background-content text-text-secondary border-border'}`}>
                                    {isGst ? 'GST' : 'Simple'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <ModernButton size="sm" variant="secondary" icon={Download} onClick={handleDownloadPdf}>
                                PDF
                            </ModernButton>
                            {invoice.status === 'draft' && (
                                <ModernButton size="sm" variant="primary" onClick={handleIssue} loading={actionLoading}>
                                    Issue Invoice
                                </ModernButton>
                            )}
                            {invoice.status === 'issued' && (
                                <ModernButton size="sm" variant="secondary" icon={Send} onClick={handleSend} loading={actionLoading}>
                                    Send
                                </ModernButton>
                            )}
                            {!['paid', 'cancelled'].includes(invoice.status) && isOwner && (
                                <ModernButton size="sm" variant="ghost" icon={XCircle} onClick={() => onCancelClick && onCancelClick(invoice)}>
                                    Cancel
                                </ModernButton>
                            )}
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-background-content/30 rounded-xl p-4 border border-border">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">From (Seller)</p>
                            <p className="text-sm font-bold text-text-main">{invoice.tenant?.name}</p>
                            <p className="text-xs text-text-secondary mt-1 whitespace-pre-line">{invoice.tenant?.address}</p>
                            {invoice.tenant?.gstin && (
                                <p className="text-xs text-text-muted mt-1">GSTIN: {invoice.tenant?.gstin}</p>
                            )}
                        </div>
                        <div className="bg-background-content/30 rounded-xl p-4 border border-border">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Bill To</p>
                            <p className="text-sm font-bold text-text-main">{invoice.customer?.name}</p>
                            <p className="text-xs text-text-secondary mt-1 whitespace-pre-line">{invoice.customer?.address}</p>
                            {invoice.customer?.gstin && (
                                <p className="text-xs text-text-muted mt-1">GSTIN: {invoice.customer?.gstin}</p>
                            )}
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-xs">
                            <thead className="bg-background-content/50 border-b border-border">
                                <tr>
                                    <th className="px-3 py-2.5 text-left font-bold text-text-secondary uppercase tracking-wider">#</th>
                                    <th className="px-3 py-2.5 text-left font-bold text-text-secondary uppercase tracking-wider">Description</th>
                                    {isGst && <th className="px-3 py-2.5 text-left font-bold text-text-secondary uppercase tracking-wider">HSN</th>}
                                    <th className="px-3 py-2.5 text-right font-bold text-text-secondary uppercase tracking-wider">Qty</th>
                                    <th className="px-3 py-2.5 text-left font-bold text-text-secondary uppercase tracking-wider">Unit</th>
                                    <th className="px-3 py-2.5 text-right font-bold text-text-secondary uppercase tracking-wider">Rate</th>
                                    <th className="px-3 py-2.5 text-right font-bold text-text-secondary uppercase tracking-wider">Disc.</th>
                                    <th className="px-3 py-2.5 text-right font-bold text-text-secondary uppercase tracking-wider">Taxable</th>
                                    {isGst && (
                                        <>
                                            <th className="px-3 py-2.5 text-right font-bold text-text-secondary uppercase tracking-wider">CGST</th>
                                            <th className="px-3 py-2.5 text-right font-bold text-text-secondary uppercase tracking-wider">SGST</th>
                                        </>
                                    )}
                                    <th className="px-3 py-2.5 text-right font-bold text-text-secondary uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {(invoice.items || []).map((item, i) => {
                                    const qty = parseFloat(item.quantity ?? item.qty) || 0;
                                    const taxable = (qty * parseFloat(item.unit_price || 0)) - parseFloat(item.discount_amount || item.discount || 0);
                                    const halfGst = isGst ? (taxable * (parseFloat(item.gst_rate) || 0)) / 200 : 0;
                                    const rowTotal = taxable + (halfGst * 2);
                                    return (
                                        <tr key={item.id || i} className="hover:bg-background-content/10">
                                            <td className="px-3 py-2.5 text-text-muted">{i + 1}</td>
                                            <td className="px-3 py-2.5 text-text-main">{item.description}</td>
                                            {isGst && <td className="px-3 py-2.5 text-text-secondary">{item.hsn_code || '—'}</td>}
                                            <td className="px-3 py-2.5 text-right text-text-secondary">{qty}</td>
                                            <td className="px-3 py-2.5 text-text-secondary">{item.unit}</td>
                                            <td className="px-3 py-2.5 text-right text-text-secondary">₹{(item.unit_price || 0).toLocaleString('en-IN')}</td>
                                            <td className="px-3 py-2.5 text-right text-error">{item.discount ? `₹${item.discount.toLocaleString('en-IN')}` : '—'}</td>
                                            <td className="px-3 py-2.5 text-right text-text-secondary">₹{taxable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                            {isGst && (
                                                <>
                                                    <td className="px-3 py-2.5 text-right text-text-secondary">
                                                        {item.gst_rate ? `${item.gst_rate / 2}% / ₹${halfGst.toFixed(2)}` : '—'}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right text-text-secondary">
                                                        {item.gst_rate ? `${item.gst_rate / 2}% / ₹${halfGst.toFixed(2)}` : '—'}
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-3 py-2.5 text-right font-semibold text-text-main">₹{rowTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Amount Summary */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2 bg-background-content/20 rounded-xl border border-border p-4 text-sm">
                            <div className="flex justify-between text-text-secondary">
                                <span>Subtotal</span><span>{formatINR(invoice.subtotal)}</span>
                            </div>
                            {invoice.total_discount > 0 && (
                                <div className="flex justify-between text-error">
                                    <span>Discount</span><span>- {formatINR(invoice.total_discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-text-secondary">
                                <span>Taxable Amount</span><span>{formatINR(invoice.taxable_amount)}</span>
                            </div>
                            {isGst && (
                                <>
                                    <div className="flex justify-between text-text-secondary">
                                        <span>CGST</span><span>{formatINR(invoice.cgst_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-text-secondary">
                                        <span>SGST</span><span>{formatINR(invoice.sgst_amount)}</span>
                                    </div>
                                </>
                            )}
                            {invoice.round_off !== 0 && invoice.round_off !== null && (
                                <div className="flex justify-between text-text-secondary">
                                    <span>Round-off</span><span>{invoice.round_off > 0 ? '+' : ''}{invoice.round_off?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-text-main text-base border-t border-border pt-2 mt-2">
                                <span>Grand Total</span>
                                <span className="text-primary text-lg">{formatINR(invoice.grand_total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <p className="text-xs italic text-text-muted px-1">
                        {amountToWords(invoice.grand_total)}
                    </p>

                    {/* Payment Status */}
                    <div className="bg-background-content/30 rounded-xl p-4 border border-border flex flex-wrap items-center gap-4 justify-between">
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            {(invoice.amount_paid > 0 || invoice.payment_status === 'paid') && (
                                <div>
                                    <p className="text-xs text-text-muted mb-0.5">Paid</p>
                                    <p className="font-bold text-success">{formatINR(invoice.amount_paid)}</p>
                                </div>
                            )}
                            {invoice.payment_status !== 'paid' && invoice.amount_pending > 0 && (
                                <div>
                                    <p className="text-xs text-text-muted mb-0.5">Pending</p>
                                    <p className="font-bold text-amber-500">{formatINR(invoice.amount_pending)}</p>
                                </div>
                            )}
                            <InvoiceStatusBadge status={invoice.payment_status || invoice.status} />
                        </div>
                        {invoice.payment_status !== 'paid' && invoice.status !== 'cancelled' && (
                            <ModernButton size="sm" variant="primary" icon={CreditCard} onClick={() => setPaymentOpen(true)}>
                                Record Payment
                            </ModernButton>
                        )}
                    </div>

                    {/* Payment History */}
                    {invoice.payments?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Payment History</p>
                            <div className="space-y-2">
                                {invoice.payments.map(pmt => {
                                    const ModeIcon = MODE_ICONS[pmt.payment_mode] || CreditCard;
                                    return (
                                        <div key={pmt.id} className="flex items-center justify-between bg-background-content/20 rounded-xl px-4 py-3 border border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                                    <ModeIcon size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-text-main">{new Date(pmt.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-xs text-text-muted capitalize">{pmt.payment_mode?.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-text-main">{formatINR(pmt.amount)}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${pmt.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-background-content text-text-muted'}`}>
                                                    {pmt.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center py-20 text-text-muted">Invoice not found</div>
            )}

            <RecordPaymentModal
                isOpen={paymentOpen}
                onClose={() => setPaymentOpen(false)}
                onSuccess={() => {
                    setPaymentOpen(false);
                    fetchInvoice();
                    if (onRefresh) onRefresh();
                }}
                orderId={invoice?.order?.id}
                invoiceId={invoice?.id}
                orderNumber={invoice?.order?.order_number}
                pendingAmount={invoice?.amount_pending != null ? invoice.amount_pending : invoice?.grand_total}
            />
        </Modal>
    );
};

export default InvoiceDetailsModal;
