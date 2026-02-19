import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingBag, Users, DollarSign, CheckSquare, RefreshCw, AlertCircle, TrendingUp, CreditCard, MessageSquare } from 'lucide-react';
import StatCard from '../../components/UI/StatCard';
import Modal from '../../components/UI/Modal';
import QuickActions from './components/QuickActions';
import RecentOrdersTable from './components/RecentOrdersTable';
import UpcomingDeliveriesWidget from './components/UpcomingDeliveriesWidget';
import CustomerForm from '../Customers/components/CustomerForm';
import InquiryForm from '../Inquiries/components/InquiryForm';
import OrderForm from '../Orders/components/OrderForm';
import { getDashboardStats, getRecentOrders, getUpcomingDeliveries } from './services/dashboardService';

const Dashboard = () => {
    const { user } = useAuth();

    // Redirect Super Admins to their specific dashboard
    if (user?.is_super_admin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const [stats, setStats] = useState(null);
    const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Recent Orders State
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentOrdersMeta, setRecentOrdersMeta] = useState({});
    const [recentOrdersLoading, setRecentOrdersLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [activeModal, setActiveModal] = useState(null); // 'customer', 'order', 'inquiry'
    const [modalFooter, setModalFooter] = useState(null);

    const fetchDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // Fetch primary stats and deliveries in parallel
            const [statsData, deliveriesData] = await Promise.all([
                getDashboardStats(),
                getUpcomingDeliveries(7, 10)
            ]);

            setStats(statsData);
            setUpcomingDeliveries(deliveriesData.data || []);

            // Initial fetch for recent orders
            await fetchRecentOrders(1, searchQuery, perPage, sortConfig);
        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchRecentOrders = async (page, search, limit = perPage, sort = sortConfig) => {
        setRecentOrdersLoading(true);
        try {
            const ordersData = await getRecentOrders({
                page,
                search,
                limit,
                sort_by: sort?.key,
                sort_dir: sort?.direction
            });
            setRecentOrders(ordersData.data || []);
            setRecentOrdersMeta(ordersData.meta || {});
        } catch (error) {
            console.error('Error fetching recent orders:', error);
        } finally {
            setRecentOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Handle Search with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                setCurrentPage(1);
                fetchRecentOrders(1, searchQuery, perPage, sortConfig);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSort = (key, direction) => {
        const newSort = { key, direction };
        setSortConfig(newSort);
        setCurrentPage(1);
        fetchRecentOrders(1, searchQuery, perPage, newSort);
    };

    // Handle Page Change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchRecentOrders(newPage, searchQuery, perPage, sortConfig);
    };

    // Handle Limit Change
    const handleLimitChange = (newLimit) => {
        setPerPage(newLimit);
        setCurrentPage(1);
        fetchRecentOrders(1, searchQuery, newLimit, sortConfig);
    };

    const handleRefresh = () => {
        fetchDashboardData(true);
    };

    const handleSuccess = useCallback(() => {
        fetchDashboardData(true);
        setActiveModal(null);
        setModalFooter(null);
    }, []);

    const handleCancel = useCallback(() => {
        setActiveModal(null);
        setModalFooter(null);
    }, []);

    const handleQuickAction = (action) => {
        if (['customer', 'order', 'inquiry'].includes(action)) {
            setActiveModal(action);
        } else {
            console.log(`Action ${action} not yet implemented`);
        }
    };

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <AlertCircle size={64} className="text-error mb-4" />
                <h2 className="text-2xl font-bold text-text-main mb-2">Failed to Load Dashboard</h2>
                <p className="text-text-secondary mb-6">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <RefreshCw size={20} />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">

            {/* Financial Overview - Primary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Revenue (This Month)"
                    value={`₹${(stats?.revenue?.this_month || 0).toLocaleString('en-IN')}`}
                    subtitle={`Invoiced: ₹${(stats?.revenue?.invoiced_this_month || 0).toLocaleString('en-IN')}`}
                    icon={DollarSign}
                    loading={loading}
                    trend={{ direction: 'up', value: '%', label: 'vs last month' }}
                />
                <StatCard
                    title="Pending Amount (Ughrani)"
                    value={`₹${(stats?.revenue?.total_pending_amount || 0).toLocaleString('en-IN')}`}
                    subtitle="Total outstanding collections"
                    icon={CreditCard}
                    loading={loading}
                />
                <StatCard
                    title="Active Orders"
                    value={stats?.orders?.active || 0}
                    subtitle="Currently in production"
                    icon={ShoppingBag}
                    loading={loading}
                />
                <StatCard
                    title="Total Customers"
                    value={stats?.customers?.total || 0}
                    subtitle={`${stats?.customers?.new_this_month || 0} new this month`}
                    icon={Users}
                    loading={loading}
                />
            </div>

            {/* Row 2: Quick Actions (Full Width) */}
            <QuickActions onAction={handleQuickAction} />

            {/* Modals */}
            <Modal
                isOpen={!!activeModal}
                onClose={handleCancel}
                footer={modalFooter}
                title={
                    activeModal === 'customer' ? 'Create New Customer' :
                        activeModal === 'order' ? 'Create New Order' :
                            'Create New Inquiry'
                }
                size={activeModal === 'customer' ? 'lg' : 'xl'}
            >
                {activeModal === 'customer' && (
                    <CustomerForm onSuccess={handleSuccess} onCancel={handleCancel} setFooter={setModalFooter} />
                )}
                {activeModal === 'inquiry' && (
                    <InquiryForm onSuccess={handleSuccess} onCancel={handleCancel} setFooter={setModalFooter} />
                )}
                {activeModal === 'order' && (
                    <OrderForm onSuccess={handleSuccess} onCancel={handleCancel} setFooter={setModalFooter} />
                )}
            </Modal>

            {/* Row 3: Operational & Growth Metrics + Alerts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Inquiry Conversion"
                    value={`${stats?.inquiries?.conversion_rate || 0}%`}
                    subtitle={`${stats?.inquiries?.converted || 0} of ${stats?.inquiries?.total || 0} converted`}
                    icon={MessageSquare}
                    loading={loading}
                />
                <StatCard
                    title="Upcoming Deliveries"
                    value={stats?.deliveries?.upcoming_7_days || 0}
                    subtitle="Due in next 7 days"
                    icon={ShoppingBag}
                    loading={loading}
                />
                <div className="bg-surface rounded-2xl border border-border p-6 flex items-start justify-between group hover:border-error/30 transition-all min-h-[140px]">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-text-secondary mb-1">Overdue Deliveries</p>
                        <p className="text-xl xl:text-2xl font-bold text-error">{stats?.deliveries?.overdue || 0}</p>
                        <p className="text-sm text-text-muted mt-2">Immediate action required</p>
                    </div>
                    <div className="p-3 bg-error/10 rounded-xl group-hover:scale-110 transition-transform">
                        <AlertCircle size={24} className="text-error" />
                    </div>
                </div>
                <div className="bg-surface rounded-2xl border border-border p-6 flex items-start justify-between group hover:border-warning/30 transition-all min-h-[140px]">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-text-secondary mb-1">Overdue Tasks</p>
                        <p className="text-xl xl:text-2xl font-bold text-warning">{stats?.tasks?.overdue || 0}</p>
                        <p className="text-sm text-text-muted mt-2">Production delays detected</p>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-xl group-hover:scale-110 transition-transform">
                        <CheckSquare size={24} className="text-warning" />
                    </div>
                </div>
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentOrdersTable
                        orders={recentOrders}
                        loading={recentOrdersLoading || loading}
                        meta={recentOrdersMeta}
                        searchQuery={searchQuery}
                        onSearch={setSearchQuery}
                        onPageChange={handlePageChange}
                        onLimitChange={handleLimitChange}
                        perPage={perPage}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />
                </div>
                <div className="lg:col-span-1">
                    <UpcomingDeliveriesWidget deliveries={upcomingDeliveries} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
