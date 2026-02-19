import React, { useState, useEffect } from 'react';
import {
    Activity,
    Briefcase,
    BarChart3,
    Users,
    TrendingUp,
    TrendingDown,
    Zap,
    Globe,
    Shield
} from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/UI/PageHeader';
import StatCard from '../../../components/UI/StatCard';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/super-admin/tenants/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch platform stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Platform Control Center"
                subtitle="Global overview of the VastraaOS ecosystem."
                icon={Shield}
            />

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Workshops"
                    value={stats?.tenants.active || 0}
                    icon={Briefcase}
                    trend={{ value: '+12%', isPositive: true }}
                    color="primary"
                />
                <StatCard
                    title="Trial Conversion"
                    value="24.8%"
                    icon={TrendingUp}
                    trend={{ value: 'Above Goal', isPositive: true }}
                    color="green"
                />
                <StatCard
                    title="System Load"
                    value="14%"
                    icon={Activity}
                    trend={{ value: 'Healthy', isPositive: true }}
                    color="blue"
                />
                <StatCard
                    title="Global Users"
                    value={stats?.usage.total_users || 0}
                    icon={Users}
                    trend={{ value: '+5.2k', isPositive: true }}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Insights */}
                <div className="lg:col-span-2 bg-surface rounded-[2.5rem] border border-border p-10 space-y-8 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-primary" />
                            Global Activity
                        </h3>
                        <div className="flex bg-background p-1 rounded-xl border border-border">
                            <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary text-white rounded-lg">7 Days</button>
                            <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main">30 Days</button>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 pt-10 px-4">
                        {[40, 60, 45, 90, 65, 80, 55, 70, 85, 40, 95, 75].map((val, i) => (
                            <div key={i} className="flex-1 space-y-2 group cursor-pointer">
                                <div className="relative h-full">
                                    <div
                                        className="absolute bottom-0 w-full bg-primary/20 rounded-md group-hover:bg-primary/40 transition-all duration-500"
                                        style={{ height: `${val}%` }}
                                    />
                                    <div
                                        className="absolute bottom-0 w-full bg-primary rounded-md group-hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] transition-all duration-500"
                                        style={{ height: `${val * 0.4}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Announcements/Status */}
                <div className="bg-surface rounded-[2.5rem] border border-border p-10 space-y-8 shadow-sm">
                    <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                        <Zap size={16} className="text-primary" />
                        Infrastructure
                    </h3>

                    <div className="space-y-4">
                        {[
                            { label: 'API Gateway', status: 'Operational', color: 'green' },
                            { label: 'Database Cluster', status: 'Operational', color: 'green' },
                            { label: 'Asset Storage', status: 'Operational', color: 'green' },
                            { label: 'Search Engine', status: 'Healthy', color: 'blue' },
                        ].map((node) => (
                            <div key={node.label} className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border">
                                <span className="text-xs font-bold text-text-main">{node.label}</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full bg-${node.color}-500 animate-pulse`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-${node.color}-500`}>{node.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-[10px] font-medium text-text-muted italic px-2">
                        * All systems monitored across global regions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
