import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Plus, TrendingDown, Clock, CheckCircle, Building2, User, ChevronLeft, ChevronRight, BarChart3, AlertTriangle, PieChart, Pencil, Trash2 } from 'lucide-react';
import { ModernButton, ModernSelect } from '../../components/UI/CustomInputs';
import { useToast } from '../../components/UI/Toast';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/UI/Modal';
import DataTable from '../../components/UI/DataTable';
import ExpenseForm from './components/ExpenseForm';
import ExpenseDetailsModal from './components/ExpenseDetailsModal';
import { getExpenses, getExpenseDashboard, deleteExpense, approveExpense } from './services/expenseService';

const STATUS_STYLES = {
    draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    pending_approval: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const TYPE_BADGE = {
    business: 'bg-indigo-500/10 text-indigo-500',
    personal: 'bg-orange-500/10 text-orange-500',
};

const Expenses = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const isManagerOrOwner = user?.roles?.includes('owner') || user?.roles?.includes('manager') || user?.role === 'owner' || user?.role === 'manager';

    // Period controls
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [consolidated, setConsolidated] = useState(false);

    // Dashboard
    const [dashboard, setDashboard] = useState(null);
    const [dashLoading, setDashLoading] = useState(true);

    // Table
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [sortConfig, setSortConfig] = useState({ key: 'expense_date', direction: 'desc' });
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [editExpense, setEditExpense] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const navigateMonth = (direction) => {
        setSelectedMonth(prev => {
            let m = prev + direction;
            if (m > 12) { setSelectedYear(y => y + 1); return 1; }
            if (m < 1) { setSelectedYear(y => y - 1); return 12; }
            return m;
        });
    };

    const fetchDashboard = useCallback(async () => {
        setDashLoading(true);
        try {
            const res = await getExpenseDashboard({
                month: consolidated ? null : selectedMonth,
                year: consolidated ? null : selectedYear,
                consolidated,
            });
            setDashboard(res.data || res);
        } catch { setDashboard(null); }
        finally { setDashLoading(false); }
    }, [selectedMonth, selectedYear, consolidated]);

    const fetchExpenses = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await getExpenses({
                page: currentPage,
                search: searchQuery,
                per_page: perPage,
                sort_by: sortConfig?.key,
                sort_dir: sortConfig?.direction,
                status: statusFilter || undefined,
                expense_type: typeFilter || undefined,
                month: consolidated ? null : selectedMonth,
                year: consolidated ? null : selectedYear,
            });
            setExpenses(res.data || []);
            setMeta(res.meta || {});
        } catch { showToast('Failed to load expenses', 'error'); }
        finally { setLoading(false); }
    }, [currentPage, searchQuery, perPage, sortConfig, statusFilter, typeFilter, selectedMonth, selectedYear, consolidated]);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    const handleQuickApprove = async (expense, e) => {
        e.stopPropagation();
        try {
            await approveExpense(expense.id, '');
            showToast('Expense approved', 'success');
            fetchExpenses(true);
            fetchDashboard();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to approve', 'error');
        }
    };

    const handleDelete = async (expense) => {
        if (!window.confirm(`Delete "${expense.title}"?`)) return;
        try {
            await deleteExpense(expense.id);
            showToast('Expense deleted', 'success');
            fetchExpenses(true);
            fetchDashboard();
        } catch (err) {
            showToast(err.response?.data?.message || 'Cannot delete', 'error');
        }
    };

    const columns = [
        { header: 'Expense', key: 'title', className: 'w-[20%]' },
        { header: 'Type', className: 'w-[8%]' },
        { header: 'Category', className: 'w-[13%]' },
        { header: 'Date', key: 'expense_date', className: 'w-[9%]' },
        { header: 'Vendor', className: 'w-[12%]' },
        { header: 'Payment', className: 'w-[9%]' },
        { header: 'Amount', key: 'amount', className: 'w-[10%]' },
        { header: 'Status', key: 'status', className: 'w-[10%]' },
        { header: '', className: 'w-[9%]' },
    ];

    const renderRow = (expense) => (
        <tr
            key={expense.id}
            onClick={() => { setSelectedExpense(expense); setIsDetailsOpen(true); }}
            className="hover:bg-background-content/30 transition-colors cursor-pointer text-sm"
        >
            <td className="px-4 py-3 overflow-hidden">
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-text-main truncate text-xs">{expense.title}</span>
                    <span className="text-[10px] text-text-muted">{expense.expense_number}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${TYPE_BADGE[expense.expense_type]}`}>
                    {expense.expense_type}
                </span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                    {expense.category?.color && (
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: expense.category.color }} />
                    )}
                    <span className="text-xs text-text-secondary truncate">{expense.category?.name || '—'}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-xs text-text-secondary">{expense.expense_date}</span>
            </td>
            <td className="px-4 py-3">
                <span className="text-xs text-text-secondary truncate">{expense.vendor_name || '—'}</span>
            </td>
            <td className="px-4 py-3">
                <span className="text-[10px] font-bold text-text-muted uppercase">{expense.payment_method?.replace('_', ' ') || '—'}</span>
            </td>
            <td className="px-4 py-3">
                <span className="text-sm font-black text-text-main">₹{parseFloat(expense.amount).toLocaleString('en-IN')}</span>
            </td>
            <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${STATUS_STYLES[expense.status]}`}>
                    {expense.status?.replace('_', ' ')}
                </span>
            </td>
            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                    {/* Edit */}
                    {['draft', 'pending_approval'].includes(expense.status) && (
                        <button
                            onClick={e => { e.stopPropagation(); setEditExpense(expense); setIsEditOpen(true); }}
                            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Pencil size={13} />
                        </button>
                    )}
                    {/* Quick approve for managers */}
                    {isManagerOrOwner && expense.status === 'pending_approval' && (
                        <button
                            onClick={e => handleQuickApprove(expense, e)}
                            className="p-1.5 text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Approve"
                        >
                            <CheckCircle size={13} />
                        </button>
                    )}
                    {/* Delete */}
                    {['draft', 'pending_approval'].includes(expense.status) && (
                        <button
                            onClick={e => { e.stopPropagation(); handleDelete(expense); }}
                            className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );

    const kpiCards = [
        {
            label: 'Total Approved',
            value: dashboard?.total_approved,
            icon: CheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            prefix: '₹',
        },
        {
            label: 'Business',
            value: dashboard?.business_total,
            icon: Building2,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            prefix: '₹',
        },
        {
            label: 'Personal',
            value: dashboard?.personal_total,
            icon: User,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            prefix: '₹',
        },
        {
            label: 'Pending Approval',
            value: dashboard?.pending_count,
            sub: dashboard?.pending_amount ? `₹${parseFloat(dashboard.pending_amount).toLocaleString('en-IN')}` : null,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            prefix: '',
            isCount: true,
        },
    ];

    const filterUI = (
        <>
            <ModernSelect
                size="sm"
                placeholder="All Status"
                value={statusFilter}
                options={[
                    { id: 'pending_approval', name: 'Pending Approval' },
                    { id: 'approved', name: 'Approved' },
                    { id: 'rejected', name: 'Rejected' },
                    { id: 'draft', name: 'Draft' },
                ]}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-[130px]"
            />
            <ModernSelect
                size="sm"
                placeholder="All Types"
                value={typeFilter}
                options={[
                    { id: 'business', name: 'Business' },
                    { id: 'personal', name: 'Personal' },
                ]}
                onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="w-[110px]"
            />
        </>
    );

    return (
        <div className="space-y-5">
            {/* Period Control Bar */}
            <div className="flex items-center justify-between bg-surface border border-border rounded-2xl px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Receipt size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-text-main tracking-tight">Expenses</h1>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">
                            {consolidated ? 'All Time' : new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!consolidated && (
                        <div className="flex items-center gap-1">
                            <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded-lg hover:bg-background-content/50 text-text-muted hover:text-text-main transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-bold text-text-main min-w-[130px] text-center">
                                {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => navigateMonth(1)} className="p-1.5 rounded-lg hover:bg-background-content/50 text-text-muted hover:text-text-main transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setConsolidated(c => !c)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            consolidated ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-text-secondary border-border hover:border-primary/50 hover:text-primary'
                        }`}
                    >
                        <BarChart3 size={14} />
                        Consolidated
                    </button>
                    <ModernButton onClick={() => setIsCreateOpen(true)} icon={Plus} variant="primary" size="sm">
                        NEW EXPENSE
                    </ModernButton>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                    <div key={i} className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${card.bg} shrink-0`}>
                            <card.icon size={20} className={card.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{card.label}</p>
                            {dashLoading ? (
                                <div className="h-5 bg-background-content rounded w-20 animate-pulse mt-1" />
                            ) : (
                                <>
                                    <p className="text-lg font-black text-text-main">
                                        {card.prefix}{card.isCount ? (card.value || 0) : (card.value || 0).toLocaleString('en-IN')}
                                    </p>
                                    {card.sub && <p className="text-[10px] text-text-muted">{card.sub}</p>}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            {dashboard && !dashLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* By Category */}
                    <div className="bg-surface border border-border rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                            <PieChart size={16} className="text-primary" /> By Category
                        </h3>
                        {dashboard.by_category?.length > 0 ? (
                            <div className="space-y-2">
                                {dashboard.by_category.slice(0, 6).map((cat, i) => {
                                    const maxVal = Math.max(...dashboard.by_category.map(c => c.total));
                                    const pct = maxVal > 0 ? (cat.total / maxVal) * 100 : 0;
                                    return (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                            <span className="text-xs text-text-secondary min-w-[120px] truncate">{cat.category}</span>
                                            <div className="flex-1 h-2 bg-background-content rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-text-main min-w-[70px] text-right">
                                                ₹{cat.total.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-text-muted text-center py-8 italic">No data for this period</p>
                        )}
                    </div>

                    {/* Monthly Trend */}
                    <div className="bg-surface border border-border rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingDown size={16} className="text-primary" /> Monthly Trend (6 Months)
                        </h3>
                        {dashboard.trend?.length > 0 ? (
                            <div className="flex items-end gap-2 h-[100px]">
                                {dashboard.trend.map((t, i) => {
                                    const max = Math.max(...dashboard.trend.map(x => x.total));
                                    const h = max > 0 ? Math.max(8, (t.total / max) * 100) : 8;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                            <span className="text-[9px] font-bold text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                                ₹{t.total.toLocaleString('en-IN')}
                                            </span>
                                            <div
                                                className="w-full rounded-t-lg bg-primary/30 hover:bg-primary/60 transition-colors cursor-default"
                                                style={{ height: `${h}px` }}
                                                title={`${t.label}: ₹${t.total.toLocaleString('en-IN')}`}
                                            />
                                            <span className="text-[8px] text-text-muted truncate w-full text-center">{t.label.split(' ')[0]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-text-muted text-center py-8 italic">No trend data</p>
                        )}
                    </div>
                </div>
            )}

            {/* Pending Approval Alert */}
            {isManagerOrOwner && dashboard?.pending_count > 0 && (
                <div
                    className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/30 rounded-2xl cursor-pointer hover:bg-amber-500/10 transition-colors"
                    onClick={() => { setStatusFilter('pending_approval'); setCurrentPage(1); }}
                >
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <AlertTriangle size={18} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-500">
                            {dashboard.pending_count} expense{dashboard.pending_count > 1 ? 's' : ''} pending your approval
                        </p>
                        <p className="text-xs text-text-muted">
                            Total: ₹{parseFloat(dashboard.pending_amount || 0).toLocaleString('en-IN')} — Click to filter
                        </p>
                    </div>
                </div>
            )}

            {/* Expenses Table */}
            <DataTable
                title="All Expenses"
                icon={Receipt}
                columns={columns}
                data={expenses}
                loading={loading}
                searchQuery={searchQuery}
                onSearch={v => { setSearchQuery(v); setCurrentPage(1); }}
                searchPlaceholder="Search expenses..."
                filters={filterUI}
                meta={meta}
                onPageChange={setCurrentPage}
                onLimitChange={l => { setPerPage(l); setCurrentPage(1); }}
                perPage={perPage}
                renderRow={renderRow}
                emptyMessage="No expenses found"
                sortConfig={sortConfig}
                onSort={(k, d) => { setSortConfig({ key: k, direction: d }); setCurrentPage(1); }}
                headerAction={() => (
                    <ModernButton onClick={() => setIsCreateOpen(true)} icon={Plus} variant="primary" size="sm">
                        NEW EXPENSE
                    </ModernButton>
                )}
            />

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Expense" size="xl">
                <ExpenseForm
                    onSuccess={() => { setIsCreateOpen(false); fetchExpenses(true); fetchDashboard(); }}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditExpense(null); }} title="Edit Expense" size="xl">
                <ExpenseForm
                    initialData={editExpense}
                    onSuccess={() => { setIsEditOpen(false); setEditExpense(null); fetchExpenses(true); fetchDashboard(); }}
                    onCancel={() => { setIsEditOpen(false); setEditExpense(null); }}
                />
            </Modal>

            {/* Details Modal */}
            <ExpenseDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => { setIsDetailsOpen(false); setSelectedExpense(null); }}
                expense={selectedExpense}
                onRefresh={() => { fetchExpenses(true); fetchDashboard(); }}
                onEdit={(exp) => { setIsDetailsOpen(false); setSelectedExpense(null); setEditExpense(exp); setIsEditOpen(true); }}
            />
        </div>
    );
};

export default Expenses;
