import React, { useState, useEffect, useRef } from 'react';
import { Calendar, IndianRupee, Tag, FileText, Building2, User, Hash, CreditCard, Paperclip, X, FolderOpen, Plus, Loader2, Users } from 'lucide-react';
import { ModernInput, ModernSelect, ModernTextArea, ModernButton } from '../../../components/UI/CustomInputs';
import { useToast } from '../../../components/UI/Toast';
import { createExpense, updateExpense, getExpenseCategories, createExpenseCategory, getExpenseGroups, createExpenseGroup, uploadExpenseReceipt } from '../services/expenseService';
import api from '../../../services/api';

const PAYMENT_METHODS = [
    { id: 'cash', name: 'Cash' },
    { id: 'upi', name: 'UPI' },
    { id: 'card', name: 'Card' },
    { id: 'bank_transfer', name: 'Bank Transfer' },
    { id: 'cheque', name: 'Cheque' },
    { id: 'other', name: 'Other' },
];

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ExpenseForm = ({ initialData = null, onSuccess, onCancel }) => {
    const { showToast } = useToast();
    const firstInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [savingGroup, setSavingGroup] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [showNewCat, setShowNewCat] = useState(false);
    const [savingCat, setSavingCat] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        expense_group_id: '',
        employee_user_id: '',
        expense_type: 'business',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        vendor_name: '',
        reference_number: '',
        is_reimbursable: false,
        notes: '',
    });

    useEffect(() => {
        Promise.all([
            getExpenseCategories(),
            getExpenseGroups(),
            api.get('/users', { params: { per_page: 100 } }).then(r => r.data),
        ]).then(([cats, grps, usrs]) => {
            setCategories(cats.data || []);
            setGroups(grps.data || []);
            const userList = usrs.data?.data || usrs.data || [];
            setEmployees(userList.map(u => ({ id: u.id, name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() })));
        });

        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                category_id: initialData.category_id?.toString() || '',
                expense_group_id: initialData.expense_group_id?.toString() || '',
                employee_user_id: initialData.employee_user_id?.toString() || '',
                expense_type: initialData.expense_type || 'business',
                amount: initialData.amount || '',
                expense_date: initialData.expense_date || new Date().toISOString().split('T')[0],
                payment_method: initialData.payment_method || 'cash',
                vendor_name: initialData.vendor_name || '',
                reference_number: initialData.reference_number || '',
                is_reimbursable: initialData.is_reimbursable || false,
                notes: initialData.notes || '',
            });
        }
        setTimeout(() => firstInputRef.current?.focus(), 100);
    }, []);

    const filteredCategories = categories.filter(c =>
        !formData.expense_type || c.type === formData.expense_type
    );

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const valid = files.filter(f => {
            if (f.size > 5 * 1024 * 1024) {
                showToast(`${f.name} exceeds 5MB limit`, 'error');
                return false;
            }
            return true;
        });
        setPendingFiles(prev => [...prev, ...valid]);
        e.target.value = '';
    };

    const removeFile = (index) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        setSavingCat(true);
        try {
            const res = await createExpenseCategory({ name: newCatName.trim(), type: formData.expense_type, requires_approval: true });
            const newCat = res.data;
            setCategories(prev => [...prev, newCat]);
            setFormData(prev => ({ ...prev, category_id: newCat.id.toString() }));
            setNewCatName('');
            setShowNewCat(false);
            showToast('Category created', 'success');
        } catch {
            showToast('Failed to create category', 'error');
        } finally {
            setSavingCat(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        setSavingGroup(true);
        try {
            const res = await createExpenseGroup({ name: newGroupName.trim() });
            const newGroup = res.data;
            setGroups(prev => [...prev, newGroup]);
            setFormData(prev => ({ ...prev, expense_group_id: newGroup.id.toString() }));
            setNewGroupName('');
            setShowNewGroup(false);
            showToast('Expense group created', 'success');
        } catch {
            showToast('Failed to create group', 'error');
        } finally {
            setSavingGroup(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount || !formData.expense_date) {
            showToast('Title, amount and date are required', 'error');
            return;
        }
        setLoading(true);
        try {
            let expense;
            if (initialData?.id) {
                const res = await updateExpense(initialData.id, formData);
                expense = res.data;
                showToast('Expense updated', 'success');
            } else {
                const res = await createExpense(formData);
                expense = res.data;
                showToast('Expense submitted for approval', 'success');
            }

            // Upload pending files
            if (pendingFiles.length > 0 && expense?.id) {
                for (const file of pendingFiles) {
                    try {
                        await uploadExpenseReceipt(expense.id, file);
                    } catch {
                        showToast(`Failed to upload ${file.name}`, 'error');
                    }
                }
            }

            onSuccess?.();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save expense', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Toggle */}
            <div className="flex items-center gap-2 p-1 bg-background-content/30 rounded-xl border border-border w-fit">
                {['business', 'personal'].map(type => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, expense_type: type, category_id: '', employee_user_id: '' }))}
                        className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            formData.expense_type === type
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-text-muted hover:text-text-main'
                        }`}
                    >
                        {type === 'business' ? 'Business' : 'Personal'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <ModernInput
                        ref={firstInputRef}
                        label="Expense Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Office stationery purchase"
                        icon={FileText}
                        autoFocus
                    />
                </div>

                <ModernInput
                    label="Amount (₹)"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    icon={IndianRupee}
                />
                <ModernInput
                    label="Expense Date"
                    name="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={handleChange}
                    icon={Calendar}
                />
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <Tag size={12} /> Category
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowNewCat(v => !v)}
                            className="text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-70 flex items-center gap-1"
                        >
                            <Plus size={10} /> New
                        </button>
                    </div>
                    {showNewCat && (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                placeholder={`New ${formData.expense_type} category name`}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm text-text-main placeholder:text-text-muted outline-none focus:border-primary/60 transition-all"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleCreateCategory}
                                disabled={savingCat || !newCatName.trim()}
                                className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                            >
                                {savingCat ? <Loader2 size={12} className="animate-spin" /> : null}
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowNewCat(false); setNewCatName(''); }}
                                className="p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-background-content/30"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <ModernSelect
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        options={filteredCategories}
                        placeholder="Select category..."
                    />
                </div>
                <ModernSelect
                    label="Payment Method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    options={PAYMENT_METHODS}
                    icon={CreditCard}
                />

                {/* Employee selector — only for personal expenses */}
                {formData.expense_type === 'personal' && (
                    <div className="md:col-span-2">
                        <ModernSelect
                            label="Employee"
                            name="employee_user_id"
                            value={formData.employee_user_id}
                            onChange={handleChange}
                            options={employees}
                            placeholder="Select employee..."
                            icon={Users}
                        />
                    </div>
                )}

                <ModernInput
                    label="Vendor / Paid To"
                    name="vendor_name"
                    value={formData.vendor_name}
                    onChange={handleChange}
                    placeholder="Vendor or recipient name"
                    icon={Building2}
                />
                <ModernInput
                    label="Bill / Reference No."
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleChange}
                    placeholder="Invoice or receipt number"
                    icon={Hash}
                />
            </div>

            {/* Expense Group / Head */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                        <FolderOpen size={12} />
                        Expense Group / Head
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowNewGroup(v => !v)}
                        className="text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-70 flex items-center gap-1"
                    >
                        <Plus size={10} /> New Group
                    </button>
                </div>

                {showNewGroup && (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Group name (e.g. Office Renovation)"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateGroup())}
                            className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm text-text-main placeholder:text-text-muted outline-none focus:border-primary/60 transition-all"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleCreateGroup}
                            disabled={savingGroup || !newGroupName.trim()}
                            className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                        >
                            {savingGroup ? <Loader2 size={12} className="animate-spin" /> : null}
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowNewGroup(false); setNewGroupName(''); }}
                            className="p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-background-content/30"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <ModernSelect
                    name="expense_group_id"
                    value={formData.expense_group_id}
                    onChange={handleChange}
                    options={groups.map(g => ({ id: g.id, name: g.name + (g.description ? ` — ${g.description}` : '') }))}
                    placeholder="No group (standalone expense)"
                    icon={FolderOpen}
                />
            </div>

            <ModernTextArea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Additional details about this expense..."
                rows={2}
            />

            {/* Attachments */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                        <Paperclip size={12} />
                        Attachments
                        <span className="text-text-muted font-normal normal-case tracking-normal">
                            (bills, receipts — JPG, PNG, PDF · max 5MB each)
                        </span>
                    </label>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-70 flex items-center gap-1"
                    >
                        <Plus size={10} /> Attach File
                    </button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                {pendingFiles.length > 0 && (
                    <div className="space-y-1.5">
                        {pendingFiles.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-background border border-border rounded-xl text-sm">
                                <Paperclip size={14} className="text-text-muted shrink-0" />
                                <span className="flex-1 text-text-main truncate">{file.name}</span>
                                <span className="text-[10px] text-text-muted font-medium shrink-0">{formatFileSize(file.size)}</span>
                                <button type="button" onClick={() => removeFile(i)} className="text-text-muted hover:text-error transition-colors shrink-0">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {pendingFiles.length === 0 && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border rounded-xl text-sm text-text-muted hover:border-primary/50 hover:text-primary transition-all"
                    >
                        <Paperclip size={16} />
                        Click to attach bill or receipt
                    </button>
                )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input
                    type="checkbox"
                    name="is_reimbursable"
                    checked={formData.is_reimbursable}
                    onChange={handleChange}
                    className="accent-primary w-4 h-4"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-main transition-colors">
                    This expense is reimbursable
                </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
                <ModernButton variant="secondary" onClick={onCancel} type="button" className="flex-1">
                    CANCEL
                </ModernButton>
                <ModernButton variant="primary" type="submit" loading={loading} className="flex-1">
                    {initialData?.id ? 'UPDATE EXPENSE' : 'SUBMIT EXPENSE'}
                </ModernButton>
            </div>
        </form>
    );
};

export default ExpenseForm;
