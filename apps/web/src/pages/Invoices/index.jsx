import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, DollarSign, FileCheck, Clock, XCircle, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '../../components/UI/DataTable';
import Modal from '../../components/UI/Modal';
import { ModernButton } from '../../components/UI/CustomInputs';
import { useToast } from '../../components/UI/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { getInvoices, updateInvoiceStatus, getInvoiceKPIs } from './services/invoiceService';
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

    const [kpiData, setKpiData] = useState(null);
    const [kpiLoading, setKpiLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [consolidated, setConsolidated] = useState(false);

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

    const fetchKPIs = useCallback(async () => {
        setKpiLoading(true);
        try {
            const res = await getInvoiceKPIs({
                month: consolidated ? null : selectedMonth,
                year: consolidated ? null : selectedYear,
                consolidated,
            });
            setKpiData(res.data || res);
        } catch { setKpiData(null); }
        finally { setKpiLoading(false); }
    }, [selectedMonth, selectedYear, consolidated]);

    useEffect(() => { fetchKPIs(); }, [fetchKPIs]);

    const navigateMonth = (direction) => {
        setSelectedMonth(prev => {
            let m = prev + direction;
            if (m > 12) { setSelectedYear(y => y + 1); return 1; }
            if (m < 1) { setSelectedYear(y => y - 1); return 12; }
            return m;
        });
    };

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
            {/* Header row — title left, controls right */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <FileText size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-text-main tracking-tight">Invoices</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {!consolidated && (
                        <>
                            <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors border border-border">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-bold text-text-main min-w-[140px] text-center">
                                {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors border border-border">
                                <ChevronRight size={16} />
                            </button>
                            <div className="h-6 w-px bg-border mx-1" />
                        </>
                    )}
                    <button
                        onClick={() => setConsolidated(c => !c)}
                        className={`flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            consolidated ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-text-secondary border-border hover:border-primary/50 hover:text-primary'
                        }`}
                    >
                        <BarChart3 size={14} />
                        Consolidated
                    </button>
                    <div className="h-6 w-px bg-border mx-1" />
                    <ModernButton onClick={() => setIsCreateOpen(true)} icon={Plus} variant="primary" size="sm">
                        NEW INVOICE
                    </ModernButton>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Invoiced', value: kpiData?.total_invoiced, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10', prefix: '₹' },
                    { label: 'Collected', value: kpiData?.total_collected, icon: FileCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', prefix: '₹' },
                    { label: 'Pending', value: kpiData?.total_pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', prefix: '₹' },
                    { label: 'Cancelled', value: kpiData?.total_cancelled, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', prefix: '₹' },
                ].map((card, i) => (
                    <div key={i} className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${card.bg} shrink-0`}>
                            <card.icon size={20} className={card.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{card.label}</p>
                            {kpiLoading ? (
                                <div className="h-5 bg-background-content rounded w-20 animate-pulse mt-1" />
                            ) : (
                                <p className="text-lg font-black text-text-main">
                                    {card.prefix}{(card.value || 0).toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
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
