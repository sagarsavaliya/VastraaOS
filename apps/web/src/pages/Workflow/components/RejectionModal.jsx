import React, { useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { rejectTask } from '../services/workflowService';
import { useToast } from '../../../components/UI/Toast';
import { ModernButton, ModernSelect } from '../../../components/UI/CustomInputs';
import Modal from '../../../components/UI/Modal';

const RejectionModal = ({ isOpen, onClose, task, completedTasks = [], onSuccess }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [rollbackMode, setRollbackMode] = useState('previous'); // 'previous' | 'specific'
    const [rollbackStageId, setRollbackStageId] = useState('');
    const [reasonError, setReasonError] = useState('');

    const completedStageTasks = completedTasks.filter(
        t => t.status === 'completed' && t.workflow_stage_id !== task?.workflow_stage_id
    );

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setReasonError('Rejection reason is required');
            return;
        }
        if (rollbackMode === 'specific' && !rollbackStageId) {
            showToast('Please select a stage to roll back to', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = { reason: reason.trim() };
            if (rollbackMode === 'specific' && rollbackStageId) {
                payload.rollback_to_stage_id = rollbackStageId;
            }
            await rejectTask(task.id, payload);
            showToast('Stage rejected and workflow rolled back', 'success');
            setReason('');
            setRollbackMode('previous');
            setRollbackStageId('');
            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to reject stage', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setReasonError('');
        setRollbackMode('previous');
        setRollbackStageId('');
        onClose();
    };

    const footer = (
        <div className="flex items-center gap-4 w-full">
            <ModernButton variant="secondary" onClick={handleClose} className="flex-1 !rounded-xl">
                CANCEL
            </ModernButton>
            <ModernButton
                onClick={handleSubmit}
                loading={loading}
                variant="danger"
                icon={RotateCcw}
                className="flex-1"
            >
                CONFIRM REJECTION
            </ModernButton>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Reject & Rollback Stage"
            footer={footer}
            size="sm"
        >
            <div className="space-y-6">
                {/* Warning banner */}
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">
                            Stage: {task?.workflow_stage?.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                            This will mark the current stage as rejected and move the order back to an earlier stage.
                        </p>
                    </div>
                </div>

                {/* Rejection reason */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Rejection Reason <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        rows={3}
                        value={reason}
                        onChange={(e) => { setReason(e.target.value); setReasonError(''); }}
                        placeholder="e.g. Work quality does not match the reference design..."
                        className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-none
                            ${reasonError ? 'border-rose-500/60' : 'border-border'}`}
                    />
                    {reasonError && <p className="text-xs text-rose-500">{reasonError}</p>}
                </div>

                {/* Rollback target */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Roll Back To
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:border-primary/40 transition-colors"
                            style={{ background: rollbackMode === 'previous' ? 'var(--color-primary-10, rgba(99,102,241,0.08))' : '' }}>
                            <input
                                type="radio"
                                value="previous"
                                checked={rollbackMode === 'previous'}
                                onChange={() => setRollbackMode('previous')}
                                className="accent-primary"
                            />
                            <div>
                                <p className="text-xs font-bold text-text-main">Previous Stage (Default)</p>
                                <p className="text-[10px] text-text-muted">Move back one step automatically</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:border-primary/40 transition-colors"
                            style={{ background: rollbackMode === 'specific' ? 'var(--color-primary-10, rgba(99,102,241,0.08))' : '' }}>
                            <input
                                type="radio"
                                value="specific"
                                checked={rollbackMode === 'specific'}
                                onChange={() => setRollbackMode('specific')}
                                className="accent-primary"
                            />
                            <div>
                                <p className="text-xs font-bold text-text-main">Choose Specific Stage</p>
                                <p className="text-[10px] text-text-muted">Select any completed earlier stage</p>
                            </div>
                        </label>
                    </div>

                    {rollbackMode === 'specific' && (
                        <ModernSelect
                            label="Select Stage to Roll Back To"
                            value={rollbackStageId}
                            onChange={(e) => setRollbackStageId(e.target.value)}
                            options={completedStageTasks.map(t => ({
                                id: t.workflow_stage_id,
                                name: t.workflow_stage?.name || `Stage ${t.workflow_stage_id}`
                            }))}
                            placeholder="Select earlier stage..."
                            icon={RotateCcw}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default RejectionModal;
