import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Calendar, User, Phone, Tag, Trash2, ArrowRight, Plus, Eye } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import StatCard from '../../components/UI/StatCard';
import Modal from '../../components/UI/Modal';
import InquiryForm from './components/InquiryForm';
import InquiryDetailsModal from './components/InquiryDetailsModal';
import ConvertInquiryModal from './components/ConvertInquiryModal';
import { getInquiries, getInquiryStats, updateInquiryStatus, deleteInquiry } from './services/inquiryService';
import { ModernButton, ModernSelect } from '../../components/UI/CustomInputs';
import { useToast } from '../../components/UI/Toast';

const Inquiries = () => {
    const { showToast } = useToast();
    const [inquiries, setInquiries] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [meta, setMeta] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [modalFooter, setModalFooter] = useState(null);

    const fetchInquiries = useCallback(async (page, search, limit, sort) => {
        setTableLoading(true);
        try {
            const data = await getInquiries({
                page,
                search,
                per_page: limit,
                sort_by: sort?.key,
                sort_dir: sort?.direction
            });
            setInquiries(data.data || []);
            setMeta(data.meta || {});
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
            setTableLoading(false);
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const statsData = await getInquiryStats();
            setStats(statsData);
            await fetchInquiries(currentPage, searchQuery, perPage, sortConfig);
        } catch (error) {
            console.error('Error fetching inquiries data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, perPage, sortConfig, fetchInquiries]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleSuccess = useCallback(() => {
        setIsCreateModalOpen(false);
        setIsViewModalOpen(false);
        setIsConvertModalOpen(false);
        setModalFooter(null);
        setSelectedInquiry(null);
        fetchData();
    }, [fetchData]);

    const handleCancel = useCallback(() => {
        setIsCreateModalOpen(false);
        setIsViewModalOpen(false);
        setIsConvertModalOpen(false);
        setModalFooter(null);
        setSelectedInquiry(null);
    }, []);

    // Handle Search with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                setCurrentPage(1);
                fetchInquiries(1, searchQuery, perPage, sortConfig);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSort = (key, direction) => {
        const newSort = { key, direction };
        setSortConfig(newSort);
        setCurrentPage(1);
        fetchInquiries(1, searchQuery, perPage, newSort);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchInquiries(newPage, searchQuery, perPage, sortConfig);
    };

    const handleLimitChange = (newLimit) => {
        setPerPage(newLimit);
        setCurrentPage(1);
        fetchInquiries(1, searchQuery, newLimit, sortConfig);
    };

    const handleStatusChange = async (inquiryId, newStatus) => {
        try {
            await updateInquiryStatus(inquiryId, newStatus);
            showToast(`Status updated to ${newStatus}`, 'success');
            setInquiries(prev => prev.map(inq =>
                inq.id === inquiryId ? { ...inq, status: newStatus } : inq
            ));
            // Also refresh stats since conversion rate etc might change
            const statsData = await getInquiryStats();
            setStats(statsData);
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            await deleteInquiry(id);
            showToast('Inquiry deleted successfully', 'success');
            fetchData();
        } catch (error) {
            showToast('Failed to delete inquiry', 'error');
        }
    };

    const handleView = (inquiry) => {
        setSelectedInquiry(inquiry);
        setIsViewModalOpen(true);
    };

    const handleConvertInit = (inquiry) => {
        setSelectedInquiry(inquiry);
        setIsConvertModalOpen(true);
    };

    const columns = [
        { header: 'Inquiry', key: 'inquiry_number' },
        { header: 'Customer', key: 'customer_name' },
        { header: 'Source', key: 'source.name' },
        { header: 'Occasion', key: 'occasion.name' },
        { header: 'Status', key: 'status', className: 'w-40' },
        { header: 'Actions', className: 'justify-end' }
    ];

    const statusOptions = [
        { id: 'new', name: 'New' },
        { id: 'contacted', name: 'Contacted' },
        { id: 'follow_up', name: 'Follow Up' },
        { id: 'interested', name: 'Interested' },
        { id: 'not_interested', name: 'Not Interested' },
        { id: 'converted', name: 'Converted' },
        { id: 'closed', name: 'Closed' }
    ];

    const renderRow = (inquiry) => (
        <tr key={inquiry.id} className="hover:bg-background-content/30 transition-colors group">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                    <button
                        onClick={() => handleView(inquiry)}
                        className="text-sm font-bold text-text-main hover:text-primary transition-colors text-left"
                    >
                        {inquiry.inquiry_number}
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                        <Calendar size={12} />
                        {new Date(inquiry.created_at).toLocaleDateString()}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-text-main font-medium">
                        <User size={14} className="text-text-muted" />
                        {inquiry.customer_name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                        <Phone size={12} />
                        {inquiry.customer_mobile}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-text-secondary">
                    {inquiry.source?.name || 'Direct'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                    <Tag size={14} className="text-primary/60" />
                    {inquiry.occasion?.name || 'N/A'}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-32">
                    <ModernSelect
                        size="sm"
                        options={statusOptions}
                        value={inquiry.status?.toLowerCase()}
                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                        className="!bg-transparent"
                    />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleView(inquiry)}
                        className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    {inquiry.status?.toLowerCase() !== 'converted' && (
                        <button
                            onClick={() => handleConvertInit(inquiry)}
                            className="p-2 text-text-muted hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                            title="Convert to Order"
                        >
                            <ArrowRight size={16} />
                        </button>
                    )}
                    <button
                        onClick={() => handleDelete(inquiry.id)}
                        className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Delete Inquiry"
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
                    title="Total Inquiries"
                    value={stats?.total || 0}
                    subtitle="Lifetime inquiries received"
                    icon={MessageSquare}
                    loading={loading}
                />
                <StatCard
                    title="Pending"
                    value={stats?.pending || 0}
                    subtitle="Awaiting response"
                    icon={Calendar}
                    loading={loading}
                />
                <StatCard
                    title="Converted"
                    value={stats?.converted || 0}
                    subtitle="Turned into orders"
                    icon={ArrowRight}
                    loading={loading}
                    trend={{ direction: 'up', value: `${stats?.conversion_rate || 0}%`, label: 'rate' }}
                />
                <StatCard
                    title="Lost"
                    value={stats?.lost || 0}
                    subtitle="Inquiries dropped"
                    icon={Trash2}
                    loading={loading}
                />
            </div>

            <DataTable
                title="All Inquiries"
                icon={MessageSquare}
                columns={columns}
                data={inquiries}
                loading={tableLoading || loading}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                meta={meta}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                perPage={perPage}
                renderRow={renderRow}
                emptyMessage="No inquiries found matching your search"
                searchPlaceholder="Search by guest name, mobile or inquiry #..."
                sortConfig={sortConfig}
                onSort={handleSort}
                headerAction={() => (
                    <ModernButton
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={Plus}
                        variant="primary"
                        size="sm"
                    >
                        NEW INQUIRY
                    </ModernButton>
                )}
            />

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCancel}
                title="Create New Inquiry"
                footer={modalFooter}
                size="xl"
            >
                <InquiryForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    setFooter={setModalFooter}
                />
            </Modal>

            {/* View Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={handleCancel}
                title="Inquiry Details"
                size="xl"
            >
                <InquiryDetailsModal
                    inquiry={selectedInquiry}
                    onConvert={handleConvertInit}
                    onClose={handleCancel}
                />
            </Modal>

            {/* Convert Modal */}
            <Modal
                isOpen={isConvertModalOpen}
                onClose={handleCancel}
                title="Convert to Order"
                footer={modalFooter}
                size="xl"
            >
                <ConvertInquiryModal
                    inquiry={selectedInquiry}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    setFooter={setModalFooter}
                />
            </Modal>
        </div>
    );
};

export default Inquiries;
