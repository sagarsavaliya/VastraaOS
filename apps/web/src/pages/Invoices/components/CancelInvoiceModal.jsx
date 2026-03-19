import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../../components/UI/Modal';
import { ModernButton, ModernTextArea } from '../../../components/UI/CustomInputs';
import { cancelInvoice } from '../services/invoiceService';
import { useToast } from '../../../components/UI/Toast';

const CancelInvoiceModal = ({ isOpen, onClose, invoice, onSuccess }) => {
    const { showToast } = useToast();
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason for cancellation.');
            return;
        }
        setLoading(true);
        try {
            await cancelInvoice(invoice.id, reason);
            showToast('Invoice cancelled successfully', 'success');
            setReason('');
            setError('');
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to cancel invoice', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Cancel Invoice"
            size="sm"
        >
            <div className="space-y-5">
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-500">This action cannot be undone.</p>
                        <p className="text-sm text-red-500 mt-1">
                            Invoice <span className="font-bold">{invoice?.invoice_number}</span> will be permanently marked as cancelled.
                        </p>
                    </div>
                </div>

                <ModernTextArea
                    label="Reason for Cancellation"
                    value={reason}
                    onChange={e => {
                        setReason(e.target.value);
                        if (error) setError('');
                    }}
                    placeholder="Briefly describe why this invoice is being cancelled..."
                    error={error}
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                    <ModernButton variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </ModernButton>
                    <ModernButton
                        variant="danger"
                        onClick={handleConfirm}
                        loading={loading}
                    >
                        Confirm Cancellation
                    </ModernButton>
                </div>
            </div>
        </Modal>
    );
};

export default CancelInvoiceModal;
