import React, { useState, useEffect } from 'react';
import { useToast } from '../../../components/UI/Toast';
import { Calendar, Trash2, Plus } from 'lucide-react';
import { ModernInput, ModernSelect, ModernSearchSelect, ModernTextArea, ModernButton, ModernNumberInput } from '../../../components/UI/CustomInputs';
import { getOccasions, getItemTypes, getOrderStatuses, getOrderPriorities } from '../../../services/masterDataService';
import { getCustomers } from '../../Customers/services/customerService';
import { createOrder, updateOrder } from '../services/orderService';

const OrderForm = ({ onSuccess, onCancel, setFooter, isEdit = false, initialData = null }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState({});

    // Master Data States
    const [occasions, setOccasions] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [formData, setFormData] = useState({
        customer_id: '',
        occasion_id: '',
        status_id: '',
        priority_id: '',
        order_date: '',
        promised_delivery_date: '',
        event_date: '',
        special_instructions: '',
        items: [
            { item_type_id: '', quantity: 1, unit_price: 0, total_price: 0, description: '' }
        ]
    });

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [occs, items, stats, prios, custs] = await Promise.all([
                    getOccasions(),
                    getItemTypes(),
                    getOrderStatuses(),
                    getOrderPriorities(),
                    getCustomers({ per_page: 100 })
                ]);
                setOccasions(occs.data || occs);
                setItemTypes(items.data || items);
                setStatuses(stats.data || stats);
                setPriorities(prios.data || prios);
                setCustomers(custs.data || []);

                if (!isEdit) {
                    // Set default status and priority for new orders
                    const allStats = stats.data || stats;
                    if (allStats?.length > 0) {
                        setFormData(prev => ({ ...prev, status_id: allStats[0].id.toString() }));
                    }

                    const allPrios = prios.data || prios;
                    if (allPrios?.length > 0) {
                        const mediumPrio = allPrios.find(p => p.name.toLowerCase() === 'medium') || allPrios[0];
                        setFormData(prev => ({ ...prev, priority_id: mediumPrio.id.toString() }));
                    }
                }
            } catch (err) {
                console.error('Error fetching master data:', err);
                showToast('Failed to load form options', 'error');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchMasterData();
    }, [isEdit]);

    useEffect(() => {
        if (isEdit && initialData) {
            setFormData({
                customer_id: initialData.customer?.id || initialData.customer_id || '',
                occasion_id: initialData.occasion?.id || initialData.occasion_id || '',
                status_id: initialData.status?.id?.toString() || initialData.status_id?.toString() || '',
                priority_id: initialData.priority?.id?.toString() || initialData.priority_id?.toString() || '',
                order_date: initialData.order_date || '',
                promised_delivery_date: initialData.promised_delivery_date || '',
                event_date: initialData.event_date || '',
                special_instructions: initialData.special_instructions || '',
                items: initialData.items?.map(item => ({
                    id: item.id, // For existing items
                    item_type_id: item.item_type?.id || item.item_type_id || '',
                    quantity: item.quantity || 1,
                    unit_price: item.unit_price || 0,
                    total_price: item.total_price || 0,
                    description: item.description || ''
                })) || [{ item_type_id: '', quantity: 1, unit_price: 0, total_price: 0, description: '' }]
            });
        }
    }, [isEdit, initialData]);

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
                        type="submit"
                        form="order-form"
                        loading={loading}
                        variant="primary"
                        size="lg"
                    >
                        {isEdit ? 'UPDATE ORDER' : 'CREATE ORDER'}
                    </ModernButton>
                </div>
            );
        }
    }, [loading, formData.items, setFooter, onCancel, initialLoading]);

    // Cleanup footer on unmount
    useEffect(() => {
        return () => { if (setFooter) setFooter(null); };
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
        return formData.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
        if (!formData.promised_delivery_date) newErrors.promised_delivery_date = 'Delivery date is required';

        const itemErrors = formData.items.map(item => {
            const err = {};
            if (!item.item_type_id) err.item_type_id = 'Required';
            if (!item.unit_price || item.unit_price <= 0) err.unit_price = 'Invalid';
            if (!item.quantity || item.quantity <= 0) err.quantity = 'Invalid';
            return Object.keys(err).length > 0 ? err : null;
        });

        if (itemErrors.some(e => e)) {
            newErrors.items = itemErrors;
            showToast('Please correct the errors in order items', 'error');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                subtotal: calculateTotal(),
                total_amount: calculateTotal(),
            };

            let result;
            if (isEdit) {
                result = await updateOrder(initialData.id, dataToSave);
                showToast('Order updated successfully!', 'success');
            } else {
                result = await createOrder(dataToSave);
                showToast('Order created successfully!', 'success');
            }
            if (onSuccess) onSuccess(result);
        } catch (err) {
            console.error('Error saving order:', err);
            const message = err.response?.data?.message || 'Failed to save order';
            showToast(message, 'error');
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };



    const inputClass = (name, hasError) => `
        w-full px-4 py-2.5 bg-background border rounded-xl text-sm transition-all outline-none appearance-none text-text-main
        ${hasError ? 'border-error ring-4 ring-error/5' : 'border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5'}
    `;

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <form id="order-form" onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModernSearchSelect
                    label="Customer"
                    placeholder="Search name or mobile..."
                    value={formData.customer_id}
                    options={customers.map(c => ({ id: c.id, name: c.name || `${c.first_name} ${c.last_name} (${c.mobile})` }))}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                    error={errors.customer_id}
                />

                <div className="grid grid-cols-2 gap-4">
                    <ModernSelect
                        label="Status"
                        name="status_id"
                        value={formData.status_id}
                        onChange={handleChange}
                        options={statuses}
                    />
                    <ModernSelect
                        label="Priority"
                        name="priority_id"
                        value={formData.priority_id}
                        onChange={handleChange}
                        options={priorities}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernInput
                    type="date"
                    label="Order Date"
                    name="order_date"
                    value={formData.order_date}
                    onChange={handleChange}
                    icon={Calendar}
                />
                <ModernInput
                    type="date"
                    label="Promised Delivery"
                    name="promised_delivery_date"
                    value={formData.promised_delivery_date}
                    onChange={handleChange}
                    error={errors.promised_delivery_date}
                    icon={Calendar}
                />
                <ModernInput
                    type="date"
                    label="Event Date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    icon={Calendar}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-black text-text-secondary flex items-center gap-2 uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                        Order Items
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

                <div className="bg-background-content/10 border border-border rounded-2xl shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-background-content/30 border-b border-border text-text-secondary">
                                <th className="text-left py-3 px-6 text-[10px] uppercase tracking-widest font-black">Item Type</th>
                                <th className="text-center py-3 px-4 text-[10px] uppercase tracking-widest font-black w-32">Qty</th>
                                <th className="text-left py-3 px-4 text-[10px] uppercase tracking-widest font-black w-40">Unit Price</th>
                                <th className="text-right py-3 px-6 text-[10px] uppercase tracking-widest font-black w-32">Total</th>
                                <th className="py-3 px-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {formData.items.map((item, index) => (
                                <tr key={index} className="group hover:bg-background-content/20 transition-colors animate-in fade-in slide-in-from-top-1">
                                    <td className="py-2.5 px-6">
                                        <ModernSelect
                                            size="sm"
                                            placeholder="Select Type..."
                                            value={item.item_type_id}
                                            onChange={(e) => handleItemChange(index, 'item_type_id', e.target.value)}
                                            options={itemTypes}
                                        />
                                        {errors.items?.[index]?.item_type_id && <div className="text-[10px] text-error font-black uppercase mt-1">Required</div>}
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
                                        <ModernNumberInput
                                            size="sm"
                                            min={0}
                                            value={item.unit_price}
                                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                        />
                                    </td>
                                    <td className="py-2.5 px-6 text-right tabular-nums">
                                        <span className="text-sm font-black text-text-main">₹{item.total_price.toLocaleString()}</span>
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
                        <tfoot className="bg-background-content/5">
                            <tr className="border-t-2 border-border">
                                <td className="py-2 px-6 text-right">
                                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Total Summary</span>
                                </td>
                                <td className="py-2 px-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter mb-0.5">Total Qty</span>
                                        <span className="text-sm font-black text-text-main tabular-nums bg-background-content/10 px-2 py-0.5 rounded-md min-w-[3rem]">
                                            {calculateTotalQty()}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-4"></td>
                                <td className="py-2 px-6 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter mb-0.5">Grand Total</span>
                                        <span className="text-lg font-black text-text-main tabular-nums">
                                            ₹{calculateTotal().toLocaleString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <ModernTextArea
                label="Special Instructions"
                name="special_instructions"
                value={formData.special_instructions}
                onChange={handleChange}
                placeholder="Reference notes, styling requirements, etc..."
                rows={3}
            />
        </form>
    );
};

export default OrderForm;
