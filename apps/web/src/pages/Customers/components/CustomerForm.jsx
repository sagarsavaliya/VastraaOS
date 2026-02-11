import React, { useState, useEffect } from 'react';
import { createCustomer, updateCustomer } from '../services/customerService';
import { useToast } from '../../../components/UI/Toast';
import { User, Phone, Mail, MapPin, Notebook, Briefcase, UserCircle } from 'lucide-react';
import { ModernInput, ModernSelect, ModernTextArea, ModernButton, ModernCheckbox } from '../../../components/UI/CustomInputs';

const CustomerForm = ({ onSuccess, onCancel, setFooter, initialData = null, isEdit = false }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        company_name: '',
        designation: '',
        company_address: '',
        company_city: '',
        company_state: '',
        company_pincode: '',
        gst_number: '',
        display_name: '',
        email: '',
        mobile: '',
        whatsapp_number: '',
        gender: 'other',
        customer_type: 'individual',
        address: '',
        city: '',
        state: '',
        pincode: '',
        is_company_address_same: false,
        notes: ''
    });

    useEffect(() => {
        if (isEdit && initialData) {
            // Check if business address and personal address are the same
            const isSameAddress =
                initialData.company_address === initialData.address &&
                initialData.company_city === initialData.city &&
                initialData.company_state === initialData.state &&
                initialData.company_pincode === initialData.pincode &&
                !!initialData.company_address; // Only true if address exists

            setFormData(prev => ({
                ...prev,
                ...initialData,
                first_name: initialData.first_name || '',
                last_name: initialData.last_name || '',
                display_name: initialData.display_name || '',
                email: initialData.email || '',
                mobile: initialData.mobile || '',
                whatsapp_number: initialData.whatsapp_number || '',
                gender: initialData.gender || 'other',
                company_name: initialData.company_name || '',
                designation: initialData.designation || '',
                company_address: initialData.company_address || '',
                company_city: initialData.company_city || '',
                company_state: initialData.company_state || '',
                company_pincode: initialData.company_pincode || '',
                gst_number: initialData.gst_number || '',
                address: initialData.address || '',
                city: initialData.city || '',
                state: initialData.state || '',
                pincode: initialData.pincode || '',
                customer_type: initialData.customer_type || 'individual',
                is_company_address_same: isSameAddress,
                notes: initialData.notes || ''
            }));
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
                        form="customer-form"
                        loading={loading}
                        variant="primary"
                        size="lg"
                    >
                        {isEdit ? 'UPDATE CUSTOMER' : 'CREATE CUSTOMER'}
                    </ModernButton>
                </div>
            );
        }
    }, [loading, setFooter, onCancel, isEdit]);

    // Cleanup footer on unmount
    useEffect(() => {
        return () => { if (setFooter) setFooter(null); };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newState = { ...prev, [name]: finalValue };

            // Sync company address to personal address if checkbox is checked
            if ((name === 'is_company_address_same' && finalValue) || (prev.is_company_address_same && name.startsWith('company_'))) {
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

    const validate = () => {
        const newErrors = {};
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Invalid mobile number (10 digits required)';

        if (formData.email && !/\S+@\S+\.\S/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            if (isEdit) {
                await updateCustomer(initialData.id, formData);
                showToast('Customer updated successfully!', 'success');
            } else {
                await createCustomer(formData);
                showToast('Customer created successfully!', 'success');
            }
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error saving customer:', err);
            const message = err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} customer`;
            showToast(message, 'error');
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form id="customer-form" onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModernInput
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    error={errors.first_name}
                    icon={User}
                />

                <ModernInput
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    error={errors.last_name}
                    icon={User}
                />

                <ModernInput
                    label="Mobile Number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    error={errors.mobile}
                    type="tel"
                    icon={Phone}
                />

                <ModernInput
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    error={errors.email}
                    type="email"
                    icon={Mail}
                />

                <ModernSelect
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    options={[
                        { id: 'male', name: 'Male' },
                        { id: 'female', name: 'Female' },
                        { id: 'other', name: 'Other' }
                    ]}
                    icon={UserCircle}
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
                    icon={Briefcase}
                />
            </div>

            {formData.customer_type === 'business' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-background-content/20 border border-primary/10">
                    <div className="col-span-1 md:col-span-2 flex items-center gap-2 mb-2">
                        <Briefcase className="text-primary" size={18} />
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Business Details</h3>
                    </div>

                    <ModernInput
                        label="Company Name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Acme Corp"
                        icon={Briefcase}
                    />
                    <ModernInput
                        label="Designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Owner / Manager"
                        icon={UserCircle}
                    />
                    <ModernInput
                        label="GST Number"
                        name="gst_number"
                        value={formData.gst_number}
                        onChange={handleChange}
                        placeholder="22AAAAA0000A1Z5"
                        icon={Notebook}
                    />
                    <div className="col-span-1 md:col-span-2">
                        <ModernTextArea
                            label="Address"
                            name="company_address"
                            value={formData.company_address}
                            onChange={handleChange}
                            placeholder="Company legal address..."
                            rows={1}
                            icon={MapPin}
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
                        icon={MapPin}
                    />

                    <div className="col-span-1 md:col-span-2 mt-2">
                        <ModernCheckbox
                            label="Delivery address is same as company address?"
                            name="is_company_address_same"
                            checked={formData.is_company_address_same}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            )}

            {!formData.is_company_address_same && (
                <>
                    <ModernTextArea
                        label="Delivery Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Street, City Area..."
                        rows={3}
                        icon={MapPin}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                            placeholder="400001"
                            className="col-span-2 md:col-span-1"
                            icon={MapPin}
                        />
                    </div>
                </>
            )}

            <ModernTextArea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Special preferences or notes..."
                rows={2}
                icon={Notebook}
            />
        </form>
    );
};

export default CustomerForm;
