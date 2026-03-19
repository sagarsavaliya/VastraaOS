import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '../../components/UI/DataTable';
import { ModernButton } from '../../components/UI/CustomInputs';
import { useToast } from '../../components/UI/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { getPayments } from './services/paymentService';
import PaymentListTable from './components/PaymentListTable';
import PaymentFilters from './components/PaymentFilters';
import RecordPaymentModal from './components/RecordPaymentModal';
import VoidPaymentModal from './components/VoidPaymentModal';
import RefundPaymentModal from './components/RefundPaymentModal';

const pageVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const EMPTY_FILTERS = { mode: '', status: '', date_from: '', date_to: '' };

const Payments = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const isOwner = user?.roles?.includes('owner') || user?.role === 'owner';

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [meta, setMeta] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'payment_date', direction: 'desc' });
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const [isRecordOpen, setIsRecordOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isVoidOpen, setIsVoidOpen] = useState(false);
    const [isRefundOpen, setIsRefundOpen] = useState(false);

    const fetchPayments = useCallback(async (silent = false) => {
        if (!silent) setTableLoading(true);
        try {
            const res = await getPayments({
                page: currentPage,
                search: searchQuery,
                per_page: perPage,
                sort_by: sortConfig?.key,
                sort_dir: sortConfig?.direction,
                ...filters,
            });
            const paymentList = res.data?.data || res.data || [];
            setPayments(Array.isArray(paymentList) ? paymentList : []);
            setMeta(res.meta || {});
        } catch {
            showToast('Failed to load payments', 'error');
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    }, [currentPage, searchQuery, perPage, sortConfig, filters, showToast]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    useEffect(() => {
        const t = setTimeout(() => { if (!loading) setCurrentPage(1); }, 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const handleSort = (key, direction) => { setSortConfig({ key, direction }); setCurrentPage(1); };

    const handleVoidClick = (payment) => { setSelectedPayment(payment); setIsVoidOpen(true); };
    const handleRefundClick = (payment) => { setSelectedPayment(payment); setIsRefundOpen(true); };

    const handleActionSuccess = () => {
        setIsVoidOpen(false);
        setIsRefundOpen(false);
        setIsRecordOpen(false);
        setSelectedPayment(null);
        fetchPayments(true);
    };

    const columns = [
        { header: 'Payment #', key: 'payment_number' },
        { header: 'Order #', key: 'order.order_number', sortable: false },
        { header: 'Customer', key: 'customer.name', sortable: false },
        { header: 'Date', key: 'payment_date' },
        { header: 'Mode', sortable: false },
        { header: 'Amount', key: 'amount' },
        { header: 'Status', sortable: false },
        { header: 'Actions', className: 'text-right', sortable: false },
    ];

    const renderRow = (payment) => (
        <PaymentListTable
            key={payment.id}
            payment={payment}
            onVoid={handleVoidClick}
            onRefund={handleRefundClick}
            isOwner={isOwner}
        />
    );

    return (
        <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-4">
            {/* Row 1: Title + Action */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <CreditCard size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-text-main tracking-tight">Payments</h2>
                </div>
                <ModernButton onClick={() => setIsRecordOpen(true)} icon={Plus} variant="primary" size="sm">
                    RECORD PAYMENT
                </ModernButton>
            </div>

            <DataTable
                columns={columns}
                data={payments}
                loading={tableLoading || loading}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                searchPlaceholder="Search order # or customer..."
                filters={<PaymentFilters filters={filters} onChange={(f) => { setFilters(f); setCurrentPage(1); }} />}
                meta={meta}
                onPageChange={setCurrentPage}
                onLimitChange={(l) => { setPerPage(l); setCurrentPage(1); }}
                perPage={perPage}
                renderRow={renderRow}
                emptyMessage="No payments found"
                sortConfig={sortConfig}
                onSort={handleSort}
            />

            <RecordPaymentModal
                isOpen={isRecordOpen}
                onClose={() => setIsRecordOpen(false)}
                onSuccess={handleActionSuccess}
            />

            <VoidPaymentModal
                isOpen={isVoidOpen}
                onClose={() => { setIsVoidOpen(false); setSelectedPayment(null); }}
                payment={selectedPayment}
                onSuccess={handleActionSuccess}
            />

            <RefundPaymentModal
                isOpen={isRefundOpen}
                onClose={() => { setIsRefundOpen(false); setSelectedPayment(null); }}
                payment={selectedPayment}
                onSuccess={handleActionSuccess}
            />
        </motion.div>
    );
};

export default Payments;
