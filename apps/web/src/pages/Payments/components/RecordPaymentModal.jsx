import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Banknote,
    Smartphone,
    CreditCard,
    BookCheck,
    Building2,
    Search,
    X,
    Loader2,
    FileText,
    CheckCircle2,
    Info,
} from 'lucide-react';
import Modal from '../../../components/UI/Modal';
import { ModernInput, ModernTextArea, ModernButton, ModernCheckbox } from '../../../components/UI/CustomInputs';
import { recordPayment } from '../services/paymentService';
import api from '../../../services/api';
import { useToast } from '../../../components/UI/Toast';

// ── helpers ──────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split('T')[0];

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// ── search helpers ────────────────────────────────────────────────────────────

const searchOrders = (q) =>
    api.get('/orders', { params: { search: q, per_page: 15 } }).then((r) => r.data);

const getOrderInvoices = (orderId) =>
    api
        .get('/invoices', { params: { order_id: orderId, status: 'issued', per_page: 50 } })
        .then((r) => r.data);

// ── payment mode config ───────────────────────────────────────────────────────

const MODES = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'upi', label: 'UPI', icon: Smartphone },
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'cheque', label: 'Cheque', icon: BookCheck },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
];

// ── initial state factory ─────────────────────────────────────────────────────

const blankFormState = (pendingAmount) => ({
    amount: pendingAmount ? String(pendingAmount) : '',
    mode: 'cash',
    paymentDate: todayStr(),
    notes: '',
    isAdvance: false,
    transactionId: '',
    approvalCode: '',
    bankName: '',
    chequeNumber: '',
    chequeDate: '',
    referenceNumber: '',
});

// ── sub-components ────────────────────────────────────────────────────────────

const ContextCard = ({ orderNumber, pendingAmount }) => (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3">
        <div className="bg-primary/10 rounded-lg p-1.5 shrink-0 mt-0.5">
            <FileText size={15} className="text-primary" />
        </div>
        <div>
            <p className="text-sm font-semibold text-text-main">Order: {orderNumber}</p>
            {pendingAmount > 0 && (
                <p className="text-xs text-text-muted mt-0.5">
                    Pending: <span className="text-primary font-bold">{formatINR(pendingAmount)}</span>
                </p>
            )}
        </div>
    </div>
);

