import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { ModernButton } from '../../../components/UI/CustomInputs';
import { getHsnCodes } from '../services/invoiceService';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount || 0);

const UNIT_OPTIONS = ['pcs', 'metres', 'sets', 'kg'];

const emptyItem = () => ({
    id: Date.now() + Math.random(),
    description: '',
    hsn_code: '',
    qty: 1,
    unit: 'pcs',
    unit_price: 0,
    discount: 0,
    gst_rate: 0,
});

const HsnAutocomplete = ({ value, onChange, onSelect }) => {
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const timerRef = useRef(null);
    const containerRef = useRef(null);

    const search = useCallback(async (q) => {
        if (!q || q.length < 2) { setResults([]); return; }
        setSearching(true);
        try {
            const res = await getHsnCodes(q);
            setResults(res.data || res || []);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => search(value), 350);
        return () => clearTimeout(timerRef.current);
    }, [value, search]);

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={value}
                    onChange={e => { onChange(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder="HSN code..."
                    className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-xs text-text-main placeholder:text-text-muted outline-none focus:border-primary/60 transition-colors"
                />
                {searching && <Search size={12} className="absolute right-2 animate-pulse text-text-muted pointer-events-none" />}
            </div>
            {open && results.length > 0 && (
                <div className="absolute z-[999] top-full mt-1 w-64 bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto py-1">
                        {results.map(r => (
                            <button
                                key={r.id || r.code}
                                type="button"
                                onClick={() => { onSelect(r); setOpen(false); }}
                                className="w-full text-left px-3 py-2 hover:bg-surface-hover transition-colors"
                            >
                                <p className="text-xs font-bold text-text-main">{r.code}</p>
                                <p className="text-[10px] text-text-muted">{r.description}</p>
                                {r.gst_rate !== undefined && (
                                    <p className="text-[10px] text-primary font-semibold">GST {r.gst_rate}%</p>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const InvoiceFormItems = ({ isGst, initialItems = [], onBack, onSubmit, submitting }) => {
    const [items, setItems] = useState(
        initialItems.length > 0 ? initialItems : [emptyItem()]
    );

    const update = (index, field, value) => {
        setItems(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const addRow = () => setItems(prev => [...prev, emptyItem()]);
    const removeRow = (index) => setItems(prev => prev.filter((_, i) => i !== index));

    const calcRow = (item) => {
        const qty = parseFloat(item.qty) || 0;
        const price = parseFloat(item.unit_price) || 0;
        const disc = parseFloat(item.discount) || 0;
        const taxable = qty * price - disc;
        const gstRate = parseFloat(item.gst_rate) || 0;
        const gstAmount = isGst ? (taxable * gstRate) / 100 : 0;
        const total = taxable + gstAmount;
        return { taxable, gstAmount, total };
    };

    const totals = items.reduce(
        (acc, item) => {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.unit_price) || 0;
            const disc = parseFloat(item.discount) || 0;
            const subtotal = qty * price;
            const gstRate = parseFloat(item.gst_rate) || 0;
            const taxable = subtotal - disc;
            const gstAmount = isGst ? (taxable * gstRate) / 100 : 0;
            acc.subtotal += subtotal;
            acc.discount += disc;
            acc.taxable += taxable;
            acc.gst += gstAmount;
            return acc;
        },
        { subtotal: 0, discount: 0, taxable: 0, gst: 0 }
    );

    const grandRaw = totals.taxable + totals.gst;
    const roundOff = Math.round(grandRaw) - grandRaw;
    const grandTotal = Math.round(grandRaw);

    const handleSubmit = () => {
        onSubmit(items, grandTotal);
    };

    const inputCls = "w-full px-2 py-1.5 bg-background border border-border rounded-lg text-xs text-text-main placeholder:text-text-muted outline-none focus:border-primary/60 transition-colors";

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs">
                    <thead className="bg-background-content border-b border-border">
                        <tr>
                            <th className="px-3 py-2.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap w-48">Description</th>
                            <th className="px-3 py-2.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap w-32">HSN Code</th>
                            <th className="px-3 py-2.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap w-16">Qty</th>
                            <th className="px-3 py-2.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap w-24">Unit</th>
                            <th className="px-3 py-2.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap w-28">Unit Price (₹)</th>
                            <th className="px-3 py-2.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap w-28">Discount (₹)</th>
                            {isGst && <th className="px-3 py-2.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap w-16">GST %</th>}
                            <th className="px-3 py-2.5 text-right text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap w-20">Total</th>
                            <th className="px-3 py-2.5 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map((item, index) => {
                            const { total } = calcRow(item);
                            return (
                                <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                                    <td className="px-3 py-2 w-48 min-w-[160px]">
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={e => update(index, 'description', e.target.value)}
                                            placeholder="Item description"
                                            className={inputCls}
                                        />
                                    </td>
                                    <td className="px-3 py-2 w-32">
                                        <HsnAutocomplete
                                            value={item.hsn_code}
                                            onChange={v => update(index, 'hsn_code', v)}
                                            onSelect={r => {
                                                update(index, 'hsn_code', r.code || r.hsn_code || '');
                                                if (r.gst_rate !== undefined) update(index, 'gst_rate', r.gst_rate);
                                            }}
                                        />
                                    </td>
                                    <td className="px-3 py-2 w-16">
                                        <input
                                            type="number"
                                            value={item.qty}
                                            min="0.01"
                                            step="0.01"
                                            onChange={e => update(index, 'qty', e.target.value)}
                                            className={inputCls + ' text-center'}
                                        />
                                    </td>
                                    <td className="px-3 py-2 w-24">
                                        <select
                                            value={item.unit}
                                            onChange={e => update(index, 'unit', e.target.value)}
                                            className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-xs text-text-main outline-none focus:border-primary/60 transition-colors appearance-none"
                                        >
                                            {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2 w-28">
                                        <input
                                            type="number"
                                            value={item.unit_price}
                                            min="0"
                                            step="0.01"
                                            onChange={e => update(index, 'unit_price', e.target.value)}
                                            className={inputCls}
                                        />
                                    </td>
                                    <td className="px-3 py-2 w-28">
                                        <input
                                            type="number"
                                            value={item.discount}
                                            min="0"
                                            step="0.01"
                                            onChange={e => update(index, 'discount', e.target.value)}
                                            className={inputCls}
                                        />
                                    </td>
                                    {isGst && (
                                        <td className="px-3 py-2 w-16">
                                            <input
                                                type="number"
                                                value={item.gst_rate}
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                onChange={e => update(index, 'gst_rate', e.target.value)}
                                                className={inputCls + ' text-center'}
                                            />
                                        </td>
                                    )}
                                    <td className="px-3 py-2 w-20 text-right font-semibold text-text-main whitespace-nowrap">
                                        ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-3 py-2 w-8">
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            disabled={items.length === 1}
                                            className="p-1 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-2 text-sm font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 hover:text-primary-hover transition-colors"
            >
                <Plus size={15} /> Add Item
            </button>

            {/* Totals */}
            <div className="ml-auto w-full max-w-xs space-y-2 bg-background-content rounded-xl border border-border p-4 text-sm">
                <div className="flex justify-between text-text-main">
                    <span>Subtotal</span>
                    <span>{formatINR(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                    <div className="flex justify-between text-red-500">
                        <span>Total Discount</span>
                        <span>- {formatINR(totals.discount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-text-main">
                    <span>Taxable Amount</span>
                    <span>{formatINR(totals.taxable)}</span>
                </div>
                {isGst && (
                    <>
                        <div className="flex justify-between text-text-main">
                            <span>CGST</span>
                            <span>{formatINR(totals.gst / 2)}</span>
                        </div>
                        <div className="flex justify-between text-text-main">
                            <span>SGST</span>
                            <span>{formatINR(totals.gst / 2)}</span>
                        </div>
                    </>
                )}
                {Math.abs(roundOff) > 0.001 && (
                    <div className="flex justify-between text-text-main">
                        <span>Round-off</span>
                        <span>{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-bold text-text-main text-base">Grand Total</span>
                    <span className="text-primary font-bold text-lg">{formatINR(grandTotal)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <ModernButton variant="secondary" onClick={onBack} disabled={submitting}>
                    Back
                </ModernButton>
                <ModernButton
                    variant="primary"
                    onClick={handleSubmit}
                    loading={submitting}
                >
                    Create Invoice
                </ModernButton>
            </div>
        </div>
    );
};

export default InvoiceFormItems;
