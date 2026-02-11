import React, { useState, useEffect } from 'react';
import { useToast } from '../../../components/UI/Toast';
import { User, Phone, Mail, Calendar, Info, Target, ShoppingBag, DollarSign, Search, PlusCircle, Notebook, LocateIcon, MapPinHouse, MapPin, Binary } from 'lucide-react';
import { ModernInput, ModernSelect, ModernSearchSelect, ModernTextArea, ModernButton, ModernCheckbox } from '../../../components/UI/CustomInputs';
import { getInquirySources, getOccasions, getItemTypes, getBudgetRanges } from '../../../services/masterDataService';
import { getCustomers } from '../../Customers/services/customerService';
import { createInquiry } from '../services/inquiryService';

const InquiryForm = ({ onSuccess, onCancel, setFooter }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errors, setErrors] = useState({});

    // Master Data States
    const [sources, setSources] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [budgetRanges, setBudgetRanges] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [formData, setFormData] = useState({
        customer_id: '',
        customer_name: '',
        customer_mobile: '',
        customer_email: '',
        customer_type: 'individual',
        company_name: '',
        designation: '',
        company_address: '',
        company_city: '',
        company_state: '',
        company_pincode: '',
        company_gst: '',
        is_company_address_same: false,
        address: '',
        city: '',
        state: '',
        pincode: '',
        source_id: '',
        occasion_id: '',
        item_type_id: '',
        budget_range_id: '',
        event_date: '',
        preferred_delivery_date: '',
        requirements: '',
        notes: ''
    });

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
                        form="inquiry-form"
                        loading={loading}
                        variant="primary"
                        size="lg"
                        icon={PlusCircle}
                    >
                        CREATE INQUIRY
                    </ModernButton>
                </div>
            );
        }
    }, [loading, setFooter, onCancel, initialLoading]);

    // Cleanup footer on unmount
    useEffect(() => {
        return () => { if (setFooter) setFooter(null); };
    }, []);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [srcs, occs, items, budgets, custs] = await Promise.all([
                    getInquirySources(),
                    getOccasions(),
                    getItemTypes(),
                    getBudgetRanges(),
                    getCustomers({ per_page: 100 })
                ]);
                setSources(srcs.data || srcs);
                setOccasions(occs.data || occs);
                setItemTypes(items.data || items);
                setBudgetRanges(budgets.data || budgets);
                setCustomers(custs.data || []);
            } catch (err) {
                console.error('Error fetching master data:', err);
                showToast('Failed to load form options', 'error');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchMasterData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newState = { ...prev, [name]: finalValue };

            // If syncing addresses, copy company address to delivery address
            if ((name === 'is_company_address_same' && finalValue) || (prev.is_company_address_same && name.startsWith('company_'))) {
                const sourceField = name === 'is_company_address_same' ? 'company_address' : (name === 'company_address' ? 'company_address' : null);

                if (name === 'is_company_address_same' || name === 'company_address') newState.address = newState.company_address;
                if (name === 'is_company_address_same' || name === 'company_city') newState.city = newState.company_city;
                if (name === 'is_company_address_same' || name === 'company_state') newState.state = newState.company_state;
                if (name === 'is_company_address_same' || name === 'company_pincode') newState.pincode = newState.company_pincode;
            }

            return newState;
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSelectCustomer = (customerId) => {
        const customer = customers.find(c => c.id.toString() === customerId.toString());
        if (customer) {
            setFormData(prev => ({
                ...prev,
                customer_id: customer.id,
                customer_name: customer.name || `${customer.first_name} ${customer.last_name}`,
                customer_mobile: customer.mobile || '',
                customer_email: customer.email || '',
                customer_type: customer.customer_type || 'individual',
                company_name: customer.company_name || '',
                designation: customer.designation || '',
                company_address: customer.company_address || '',
                company_gst: customer.gst_number || '',
                company_city: customer.company_city || '',
                company_state: customer.company_state || '',
                company_pincode: customer.company_pincode || '',
                is_company_address_same: (customer.company_address && customer.company_address === customer.address) || false,
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || '',
                pincode: customer.pincode || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                customer_id: '',
                customer_name: '',
                customer_mobile: '',
                customer_email: '',
                customer_type: 'individual',
                company_name: '',
                designation: '',
                company_address: '',
                company_city: '',
                company_state: '',
                company_pincode: '',
                company_gst: '',
                is_company_address_same: false,
                address: '',
                city: '',
                state: '',
                pincode: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // Customer validation
        if (!formData.customer_name && !formData.customer_id) {
            newErrors.customer_name = 'Customer name is required';
        }

        if (!formData.customer_mobile && !formData.customer_id) {
            newErrors.customer_mobile = 'Mobile number is required';
        } else if (formData.customer_mobile && !/^[0-9]{10}$/.test(formData.customer_mobile.replace(/\s/g, ''))) {
            newErrors.customer_mobile = 'Mobile number must be 10 digits';
        }

        // Email validation (optional but must be valid if provided)
        if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
            newErrors.customer_email = 'Invalid email format';
        }

        // Source validation
        if (!formData.source_id) {
            newErrors.source_id = 'Inquiry source is required';
        }

        // Date validations
        if (formData.event_date && formData.preferred_delivery_date) {
            const eventDate = new Date(formData.event_date);
            const deliveryDate = new Date(formData.preferred_delivery_date);
            if (deliveryDate > eventDate) {
                newErrors.preferred_delivery_date = 'Delivery date must be before event date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const result = await createInquiry(formData);
            showToast('Inquiry created successfully!', 'success');
            if (onSuccess) onSuccess(result);
        } catch (err) {
            console.error('Error creating inquiry:', err);
            const message = err.response?.data?.message || 'Failed to create inquiry';
            showToast(message, 'error');
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-lg shadow-primary/10"></div>
            </div>
        );
    }

    return (
        <form id="inquiry-form" onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
            <div className="bg-background-content/10 p-6 rounded-3xl border border-border/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-text-muted flex items-center gap-2 uppercase tracking-[0.2em]">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                        Customer Identity
                    </h4>
                    {!formData.customer_id && formData.customer_name && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg animate-in fade-in slide-in-from-right-2">
                            <PlusCircle size={14} />
                            NEW CUSTOMER PROFILE WILL BE CREATED
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
                    <ModernSearchSelect
                        label="Select Existing Customer"
                        placeholder="Search by name or contact..."
                        value={formData.customer_id}
                        onChange={(e) => handleSelectCustomer(e.target.value)}
                        options={customers.map(c => ({ id: c.id, name: `${c.name || c.first_name + ' ' + c.last_name} (${c.mobile})` }))}
                        icon={Search}
                    />

                    <ModernInput
                        label="Full Name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        disabled={!!formData.customer_id}
                        placeholder="John Doe"
                        error={errors.customer_name}
                        icon={User}
                    />

                    <ModernInput
                        label="Mobile Number"
                        name="customer_mobile"
                        value={formData.customer_mobile}
                        onChange={handleChange}
                        disabled={!!formData.customer_id}
                        placeholder="9876543210"
                        error={errors.customer_mobile}
                        type="tel"
                        icon={Phone}
                    />

                    <ModernInput
                        label="Email Address"
                        name="customer_email"
                        value={formData.customer_email}
                        onChange={handleChange}
                        disabled={!!formData.customer_id}
                        placeholder="john@example.com"
                        error={errors.customer_email}
                        type="email"
                        icon={Mail}
                    />

                    <ModernSelect
                        label="Customer Type"
                        name="customer_type"
                        value={formData.customer_type}
                        onChange={handleChange}
                        options={[
                            { id: 'individual', name: 'Individual' },
                            { id: 'business', name: 'Business' }
                        ]}
                        icon={Info}
                    />

                    {formData.customer_type === 'business' && (
                        <div className="col-span-full gap-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center gap-2 mb-4">
                                <ShoppingBag className="text-primary" size={16} />
                                <h5 className="text-xs font-bold text-primary uppercase tracking-wider">Business Details</h5>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                <ModernInput
                                    label="Company Name"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    placeholder="Acme Corp"
                                    icon={ShoppingBag}
                                />
                                <ModernInput
                                    label="Designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="Manager"
                                    icon={User}
                                />
                                <ModernInput
                                    label="Company GST"
                                    name="company_gst"
                                    value={formData.company_gst}
                                    onChange={handleChange}
                                    placeholder="22AAAAA0000A1Z5"
                                    icon={Notebook}
                                />
                                <div className="col-span-full">
                                    <ModernTextArea
                                        label="Address"
                                        name="company_address"
                                        value={formData.company_address}
                                        onChange={handleChange}
                                        placeholder="Company registered address..."
                                        rows={1}
                                        icon={Target}
                                    />
                                </div>
                                <ModernInput
                                    label="City"
                                    name="company_city"
                                    value={formData.company_city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    icon={MapPin}
                                />
                                <ModernInput
                                    label="State"
                                    name="company_state"
                                    value={formData.company_state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    icon={MapPin}
                                />
                                <ModernInput
                                    label="Pincode"
                                    name="company_pincode"
                                    value={formData.company_pincode}
                                    onChange={handleChange}
                                    placeholder="Pincode"
                                    icon={Binary}
                                />

                                <div className="col-span-full mt-2">
                                    <ModernCheckbox
                                        label="Delivery address is same as company address?"
                                        name="is_company_address_same"
                                        checked={formData.is_company_address_same}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {(!formData.is_company_address_same || formData.customer_type !== 'business') && (
                        <div className="col-span-full border-t border-border/30 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <LocateIcon className="text-text-muted" size={16} />
                                <h5 className="text-xs font-bold text-text-muted uppercase tracking-wider">Address Details (Delivery)</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="col-span-3">
                                    <ModernTextArea
                                        label="Street Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Flat No, Building, Street..."
                                        rows={1}
                                        icon={MapPinHouse}
                                    />
                                </div>
                                <ModernInput
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    icon={MapPin}
                                />
                                <ModernInput
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    icon={MapPin}
                                />
                                <ModernInput
                                    label="Pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="360004"
                                    icon={Binary}
                                />
                            </div>
                        </div>
                    )}

                    {!formData.customer_id && formData.customer_name && (
                        <div className="col-span-full animate-in fade-in slide-in-from-top-2 border-t border-border/30 pt-4 mt-2">
                            <ModernTextArea
                                label="Initial Customer Notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Add any background info, references, or preferences for this new customer..."
                                rows={2}
                                icon={Notebook}
                                className="bg-primary/5 rounded-2xl p-4 border border-primary/20"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModernSelect
                    label="Inquiry Source"
                    name="source_id"
                    value={formData.source_id}
                    onChange={handleChange}
                    options={sources}
                    icon={Target}
                    error={errors.source_id}
                />

                <ModernSelect
                    label="Occasion"
                    name="occasion_id"
                    value={formData.occasion_id}
                    onChange={handleChange}
                    options={occasions.map(o => ({ id: o.id, name: o.title || o.name }))}
                    icon={ShoppingBag}
                />

                <ModernSelect
                    label="Item Type"
                    name="item_type_id"
                    value={formData.item_type_id}
                    onChange={handleChange}
                    options={itemTypes}
                    icon={Info}
                />

                <ModernSelect
                    label="Budget Range"
                    name="budget_range_id"
                    value={formData.budget_range_id}
                    onChange={handleChange}
                    options={budgetRanges.map(b => ({ id: b.id, name: b.label || b.name }))}
                    icon={DollarSign}
                />

                <ModernInput
                    type="date"
                    label="Event Date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    icon={Calendar}
                />

                <ModernInput
                    type="date"
                    label="Preferred Delivery"
                    name="preferred_delivery_date"
                    value={formData.preferred_delivery_date}
                    onChange={handleChange}
                    icon={Calendar}
                    error={errors.preferred_delivery_date}
                />
            </div>

            <ModernTextArea
                label="Requirements & Preferences"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Describe specific design or fabric requirements..."
                rows={4}
                icon={Notebook}
            />
        </form>
    );
};

export default InquiryForm;
