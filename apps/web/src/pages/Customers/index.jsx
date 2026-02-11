import React, { useState, useEffect, useCallback } from 'react';
import { Users, User, Phone, MapPin, ShoppingBag, Ruler, Search, Trash2, Edit, Plus } from 'lucide-react';
import { useToast } from '../../components/UI/Toast';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import StatCard from '../../components/UI/StatCard';
import Modal from '../../components/UI/Modal';
import CustomerForm from './components/CustomerForm';
import { getCustomers, getCustomerStats } from './services/customerService';
import { ModernButton } from '../../components/UI/CustomInputs';

import CustomerMeasurementsModal from './components/CustomerMeasurementsModal';
import CustomerItemsModal from './components/CustomerItemsModal';
import CustomerDetailsModal from './components/CustomerDetailsModal';
import { deleteCustomer } from './services/customerService';

const Customers = () => {
    const { showToast } = useToast();
    const [customers, setCustomers] = useState([]);
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

    // Modal States
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isMeasurementsModalOpen, setIsMeasurementsModalOpen] = useState(false);
    const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchCustomers = useCallback(async (page, search, limit, sort) => {
        setTableLoading(true);
        try {
            const data = await getCustomers({
                page,
                search,
                per_page: limit,
                sort_by: sort?.key,
                sort_dir: sort?.direction
            });
            setCustomers(data.data || []);
            setMeta(data.meta || {});
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setTableLoading(false);
        }
    }, []);

    const fetchData = useCallback(async () => {
        // Stats are okay to show loading, but table should be silent if possible
        // or just use tableLoading
        try {
            const statsData = await getCustomerStats();
            setStats(statsData);
            await fetchCustomers(currentPage, searchQuery, perPage, sortConfig);
        } catch (error) {
            console.error('Error fetching customers data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, perPage, sortConfig, fetchCustomers]);

    useEffect(() => {
        fetchData();
    }, []);

    const closeSubModals = useCallback(() => {
        setIsMeasurementsModalOpen(false);
        setIsItemsModalOpen(false);
        setIsDetailsModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedCustomer(null);
    }, []);

    const handleSuccess = useCallback(() => {
        setIsCreateModalOpen(false);
        closeSubModals();
        setModalFooter(null);
        fetchData();
    }, [fetchData, closeSubModals]);

    const handleCancel = useCallback(() => {
        setIsCreateModalOpen(false);
        setModalFooter(null);
    }, []);

    const handleEdit = useCallback((customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
        setIsDetailsModalOpen(false); // Close details if open
    }, []);

    const handleDelete = useCallback(async (customer) => {
        if (window.confirm(`Are you sure you want to delete customer ${customer.name}?`)) {
            try {
                await deleteCustomer(customer.id);
                showToast('Customer deleted successfully', 'success');
                fetchData();
            } catch (error) {
                console.error('Error deleting customer:', error);
                showToast('Failed to delete customer', 'error');
            }
        }
    }, [fetchData, showToast]);

    // Handle Search with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                setCurrentPage(1);
                fetchCustomers(1, searchQuery, perPage, sortConfig);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSort = (key, direction) => {
        const newSort = { key, direction };
        setSortConfig(newSort);
        setCurrentPage(1);
        fetchCustomers(1, searchQuery, perPage, newSort);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchCustomers(newPage, searchQuery, perPage, sortConfig);
    };

    const handleLimitChange = (newLimit) => {
        setPerPage(newLimit);
        setCurrentPage(1);
        fetchCustomers(1, searchQuery, newLimit, sortConfig);
    };

    const columns = [
        { header: 'Customer', key: 'name' },
        { header: 'Contact', key: 'mobile' },
        { header: 'Category', key: 'customer_category' },
        { header: 'Orders', key: 'orders_count' },
        { header: 'Last Visit', key: 'last_order_date' },
        { header: 'Actions', className: 'text-right' }
    ];

    const getCategoryStyle = (category) => {
        switch (category?.toLowerCase()) {
            case 'vip': return 'bg-amber-100 text-amber-600 border-amber-200';
            case 'wholesale': return 'bg-blue-100 text-blue-600 border-blue-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const renderRow = (customer) => (
        <tr key={customer.id} className="hover:bg-background-content/30 transition-colors group">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center border border-border border-2 justify-center text-primary font-bold relative">
                        {customer.name.charAt(0).toUpperCase()}
                        {customer.customer_type === 'business' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-white rounded-xl flex items-center justify-center text-[8px] font-bold border border-background shadow-sm" title="Business User">
                                B
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <button
                            onClick={() => {
                                setSelectedCustomer(customer);
                                setIsDetailsModalOpen(true);
                            }}
                            className="text-sm font-semibold text-text-main hover:text-primary transition-colors text-left"
                        >
                            {customer.name}
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                            <MapPin size={12} />
                            {customer.city || 'N/A'}{customer.state ? `, ${customer.state}` : ''}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-text-muted" />
                        {customer.mobile}
                    </div>
                    {customer.email && (
                        <div className="text-xs text-text-muted mt-1 lowercase truncate max-w-[150px]">
                            {customer.email}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-md border ${getCategoryStyle(customer.customer_category)}`}>
                    {customer.customer_category || 'REGULAR'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <button
                    onClick={() => {
                        setSelectedCustomer(customer);
                        setIsItemsModalOpen(true);
                    }}
                    className="flex items-center gap-2 text-sm text-text-main font-medium hover:text-primary transition-colors bg-primary/5 px-2 py-1 rounded-lg border border-primary/10"
                >
                    <ShoppingBag size={14} className="text-primary/60" />
                    {customer.orders_count || 0}
                </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'No orders yet'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-2 text-text-muted">
                    <button
                        onClick={() => {
                            setSelectedCustomer(customer);
                            setIsMeasurementsModalOpen(true);
                        }}
                        className="p-2 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Measurements"
                    >
                        <Ruler size={16} />
                    </button>
                    <button
                        onClick={() => handleEdit(customer)}
                        className="p-2 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(customer)}
                        className="p-2 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Delete"
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
                    title="Total Customers"
                    value={stats?.total || 0}
                    subtitle="Registered clients"
                    icon={Users}
                    loading={loading}
                />
                <StatCard
                    title="New (This Month)"
                    value={stats?.new_this_month || 0}
                    subtitle="Acquisition focus"
                    icon={User}
                    loading={loading}
                    trend={{ direction: 'up', value: '0%', label: 'vs last month' }}
                />
                <StatCard
                    title="VIP Clients"
                    value={stats?.categories?.vip || 0}
                    subtitle="High value customers"
                    icon={Edit}
                    loading={loading}
                />
                <StatCard
                    title="Wholesale"
                    value={stats?.categories?.wholesale || 0}
                    subtitle="B2B customers"
                    icon={ShoppingBag}
                    loading={loading}
                />
            </div>

            <DataTable
                title="Customer Directory"
                icon={Users}
                columns={columns}
                data={customers}
                loading={tableLoading || loading}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                meta={meta}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                perPage={perPage}
                renderRow={renderRow}
                emptyMessage="No customers found matching your search"
                searchPlaceholder="Search by name, mobile, email or code..."
                sortConfig={sortConfig}
                onSort={handleSort}
                headerAction={() => (
                    <ModernButton
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={Plus}
                        variant="primary"
                        size="sm"
                    >
                        NEW CUSTOMER
                    </ModernButton>
                )}
            />

            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCancel}
                title="Create New Customer"
                footer={modalFooter}
                size="lg"
            >
                <CustomerForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    setFooter={setModalFooter}
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={closeSubModals}
                title="Edit Customer"
                footer={modalFooter}
                size="lg"
            >
                <CustomerForm
                    initialData={selectedCustomer}
                    isEdit={true}
                    onSuccess={handleSuccess}
                    onCancel={closeSubModals}
                    setFooter={setModalFooter}
                />
            </Modal>

            <Modal
                isOpen={isDetailsModalOpen}
                onClose={closeSubModals}
                title="Customer Portrait"
                size="lg"
            >
                <CustomerDetailsModal
                    customer={selectedCustomer}
                    onEdit={handleEdit}
                    onMeasurements={(c) => {
                        setSelectedCustomer(c);
                        setIsMeasurementsModalOpen(true);
                        setIsDetailsModalOpen(false);
                    }}
                    onHistory={(c) => {
                        setSelectedCustomer(c);
                        setIsItemsModalOpen(true);
                        setIsDetailsModalOpen(false);
                    }}
                    onDelete={handleDelete}
                    onClose={closeSubModals}
                />
            </Modal>

            <Modal
                isOpen={isMeasurementsModalOpen}
                onClose={closeSubModals}
                title="Customer Measurements"
                footer={modalFooter}
                size="4xl"
            >
                <CustomerMeasurementsModal
                    customer={selectedCustomer}
                    setFooter={setModalFooter}
                />
            </Modal>

            <Modal
                isOpen={isItemsModalOpen}
                onClose={closeSubModals}
                title="Order History"
                footer={modalFooter}
                size="4xl"
            >
                <CustomerItemsModal
                    customer={selectedCustomer}
                    setFooter={setModalFooter}
                />
            </Modal>
        </div>
    );
};

export default Customers;
