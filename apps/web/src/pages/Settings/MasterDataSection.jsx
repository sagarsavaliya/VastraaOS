import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    ChevronRight,
    Loader2,
    AlertCircle,
    Check
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/UI/Toast';
import Modal from '../../components/UI/Modal';

const MasterDataSection = ({ type, title, description, columns, validationRules }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const { showToast } = useToast();

    const endpoint = `/masters/${type}`;

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get(endpoint);
            setData(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data');
            showToast('Failed to load ' + title, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [type]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                name_gujarati: '',
                name_hindi: '',
                display_order: data.length + 1,
                is_active: true,
                ...getDefaultsForType(type)
            });
        }
        setIsModalOpen(true);
    };

    const getDefaultsForType = (type) => {
        switch (type) {
            case 'item-types':
                return { hsn_code: '', gst_rate: 12 };
            case 'occasions':
                return { color: '#3b82f6' };
            case 'budget-ranges':
                return { min_amount: 0, max_amount: 5000, color: '#22c55e' };
            case 'inquiry-sources':
                return { icon: 'help-circle' };
            default:
                return {};
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingItem) {
                await api.put(`${endpoint}/${editingItem.id}`, formData);
                showToast(title + ' updated successfully', 'success');
            } else {
                await api.post(endpoint, formData);
                showToast(title + ' created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Save failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await api.delete(`${endpoint}/${id}`);
            showToast(title + ' deleted successfully', 'success');
            fetchData();
        } catch (err) {
            showToast('Delete failed', 'error');
        }
    };

    const filteredData = data.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name_gujarati?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name_hindi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && data.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-text-main">{title}</h2>
                    <p className="text-sm text-text-muted">{description}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-soft transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Add New
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                    type="text"
                    placeholder={`Search ${title.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-2xl outline-none focus:border-primary transition-all text-sm"
                />
            </div>

            <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background/50 border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Name</th>
                            {columns.map(col => (
                                <th key={col.key} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-text-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredData.length > 0 ? filteredData.map(item => (
                            <tr key={item.id} className="hover:bg-background/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-text-main">{item.name}</span>
                                        <div className="flex gap-2 text-[10px] text-text-muted font-medium">
                                            <span>{item.name_gujarati}</span>
                                            <span>•</span>
                                            <span>{item.name_hindi}</span>
                                        </div>
                                    </div>
                                </td>
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-4 text-sm text-text-main font-medium">
                                        {col.render ? col.render(item) : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-text-muted italic text-sm">
                                    No items found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? `Edit ${title}` : `Add New ${title}`}
            >
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Name (English)</label>
                            <input
                                required
                                name="name"
                                value={formData.name || ''}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Name (Gujarati)</label>
                            <input
                                name="name_gujarati"
                                value={formData.name_gujarati || ''}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Name (Hindi)</label>
                            <input
                                name="name_hindi"
                                value={formData.name_hindi || ''}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Display Order</label>
                            <input
                                type="number"
                                name="display_order"
                                value={formData.display_order || 0}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                checked={formData.is_active || false}
                                onChange={handleFormChange}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="is_active" className="text-sm font-bold text-text-main cursor-pointer">Active</label>
                        </div>
                    </div>

                    {/* Dynamic fields based on type */}
                    {type === 'item-types' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">HSN Code</label>
                                <input
                                    name="hsn_code"
                                    value={formData.hsn_code || ''}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Default GST Rate (%)</label>
                                <input
                                    type="number"
                                    name="gst_rate"
                                    value={formData.gst_rate || 0}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {type === 'occasions' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Label Color</label>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="color"
                                    name="color"
                                    value={formData.color || '#3b82f6'}
                                    onChange={handleFormChange}
                                    className="h-10 w-20 bg-background border border-border p-1 rounded-lg cursor-pointer"
                                />
                                <span className="text-sm font-mono text-text-muted">{formData.color}</span>
                            </div>
                        </div>
                    )}

                    {type === 'budget-ranges' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Min Amount</label>
                                    <input
                                        type="number"
                                        name="min_amount"
                                        value={formData.min_amount || 0}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Max Amount</label>
                                    <input
                                        type="number"
                                        name="max_amount"
                                        value={formData.max_amount || ''}
                                        onChange={handleFormChange}
                                        placeholder="No limit"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Label Color</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color || '#22c55e'}
                                        onChange={handleFormChange}
                                        className="h-10 w-20 bg-background border border-border p-1 rounded-lg cursor-pointer"
                                    />
                                    <span className="text-sm font-mono text-text-muted">{formData.color}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {type === 'inquiry-sources' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Lucide Icon Name</label>
                            <input
                                name="icon"
                                value={formData.icon || ''}
                                onChange={handleFormChange}
                                placeholder="e.g. instagram, facebook, phone"
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-soft transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="animate-spin" size={16} />}
                            {editingItem ? 'Save Changes' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MasterDataSection;