const OrderSearchDropdown = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    const runSearch = useCallback(async (q) => {
        if (!q.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }
        setSearching(true);
        try {
            const res = await searchOrders(q);
            const list = res?.data ?? res ?? [];
            setResults(Array.isArray(list) ? list : []);
            setOpen(true);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(query), 350);
        return () => clearTimeout(debounceRef.current);
    }, [query, runSearch]);

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (order) => {
        setOpen(false);
        setQuery('');
        setResults([]);
        onSelect(order);
    };

    return (
        <div className="flex flex-col gap-1.5" ref={containerRef}>
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                Search Order
            </label>
            <div className="relative">
                <div className="relative flex items-center rounded-xl border border-border bg-background-content/10 hover:border-border-hover transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background">
                    <Search size={15} className="absolute left-3.5 text-text-muted shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Order number or customer name..."
                        className="w-full h-11 pl-10 pr-10 bg-transparent text-sm text-text-main placeholder-text-muted/40 outline-none"
                    />
                    {searching && (
                        <Loader2 size={15} className="absolute right-3.5 text-text-muted animate-spin" />
                    )}
                    {!searching && query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
                            className="absolute right-3.5 text-text-muted hover:text-text-main transition-colors"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                {open && results.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-52 overflow-y-auto py-1.5 px-1.5 space-y-0.5">
                            {results.map((order) => (
                                <button
                                    key={order.id}
                                    type="button"
                                    onClick={() => handleSelect(order)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-background-content/50 transition-colors"
                                >
                                    <span className="text-sm font-semibold text-text-main">
                                        {order.order_number}
                                    </span>
                                    <span className="text-xs text-text-muted">
                                        {order.customer?.name ?? order.customer_name ?? ''}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {open && !searching && results.length === 0 && query.trim() && (
                    <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-xl px-4 py-4 text-center text-xs text-text-muted italic animate-in fade-in duration-200">
                        No orders found for &ldquo;{query}&rdquo;
                    </div>
                )}
            </div>
        </div>
    );
};

const InvoiceCard = ({ invoice, selected, onSelect }) => {
    const pending = invoice.amount_pending ?? invoice.grand_total ?? 0;
    return (
        <button
            type="button"
            onClick={() => onSelect(invoice)}
            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
                selected
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-border hover:border-border-hover hover:bg-background-content/20'
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-bold text-text-main">{invoice.invoice_number}</p>
                    <p className="text-xs text-text-muted mt-0.5">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-xs text-text-muted">Pending</p>
                    <p className={`text-sm font-bold ${selected ? 'text-primary' : 'text-text-main'}`}>
                        {formatINR(pending)}
                    </p>
                </div>
            </div>
            {selected && (
                <div className="mt-2 flex items-center gap-1.5 text-primary">
                    <CheckCircle2 size={13} strokeWidth={2.5} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Selected</span>
                </div>
            )}
        </button>
    );
};

const AdvanceOptionCard = ({ selected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
            selected
                ? 'bg-primary/10 border-primary'
                : 'bg-background border-border hover:border-border-hover hover:bg-background-content/20'
        }`}
    >
        <div className="flex items-center gap-2.5">
            <div className={`rounded-lg p-1.5 ${selected ? 'bg-primary/20' : 'bg-background-content/30'}`}>
                <Banknote size={15} className={selected ? 'text-primary' : 'text-text-muted'} />
            </div>
            <div>
                <p className="text-sm font-bold text-text-main">No Invoice / Advance Payment</p>
                <p className="text-xs text-text-muted mt-0.5">Record without linking to a specific invoice</p>
            </div>
            {selected && <CheckCircle2 size={15} className="text-primary ml-auto shrink-0" strokeWidth={2.5} />}
        </div>
    </button>
);

// ── main component ────────────────────────────────────────────────────────────

const RecordPaymentModal = ({
    isOpen,
    onClose,
    onSuccess,
    orderId,
    invoiceId,
    orderNumber,
    pendingAmount,
}) => {
    const { showToast } = useToast();
    const isContextMode = Boolean(orderId);

    // standalone search state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [advanceSelected, setAdvanceSelected] = useState(false);

    // form state
    const [form, setForm] = useState(() => blankFormState(pendingAmount));
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // ── reset on open ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setSelectedOrder(null);
            setInvoices([]);
            setSelectedInvoice(null);
            setAdvanceSelected(false);
            setErrors({});
            setForm(blankFormState(pendingAmount));
        }
    }, [isOpen, pendingAmount]);

    // ── fetch invoices when an order is chosen in standalone mode ─────────────
    const handleOrderSelect = useCallback(async (order) => {
        setSelectedOrder(order);
        setSelectedInvoice(null);
        setAdvanceSelected(false);
        setInvoicesLoading(true);
        try {
            const res = await getOrderInvoices(order.id);
            const list = res?.data ?? res ?? [];
            const arr = Array.isArray(list) ? list : [];
            setInvoices(arr);
            if (arr.length === 0) {
                // no invoices — automatically mark as advance
                setAdvanceSelected(true);
                setForm((f) => ({ ...f, isAdvance: true }));
            }
        } catch {
            setInvoices([]);
            setAdvanceSelected(true);
            setForm((f) => ({ ...f, isAdvance: true }));
        } finally {
            setInvoicesLoading(false);
        }
    }, []);

    // ── invoice / advance selection ───────────────────────────────────────────
    const handleInvoiceSelect = (invoice) => {
        setSelectedInvoice(invoice);
        setAdvanceSelected(false);
        const pending = invoice.amount_pending ?? invoice.grand_total ?? '';
        setForm((f) => ({ ...f, amount: pending ? String(pending) : f.amount, isAdvance: false }));
    };

    const handleAdvanceSelect = () => {
        setSelectedInvoice(null);
        setAdvanceSelected(true);
        setForm((f) => ({ ...f, isAdvance: true }));
    };

    // ── mode change — clear extra fields ─────────────────────────────────────
    const handleModeChange = (value) => {
        setForm((f) => ({
            ...f,
            mode: value,
            transactionId: '',
            approvalCode: '',
            bankName: '',
            chequeNumber: '',
            chequeDate: '',
            referenceNumber: '',
        }));
    };

    // ── field helpers ─────────────────────────────────────────────────────────
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    // ── validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!isContextMode && !selectedOrder) e.order = 'Please select an order';
        if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Amount must be greater than 0';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const resolvedOrderId = isContextMode ? orderId : selectedOrder?.id;
            const resolvedInvoiceId = isContextMode
                ? invoiceId ?? null
                : selectedInvoice?.id ?? null;
            const isAdvancePayment = isContextMode
                ? !invoiceId
                : advanceSelected;

            const payload = {
                order_id: resolvedOrderId,
                invoice_id: resolvedInvoiceId,
                amount: parseFloat(form.amount),
                payment_mode: form.mode,
                payment_date: form.paymentDate,
                notes: form.notes || undefined,
                advance_payment: isAdvancePayment,
            };

            if (form.mode === 'upi') {
                payload.transaction_reference = form.transactionId || undefined;
            }
            if (form.mode === 'card') {
                payload.approval_code = form.approvalCode || undefined;
                payload.bank_name = form.bankName || undefined;
            }
            if (form.mode === 'cheque') {
                payload.cheque_number = form.chequeNumber || undefined;
                payload.cheque_date = form.chequeDate || undefined;
                payload.bank_name = form.bankName || undefined;
            }
            if (form.mode === 'bank_transfer') {
                payload.transaction_reference = form.referenceNumber || undefined;
                payload.bank_name = form.bankName || undefined;
            }

            await recordPayment(payload);
            showToast('Payment recorded successfully', 'success');
            onSuccess?.();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to record payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ── derived flags ─────────────────────────────────────────────────────────
    const showInvoiceSection = !isContextMode && selectedOrder !== null;
    const showPaymentForm = isContextMode || selectedOrder !== null;
    const showAdvanceCheckbox = !isContextMode && !selectedInvoice && !advanceSelected;

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="lg">
            <div className="space-y-5">

                {/* ── CONTEXT MODE: order card ── */}
                {isContextMode && (
                    <ContextCard orderNumber={orderNumber} pendingAmount={pendingAmount} />
                )}

                {/* ── STANDALONE MODE: order search ── */}
                {!isContextMode && (
                    <div className="space-y-3">
                        <OrderSearchDropdown onSelect={handleOrderSelect} />

                        {errors.order && (
                            <span className="text-[10px] font-bold text-error ml-1 uppercase tracking-tight">
                                {errors.order}
                            </span>
                        )}

                        {/* selected order pill */}
                        {selectedOrder && (
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="bg-primary/10 rounded-lg p-1.5 shrink-0">
                                        <FileText size={14} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-main">
                                            {selectedOrder.order_number}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            {selectedOrder.customer?.name ?? selectedOrder.customer_name ?? ''}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedOrder(null);
                                        setInvoices([]);
                                        setSelectedInvoice(null);
                                        setAdvanceSelected(false);
                                        setForm(blankFormState(pendingAmount));
                                    }}
                                    className="text-text-muted hover:text-text-main transition-colors p-1.5 hover:bg-background-content/30 rounded-lg"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── INVOICE SELECTION (standalone only, after order chosen) ── */}
                {showInvoiceSection && (
                    <div className="space-y-2.5">
                        <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1 block">
                            Invoice
                        </label>

                        {invoicesLoading && (
                            <div className="flex items-center gap-2.5 p-3.5 bg-surface border border-border rounded-xl text-text-muted text-sm">
                                <Loader2 size={15} className="animate-spin shrink-0" />
                                Loading invoices...
                            </div>
                        )}

                        {!invoicesLoading && invoices.length === 0 && (
                            <div className="flex items-start gap-2.5 p-3.5 bg-primary/5 border border-primary/20 rounded-xl">
                                <Info size={15} className="text-primary shrink-0 mt-0.5" />
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    No issued invoices found for this order. Payment will be recorded as an advance.
                                </p>
                            </div>
                        )}

                        {!invoicesLoading && invoices.length > 0 && (
                            <div className="space-y-2">
                                {invoices.map((inv) => (
                                    <InvoiceCard
                                        key={inv.id}
                                        invoice={inv}
                                        selected={selectedInvoice?.id === inv.id}
                                        onSelect={handleInvoiceSelect}
                                    />
                                ))}
                                <AdvanceOptionCard
                                    selected={advanceSelected}
                                    onSelect={handleAdvanceSelect}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ── PAYMENT FORM ── */}
                {showPaymentForm && (
                    <div className="space-y-5">
                        {/* divider when standalone */}
                        {!isContextMode && (
                            <div className="border-t border-border" />
                        )}

                        {/* amount */}
                        <div>
                            <ModernInput
                                label="Amount (₹)"
                                type="number"
                                value={form.amount}
                                onChange={set('amount')}
                                placeholder="0.00"
                                error={errors.amount}
                                min="0.01"
                                step="0.01"
                            />
                            {isContextMode && pendingAmount > 0 && !errors.amount && (
                                <p className="text-xs text-text-muted mt-1 ml-1">
                                    Hint: Pending amount is {formatINR(pendingAmount)}
                                </p>
                            )}
                        </div>

                        {/* payment mode buttons */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                                Payment Mode
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {MODES.map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => handleModeChange(value)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                                            form.mode === value
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border text-text-muted hover:border-border-hover hover:text-text-secondary'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide leading-tight text-center">
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* mode-specific extra fields */}
                        {form.mode === 'upi' && (
                            <ModernInput
                                label="Transaction ID"
                                value={form.transactionId}
                                onChange={set('transactionId')}
                                placeholder="UPI transaction ID..."
                            />
                        )}
                        {form.mode === 'card' && (
                            <div className="grid grid-cols-2 gap-3">
                                <ModernInput
                                    label="Approval Code"
                                    value={form.approvalCode}
                                    onChange={set('approvalCode')}
                                    placeholder="Auth code..."
                                />
                                <ModernInput
                                    label="Bank Name"
                                    value={form.bankName}
                                    onChange={set('bankName')}
                                    placeholder="Bank name..."
                                />
                            </div>
                        )}
                        {form.mode === 'cheque' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <ModernInput
                                    label="Cheque Number"
                                    value={form.chequeNumber}
                                    onChange={set('chequeNumber')}
                                    placeholder="Cheque no..."
                                />
                                <ModernInput
                                    label="Cheque Date"
                                    type="date"
                                    value={form.chequeDate}
                                    onChange={set('chequeDate')}
                                />
                                <ModernInput
                                    label="Bank Name"
                                    value={form.bankName}
                                    onChange={set('bankName')}
                                    placeholder="Bank name..."
                                />
                            </div>
                        )}
                        {form.mode === 'bank_transfer' && (
                            <div className="grid grid-cols-2 gap-3">
                                <ModernInput
                                    label="Reference Number"
                                    value={form.referenceNumber}
                                    onChange={set('referenceNumber')}
                                    placeholder="Ref / UTR number..."
                                />
                                <ModernInput
                                    label="Bank Name"
                                    value={form.bankName}
                                    onChange={set('bankName')}
                                    placeholder="Bank name..."
                                />
                            </div>
                        )}

                        {/* payment date */}
                        <ModernInput
                            label="Payment Date"
                            type="date"
                            value={form.paymentDate}
                            onChange={set('paymentDate')}
                        />

                        {/* notes */}
                        <ModernTextArea
                            label="Notes (Optional)"
                            value={form.notes}
                            onChange={set('notes')}
                            placeholder="Add any notes about this payment..."
                        />

                        {/* advance checkbox — only when no invoice is linked */}
                        {showAdvanceCheckbox && (
                            <div className="space-y-1">
                                <ModernCheckbox
                                    label="Advance Payment"
                                    checked={form.isAdvance}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, isAdvance: e.target.checked }))
                                    }
                                />
                                {form.isAdvance && (
                                    <p className="text-xs text-text-muted ml-1">
                                        Mark as advance — will be adjusted on final invoice.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* actions */}
                        <div className="flex items-center justify-end gap-3 pt-1">
                            <ModernButton variant="secondary" onClick={onClose} disabled={loading}>
                                Cancel
                            </ModernButton>
                            <ModernButton variant="primary" onClick={handleSubmit} loading={loading}>
                                Record Payment
                            </ModernButton>
                        </div>
                    </div>
                )}

                {/* ── fallback actions when no order selected yet (standalone) ── */}
                {!isContextMode && !selectedOrder && (
                    <div className="flex items-center justify-end pt-1">
                        <ModernButton variant="secondary" onClick={onClose}>
                            Cancel
                        </ModernButton>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default RecordPaymentModal;
