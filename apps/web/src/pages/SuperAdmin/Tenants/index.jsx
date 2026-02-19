import React, { useState, useEffect } from 'react';
import {
    Users,
    Briefcase,
    BarChart3,
    Search,
    Settings,
    CheckCircle2,
    AlertCircle,
    Activity,
    ExternalLink,
    Filter
} from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/UI/PageHeader';
import DataTable from '../../../components/UI/DataTable';
import StatCard from '../../../components/UI/StatCard';
import Modal from '../../../components/UI/Modal';
import { useToast } from '../../../components/UI/Toast';

const TenantManagement = () => {
    const [tenants, setTenants] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchTenants();
        fetchGlobalStats();
    }, [search, statusFilter]);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const params = {
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            };
            const response = await api.get('/super-admin/tenants', { params });
            setTenants(response.data.data);
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
            addToast('Error', 'Failed to load tenants', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalStats = async () => {
        try {
            const response = await api.get('/super-admin/tenants/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch global stats:', error);
        }
    };

    const handleStatusUpdate = async (tenantId, newStatus) => {
        try {
            setIsUpdating(true);
            await api.put(`/super-admin/tenants/${tenantId}/status`, { status: newStatus });
            addToast('Success', `Tenant status updated to ${newStatus}`, 'success');
            fetchTenants();
            if (selectedTenant && selectedTenant.id === tenantId) {
                const refreshed = await api.get(`/super-admin/tenants/${tenantId}`);
                setSelectedTenant(refreshed.data.tenant);
            }
        } catch (error) {
            addToast('Error', 'Failed to update status', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const columns = [
        { header: 'Business / Owner', key: 'business_name' },
        { header: 'Plan', key: null },
        { header: 'Status', key: 'status' },
        { header: 'Start Date', key: null },
        { header: 'Expiry Date', key: null },
        { header: 'Days Left', key: null },
        { header: 'Actions', key: null }
    ];

    const getRemainingDays = (expiryDate) => {
        if (!expiryDate) return 0;
        const diff = new Date(expiryDate) - new Date();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const renderRow = (tenant) => {
        const sub = tenant.subscription;
        const daysLeft = getRemainingDays(sub?.current_period_end);

        return (
            <tr key={tenant.id} className="hover:bg-surface-hover/30 transition-colors group">
                <td className="px-6 py-4">
                    <div>
                        <div className="font-bold text-text-main">{tenant.business_name}</div>
                        <div className="text-xs text-text-muted">{tenant.email}</div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary">
                            {sub?.plan?.name || 'No Plan'}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider">
                            {sub?.billing_cycle || '---'}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`
                        px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                        ${tenant.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            tenant.status === 'suspended' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-orange-500/10 text-orange-500 border-orange-500/20'}
                    `}>
                        {tenant.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-text-main">
                    {sub?.current_period_start ? new Date(sub.current_period_start).toLocaleDateString() : '---'}
                </td>
                <td className="px-6 py-4 text-xs font-medium text-text-main">
                    {sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '---'}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${daysLeft <= 7 ? 'text-red-500' : 'text-text-main'}`}>
                            {daysLeft}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase">Days</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <button
                        onClick={async () => {
                            const response = await api.get(`/super-admin/tenants/${tenant.id}`);
                            setSelectedTenant(response.data.tenant);
                            setSelectedTenant(prev => ({ ...prev, kpis: response.data.kpis }));
                            setIsDetailModalOpen(true);
                        }}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                    >
                        <Settings size={18} />
                    </button>
                </td>
            </tr>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Tenant Management"
                subtitle="Monitor and manage all active platform workshops."
                icon={Briefcase}
            />

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Tenants"
                    value={stats?.tenants.active || 0}
                    icon={CheckCircle2}
                    trend={{ value: 'Real-time', isPositive: true }}
                    color="green"
                />
                <StatCard
                    title="Trialing"
                    value={stats?.tenants.trial || 0}
                    icon={Activity}
                    trend={{ value: 'Conversion', isPositive: true }}
                    color="orange"
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.usage.total_orders || 0}
                    icon={BarChart3}
                    trend={{ value: 'Global', isPositive: true }}
                    color="blue"
                />
                <StatCard
                    title="Total Users"
                    value={stats?.usage.total_users || 0}
                    icon={Users}
                    trend={{ value: 'Network', isPositive: true }}
                    color="purple"
                />
            </div>

            {/* Tenant Table */}
            <DataTable
                title="SaaS Tenants"
                icon={Briefcase}
                columns={columns}
                data={tenants}
                loading={loading}
                onSearch={setSearch}
                renderRow={renderRow}
                filters={
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-text-muted" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider outline-none focus:border-primary"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="trial">Trial</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                }
            />

            {/* Tenant Details Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={selectedTenant?.business_name}
                size="xl"
            >
                {selectedTenant && (
                    <div className="space-y-8">
                        {/* Summary Header */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-background rounded-2xl border border-border">
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Status</div>
                                <div className="text-lg font-bold text-text-main capitalize">{selectedTenant.status}</div>
                            </div>
                            <div className="p-4 bg-background rounded-2xl border border-border">
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Plan</div>
                                <div className="text-lg font-bold text-text-main">{selectedTenant.subscription?.plan?.name || 'No Plan'}</div>
                            </div>
                            <div className="p-4 bg-background rounded-2xl border border-border">
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Expiry Date</div>
                                <div className="text-sm font-bold text-red-500">
                                    {selectedTenant.subscription?.current_period_end ? new Date(selectedTenant.subscription.current_period_end).toLocaleDateString() : '---'}
                                </div>
                            </div>
                            <div className="p-4 bg-background rounded-2xl border border-border">
                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Email</div>
                                <div className="text-sm font-medium text-text-main truncate">{selectedTenant.email}</div>
                            </div>
                        </div>

                        {/* Usage KPIs */}
                        <div>
                            <h4 className="text-xs font-black text-text-main uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Activity size={14} className="text-primary" />
                                Usage vs Limits
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'Users', current: selectedTenant.kpis?.users.current, max: selectedTenant.kpis?.users.limit },
                                    { label: 'Active Orders', current: selectedTenant.kpis?.orders.this_month, max: selectedTenant.kpis?.orders.limit },
                                    { label: 'Customers', current: selectedTenant.kpis?.customers.total, max: selectedTenant.kpis?.customers.limit },
                                    { label: 'Workers', current: selectedTenant.kpis?.workers.total, max: selectedTenant.kpis?.workers.limit },
                                ].map((kpi) => (
                                    <div key={kpi.label} className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-bold uppercase">
                                            <span>{kpi.label}</span>
                                            <span className="text-text-muted">
                                                {kpi.current} / {kpi.max === -1 ? '∞' : kpi.max}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-background rounded-full overflow-hidden border border-border">
                                            <div
                                                className={`h-full transition-all duration-1000 ${(kpi.current / kpi.max) > 0.9 ? 'bg-red-500' : 'bg-primary'
                                                    }`}
                                                style={{ width: `${kpi.max === -1 ? (kpi.current > 0 ? 30 : 5) : Math.min((kpi.current / kpi.max) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Administrative Controls */}
                        <div className="pt-6 border-t border-border flex flex-wrap gap-4">
                            <button
                                onClick={() => handleStatusUpdate(selectedTenant.id, selectedTenant.status === 'active' ? 'suspended' : 'active')}
                                disabled={isUpdating}
                                className={`
                                    px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all
                                    ${selectedTenant.status === 'active'
                                        ? 'border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white'
                                        : 'border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white'}
                                `}
                            >
                                {selectedTenant.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
                            </button>

                            <button
                                onClick={() => window.open(`http://${selectedTenant.subdomain}.vastraaos.com`, '_blank')}
                                className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                            >
                                <ExternalLink size={14} />
                                Preview Portal
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TenantManagement;
