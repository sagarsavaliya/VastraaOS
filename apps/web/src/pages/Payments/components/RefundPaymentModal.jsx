import React, { useState, useEffect } from 'react';
import Modal from '../../../components/UI/Modal';
import { ModernInput, ModernTextArea, ModernButton } from '../../../components/UI/CustomInputs';
import { refundPayment } from '../services/paymentService';
import { useToast } from '../../../components/UI/Toast';

const todayStr = () => new Date().toISOString().split('T')[0];

const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const RefundPaymentModal = ({ isOpen, onClose, payment, onSuccess }) => {
    const { showToast } = useToast();
    const [refundAmount, setRefundAmount] = useState('');
    const [reason, setReason] = useState('');
    const [refundDate, setRefundDate] = useState(todayStr());
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && payment) {
            setRefundAmount(String(payment.amount || ''));
            setReason('');
            setRefundDate(todayStr());
            setErrors({});
        }
    }, [isOpen, payment]);

    const validate = () => {
        const e = {};
        const amt = parseFloat(refundAmount);
        if (!amt || amt <= 0) e.refundAmount = 'Refund amount must be greater than 0';
        if (amt > (payment?.amount || 0)) e.refundAmount = `Cannot exceed original amount of ${formatINR(payment?.amount)}`;
        if (!reason.trim()) e.reason = 'Reason is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRefund = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await refundPayment(payment.id, {
                amount: parseFloat(refundAmount),
                reason,
                refund_date: refundDate,
            });
            showToast('Refund processed successfully', 'success');
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to process refund', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Process Refund" size="sm">
            <div className="space-y-5">
                <div className="bg-background-content/30 rounded-xl border border-border p-4 text-sm">
                    <p className="text-text-muted text-xs uppercase tracking-wider font-bold mb-1">Original Payment</p>
                    <p className="text-text-main font-bold text-lg">{formatINR(payment?.amount)}</p>
                    <p className="text-text-secondary text-xs mt-0.5">{payment?.payment_date} &bull; <span className="capitalize">{payment?.payment_mode?.replace('_', ' ')}</span></p>
                </div>

                <ModernInput
                    label="Refund Amount (₹)"
                    type="number"
                    value={refundAmount}
                    onChange={e => { setRefundAmount(e.target.value); if (errors.refundAmount) setErrors(p => ({ ...p, refundAmount: '' })); }}
                    placeholder="0.00"
                    min="0.01"
                    max={payment?.amount}
                    step="0.01"
                    error={errors.refundAmount}
                />

                <ModernTextArea
                    label="Refund Reason"
                    value={reason}
                    onChange={e => { setReason(e.target.value); if (errors.reason) setErrors(p => ({ ...p, reason: '' })); }}
                    placeholder="Explain why this refund is being issued..."
                    error={errors.reason}
                />

                <ModernInput
                    label="Refund Date"
                    type="date"
                    value={refundDate}
                    onChange={e => setRefundDate(e.target.value)}
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                    <ModernButton variant="secondary" onClick={handleClose} disabled={loading}>Cancel</ModernButton>
                    <ModernButton variant="primary" onClick={handleRefund} loading={loading}>Process Refund</ModernButton>
                </div>
            </div>
        </Modal>
    );
};

export default RefundPaymentModal;
