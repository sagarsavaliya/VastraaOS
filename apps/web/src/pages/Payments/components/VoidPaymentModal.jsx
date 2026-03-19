import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../../components/UI/Modal';
import { ModernButton, ModernTextArea } from '../../../components/UI/CustomInputs';
import { voidPayment } from '../services/paymentService';
import { useToast } from '../../../components/UI/Toast';

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const VoidPaymentModal = ({ isOpen, onClose, payment, onSuccess }) => {
    const { showToast } = useToast();
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVoid = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason for voiding this payment.');
            return;
        }
        setLoading(true);
        try {
            await voidPayment(payment.id, reason);
            showToast('Payment voided successfully', 'success');
            setReason('');
            setError('');
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to void payment', 'error');
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
        <Modal isOpen={isOpen} onClose={handleClose} title="Void Payment" size="sm">
            <div className="space-y-5">
                <div className="bg-background-content/30 rounded-xl border border-border p-4 text-sm space-y-1">
                    <p className="text-text-muted text-xs uppercase tracking-wider font-bold">Payment Details</p>
                    <p className="text-text-main font-bold text-base">{formatINR(payment?.amount)}</p>
                    <p className="text-text-secondary">{payment?.payment_date} &bull; <span className="capitalize">{payment?.payment_mode?.replace('_', ' ')}</span></p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-500">Voiding a payment is irreversible. The order balance will be updated accordingly.</p>
                </div>

                <ModernTextArea
                    label="Reason for Voiding"
                    value={reason}
                    onChange={e => { setReason(e.target.value); if (error) setError(''); }}
                    placeholder="Describe why this payment is being voided..."
                    error={error}
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                    <ModernButton variant="secondary" onClick={handleClose} disabled={loading}>Cancel</ModernButton>
                    <ModernButton variant="danger" onClick={handleVoid} loading={loading}>Void Payment</ModernButton>
                </div>
            </div>
        </Modal>
    );
};

export default VoidPaymentModal;
