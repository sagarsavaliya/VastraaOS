import React, { useState, useEffect } from 'react';
import { UserPlus, Calendar, User, Briefcase, Zap, Package, Shield } from 'lucide-react';
import { assignTask, setCoordinator, getWorkers, getUsers, getWorkflowList } from '../services/workflowService';
import { useToast } from '../../../components/UI/Toast';
import { ModernSelect, ModernInput, ModernButton, ModernSearchSelect } from '../../../components/UI/CustomInputs';
import Modal from '../../../components/UI/Modal';

const AssignTaskModal = ({ isOpen, onClose, task, onSuccess }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        user_id: '',
        worker_id: '',
        apply_coordinator_to_all: false,
        item_id: '',
        due_date: new Date().toISOString().split('T')[0]
    });

    const selectedItemData = items.find(i => i.id === formData.item_id);

    // Determine the active task ID to assign to
    const getActiveTaskId = (source) => {
        const tasks = source?.workflow_tasks;
        if (!tasks?.length) return null;
        return (tasks.find(t => !['completed', 'skipped', 'rejected'].includes(t.status)) || tasks[0])?.id;
    };

    useEffect(() => {
        if (!isOpen) return;
        const fetchData = async () => {
            setInitialLoading(true);
            try {
                const [workersRes, usersRes, itemsRes] = await Promise.all([
                    getWorkers(),
                    getUsers(),
                    !task ? getWorkflowList({ per_page: 100 }) : Promise.resolve({ data: [] })
                ]);
                setWorkers(workersRes.data || []);
                setUsers(usersRes.data || []);
                setItems(itemsRes.data || []);

                if (task) {
                    setFormData(prev => ({
                        ...prev,
                        user_id: task.assigned_user_id || task.assigned_user?.id || '',
                        worker_id: task.assigned_worker_id || task.assigned_worker?.id || '',
                        item_id: task.id,
                        due_date: (() => {
                            const activeTask = task.workflow_tasks?.find(t => !['completed', 'skipped', 'rejected'].includes(t.status));
                            return activeTask?.due_date
                                ? new Date(activeTask.due_date).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0];
                        })()
                    }));
                } else {
                    setFormData({ user_id: '', worker_id: '', apply_coordinator_to_all: false, item_id: '', due_date: new Date().toISOString().split('T')[0] });
                }
            } catch (err) {
                showToast('Failed to load team data', 'error');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [isOpen, task]);

    const handleAssign = async () => {
        const source = task || selectedItemData;
        if (!source) {
            showToast('Please select a production item', 'error');
            return;
        }
        if (!formData.user_id && !formData.worker_id) {
            showToast('Select at least a coordinator or an executor', 'error');
            return;
        }

        const targetTaskId = getActiveTaskId(source);
        if (!targetTaskId) {
            showToast('No active workflow task found for this item', 'error');
            return;
        }

        setLoading(true);
        try {
            // Assign coordinator + executor to the active task
            const payload = {
                due_date: formData.due_date,
                ...(formData.user_id ? { user_id: formData.user_id } : {}),
                ...(formData.worker_id ? { worker_id: formData.worker_id } : {}),
            };
            await assignTask(targetTaskId, payload);

            // Propagate coordinator to all pending stages if requested
            if (formData.apply_coordinator_to_all && formData.user_id) {
                await setCoordinator(source.id, formData.user_id);
            }

            showToast('Assignment updated successfully', 'success');
            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to assign', 'error');
        } finally {
            setLoading(false);
        }
    };

    const activeTaskStage = (() => {
        const source = task || selectedItemData;
        const activeTask = source?.workflow_tasks?.find(t => !['completed', 'skipped', 'rejected'].includes(t.status));
        return activeTask?.workflow_stage?.name || source?.current_workflow_stage?.name || null;
    })();

    const footer = (
        <div className="flex items-center gap-4 w-full">
            <ModernButton variant="secondary" onClick={onClose} className="flex-1 !rounded-xl">CANCEL</ModernButton>
            <ModernButton
                onClick={handleAssign}
                loading={loading}
                disabled={!formData.worker_id && !formData.user_id}
                variant="primary"
                icon={Zap}
            >
                {task ? 'UPDATE ASSIGNMENT' : 'INITIATE ASSIGNMENT'}
            </ModernButton>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={task ? 'Update Assignment' : 'New Assignment'}
            footer={footer}
            size="md"
        >
            <div className="space-y-6">
                {initialLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">Syncing Team...</span>
                    </div>
                ) : (
                    <>
                        {/* Item Info / Selection */}
                        <div className="bg-background-content/50 rounded-xl p-5 border border-border">
                            {!task ? (
                                <ModernSearchSelect
                                    label="Select Production Item"
                                    value={formData.item_id}
                                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                                    options={items.map(i => ({
                                        id: i.id,
                                        label: `#${i.order?.order_number} - ${i.item_type?.name || i.item_name}`,
                                        sublabel: i.order?.customer?.display_name
                                    }))}
                                    placeholder="Search by order or item..."
                                    icon={Package}
                                />
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Production Item</p>
                                    <p className="text-sm font-bold text-text-main flex items-center gap-2">
                                        <Package size={16} className="text-primary" />
                                        #{task.order?.order_number || 'N/A'} — {task.item_type?.name || task.item_name || 'Item'}
                                    </p>
                                    {activeTaskStage && (
                                        <p className="text-[10px] text-text-muted mt-1">
                                            Active Stage: <span className="text-primary font-bold">{activeTaskStage}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Coordinator Section */}
                        <div className="bg-background-content/50 rounded-xl p-5 border border-border space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full border border-border bg-indigo-500/10 text-indigo-500">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-text-main uppercase tracking-tight">Staff Coordinator</h4>
                                    <p className="text-[10px] text-text-muted">Oversees this item through all stages</p>
                                </div>
                            </div>
                            <ModernSelect
                                value={formData.user_id}
                                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                options={users.map(u => ({ id: u.id, name: u.name }))}
                                placeholder="Select team member..."
                                icon={User}
                            />
                            {formData.user_id && (
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.apply_coordinator_to_all}
                                        onChange={(e) => setFormData({ ...formData, apply_coordinator_to_all: e.target.checked })}
                                        className="accent-primary w-4 h-4"
                                    />
                                    <span className="text-xs text-text-secondary group-hover:text-text-main transition-colors">
                                        Apply as coordinator for all pending stages
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* Executor Section */}
                        <div className="bg-background-content/50 rounded-xl p-5 border border-border space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full border border-border bg-primary/10 text-primary">
                                    <Briefcase size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-text-main uppercase tracking-tight">Stage Executor</h4>
                                    <p className="text-[10px] text-text-muted">
                                        Who physically does {activeTaskStage ? `"${activeTaskStage}"` : 'this stage'}
                                    </p>
                                </div>
                            </div>
                            <ModernSelect
                                value={formData.worker_id}
                                onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                                options={workers.map(w => ({ id: w.id, name: w.display_name || w.name }))}
                                placeholder="Select external artisan..."
                                icon={Briefcase}
                            />
                        </div>

                        {/* Deadline */}
                        <div className="bg-background-content/50 rounded-xl p-5 border border-border">
                            <ModernInput
                                type="date"
                                label="Commitment Deadline"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                icon={Calendar}
                            />
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default AssignTaskModal;
