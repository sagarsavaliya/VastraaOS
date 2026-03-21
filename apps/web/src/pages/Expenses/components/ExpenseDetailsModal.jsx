import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Building2, User, Tag, Calendar, Hash, CreditCard, AlertCircle, IndianRupee, Paperclip, Download, FolderOpen, Users, ExternalLink, X, FileText, Pencil } from 'lucide-react';
import Modal from '../../../components/UI/Modal';
import { ModernButton, ModernTextArea } from '../../../components/UI/CustomInputs';
import { approveExpense, rejectExpense, deleteExpenseReceipt } from '../services/expenseService';
import { useToast } from '../../../components/UI/Toast';
import { useAuth } from '../../../contexts/AuthContext';

const STATUS_STYLES = {
    draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    pending_approval: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const isImageMime = (mime) => mime && mime.startsWith('image/');

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ExpenseDetailsModal = ({ isOpen, onClose, expense, onRefresh, onEdit }) => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const isManagerOrOwner = user?.roles?.includes('owner') || user?.roles?.includes('manager') || user?.role === 'owner' || user?.role === 'manager';
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingReceiptIndex, setDeletingReceiptIndex] = useState(null);

    if (!expense) return null;

    const handleApprove = async () => {
        setLoading(true);
        try {
            await approveExpense(expense.id, approvalNotes);
            showToast('Expense approved', 'success');
            onRefresh?.();
            onClose();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to approve', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            showToast('Rejection reason is required', 'error');
            return;
        }
        setLoading(true);
        try {
            await rejectExpense(expense.id, rejectionReason);
            showToast('Expense rejected', 'success');
            onRefresh?.();
            onClose();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to reject', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReceipt = async (index) => {
        setDeletingReceiptIndex(index);
        try {
            await deleteExpenseReceipt(expense.id, index);
            showToast('Attachment removed', 'success');
            onRefresh?.();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete attachment', 'error');
        } finally {
            setDeletingReceiptIndex(null);
        }
    };

    const statusLabel = expense.status?.replace('_', ' ').toUpperCase();

    // Build the core detail items
    const detailItems = [
        { icon: Calendar, label: 'Date', value: expense.expense_date },
        { icon: Tag, label: 'Category', value: expense.category?.name || 'Uncategorized' },
        { icon: CreditCard, label: 'Payment', value: expense.payment_method?.replace('_', ' ')?.toUpperCase() },
        { icon: Building2, label: 'Vendor', value: expense.vendor_name || '—' },
        { icon: Hash, label: 'Reference', value: expense.reference_number || '—' },
        { icon: User, label: 'Submitted By', value: expense.submitted_by?.name || '—' },
    ];

    // Conditionally add Employee for personal expenses
    if (expense.expense_type === 'personal' && expense.employee) {
        detailItems.push({ icon: Users, label: 'Employee', value: expense.employee?.name || '—' });
    }

    // Conditionally add Expense Group
    if (expense.group?.name) {
        detailItems.push({ icon: FolderOpen, label: 'Expense Group', value: expense.group.name });
    }

    const receipts = expense.receipts || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Expense: ${expense.expense_number || expense.title}`} size="md">
            <div className="space-y-5">
                {/* Status + Type + Edit */}
                <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_STYLES[expense.status]}`}>
                        {statusLabel}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-muted uppercase">
                            {expense.expense_type === 'business' ? 'Business' : 'Personal'}
                        </span>
                        {['draft', 'pending_approval'].includes(expense.status) && onEdit && (
                            <button
                                onClick={() => onEdit(expense)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
                            >
                                <Pencil size={12} /> Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Amount */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-3xl font-black text-primary">₹{parseFloat(expense.amount).toLocaleString('en-IN')}</p>
                    {expense.is_reimbursable && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
                            REIMBURSABLE
                        </span>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {detailItems.map((item, i) => (
                        <div key={i} className="bg-background-content/30 rounded-xl p-3 border border-border">
                            <div className="flex items-center gap-1.5 mb-1">
                                <item.icon size={12} className="text-text-muted" />
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.label}</p>
                            </div>
                            <p className="text-xs font-bold text-text-main">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Description */}
                {expense.description && (
                    <div className="bg-background-content/30 rounded-xl p-4 border border-border">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Description</p>
                        <p className="text-sm text-text-secondary leading-relaxed">{expense.description}</p>
                    </div>
                )}

                {/* Attachments */}
                {receipts.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                            <Paperclip size={11} />
                            Attachments ({receipts.length})
                        </p>
                        <div className="space-y-2">
                            {receipts.map((receipt, i) => {
                                const isImage = isImageMime(receipt.mime);
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl group">
                                        {/* Thumbnail or PDF icon */}
                                        {isImage ? (
                                            <a href={receipt.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                                <img
                                                    src={receipt.url}
                                                    alt={receipt.name}
                                                    className="w-10 h-10 object-cover rounded-lg border border-border"
                                                />
                                            </a>
                                        ) : (
                                            <div className="w-10 h-10 flex items-center justify-center bg-rose-500/10 rounded-lg border border-rose-500/20 shrink-0">
                                                <FileText size={18} className="text-rose-500" />
                                            </div>
                                        )}

                                        {/* Name + size */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-text-main truncate">{receipt.name}</p>
                                            {receipt.size && (
                                                <p className="text-[10px] text-text-muted">{formatFileSize(receipt.size)}</p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <a
                                                href={receipt.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={!isImage ? receipt.name : undefined}
                                                className="p-1.5 text-text-muted hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                                                title={isImage ? 'Open in new tab' : 'Download'}
                                            >
                                                {isImage ? <ExternalLink size={14} /> : <Download size={14} />}
                                            </a>
                                            {isManagerOrOwner && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteReceipt(i)}
                                                    disabled={deletingReceiptIndex === i}
                                                    className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                                                    title="Remove attachment"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Approval info */}
                {expense.status === 'approved' && expense.approved_by && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
                            Approved by {expense.approved_by?.name}
                        </p>
                        {expense.approval_notes && <p className="text-xs text-text-secondary">{expense.approval_notes}</p>}
                    </div>
                )}

                {expense.status === 'rejected' && (
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Rejection Reason</p>
                        <p className="text-xs text-text-secondary">{expense.rejection_reason}</p>
                    </div>
                )}

                {/* Approval Actions */}
                {isManagerOrOwner && expense.status === 'pending_approval' && (
                    <div className="space-y-3 pt-2 border-t border-border">
                        {!showRejectForm ? (
                            <>
                                <ModernTextArea
                                    label="Approval Notes (optional)"
                                    value={approvalNotes}
                                    onChange={e => setApprovalNotes(e.target.value)}
                                    placeholder="Add any notes for the submitter..."
                                    rows={2}
                                />
                                <div className="flex gap-3">
                                    <ModernButton
                                        variant="danger"
                                        size="sm"
                                        icon={XCircle}
                                        onClick={() => setShowRejectForm(true)}
                                        className="flex-1"
                                    >
                                        REJECT
                                    </ModernButton>
                                    <ModernButton
                                        variant="success"
                                        size="sm"
                                        icon={CheckCircle}
                                        onClick={handleApprove}
                                        loading={loading}
                                        className="flex-1"
                                    >
                                        APPROVE
                                    </ModernButton>
                                </div>
                            </>
                        ) : (
                            <>
                                <ModernTextArea
                                    label="Rejection Reason *"
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this expense is being rejected..."
                                    rows={3}
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <ModernButton variant="secondary" size="sm" onClick={() => setShowRejectForm(false)} className="flex-1">
                                        BACK
                                    </ModernButton>
                                    <ModernButton variant="danger" size="sm" onClick={handleReject} loading={loading} className="flex-1">
                                        CONFIRM REJECT
                                    </ModernButton>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ExpenseDetailsModal;
