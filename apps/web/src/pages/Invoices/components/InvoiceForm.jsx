import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ChevronRight, Package, Loader2 } from 'lucide-react';
import { ModernInput, ModernTextArea, ModernButton } from '../../../components/UI/CustomInputs';
import { getOrdersForInvoice, createInvoice } from '../services/invoiceService';
import { getOrder } from '../../Orders/services/orderService';
import { useToast } from '../../../components/UI/Toast';
import InvoiceFormItems from './InvoiceFormItems';

const todayStr = () => new Date().toISOString().split('T')[0];

const InvoiceForm = ({ onSuccess, onCancel }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Step 1 state
    const [orderSearch, setOrderSearch] = useState('');
    const [orderResults, setOrderResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [invoiceType, setInvoiceType] = useState('gst');
    const [invoiceDate, setInvoiceDate] = useState(todayStr());
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [terms, setTerms] = useState('');

    // Step 2 state
    const [initialItems, setInitialItems] = useState([]);

    const searchRef = useRef(null);
    const timerRef = useRef(null);

    const searchOrders = useCallback(async (q) => {
        if (!q || q.length < 2) { setOrderResults([]); return; }
        setSearching(true);
        try {
            const res = await getOrdersForInvoice(q);
            setOrderResults(res.data || []);
        } catch {
            setOrderResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => searchOrders(orderSearch), 350);
        return () => clearTimeout(timerRef.current);
    }, [orderSearch, searchOrders]);

    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOrderSelect = async (order) => {
        setOrderSearch(order.order_number);
        setSearchOpen(false);
        setLoadingOrder(true);
        try {
            const res = await getOrder(order.id);
            const full = res.data || res;
            setSelectedOrder(full);
        } catch {
            setSelectedOrder(order);
            showToast('Could not load order details', 'error');
        } finally {
            setLoadingOrder(false);
        }
    };

    const mapOrderItems = (order) => {
        if (!order?.items?.length) return [];
        return order.items.map(item => ({
            id: Date.now() + Math.random(),
            description: item.item_type?.name || item.description || item.item_name || '',
            hsn_code: item.item_type?.hsn_code || '',
            qty: parseFloat(item.quantity) || 1,
            unit: 'pcs',
            unit_price: parseFloat(item.unit_price || item.price) || 0,
            discount: parseFloat(item.discount_amount) || 0,
            gst_rate: 0,
        }));
    };

    const handleNext = () => {
        if (!selectedOrder) {
            showToast('Please select an order first', 'error');
            return;
        }
        const mapped = mapOrderItems(selectedOrder);
        setInitialItems(mapped);
        setStep(2);
    };

    const handleSubmit = async (items, grandTotal) => {
        setSubmitting(true);
        try {
            const payload = {
                order_id: selectedOrder.id,
                invoice_type: invoiceType,
                invoice_date: invoiceDate,
                due_date: dueDate || null,
                notes,
                terms_conditions: terms,
                items: items.map(item => ({
                    description: item.description,
                    hsn_code: item.hsn_code || null,
                    quantity: parseFloat(item.qty) || 1,
                    unit: item.unit,
                    unit_price: parseFloat(item.unit_price) || 0,
                    discount_amount: parseFloat(item.discount) || 0,
                    gst_rate: parseFloat(item.gst_rate) || 0,
                })),
                grand_total: grandTotal,
            };
            await createInvoice(payload);
            showToast('Invoice created successfully', 'success');
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create invoice', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 2) {
        return (
            <InvoiceFormItems
                isGst={invoiceType === 'gst'}
                initialItems={initialItems}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        );
    }

    return (
        <div className="space-y-5">
            {/* Order Selector */}
            <div className="flex flex-col gap-1.5" ref={searchRef}>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                    Select Order
                </label>
                <div className="relative">
                    <div className="relative flex items-center border border-border rounded-xl bg-background focus-within:border-primary/60 h-11 transition-colors">
                        <Search size={16} className="absolute left-4 text-text-muted pointer-events-none" />
                        <input
                            type="text"
                            value={orderSearch}
                            onChange={e => { setOrderSearch(e.target.value); setSearchOpen(true); }}
                            onFocus={() => setSearchOpen(true)}
                            placeholder="Search by order number or customer name..."
                            className="w-full pl-10 pr-4 bg-transparent text-sm text-text-main placeholder:text-text-muted outline-none h-full"
                        />
                        {searching && (
                            <div className="absolute right-4 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>
                    {searchOpen && orderResults.length > 0 && (
                        <div className="absolute z-[999] w-full mt-1 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
                            <div className="max-h-56 overflow-y-auto py-1">
                                {orderResults.map(order => (
                                    <button
                                        key={order.id}
                                        type="button"
                                        onClick={() => handleOrderSelect(order)}
                                        className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors"
                                    >
                                        <p className="text-sm font-bold text-text-main">{order.order_number}</p>
                                        <p className="text-xs text-text-muted">{order.customer?.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Order Summary */}
            {loadingOrder && (
                <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-sm text-text-secondary">Loading order details...</span>
                </div>
            )}
            {selectedOrder && !loadingOrder && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Package size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-main">{selectedOrder.order_number} — {selectedOrder.customer?.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                            {selectedOrder.items?.length || selectedOrder.items_count || 0} items &bull; ₹{Number(selectedOrder.total_amount || 0).toLocaleString('en-IN')} order value
                            {selectedOrder.items?.length > 0 && (
                                <span className="ml-2 text-primary font-medium">· Items will be pre-filled on Next</span>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Invoice Type + Dates — single row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Invoice Type */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">Invoice Type</label>
                    <div className="flex border border-border rounded-xl overflow-hidden bg-background-content p-1 h-11">
                        {[{ value: 'gst', label: 'GST' }, { value: 'simple', label: 'Simple' }].map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setInvoiceType(opt.value)}
                                className={`flex-1 rounded-lg text-sm font-bold transition-all duration-200 ${invoiceType === opt.value ? 'bg-primary text-white shadow-sm' : 'bg-background-content text-text-muted hover:text-text-main'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <ModernInput label="Invoice Date" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                <ModernInput label="Due Date (Optional)" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>

            {/* Notes + Terms — side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModernTextArea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes or special instructions..." rows={3} />
                <ModernTextArea label="Terms & Conditions" value={terms} onChange={e => setTerms(e.target.value)} placeholder="Payment terms, delivery conditions..." rows={3} />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <ModernButton variant="secondary" onClick={onCancel}>Cancel</ModernButton>
                <ModernButton variant="primary" icon={ChevronRight} onClick={handleNext}>
                    Next
                </ModernButton>
            </div>
        </div>
    );
};

export default InvoiceForm;
