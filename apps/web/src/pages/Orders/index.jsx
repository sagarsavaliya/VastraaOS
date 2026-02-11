import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Package, User, Calendar, DollarSign, TrendingUp, AlertCircle, Edit, Trash2, Plus } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import StatCard from '../../components/UI/StatCard';
import Modal from '../../components/UI/Modal';
import OrderForm from './components/OrderForm';
import OrderDetailsModal from './components/OrderDetailsModal';
import { getOrders, getOrderStats, deleteOrder } from './services/orderService';
import { ModernButton } from '../../components/UI/CustomInputs';
import { useToast } from '../../components/UI/Toast';

const Orders = () => {
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [meta, setMeta] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [modalFooter, setModalFooter] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Data Fetching Logic (Consolidated)
    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setTableLoading(true);
        if (orders.length === 0) setLoading(true);

        try {
            const [statsData, ordersData] = await Promise.all([
                getOrderStats(),
                getOrders({
                    page: currentPage,
                    search: searchQuery,
                    per_page: perPage,
                    sort_by: sortConfig?.key,
                    sort_dir: sortConfig?.direction
                })
            ]);

            setStats(statsData);
            setOrders(ordersData.data || []);
            setMeta(ordersData.meta || {});
        } catch (error) {
            console.error('Error fetching orders data:', error);
            showToast('Failed to refresh data', 'error');
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    }, [currentPage, searchQuery, perPage, sortConfig, showToast]); // Removed orders.length to prevent unnecessary effect reconstructions

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSuccess = useCallback(() => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setModalFooter(null);
        setSelectedOrder(null);
        fetchData(true); // Silent refresh
    }, [fetchData]);

    const handleCancel = useCallback(() => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setModalFooter(null);
        setSelectedOrder(null);
    }, []);

    // Handle Search with Debounce - only updates state, fetchData effect handles the rest
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleLimitChange = (newLimit) => {
        setPerPage(newLimit);
        setCurrentPage(1);
    };

    const handleEdit = (order) => {
        setSelectedOrder(order);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (order) => {
        if (!window.confirm(`Are you sure you want to delete order ${order.order_number}?`)) return;

        try {
            await deleteOrder(order.id);
            showToast('Order deleted successfully', 'success');
            fetchData();
        } catch (error) {
            console.error('Error deleting order:', error);
            const message = error.response?.data?.message || 'Failed to delete order';
            showToast(message, 'error');
        }
    };

    const columns = [
        { header: 'Order #', key: 'order_number' },
        { header: 'Customer', key: 'customer.name', sortable: false },
        { header: 'Items', key: 'items_count' },
        { header: 'Amount', key: 'total_amount' },
        { header: 'Status', key: 'status.name', sortable: false },
        { header: 'Delivery', key: 'promised_delivery_date' },
        { header: 'Actions', className: 'text-right', sortable: false }
    ];

    const getStatusStyle = (color) => {
        const baseColor = color || '#6366f1';
        return {
            backgroundColor: `${baseColor}15`,
            color: baseColor,
            borderColor: `${baseColor}30`
        };
    };

    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    };

    const renderRow = (order) => (
        <tr
            key={order.id}
            onClick={() => handleRowClick(order)}
            className="hover:bg-background-content/30 transition-colors group text-sm cursor-pointer"
        >
            <td className="px-6 py-4 whitespace-nowrap font-medium text-text-main group-hover:text-primary">
                {order.order_number}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-background-content flex items-center justify-center text-[10px] font-bold text-text-secondary border border-border">
                        {order.customer?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-text-main">{order.customer?.name || 'N/A'}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                {order.items_count || 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap font-semibold text-text-main">
                ₹{order.total_amount?.toLocaleString('en-IN')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    style={getStatusStyle(order.status?.color)}
                >
                    {order.status?.name || 'N/A'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-text-muted" />
                    {order.promised_delivery_date || 'N/A'}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5 text-text-muted">
                    <button
                        onClick={() => handleEdit(order)}
                        className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit Order"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(order)}
                        className="p-1.5 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Delete Order"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Orders"
                    value={stats?.active || 0}
                    subtitle="Currently in work"
                    icon={Package}
                    loading={loading}
                    trend={{ direction: 'up', value: '0', label: 'new today' }}
                />
                <StatCard
                    title="Overdue"
                    value={stats?.overdue || 0}
                    subtitle="Past delivery date"
                    icon={AlertCircle}
                    loading={loading}
                    className="border-error/20"
                />
                <StatCard
                    title="Ready for Delivery"
                    value={stats?.ready_for_delivery || 0}
                    subtitle="Awaiting pickup"
                    icon={TrendingUp}
                    loading={loading}
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${(stats?.revenue_this_month || 0).toLocaleString('en-IN')}`}
                    subtitle="Invoiced this month"
                    icon={DollarSign}
                    loading={loading}
                />
            </div>

            <DataTable
                title="All Orders"
                icon={ShoppingBag}
                columns={columns}
                data={orders}
                loading={tableLoading || loading}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                meta={meta}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                perPage={perPage}
                renderRow={renderRow}
                emptyMessage="No orders found matching your search"
                searchPlaceholder="Search by order # or customer name..."
                sortConfig={sortConfig}
                onSort={handleSort}
                headerAction={() => (
                    <ModernButton
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={Plus}
                        variant="primary"
                        size="sm"
                    >
                        NEW ORDER
                    </ModernButton>
                )}
            />

            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCancel}
                title="Create New Order"
                footer={modalFooter}
                size="xl"
            >
                <OrderForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    setFooter={setModalFooter}
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCancel}
                title={`Edit Order: ${selectedOrder?.order_number}`}
                footer={modalFooter}
                size="xl"
            >
                <OrderForm
                    isEdit={true}
                    initialData={selectedOrder}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    setFooter={setModalFooter}
                />
            </Modal>

            <OrderDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedOrder(null);
                }}
                orderId={selectedOrder?.id}
            />
        </div>
    );
};

export default Orders;
