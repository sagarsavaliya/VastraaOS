import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../components/UI/Toast';
import {
    Calendar, AlertCircle, ArrowRight, Trash2, Plus,
    ShoppingBag, User, Tag, Clock
} from 'lucide-react';
import {
    ModernInput, ModernSelect, ModernButton,
    ModernNumberInput, ModernTextArea, ModernCheckbox
} from '../../../components/UI/CustomInputs';
import { getOrderPriorities, getItemTypes } from '../../../services/masterDataService';
import { convertToOrder } from '../services/inquiryService';

const ConvertInquiryModal = ({ inquiry, onSuccess, onCancel, setFooter }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [priorities, setPriorities] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);

    const [formData, setFormData] = useState({
        customer_id: inquiry.customer?.id || '',
        order_date: new Date().toISOString().split('T')[0],
        promised_delivery_date: inquiry.preferred_delivery_date || '',
        event_date: inquiry.event_date || '',
        priority_id: '',
        use_customer_address: true,
        delivery_address_line1: inquiry.customer?.address || inquiry.address || '',
        delivery_address_line2: '',
        delivery_city: inquiry.customer?.city || inquiry.city || '',
        delivery_state: inquiry.customer?.state || inquiry.state || '',
        delivery_pincode: inquiry.customer?.pincode || inquiry.pincode || '',
        items: [
            {
                item_type_id: inquiry.item_type?.id || '',
                quantity: 1,
                unit_price: 0,
                total_price: 0,
                description: inquiry.requirements || ''
            }
        ],
        special_instructions: inquiry.requirements || ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [priosData, typesData] = await Promise.all([
                    getOrderPriorities(),
                    getItemTypes()
                ]);

                const prios = priosData.data || priosData;
                const types = typesData.data || typesData;

                setPriorities(prios);
                setItemTypes(types);

                if (prios?.length > 0) {
                    const normalPrio = prios.find(p => p.name.toLowerCase() === 'normal') || prios[0];
                    setFormData(prev => ({ ...prev, priority_id: normalPrio.id.toString() }));
                }
            } catch (err) {
                console.error('Error fetching master data:', err);
            }
        };
        fetchMasterData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total_price = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        const lastItem = formData.items[formData.items.length - 1];
        if (lastItem && (!lastItem.item_type_id || lastItem.unit_price <= 0)) {
            showToast('Please fill the current item details before adding another', 'error');
            return;
        }

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { item_type_id: '', quantity: 1, unit_price: 0, total_price: 0, description: '' }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    };

    const calculateTotalQty = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    };

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        const newErrors = {};
        if (!formData.promised_delivery_date) newErrors.promised_delivery_date = 'Required';
        if (!formData.priority_id) newErrors.priority_id = 'Required';

        const itemErrors = formData.items.map(item => {
            const err = {};
            if (!item.item_type_id) err.item_type_id = 'Required';
            if (item.unit_price < 0) err.unit_price = 'Invalid';
            return Object.keys(err).length > 0 ? err : null;
        });

        if (itemErrors.some(e => e) || Object.keys(newErrors).length > 0) {
            setErrors({ ...newErrors, items: itemErrors });
            showToast('Please correct the errors in the form', 'error');
            return;
        }

        setLoading(true);
        try {
            await convertToOrder(inquiry.id, formData);
            showToast('Inquiry successfully converted to Order!', 'success');
            onSuccess();
        } catch (err) {
            console.error('Conversion error:', err);
            showToast(err.response?.data?.message || 'Failed to convert inquiry', 'error');
        } finally {
            setLoading(false);
        }
    }, [formData, inquiry.id, onSuccess, showToast]);

    useEffect(() => {
        if (setFooter) {
            setFooter(
                <div className="flex items-center justify-center gap-4 w-full">
                    <ModernButton
                        variant="secondary"
                        onClick={onCancel}
                    >
                        CANCEL
                    </ModernButton>
                    <ModernButton
                        onClick={handleSubmit}
                        loading={loading}
                        variant="primary"
                        icon={ArrowRight}
                        size="lg"
                    >
                        CONFIRM CONVERSION
                    </ModernButton>
                </div>
            );
        }
    }, [loading, setFooter, onCancel, handleSubmit]);

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {/* Context Header */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border border-content rounded-2xl bg-primary/10 flex items-center justify-center text-content shrink-0 transition-transform hover:scale-105 duration-300">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-text-main tracking-tight">
                                Converting Inquiry {inquiry.inquiry_number}
                            </h4>
                            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                                <User size={12} /> {inquiry.customer_name}
                                <span className="text-border mx-1">|</span>
                                <Clock size={12} /> Received: {new Date(inquiry.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="md:block text-right">
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Status</div>
                        <span className="px-3 py-1 bg-background border border-border rounded-full text-[10px] font-bold text-text-secondary uppercase">
                            Draft Order
                        </span>
                    </div>
                </div>
            </div>

            {/* Core Details Section */}
            <div className="grid grid-cols-1 gap-8 bg-background-content/5 p-6 rounded-2xl border border-border/50">
                <div className="space-y-6 ">
                    <h5 className="text-[10px] font-bold text-content uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar size={12} />
                        Scheduling & Priority
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModernSelect
                            label="Order Priority"
                            name="priority_id"
                            options={priorities}
                            value={formData.priority_id}
                            onChange={handleChange}
                            error={errors.priority_id}
                            required
                        />
                        <ModernInput
                            label="Event Date"
                            name="event_date"
                            type="date"
                            value={formData.event_date}
                            onChange={handleChange}
                            icon={Calendar}
                        />
                        <ModernInput
                            label="Order Date"
                            name="order_date"
                            type="date"
                            value={formData.order_date}
                            onChange={handleChange}
                            icon={Calendar}
                            required
                        />
                        <ModernInput
                            label="Promised Delivery"
                            name="promised_delivery_date"
                            type="date"
                            value={formData.promised_delivery_date}
                            onChange={handleChange}
                            error={errors.promised_delivery_date}
                            icon={Calendar}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6 rounded-2xl border border-border/50 p-5">
                <h5 className="text-[10px] font-bold text-content uppercase tracking-[0.2em] flex items-center gap-2">
                    <Tag size={12} />
                    Customer & Requirements
                </h5>
                <div className="flex-1 flex flex-col gap-6">
                    <div className="p-4 bg-background border border-border rounded-xl">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Original Requirements</div>
                        <p className="text-sm text-text-secondary italic">
                            "{inquiry.requirements || 'No specific requirements listed.'}"
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/50 p-5">
                <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold text-content uppercase tracking-[0.2em] flex items-center gap-2">
                        <Tag size={12} />
                        Delivery Details
                    </h5>
                    <ModernCheckbox
                        label="Use Customer Profile Address"
                        name="use_customer_address"
                        checked={formData.use_customer_address}
                        onChange={(e) => setFormData(prev => ({ ...prev, use_customer_address: e.target.checked }))}

                    />
                </div>

                {!formData.use_customer_address && (
                    <div className="grid grid-cols-1 gap-4 bg-primary/5 animate-in fade-in slide-in-from-top-2">
                        <ModernTextArea
                            label="Delivery Address"
                            name="delivery_address_line1"
                            value={formData.delivery_address_line1}
                            onChange={handleChange}
                            placeholder="Flat No, Street..."
                            rows={2}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <ModernInput
                                label="City"
                                name="delivery_city"
                                value={formData.delivery_city}
                                onChange={handleChange}
                                placeholder="City"
                            />
                            <ModernInput
                                label="State"
                                name="delivery_state"
                                value={formData.delivery_state}
                                onChange={handleChange}
                                placeholder="State"
                            />
                            <div className="col-span-2">
                                <ModernInput
                                    label="Pincode"
                                    name="delivery_pincode"
                                    value={formData.delivery_pincode}
                                    onChange={handleChange}
                                    placeholder="Pincode"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <ModernTextArea
                    label="Special Instructions (Auto-populated)"
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleChange}
                    placeholder="Instructions for production..."
                    rows={4}
                />
            </div>

            {/* Order Items Table */}
            <div className="space-y-4 border border-primary/10 rounded-2xl p-5">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-black text-text-main flex items-center gap-2 uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                        Design & Items
                    </h4>
                    <ModernButton
                        variant="primary"
                        size="sm"
                        onClick={addItem}
                        icon={Plus}
                    >
                        ADD ITEM
                    </ModernButton>
                </div>

                <div className="bg-background-content/10 border border-border rounded-2xl shadow-sm overflow-hidden overflow-y-auto min-h-[250px]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-background-content/10 border-b border-border text-text-secondary">
                                <th className="text-left py-3 px-6 text-[10px] uppercase tracking-widest font-black">Item Type</th>
                                <th className="text-center py-3 px-4 text-[10px] uppercase tracking-widest font-black w-32">Qty</th>
                                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest font-black w-40">Unit Price</th>
                                <th className="text-right py-3 px-6 text-[10px] uppercase tracking-widest font-black w-32">Total</th>
                                <th className="py-3 px-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 bg-surface/30">
                            {formData.items.map((item, index) => (
                                <tr key={index} className="group hover:bg-primary/5 transition-colors">
                                    <td className="py-2.5 px-6">
                                        <ModernSelect
                                            size="sm"
                                            placeholder="Select Type..."
                                            value={item.item_type_id}
                                            options={itemTypes}
                                            onChange={(e) => handleItemChange(index, 'item_type_id', e.target.value)}
                                            error={errors.items?.[index]?.item_type_id}
                                        />
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <ModernNumberInput
                                            size="sm"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px] font-bold">₹</span>
                                            <ModernNumberInput
                                                size="sm"
                                                className="pl-6"
                                                min={0}
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-6 text-right tabular-nums">
                                        <span className="text-sm font-black text-text-main">
                                            ₹{(item.total_price || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            disabled={formData.items.length === 1}
                                            className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-xl transition-all disabled:opacity-0"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-background-content/10 border-t-2 border-border">
                            <tr>
                                <td className="py-3 px-6 text-right" colSpan={3}>
                                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Grand Total</span>
                                </td>
                                <td className="py-3 px-6 text-right tabular-nums">
                                    <span className="text-xl font-black text-primary">
                                        ₹{calculateTotal().toLocaleString()}
                                    </span>
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="text-[10px] text-text-muted font-bold italic uppercase tracking-widest p-2 bg-background-content/5 rounded-full border border-border/10">
                * Confirming conversion will automatically create a draft order and customer profile.
            </div>
        </form >
    );
};

export default ConvertInquiryModal;
