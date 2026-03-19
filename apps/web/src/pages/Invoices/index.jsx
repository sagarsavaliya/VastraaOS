import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '../../components/UI/DataTable';
import Modal from '../../components/UI/Modal';
import { ModernButton } from '../../components/UI/CustomInputs';
import { useToast } from '../../components/UI/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { getInvoices, updateInvoiceStatus } from './services/invoiceService';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceListTable from './components/InvoiceListTable';
import InvoiceForm from './components/InvoiceForm';
import InvoiceDetailsModal from './components/InvoiceDetailsModal';
import CancelInvoiceModal from './components/CancelInvoiceModal';

const pageVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const EMPTY_FILTERS = { status: '', invoice_type: '', date_from: '', date_to: '' };

const Invoices = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const isOwner = user?.roles?.includes('owner') || user?.role === 'owner';

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [meta, setMeta] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);

    const fetchInvoices = useCallback(async (silent = false) => {
        if (!silent) setTableLoading(true);
        try {
            const res = await getInvoices({
                page: currentPage,
                search: searchQuery,
                per_page: perPage,
                sort_by: sortConfig?.key,
                sort_dir: sortConfig?.direction,
                ...filters,
            });
            const invoiceList = res.data?.data || res.data || [];
            setInvoices(Array.isArray(invoiceList) ? invoiceList : []);
            setMeta(res.meta || {});
        } catch {
            showToast('Failed to load invoices', 'error');
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    }, [currentPage, searchQuery, perPage, sortConfig, filters, showToast]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSort = (key, direction) => {
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const handleView = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailsOpen(true);
    };

    const handleIssue = async (invoice) => {
        try {
            await updateInvoiceStatus(invoice.id, 'issued');
            showToast('Invoice issued successfully', 'success');
            fetchInvoices(true);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to issue invoice', 'error');
        }
    };

    const handleCancelClick = (invoice) => {
        setSelectedInvoice(invoice);
        setIsCancelOpen(true);
    };

    const handleCancelSuccess = () => {
        setIsCancelOpen(false);
        setSelectedInvoice(null);
        fetchInvoices(true);
    };

    const columns = [
        { header: 'Invoice #', key: 'invoice_number' },
        { header: 'Customer', key: 'customer.name', sortable: false },
        { header: 'Order #', key: 'order.order_number', sortable: false },
        { header: 'Type', sortable: false },
        { header: 'Date', key: 'invoice_date' },
        { header: 'Due Date', key: 'due_date' },
        { header: 'Amount', key: 'grand_total' },
        { header: 'Status', sortable: false },
        { header: 'Actions', className: 'text-right', sortable: false },
    ];

    const renderRow = (invoice) => (
        <InvoiceListTable
            key={invoice.id}
            invoice={invoice}
            onView={handleView}
            onIssue={handleIssue}
            onCancel={handleCancelClick}
            isOwner={isOwner}
        />
    );

    return (
        <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-4">
            {/* Row 1: Title + Action */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <FileText size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-text-main tracking-tight">Invoices</h2>
                </div>
                <ModernButton onClick={() => setIsCreateOpen(true)} icon={Plus} variant="primary" size="sm">
                    NEW INVOICE
                </ModernButton>
            </div>

            <DataTable
                columns={columns}
                data={invoices}
                loading={tableLoading || loading}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                searchPlaceholder="Search invoice # or customer..."
                filters={<InvoiceFilters filters={filters} onChange={(f) => { setFilters(f); setCurrentPage(1); }} />}
                meta={meta}
                onPageChange={setCurrentPage}
                onLimitChange={(l) => { setPerPage(l); setCurrentPage(1); }}
                perPage={perPage}
                renderRow={renderRow}
                emptyMessage="No invoices found"
                sortConfig={sortConfig}
                onSort={handleSort}
            />

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create Invoice"
                size="full"
            >
                <InvoiceForm
                    onSuccess={() => {
                        setIsCreateOpen(false);
                        fetchInvoices(true);
                    }}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </Modal>

            <InvoiceDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => { setIsDetailsOpen(false); setSelectedInvoice(null); }}
                invoiceId={selectedInvoice?.id}
                onCancelClick={(inv) => {
                    setSelectedInvoice(inv);
                    setIsDetailsOpen(false);
                    setIsCancelOpen(true);
                }}
                onRefresh={() => fetchInvoices(true)}
            />

            <CancelInvoiceModal
                isOpen={isCancelOpen}
                onClose={() => { setIsCancelOpen(false); setSelectedInvoice(null); }}
                invoice={selectedInvoice}
                onSuccess={handleCancelSuccess}
            />
        </motion.div>
    );
};

export default Invoices;
