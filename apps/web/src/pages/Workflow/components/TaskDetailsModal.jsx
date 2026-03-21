import React, { useState, useEffect } from 'react';
import { Package, User, Calendar, Clock, CheckCircle, Camera, MessageSquare, Edit, Zap, Send, ClipboardList, Briefcase, Scissors, Disc, AlertCircle, Plus, ImageUp, Play, XCircle, SkipForward, RotateCcw, Ruler, ArrowRight, UserPlus } from 'lucide-react';
import { getWorkflowItem, addComment, getWorkflowStages, updateTaskStatus } from '../services/workflowService';
import WorkflowTimeline from './WorkflowTimeline';
import RejectionModal from './RejectionModal';
import { ModernButton } from '../../../components/UI/CustomInputs';
import { useToast } from '../../../components/UI/Toast';
import Modal from '../../../components/UI/Modal';
import { useAuth } from '../../../contexts/AuthContext';

const TaskDetailsModal = ({ isOpen, onClose, taskId, onAssignClick, onPhotoUploadClick, onStatusUpdate }) => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const isManagerOrOwner = user?.roles?.some(r => ['owner', 'manager'].includes(r.name));

    const [item, setItem] = useState(null);
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [isRejectionOpen, setIsRejectionOpen] = useState(false);
    const [stageNotes, setStageNotes] = useState('');

    useEffect(() => {
        if (isOpen && taskId) {
            fetchItemDetails();
            fetchStages();
        }
    }, [isOpen, taskId]);

    const fetchStages = async () => {
        try {
            const data = await getWorkflowStages();
            setStages(data.data || []);
        } catch (error) {
            console.error('Error fetching stages:', error);
        }
    };

    const fetchItemDetails = async () => {
        setLoading(true);
        try {
            const data = await getWorkflowItem(taskId);
            setItem(data.data);
        } catch (error) {
            console.error('Error fetching item details:', error);
            showToast('Failed to load production details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const activeTask = item?.workflow_tasks?.find(t => !['completed', 'skipped', 'rejected'].includes(t.status));
    const hasMeasurements = !!item?.order?.measurement_profile_id;
    const approachingStitching = item?.current_workflow_stage?.stage_order >= 8;
    const isActiveTaskAssigned = !!(activeTask?.assigned_to_worker_id || activeTask?.assigned_to_user_id
        || item?.assigned_worker_id || item?.assigned_user_id);

    const handleStageAction = async (status, notes = '') => {
        if (!activeTask) return;
        setActionLoading(true);
        try {
            await updateTaskStatus(activeTask.id, { status, notes });
            showToast(
                status === 'completed' ? 'Stage completed — moved to next stage' :
                status === 'in_progress' ? 'Stage started' : 'Stage skipped',
                'success'
            );
            setStageNotes('');
            await fetchItemDetails();
            onStatusUpdate && onStatusUpdate();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update stage';
            const code = error.response?.data?.error_code;
            if (code === 'PHOTO_REQUIRED') {
                showToast('Upload a photo before completing this stage', 'error');
            } else if (code === 'MEASUREMENTS_REQUIRED') {
                showToast(msg, 'error');
            } else {
                showToast(msg, 'error');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartAndComplete = async () => {
        if (!activeTask) return;
        setActionLoading(true);
        try {
            await updateTaskStatus(activeTask.id, { status: 'in_progress' });
            await updateTaskStatus(activeTask.id, { status: 'completed', notes: stageNotes });
            showToast('Stage completed — moved to next stage', 'success');
            setStageNotes('');
            await fetchItemDetails();
            onStatusUpdate && onStatusUpdate();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to complete stage';
            showToast(msg, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        const activeTask = item?.workflow_tasks?.find(t => t.status !== 'completed');
        if (!activeTask) {
            showToast('No active stage found to add comment', 'warning');
            return;
        }

        setSubmittingComment(true);
        try {
            await addComment(activeTask.id, newComment);
            setNewComment('');
            fetchItemDetails();
            showToast('Comment added', 'success');
        } catch (error) {
            showToast('Failed to add comment', 'error');
        } finally {
            setSubmittingComment(false);
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
            in_progress: 'bg-primary/10 text-primary border-primary/20',
            completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            skipped: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            blocked: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        };
        return styles[status] || styles.pending;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={loading ? 'Loading Production...' : `Production #${item?.order?.order_number} - ${item?.item_name || item?.item_type?.name || 'Item'}`}
            size="full"
        >
            <div className="min-h-[600px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-text-muted uppercase tracking-widest animate-pulse">Synchronizing Workflow...</span>
                    </div>
                ) : item ? (
                    <div className="space-y-5 pb-10">
                        {/* Summary Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-background-content/50 rounded-xl px-5 py-3 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <User size={16} className="text-text-muted" />
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Client</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-bold text-text-main truncate">
                                        {item.order?.customer?.display_name ||
                                            (item.order?.customer?.first_name ? `${item.order.customer.first_name} ${item.order.customer.last_name || ''}` : 'Anonymous')}
                                    </p>
                                    <p className="text-[10px] text-text-muted mt-1 uppercase tracking-tighter">Priority: {item.order?.priority?.name}</p>
                                </div>

                            </div>
                            <div className="bg-background-content/50 rounded-xl px-5 py-3 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Disc size={16} className="text-text-muted" />
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Item Type</span>
                                </div>
                                <p className="text-sm font-bold text-text-main truncate">{item.item_type?.name || item.item_name}</p>
                            </div>
                            <div className="bg-background-content/50 rounded-xl px-5 py-3 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={16} className="text-text-muted" />
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Delivery</span>
                                </div>
                                <p className="text-sm font-bold text-text-main">
                                    {item.order?.promised_delivery_date ? new Date(item.order.promised_delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not Set'}
                                </p>
                            </div>
                            <div className="bg-background-content/50 rounded-xl px-5 py-3 border border-border relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap size={16} className="text-text-muted" />
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Process Status</span>
                                </div>
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                                    {item.status?.replace('_', ' ')}
                                </span>
                                {item.status === 'in_progress' && (
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Draft Order Blocker */}
                        {item.order?.status?.code === 'DRAFT' && (
                            <div className="p-4 bg-slate-500/10 border border-slate-500/30 rounded-xl flex items-start gap-3">
                                <AlertCircle size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order Not Confirmed</p>
                                    <p className="text-xs text-text-secondary">
                                        This order is still in <span className="font-bold text-slate-300">Draft</span> status. Confirm the order first before assigning tasks or starting production.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Measurement Warning Banner */}
                        {!hasMeasurements && approachingStitching && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                                <Ruler size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Measurements Missing</p>
                                    <p className="text-xs text-text-secondary">
                                        Stitching (Stage 10) will be blocked until a measurement profile is added to this order.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Active Stage Action Panel */}
                        {activeTask && item.order?.status?.code !== 'DRAFT' && (
                            <div className="bg-background-content/50 rounded-xl p-5 border border-primary/20 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                        <span className="text-xs font-bold text-text-main uppercase tracking-widest">
                                            Active Stage: {activeTask.workflow_stage?.name}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                        activeTask.status === 'in_progress'
                                            ? 'bg-primary/10 text-primary border-primary/20'
                                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                    }`}>
                                        {activeTask.status?.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {activeTask.status === 'pending' && (
                                        isActiveTaskAssigned ? (
                                            <div className="w-full space-y-3">
                                                <textarea
                                                    rows={2}
                                                    value={stageNotes}
                                                    onChange={(e) => setStageNotes(e.target.value)}
                                                    placeholder="Add a note for this stage (optional)..."
                                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-none"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <ModernButton
                                                        variant="primary"
                                                        size="sm"
                                                        icon={Play}
                                                        loading={actionLoading}
                                                        onClick={() => handleStageAction('in_progress')}
                                                    >
                                                        Start Work
                                                    </ModernButton>
                                                    <ModernButton
                                                        variant="success"
                                                        size="sm"
                                                        icon={CheckCircle}
                                                        loading={actionLoading}
                                                        onClick={handleStartAndComplete}
                                                    >
                                                        Mark Complete
                                                    </ModernButton>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                                    <AlertCircle size={14} className="text-amber-500" />
                                                    <span className="text-xs font-bold text-amber-500">Assign someone before starting</span>
                                                </div>
                                                <ModernButton
                                                    variant="primary"
                                                    size="sm"
                                                    icon={UserPlus}
                                                    onClick={() => onAssignClick && onAssignClick(item)}
                                                >
                                                    Assign & Start
                                                </ModernButton>
                                            </div>
                                        )
                                    )}
                                    {activeTask.status === 'in_progress' && (
                                        <div className="w-full space-y-3">
                                            {activeTask.workflow_stage?.requires_photo && !activeTask.photos?.length && (
                                                <p className="text-[10px] text-amber-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> Photo upload required before completing this stage
                                                </p>
                                            )}
                                            <textarea
                                                rows={2}
                                                value={stageNotes}
                                                onChange={(e) => setStageNotes(e.target.value)}
                                                placeholder="Add a note for this stage (optional)..."
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-none"
                                            />
                                            <div className="flex items-center gap-3">
                                                {!isActiveTaskAssigned && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                                        <AlertCircle size={14} className="text-amber-500" />
                                                        <span className="text-xs font-bold text-amber-500">Unassigned</span>
                                                    </div>
                                                )}
                                                <ModernButton
                                                    variant="success"
                                                    size="sm"
                                                    icon={CheckCircle}
                                                    loading={actionLoading}
                                                    onClick={() => handleStageAction('completed', stageNotes)}
                                                >
                                                    Mark Complete
                                                </ModernButton>
                                            </div>
                                        </div>
                                    )}
                                    {isManagerOrOwner && (
                                        <>
                                            <ModernButton
                                                variant="ghost"
                                                size="sm"
                                                icon={SkipForward}
                                                loading={actionLoading}
                                                onClick={() => handleStageAction('skipped')}
                                                className="border border-border/60 text-text-muted"
                                            >
                                                Skip Stage
                                            </ModernButton>
                                            <ModernButton
                                                variant="danger"
                                                size="sm"
                                                icon={RotateCcw}
                                                onClick={() => setIsRejectionOpen(true)}
                                                className="ml-auto"
                                            >
                                                Reject Stage
                                            </ModernButton>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Progression Banner */}
                        <div className="bg-background-content/50 rounded-xl p-5 border border-border shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-primary" />
                                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Workflow Progression</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full text-[9px] font-bold bg-primary text-white uppercase tracking-widest flex items-center gap-2">
                                        <Zap size={10} fill="currentColor" /> LIVE OPS
                                    </span>
                                </div>
                            </div>
                            <WorkflowTimeline
                                stages={stages}
                                currentStageId={item.current_workflow_stage_id}
                                completedStageIds={item.workflow_tasks?.filter(t => t.status === 'completed').map(t => t.workflow_stage_id) || []}
                                skippedStageIds={item.workflow_tasks?.filter(t => t.status === 'skipped').map(t => t.workflow_stage_id) || []}
                                workflowTasks={item.workflow_tasks || []}
                                canAssign={isManagerOrOwner}
                                onStageClick={(stageTask) => {
                                    // Build a minimal item proxy so AssignTaskModal can work
                                    onAssignClick && onAssignClick({ ...item, _overrideTaskId: stageTask.id, workflow_tasks: [stageTask] });
                                }}
                            />
                        </div>

                        {/* Detail Matrix */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Specifications & Multimedia */}
                            <div className="lg:col-span-2 space-y-5">
                                {/* Assignment Controls */}
                                <div className="bg-background-content/50 rounded-xl p-5 border border-border relative group">
                                    <div className="absolute top-0 right-0 p-5">
                                        <ModernButton
                                            variant="secondary"
                                            size="sm"
                                            icon={Edit}
                                            onClick={() => onAssignClick && onAssignClick(item)}
                                            className="!rounded-lg text-xs"
                                        > RE-ASSIGN
                                        </ModernButton>
                                    </div>

                                    <div className="flex items-center gap-4 mb-5">
                                        <ClipboardList size={20} className="text-primary" />
                                        <h3 className="text-base font-bold text-text-main uppercase tracking-tight">Active Allocation</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="p-4 bg-background rounded-lg border border-border">
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Allocated Personnel</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                                                    {(item.assigned_worker?.display_name || item.assigned_worker?.first_name || item.assigned_user?.name || '?')[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-black text-text-main uppercase leading-tight">
                                                        {item.assigned_worker?.display_name ||
                                                            (item.assigned_worker ? `${item.assigned_worker.first_name} ${item.assigned_worker.last_name || ''}` :
                                                                (item.assigned_user?.name || 'Unallocated'))}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">
                                                        {item.assigned_worker ? 'External Artisan' : item.assigned_user ? 'Staff Lead' : 'Waiting for assignment'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-background rounded-lg border border-border">
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Current Department</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                    <Zap size={14} fill="currentColor" />
                                                </div>
                                                <p className="text-sm font-bold text-text-main uppercase">
                                                    {item.current_workflow_stage?.name || 'Initial Stage'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {item.special_instructions && (
                                        <div className="mt-8 p-5 bg-amber-500/5 rounded-xl border border-amber-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle size={14} className="text-amber-500" />
                                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Protocol Instructions</span>
                                            </div>
                                            <p className="text-sm font-medium text-text-secondary leading-relaxed italic">{item.special_instructions}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Artifact Groups */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-background-content/50 rounded-xl p-5 border border-border">
                                        <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Scissors size={16} className="text-text-muted" /> Material Specs
                                        </h4>
                                        <div className="space-y-3">
                                            {item.fabrics?.length > 0 ? item.fabrics.map((f, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/50 text-xs">
                                                    <span className="font-bold text-text-main">{f.fabric_type} ({f.color})</span>
                                                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">{f.quantity_meters}M</span>
                                                </div>
                                            )) : <p className="text-[10px] text-text-muted text-center py-4 italic uppercase">No Fabric Data</p>}
                                        </div>
                                    </div>
                                    <div className="bg-background-content/50 rounded-xl p-5 border border-border">
                                        <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Zap size={16} className="text-text-muted" /> Embellishments
                                        </h4>
                                        <div className="space-y-3">
                                            {item.embellishments?.length > 0 ? item.embellishments.map((e, i) => (
                                                <div key={i} className="p-3 bg-background rounded-lg border border-border/50">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold text-text-main uppercase">{e.work_type?.name}</span>
                                                        <span className="text-[9px] font-bold text-emerald-500">{e.status}</span>
                                                    </div>
                                                    <p className="text-[10px] text-text-muted truncate italic">{e.description}</p>
                                                </div>
                                            )) : <p className="text-[10px] text-text-muted text-center py-4 italic uppercase">No Embellishment Data</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Evidence */}
                                <div className="space-y-5 bg-background-content/50 rounded-xl p-5 border border-border">
                                    <div className="flex items-center justify-between ">
                                        <h3 className="text-xs font-bold text-text-main uppercase tracking-[0.3em] flex items-center gap-3">
                                            <Camera size={18} className="text-primary" /> Visual Metadata
                                        </h3>
                                        <ModernButton
                                            variant="ghost"
                                            size="sm"
                                            icon={ImageUp}
                                            onClick={() => onPhotoUploadClick && onPhotoUploadClick(item)}
                                            className="!rounded-lg border border-border/40 text-[10px]"
                                        > ADD PHOTO
                                        </ModernButton>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {item.reference_images?.map((img, i) => (
                                            <div key={`ref-${i}`} className="aspect-[3/4] rounded-xl overflow-hidden border border-border bg-background group relative shadow-sm">
                                                <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="ref" />
                                                <div className="absolute top-2 left-2">
                                                    <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[7px] font-bold px-2 py-0.5 rounded shadow-lg uppercase">Reference</span>
                                                </div>
                                            </div>
                                        ))}
                                        {item.workflow_tasks?.flatMap(t => t.photos || []).map((photo, i) => (
                                            <div key={`wf-${i}`} className="aspect-[3/4] rounded-xl overflow-hidden border border-border bg-background group relative shadow-sm">
                                                <img src={photo.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="wf" />
                                                <div className="absolute top-2 left-2">
                                                    <span className="bg-primary/90 backdrop-blur-sm text-white text-[7px] font-bold px-2 py-0.5 rounded shadow-lg uppercase">Stage Log</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!item.reference_images?.length && !item.workflow_tasks?.some(t => t.photos?.length)) && (
                                            <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-background-content/10 opacity-40">
                                                <Camera size={32} className="mb-3" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-center">No visual data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Feed & Logs */}
                            <div className="space-y-8">
                                {/* Workflow Stream */}
                                <div className="bg-background rounded-xl border border-border flex flex-col h-[400px]">
                                    <div className="px-6 py-5 border-b border-border flex items-center gap-3">
                                        <Send size={16} className="text-primary" />
                                        <h4 className="text-xs font-bold text-text-main uppercase tracking-widest">Workflow Log</h4>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                                        {item.workflow_tasks?.slice().reverse().map((task, idx) => (
                                            <div key={task.id} className="relative pl-7">
                                                {idx !== item.workflow_tasks.length - 1 && (
                                                    <div className="absolute left-[7px] top-4 bottom-[-20px] w-px bg-border"></div>
                                                )}
                                                <div className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 z-10 
                                                    ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500/20' :
                                                        task.status === 'in_progress' ? 'bg-primary border-primary/20 animate-pulse' :
                                                            'bg-background border-border'} 
                                                `}></div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[11px] font-bold text-text-main uppercase truncate pr-2">{task.workflow_stage?.name}</p>
                                                        <span className="text-[8px] font-bold text-text-muted whitespace-nowrap">
                                                            {task.completed_at ? new Date(task.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'ACTIVE'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] text-text-muted flex items-center gap-1">
                                                        <User size={8} /> {task.assigned_to_user?.name || task.assigned_to_worker?.display_name || 'System'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Intelligence Feed */}
                                <div className="bg-background rounded-xl border border-border shadow-xl flex flex-col h-[400px] overflow-hidden">
                                    <div className="px-6 py-5 border-b border-border bg-background-content/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare size={16} className="text-primary" />
                                            <h3 className="text-xs font-bold text-text-main uppercase tracking-widest">Operations Feed</h3>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                                        {item.workflow_tasks?.flatMap(t => t.comments || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).length > 0 ? (
                                            item.workflow_tasks.flatMap(t => t.comments || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((cmt, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-primary uppercase">{cmt.user?.name}</span>
                                                        <span className="text-[8px] text-text-muted">
                                                            {new Date(cmt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="bg-background-content/50 p-4 rounded-xl rounded-tl-none border border-border/50 shadow-sm">
                                                        <p className="text-[11px] text-text-secondary leading-relaxed">{cmt.comment}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                                                <MessageSquare size={24} />
                                                <p className="text-[9px] font-bold uppercase tracking-widest">No operations logged</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 border-t border-border bg-background-content/10">
                                        <div className="relative">
                                            <input
                                                className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-3 text-[11px] text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                                                placeholder="Add intelligence..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                            />
                                            <button
                                                onClick={handleAddComment}
                                                disabled={!newComment.trim() || submittingComment}
                                                className="absolute right-2 top-1.5 p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 shadow-md"
                                            >
                                                <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 opacity-20">
                        <Package size={64} className="mb-4" />
                        <p className="text-xl font-bold uppercase tracking-widest">Production Artifact Missing</p>
                    </div>
                )}
            </div>

            <RejectionModal
                isOpen={isRejectionOpen}
                onClose={() => setIsRejectionOpen(false)}
                task={activeTask}
                completedTasks={item?.workflow_tasks || []}
                onSuccess={() => {
                    fetchItemDetails();
                    onStatusUpdate && onStatusUpdate();
                }}
            />
        </Modal>
    );
};

export default TaskDetailsModal;
