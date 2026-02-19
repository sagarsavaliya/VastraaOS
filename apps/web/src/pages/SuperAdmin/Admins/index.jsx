import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Trash2,
    ShieldCheck,
    Mail,
    Phone,
    Calendar,
    Search
} from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/UI/PageHeader';
import DataTable from '../../../components/UI/DataTable';
import Modal from '../../../components/UI/Modal';
import { useToast } from '../../../components/UI/Toast';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: ''
    });
    const { addToast } = useToast();

    useEffect(() => {
        fetchAdmins();
    }, [search]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await api.get('/super-admin/admins');
            let data = response.data.data;
            if (search) {
                data = data.filter(admin =>
                    admin.name.toLowerCase().includes(search.toLowerCase()) ||
                    admin.email.toLowerCase().includes(search.toLowerCase())
                );
            }
            setAdmins(data);
        } catch (error) {
            addToast('Error', 'Failed to load admins', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post('/super-admin/admins', formData);
            addToast('Success', 'Super Admin invited successfully', 'success');
            setIsInviteModalOpen(false);
            setFormData({ name: '', email: '', mobile: '', password: '' });
            fetchAdmins();
        } catch (error) {
            addToast('Error', error.response?.data?.message || 'Failed to invite admin', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (adminId) => {
        if (!window.confirm('Are you sure you want to revoke this admin\'s access?')) return;
        try {
            await api.delete(`/super-admin/admins/${adminId}`);
            addToast('Success', 'Admin access revoked', 'success');
            fetchAdmins();
        } catch (error) {
            addToast('Error', error.response?.data?.message || 'Failed to revoke access', 'error');
        }
    };

    const columns = [
        { header: 'Administrator', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Mobile', key: 'mobile' },
        { header: 'Joined', key: 'created_at' },
        { header: 'Actions', key: null }
    ];

    const renderRow = (admin) => (
        <tr key={admin.id} className="hover:bg-surface-hover/30 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {admin.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-text-main flex items-center gap-2">
                            {admin.name}
                            <ShieldCheck size={14} className="text-primary" />
                        </div>
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Global Admin</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-text-main">{admin.email}</td>
            <td className="px-6 py-4 text-sm text-text-main">{admin.mobile || '---'}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Calendar size={14} />
                    {new Date(admin.created_at).toLocaleDateString()}
                </div>
            </td>
            <td className="px-6 py-4">
                <button
                    onClick={() => handleDelete(admin.id)}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Revoke Access"
                >
                    <Trash2 size={18} />
                </button>
            </td>
        </tr>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Admin Management"
                subtitle="Manage the global platform administration team."
                icon={Users}
            />

            <DataTable
                title="Super Administrators"
                icon={ShieldCheck}
                columns={columns}
                data={admins}
                loading={loading}
                onSearch={setSearch}
                renderRow={renderRow}
                headerAction={() => (
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all"
                    >
                        <UserPlus size={16} />
                        Invite Admin
                    </button>
                )}
            />

            {/* Invite Modal */}
            <Modal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                title="Invite Super Admin"
            >
                <form onSubmit={handleInvite} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">Full Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all"
                                placeholder="Enter admin name"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">Email Address</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all"
                                placeholder="admin@vastraaos.com"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">Mobile Number</label>
                            <input
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all"
                                placeholder="+91 00000 00000"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">Initial Password</label>
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Invite Super Admin'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default AdminManagement;
