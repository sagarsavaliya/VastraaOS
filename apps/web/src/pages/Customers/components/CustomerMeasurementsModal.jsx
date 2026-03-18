import React, { useState, useEffect } from 'react';
import {
    Ruler, Calendar, Plus, Trash2, ArrowLeft, ChevronRight,
    CheckCircle, Star, Edit2
} from 'lucide-react';
import { useToast } from '../../../components/UI/Toast';
import { ModernButton, ModernInput, ModernTextArea, ModernCheckbox } from '../../../components/UI/CustomInputs';
import {
    getCustomerMeasurements,
    getMeasurementTypes,
    createMeasurementProfile,
    updateMeasurementProfile,
    deleteMeasurementProfile,
    createMeasurementRecord,
    updateMeasurementRecord,
    deleteMeasurementRecord,
} from '../services/customerService';

const SECTION_LABELS = {
    upper: 'Upper Body',
    lower: 'Lower Body',
    full: 'Full Body',
};

const today = () => new Date().toISOString().split('T')[0];

const CustomerMeasurementsModal = ({ customer, setFooter }) => {
    const { showToast } = useToast();

    // View state
    const [view, setView] = useState('list');

    // Data state
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [measurementTypes, setMeasurementTypes] = useState([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleteRecordConfirm, setDeleteRecordConfirm] = useState(null); // record id
    const [editingRecord, setEditingRecord] = useState(null); // { id, record_name }


    // Form state
    const [profileForm, setProfileForm] = useState({ profile_name: '', description: '', is_default: false });
    const [recordForm, setRecordForm] = useState({ record_name: '', measurement_date: today(), notes: '', values: {} });

    // Suppress modal footer
    useEffect(() => {
        if (setFooter) setFooter(null);
    }, [setFooter]);

    // Load measurement types once on mount
    useEffect(() => {
        getMeasurementTypes()
            .then(data => {
                const types = data?.data || data || [];
                setMeasurementTypes(Array.isArray(types) ? types : []);
            })
            .catch(() => showToast('Failed to load measurement types', 'error'));
    }, []);

    // Reload profiles whenever customer changes
    useEffect(() => {
        if (customer) {
            fetchProfiles();
        } else {
            setProfiles([]);
            setSelectedProfile(null);
            setSelectedRecord(null);
        }
    }, [customer]);

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const getDefaultRecord = (profile) =>
        profile?.measurement_records?.find(r => r.is_latest) ||
        profile?.measurement_records?.[0] ||
        null;

    // ─── Record edit/delete ───────────────────────────────────────────────────

    const handleDeleteRecord = async (recordId) => {
        setSaving(true);
        try {
            await deleteMeasurementRecord(recordId);
            showToast('Measurement deleted', 'success');
            setDeleteRecordConfirm(null);
            if (selectedRecord?.id === recordId) setSelectedRecord(null);
            await fetchProfiles(selectedProfile.id);
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to delete', 'error');
            setDeleteRecordConfirm(null);
        } finally {
            setSaving(false);
        }
    };

    const handleRenameRecord = async () => {
        if (!editingRecord?.record_name?.trim()) return;
        setSaving(true);
        try {
            await updateMeasurementRecord(editingRecord.id, { record_name: editingRecord.record_name.trim() });
            showToast('Renamed', 'success');
            setEditingRecord(null);
            await fetchProfiles(selectedProfile.id);
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to rename', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSetDefaultRecord = async (record) => {
        setSaving(true);
        try {
            await updateMeasurementRecord(record.id, { is_latest: true });
            showToast(`"${record.record_name}" set as default`, 'success');
            await fetchProfiles(selectedProfile.id);
        } catch (err) {
            showToast('Failed to update', 'error');
        } finally {
            setSaving(false);
        }
    };

    const groupTypesBySection = () => {
        const groups = { upper: [], lower: [], full: [] };
        measurementTypes.forEach(t => {
            const section = t.body_section;
            if (groups[section]) groups[section].push(t);
            else groups.upper.push(t); // fallback
        });
        // Sort within groups by display_order
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
        });
        return groups;
    };

    // ─── Data fetchers ────────────────────────────────────────────────────────

    const fetchProfiles = async (autoSelectId = null) => {
        setLoading(true);
        try {
            const data = await getCustomerMeasurements(customer.id);
            const list = data?.data || data || [];
            const arr = Array.isArray(list) ? list : [];
            setProfiles(arr);

            if (autoSelectId) {
                const found = arr.find(p => p.id === autoSelectId);
                const target = found || (arr.length > 0 ? arr[0] : null);
                setSelectedProfile(target);
                setSelectedRecord(target ? getDefaultRecord(target) : null);
            } else if (arr.length > 0) {
                // Keep the currently selected profile refreshed, or default to first
                setSelectedProfile(prev => {
                    if (prev) {
                        const refreshed = arr.find(p => p.id === prev.id);
                        const target = refreshed || arr[0];
                        setSelectedRecord(getDefaultRecord(target));
                        return target;
                    }
                    const first = arr[0];
                    setSelectedRecord(getDefaultRecord(first));
                    return first;
                });
            } else {
                setSelectedProfile(null);
                setSelectedRecord(null);
            }
        } catch {
            showToast('Failed to load measurement profiles', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ─── Profile form ─────────────────────────────────────────────────────────

    const openAddProfile = () => {
        setProfileForm({ profile_name: '', description: '', is_default: false });
        setView('add_profile');
    };

    const handleProfileFormChange = (field, value) => {
        setProfileForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCreateProfile = async () => {
        if (!profileForm.profile_name.trim()) {
            showToast('Profile name is required', 'error');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                customer_id: customer.id,
                profile_name: profileForm.profile_name.trim(),
                ...(profileForm.description.trim() && { description: profileForm.description.trim() }),
                is_default: profileForm.is_default,
            };
            const created = await createMeasurementProfile(payload);
            const newId = created?.data?.id || created?.id;
            showToast('Profile created successfully', 'success');
            setView('list');
            await fetchProfiles(newId);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to create profile';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const openEditProfile = (profile) => {
        setProfileForm({
            profile_name: profile.profile_name,
            description: profile.description || '',
            is_default: profile.is_default,
        });
        setSelectedProfile(profile);
        setView('edit_profile');
    };

    const handleUpdateProfile = async () => {
        if (!profileForm.profile_name.trim()) {
            showToast('Profile name is required', 'error');
            return;
        }
        setSaving(true);
        try {
            await updateMeasurementProfile(selectedProfile.id, {
                profile_name: profileForm.profile_name.trim(),
                description: profileForm.description.trim() || null,
                is_default: profileForm.is_default,
            });
            showToast('Profile updated', 'success');
            setView('list');
            await fetchProfiles(selectedProfile.id);
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ─── Delete profile ───────────────────────────────────────────────────────

    const handleDeleteProfile = async (profileId) => {
        setSaving(true);
        try {
            await deleteMeasurementProfile(profileId);
            showToast('Profile deleted', 'success');
            setDeleteConfirm(null);
            // If we deleted the selected profile, clear selection
            if (selectedProfile?.id === profileId) {
                setSelectedProfile(null);
                setSelectedRecord(null);
            }
            await fetchProfiles();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to delete profile';
            showToast(msg, 'error');
            setDeleteConfirm(null);
        } finally {
            setSaving(false);
        }
    };

    // ─── Record form ──────────────────────────────────────────────────────────

    const openAddRecord = () => {
        // Pre-populate values map with empty strings for all types
        const initialValues = {};
        measurementTypes.forEach(t => { initialValues[t.id] = ''; });
        setRecordForm({ record_name: '', measurement_date: today(), notes: '', values: initialValues });
        setView('add_record');
    };

    const handleRecordValueChange = (typeId, value) => {
        setRecordForm(prev => ({
            ...prev,
            values: { ...prev.values, [typeId]: value },
        }));
    };

    const handleCreateRecord = async () => {
        if (!recordForm.record_name.trim()) {
            showToast('Size / Name is required', 'error');
            return;
        }
        if (!recordForm.measurement_date) {
            showToast('Measurement date is required', 'error');
            return;
        }
        // Validate required fields
        const requiredMissing = measurementTypes
            .filter(t => t.is_required)
            .some(t => !recordForm.values[t.id] && recordForm.values[t.id] !== 0);
        if (requiredMissing) {
            showToast('Please fill all required measurements', 'error');
            return;
        }
        // Build measurements array — only include entries that have a value
        const measurements = measurementTypes
            .filter(t => recordForm.values[t.id] !== '' && recordForm.values[t.id] !== undefined)
            .map(t => ({
                measurement_type_id: t.id,
                value: parseFloat(recordForm.values[t.id]),
            }));

        setSaving(true);
        try {
            const result = await createMeasurementRecord({
                measurement_profile_id: selectedProfile.id,
                record_name: recordForm.record_name.trim(),
                measurement_date: recordForm.measurement_date,
                ...(recordForm.notes.trim() && { notes: recordForm.notes.trim() }),
                measurements,
            });
            showToast('Measurements recorded successfully', 'success');
            setView('list');
            // Refresh profiles and select the new record if we can identify it
            const newRecordId = result?.data?.id || result?.id || null;
            await fetchProfiles(selectedProfile.id);
            // After fetchProfiles updates state, try to select the new record
            if (newRecordId) {
                setSelectedRecord(prev => {
                    // Will be updated once profiles state settles; handled below
                    return prev;
                });
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to save measurements';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    // ─── Loading screen ───────────────────────────────────────────────────────

    if (loading && profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-text-muted font-medium">Loading measurement profiles...</p>
            </div>
        );
    }

    // ─── View: add_profile ────────────────────────────────────────────────────

    if (view === 'add_profile') {
        return (
            <div className="p-8 max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => setView('list')}
                        className="p-2 rounded-xl hover:bg-surface border border-transparent hover:border-border/50 text-text-muted hover:text-text-main transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-xl font-black text-text-main tracking-tight">New Profile</h2>
                </div>

                <div className="space-y-5">
                    <ModernInput
                        label="Profile Name *"
                        value={profileForm.profile_name}
                        onChange={e => handleProfileFormChange('profile_name', e.target.value)}
                        placeholder="e.g. Wedding Suit, Casual Wear"
                    />

                    <ModernTextArea
                        label="Notes"
                        value={profileForm.description}
                        onChange={e => handleProfileFormChange('description', e.target.value)}
                        placeholder="e.g. Prefers loose fit, left shoulder slightly lower..."
                    />

                    <ModernCheckbox
                        label="Set as default profile"
                        checked={profileForm.is_default}
                        onChange={e => handleProfileFormChange('is_default', e.target.checked)}
                    />
                </div>

                <div className="flex gap-3 mt-8">
                    <ModernButton
                        variant="ghost"
                        onClick={() => setView('list')}
                        disabled={saving}
                    >
                        Cancel
                    </ModernButton>
                    <ModernButton
                        variant="primary"
                        icon={Plus}
                        loading={saving}
                        onClick={handleCreateProfile}
                    >
                        Create Profile
                    </ModernButton>
                </div>
            </div>
        );
    }

    // ─── View: edit_profile ───────────────────────────────────────────────────

    if (view === 'edit_profile') {
        return (
            <div className="p-8 max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => setView('list')}
                        className="p-2 rounded-xl hover:bg-surface border border-transparent hover:border-border/50 text-text-muted hover:text-text-main transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-xl font-black text-text-main tracking-tight">Edit Profile</h2>
                </div>

                <div className="space-y-5">
                    <ModernInput
                        label="Profile Name *"
                        value={profileForm.profile_name}
                        onChange={e => handleProfileFormChange('profile_name', e.target.value)}
                        placeholder="e.g. Wedding Suit, Casual Wear"
                    />

                    <ModernTextArea
                        label="Notes"
                        value={profileForm.description}
                        onChange={e => handleProfileFormChange('description', e.target.value)}
                        placeholder="e.g. Prefers loose fit, left shoulder slightly lower..."
                    />

                    <ModernCheckbox
                        label="Set as default profile"
                        checked={profileForm.is_default}
                        onChange={e => handleProfileFormChange('is_default', e.target.checked)}
                    />
                </div>

                <div className="flex gap-3 mt-8">
                    <ModernButton variant="ghost" onClick={() => setView('list')} disabled={saving}>
                        Cancel
                    </ModernButton>
                    <ModernButton variant="primary" icon={CheckCircle} loading={saving} onClick={handleUpdateProfile}>
                        Save Changes
                    </ModernButton>
                </div>
            </div>
        );
    }

    // ─── View: add_record ─────────────────────────────────────────────────────

    if (view === 'add_record') {
        const typeGroups = groupTypesBySection();

        return (
            <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => setView('list')}
                        className="p-2 rounded-xl hover:bg-surface border border-transparent hover:border-border/50 text-text-muted hover:text-text-main transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-text-main tracking-tight">Record Measurements</h2>
                        <p className="text-xs text-text-muted mt-0.5 font-medium">{selectedProfile?.profile_name}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Size / Name */}
                    <ModernInput
                        label="Size / Name *"
                        value={recordForm.record_name}
                        onChange={e => setRecordForm(prev => ({ ...prev, record_name: e.target.value }))}
                        placeholder="e.g. M, L, XL, Slim Fit, Bridal"
                    />

                    {/* Date + Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <ModernInput
                            label="Measurement Date *"
                            type="date"
                            icon={Calendar}
                            value={recordForm.measurement_date}
                            onChange={e => setRecordForm(prev => ({ ...prev, measurement_date: e.target.value }))}
                        />
                        <ModernInput
                            label="Notes"
                            value={recordForm.notes}
                            onChange={e => setRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Optional notes..."
                        />
                    </div>

                    {/* Measurement sections */}
                    {Object.entries(typeGroups).map(([section, types]) => {
                        if (types.length === 0) return null;
                        return (
                            <div key={section}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-black text-text-muted uppercase tracking-widest">
                                        {SECTION_LABELS[section] || section}
                                    </span>
                                    <div className="flex-1 h-px bg-border/50"></div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {types.map(type => (
                                        <div key={type.id} className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest ml-1">
                                                {type.name}{type.is_required ? ' *' : ''}
                                            </label>
                                            <div className="relative flex items-center border border-border bg-background-content/10 hover:border-border-hover hover:bg-background-content/20 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl h-11 transition-all duration-200">
                                                <input
                                                    type="number"
                                                    min={type.min_value ?? undefined}
                                                    max={type.max_value ?? undefined}
                                                    step="0.1"
                                                    value={recordForm.values[type.id] ?? ''}
                                                    onChange={e => handleRecordValueChange(type.id, e.target.value)}
                                                    placeholder="0"
                                                    className="w-full bg-transparent text-sm text-text-main placeholder-text-muted/40 outline-none pl-3 pr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                {type.unit && (
                                                    <span className="text-[10px] font-bold text-text-muted pr-2.5 shrink-0">
                                                        {type.unit}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-3 mt-8">
                    <ModernButton
                        variant="ghost"
                        onClick={() => setView('list')}
                        disabled={saving}
                    >
                        Cancel
                    </ModernButton>
                    <ModernButton
                        variant="primary"
                        icon={CheckCircle}
                        loading={saving}
                        onClick={handleCreateRecord}
                    >
                        Save Measurements
                    </ModernButton>
                </div>
            </div>
        );
    }

    // ─── View: list (default) ─────────────────────────────────────────────────

    const currentMeasurements = selectedRecord?.measurement_values || [];

    return (
        <div className="flex bg-background rounded-2xl overflow-hidden min-h-[500px] border border-border/30">

            {/* ── Sidebar: Profile list ── */}
            <div className="w-1/3 border-r border-border/50 bg-surface/30 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border/30 flex justify-between items-center bg-surface">
                    <span className="text-xs font-black text-text-muted uppercase tracking-widest">Profiles</span>
                    <button
                        onClick={openAddProfile}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                        title="New Profile"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Profile list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {profiles.length === 0 ? (
                        <div className="p-8 text-center text-sm text-text-muted">
                            No profiles yet. Create one to get started.
                        </div>
                    ) : (
                        profiles.map(profile => (
                            <div
                                key={profile.id}
                                onClick={() => {
                                    setSelectedProfile(profile);
                                    setSelectedRecord(getDefaultRecord(profile));
                                }}
                                className={`relative p-4 rounded-xl border cursor-pointer transition-all group
                                    ${selectedProfile?.id === profile.id
                                        ? 'bg-primary/10 border-primary/20 shadow-sm'
                                        : 'hover:bg-surface border-transparent hover:border-border/50'}`}
                            >
                                {/* Top row: name + edit/delete icons */}
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className="font-bold text-text-main text-sm flex-1 leading-tight">{profile.profile_name}</span>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => openEditProfile(profile)}
                                            className="p-1 rounded hover:bg-primary/10 hover:text-primary text-text-muted transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(profile.id)}
                                            className="p-1 rounded hover:bg-rose-500/10 hover:text-rose-500 text-text-muted transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Default badge */}
                                {profile.is_default && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider mb-1.5">
                                        <Star size={8} className="fill-primary" /> Default
                                    </span>
                                )}

                                {/* Size variant chips */}
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {(profile.measurement_records || []).map(r => (
                                        <span
                                            key={r.id}
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border
                                                ${r.is_latest
                                                    ? 'bg-primary/10 text-primary border-primary/20'
                                                    : 'bg-surface text-text-muted border-border/50'}`}
                                        >
                                            {r.record_name || 'Unnamed'}
                                        </span>
                                    ))}
                                    {!(profile.measurement_records?.length) && (
                                        <span className="text-[9px] text-text-muted italic">No measurements yet</span>
                                    )}
                                </div>

                                {/* Delete confirm inline */}
                                {deleteConfirm === profile.id && (
                                    <div
                                        className="mt-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-2"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <span className="text-xs font-bold text-rose-500">Delete this profile?</span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleDeleteProfile(profile.id)}
                                                disabled={saving}
                                                className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="text-xs font-bold text-text-muted hover:text-text-main px-2.5 py-1 rounded-lg hover:bg-surface transition-colors"
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Right panel ── */}
            <div className="flex-1 overflow-y-auto relative min-h-[500px]">
                {!selectedProfile ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center h-full text-text-muted/50 p-12 min-h-[500px]">
                        <Ruler size={56} className="mb-4 opacity-30" />
                        <p className="text-lg font-semibold text-text-muted/60">Select a profile to view details</p>
                        <p className="text-sm text-text-muted/40 mt-1">or create a new profile to start recording measurements</p>
                        <ModernButton
                            variant="outline"
                            size="sm"
                            icon={Plus}
                            onClick={openAddProfile}
                            className="mt-6"
                        >
                            New Profile
                        </ModernButton>
                    </div>
                ) : (
                    <div className="p-8">
                        {/* Profile header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-black text-text-main tracking-tight">
                                        {selectedProfile.profile_name}
                                    </h2>
                                    {selectedProfile.is_default && (
                                        <span className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                                            <Star size={10} className="fill-primary" />
                                            Default
                                        </span>
                                    )}
                                </div>
                                {selectedProfile.description && (
                                    <p className="text-sm text-text-muted max-w-md">{selectedProfile.description}</p>
                                )}
                            </div>
                            <ModernButton
                                variant="primary"
                                size="sm"
                                icon={Plus}
                                onClick={openAddRecord}
                            >
                                Add Measurements
                            </ModernButton>
                        </div>

                        {/* Size variant tabs */}
                        {(selectedProfile.measurement_records?.length > 0) && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {selectedProfile.measurement_records.map(r => {
                                    const isActive = selectedRecord?.id === r.id;
                                    const isEditing = editingRecord?.id === r.id;
                                    const isDeleteConfirm = deleteRecordConfirm === r.id;

                                    if (isEditing) return (
                                        <div key={r.id} className="flex items-center gap-1 px-2 py-1 rounded-full border border-primary/40 bg-primary/5">
                                            <input
                                                autoFocus
                                                value={editingRecord.record_name}
                                                onChange={e => setEditingRecord(prev => ({ ...prev, record_name: e.target.value }))}
                                                onKeyDown={e => { if (e.key === 'Enter') handleRenameRecord(); if (e.key === 'Escape') setEditingRecord(null); }}
                                                className="text-xs font-bold bg-transparent outline-none text-primary w-20"
                                            />
                                            <button onClick={handleRenameRecord} disabled={saving} className="text-success hover:text-success/80"><CheckCircle size={13} /></button>
                                            <button onClick={() => setEditingRecord(null)} className="text-text-muted hover:text-rose-500"><Trash2 size={11} /></button>
                                        </div>
                                    );

                                    if (isDeleteConfirm) return (
                                        <div key={r.id} className="flex items-center gap-1 px-2 py-1 rounded-full border border-rose-500/40 bg-rose-500/10 text-xs font-bold text-rose-500">
                                            <span>Delete "{r.record_name}"?</span>
                                            <button onClick={() => handleDeleteRecord(r.id)} disabled={saving} className="underline hover:no-underline">Yes</button>
                                            <button onClick={() => setDeleteRecordConfirm(null)} className="text-text-muted hover:text-text-main underline hover:no-underline">No</button>
                                        </div>
                                    );

                                    return (
                                        <div key={r.id} className={`group flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full border text-xs font-bold transition-all
                                            ${isActive ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-surface text-text-muted border-border/50 hover:border-border hover:text-text-main'}`}>
                                            <button onClick={() => setSelectedRecord(r)} className="flex items-center gap-1">
                                                {r.record_name || 'Unnamed'}
                                                {r.is_latest && <Star size={9} className="fill-primary text-primary" />}
                                            </button>
                                            {isActive && (
                                                <div className="flex items-center gap-0.5 ml-1 border-l border-primary/20 pl-1">
                                                    <button onClick={() => setEditingRecord({ id: r.id, record_name: r.record_name })} title="Rename" className="p-0.5 rounded hover:bg-primary/10 text-primary/60 hover:text-primary"><Edit2 size={10} /></button>
                                                    {!r.is_latest && <button onClick={() => handleSetDefaultRecord(r)} title="Set as default" className="p-0.5 rounded hover:bg-primary/10 text-primary/60 hover:text-primary"><Star size={10} /></button>}
                                                    <button onClick={() => setDeleteRecordConfirm(r.id)} title="Delete" className="p-0.5 rounded hover:bg-rose-500/10 text-text-muted/60 hover:text-rose-500"><Trash2 size={10} /></button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Measurements grid for selectedRecord */}
                        {currentMeasurements.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center text-text-muted opacity-60 bg-background/50 rounded-2xl border border-dashed border-border">
                                <Ruler size={48} className="mb-4 opacity-40" />
                                <p className="font-semibold text-base">No measurements recorded yet</p>
                                <p className="text-sm mt-1 opacity-70">Start by recording the first set of measurements</p>
                                <ModernButton
                                    variant="outline"
                                    size="sm"
                                    icon={ChevronRight}
                                    onClick={openAddRecord}
                                    className="mt-5"
                                >
                                    Record First Measurements
                                </ModernButton>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(SECTION_LABELS).map(([section, label]) => {
                                    const values = currentMeasurements.filter(m => {
                                        const type = m.measurement_type;
                                        return (type?.body_section || 'upper') === section;
                                    });
                                    if (values.length === 0) return null;
                                    return (
                                        <div key={section}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-black text-text-muted uppercase tracking-widest">
                                                    {label}
                                                </span>
                                                <div className="flex-1 h-px bg-border/50"></div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {values.map(m => {
                                                    const type = m.measurement_type;
                                                    return (
                                                        <div
                                                            key={m.id}
                                                            className="bg-surface border border-border/50 p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-colors shadow-sm"
                                                        >
                                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                                                                {type?.name || 'Measurement'}
                                                            </span>
                                                            <div className="flex items-end gap-1">
                                                                <span className="text-2xl font-black text-primary">
                                                                    {m.value}
                                                                </span>
                                                                <span className="text-xs font-bold text-text-muted pb-0.5">
                                                                    {type?.unit || m.unit || 'in'}
                                                                </span>
                                                            </div>
                                                            {m.notes && (
                                                                <p className="text-[10px] text-text-muted mt-2 border-t border-border/30 pt-1 italic">
                                                                    {m.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerMeasurementsModal;
