import React, { useState, useEffect } from 'react';
import { createWorker, updateWorker } from '../services/workerService';
import { getWorkTypes } from '../../../services/masterDataService';
import { useToast } from '../../../components/UI/Toast';
import {
    User, Phone, Mail, MapPin, Notebook, Briefcase,
    CreditCard, Landmark, Hexagon, Award, Plus, Trash2,
    AtSign, DollarSign, Calendar, ShieldCheck, Users
} from 'lucide-react';
import {
    ModernInput, ModernSelect, ModernTextArea,
    ModernButton, ModernNumberInput, ModernCheckbox
} from '../../../components/UI/CustomInputs';

const WorkerForm = ({ worker, onSuccess, onCancel, setFooter }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [workTypes, setWorkTypes] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        display_name: '',
        mobile: '',
        alternate_mobile: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        worker_type: 'external',
        specialization: '',
        experience_years: 0,
        default_rate: 0,
        rate_type: 'per_piece',
        bank_name: '',
        bank_account_name: '',
        bank_account_number: '',
        bank_ifsc_code: '',
        upi_id: '',
        pan_number: '',
        is_active: true,
        notes: '',
        skills: []
    });

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const types = await getWorkTypes();
                setWorkTypes(types);
            } catch (err) {
                console.error('Error fetching work types:', err);
            }
        };
        fetchMasters();

        if (worker) {
            setFormData({
                ...formData,
                ...worker,
                skills: worker.skills?.map(s => ({
                    work_type_id: s.work_type_id,
                    proficiency_level: s.proficiency_level || 'intermediate',
                    rate_per_piece: s.rate_per_piece || 0
                })) || []
            });
        }
    }, [worker]);

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
                        form="worker-form"
                        loading={loading}
                        variant="primary"
                        size="lg"
                    >
                        {worker ? 'UPDATE WORKER' : 'CREATE WORKER'}
                    </ModernButton>
                </div>
            );
        }
    }, [loading, setFooter, onCancel, worker]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSkillChange = (index, field, value) => {
        const newSkills = [...formData.skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const addSkill = () => {
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, { work_type_id: '', proficiency_level: 'intermediate', rate_per_piece: 0 }]
        }));
    };

    const removeSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.display_name) newErrors.display_name = 'Display name is required';
        if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = '10 digits required';

        if (formData.email && !/\S+@\S+\.\S/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            if (worker) {
                await updateWorker(worker.id, formData);
                showToast('Worker updated successfully!', 'success');
            } else {
                await createWorker(formData);
                showToast('Worker created successfully!', 'success');
            }
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error saving worker:', err);
            const message = err.response?.data?.message || 'Failed to save worker';
            showToast(message, 'error');
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form id="worker-form" onSubmit={handleSubmit} className="space-y-10 py-2 antialiased" autoComplete="off">
            {/* Section 1: Personal Profile */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <User size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Personal Profile</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernInput
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="e.g. Salim"
                        error={errors.first_name}
                        icon={User}
                    />
                    <ModernInput
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="e.g. Khan"
                        error={errors.last_name}
                        icon={User}
                    />
                    <ModernInput
                        label="Display Name (Public)"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleChange}
                        placeholder="Salim Master"
                        error={errors.display_name}
                        icon={ShieldCheck}
                    />
                    <ModernInput
                        label="Mobile Number"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="9876543210"
                        error={errors.mobile}
                        icon={Phone}
                    />
                </div>
            </div>

            {/* Section 2: Technical & Payment Config */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <Award size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Technical & Payment</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ModernInput
                        label="Specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g. Zardoshi Expert"
                        icon={Briefcase}
                    />
                    <ModernNumberInput
                        label="Experience (Years)"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleChange}
                        min={0}
                        icon={Calendar}
                    />
                    <ModernSelect
                        label="Rate Type"
                        name="rate_type"
                        value={formData.rate_type}
                        onChange={handleChange}
                        options={[
                            { id: 'per_piece', name: 'Per Piece' },
                            { id: 'per_hour', name: 'Per Hour' },
                            { id: 'per_day', name: 'Per Day' },
                            { id: 'fixed', name: 'Fixed Salary' }
                        ]}
                        icon={CreditCard}
                    />
                    <ModernNumberInput
                        label="Daily Rate (₹)"
                        name="default_rate"
                        value={formData.default_rate}
                        onChange={handleChange}
                        min={0}
                        icon={DollarSign}
                    />
                    <ModernSelect
                        label="Worker Type"
                        name="worker_type"
                        value={formData.worker_type}
                        onChange={handleChange}
                        options={[
                            { id: 'external', name: 'External / JobWork' },
                            { id: 'internal', name: 'In-House Staff' }
                        ]}
                        icon={Users}
                    />
                    <div className="flex items-end pb-1.5">
                        <ModernCheckbox
                            label="Available for Work"
                            checked={formData.is_active}
                            onChange={(e) => handleChange({ target: { name: 'is_active', checked: e.target.checked, type: 'checkbox' } })}
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Bank Details */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                        <Landmark size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Bank Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernInput
                        label="Bank Account Name"
                        name="bank_account_name"
                        value={formData.bank_account_name}
                        onChange={handleChange}
                        placeholder="As per passbook"
                        icon={User}
                    />
                    <ModernInput
                        label="Bank Account Number"
                        name="bank_account_number"
                        value={formData.bank_account_number}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        icon={CreditCard}
                    />
                    <ModernInput
                        label="Bank Name"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleChange}
                        placeholder="SBI, HDFC, etc."
                        icon={Landmark}
                    />
                    <ModernInput
                        label="IFSC Code"
                        name="bank_ifsc_code"
                        value={formData.bank_ifsc_code}
                        onChange={handleChange}
                        placeholder="SBIN0001234"
                        icon={Hexagon}
                    />
                    <ModernInput
                        label="UPI ID"
                        name="upi_id"
                        value={formData.upi_id}
                        onChange={handleChange}
                        placeholder="worker@upi"
                        icon={AtSign}
                        className="md:col-span-2"
                    />
                </div>
            </div>

            {/* Section 4: Skills Matrix */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Plus size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Skills Matrix</h3>
                    </div>
                    <ModernButton
                        size="sm"
                        variant="ghost"
                        onClick={addSkill}
                        icon={Plus}
                        className="text-primary hover:bg-primary/5"
                    >
                        ADD SKILL
                    </ModernButton>
                </div>

                <div className="space-y-4">
                    {formData.skills.map((skill, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-background-content/10 border border-border relative group">
                            <ModernSelect
                                label="Work Type"
                                value={skill.work_type_id}
                                onChange={(e) => handleSkillChange(index, 'work_type_id', e.target.value)}
                                options={workTypes}
                                size="sm"
                            />
                            <ModernSelect
                                label="Proficiency"
                                value={skill.proficiency_level}
                                onChange={(e) => handleSkillChange(index, 'proficiency_level', e.target.value)}
                                options={[
                                    { id: 'beginner', name: 'Beginner' },
                                    { id: 'intermediate', name: 'Intermediate' },
                                    { id: 'expert', name: 'Expert' }
                                ]}
                                size="sm"
                            />
                            <ModernNumberInput
                                label="Custom Rate (₹)"
                                value={skill.rate_per_piece}
                                onChange={(e) => handleSkillChange(index, 'rate_per_piece', e.target.value)}
                                size="sm"
                                icon={DollarSign}
                            />
                            <div className="flex items-end pb-1 justify-end">
                                <button
                                    type="button"
                                    onClick={() => removeSkill(index)}
                                    className="p-2 text-text-muted hover:text-error transition-colors bg-surface border border-border rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {formData.skills.length === 0 && (
                        <div className="text-center py-8 rounded-xl border border-dashed border-border bg-background-content/5">
                            <p className="text-xs text-text-muted uppercase tracking-widest font-bold">No skills added yet</p>
                            <button
                                type="button"
                                onClick={addSkill}
                                className="mt-2 text-primary text-[10px] font-bold uppercase hover:underline"
                            >
                                Click here to add the first skill
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 5: Experience & Notes */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-600">
                        <Notebook size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Additional Notes</h3>
                </div>
                <ModernTextArea
                    label="Internal Observations"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Reliability, quality of work, specialized tools they own..."
                    rows={4}
                    icon={Notebook}
                />
            </div>
        </form>
    );
};

export default WorkerForm;
