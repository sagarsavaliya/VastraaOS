import React, { useState, useEffect } from 'react';
import { X, Ruler, Calendar, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../../components/UI/Toast';
import { ModernButton, ModernInput } from '../../../components/UI/CustomInputs';
import { getCustomerMeasurements } from '../services/customerService';
import api from '../../../services/api';

const CustomerMeasurementsModal = ({ customer, setFooter }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);

    useEffect(() => {
        if (customer) {
            fetchMeasurements();
        } else {
            setProfiles([]);
            setSelectedProfile(null);
        }
    }, [customer]);

    useEffect(() => {
        if (setFooter) {
            setFooter(null);
        }
    }, [setFooter]);

    const fetchMeasurements = async () => {
        setLoading(true);
        try {
            const data = await getCustomerMeasurements(customer.id);
            // Handle both { data: [...] } and [...] formats
            const profilesList = data?.data || data || [];
            setProfiles(Array.isArray(profilesList) ? profilesList : []);
            if (Array.isArray(profilesList) && profilesList.length > 0) {
                setSelectedProfile(profilesList[0]);
            }
        } catch (err) {
            console.error('Error fetching measurements:', err);
            showToast('Failed to load measurements', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-text-muted font-medium">Loading measurement profiles...</p>
            </div>
        );
    }

    return (
        <div className="flex bg-background rounded-2xl overflow-hidden min-h-[500px] border border-border/30">
            {/* Sidebar: Profiles List */}
            <div className="w-1/3 border-r border-border/50 bg-surface/30 flex flex-col">
                <div className="p-4 border-b border-border/30 flex justify-between items-center bg-surface">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Profiles</span>
                    <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors" title="Add Profile">
                        <Plus size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {profiles.length === 0 ? (
                        <div className="p-8 text-center text-sm text-text-muted">No measurements found</div>
                    ) : (
                        profiles.map(profile => (
                            <button
                                key={profile.id}
                                onClick={() => setSelectedProfile(profile)}
                                className={`w-full text-left p-4 rounded-xl transition-all border ${selectedProfile?.id === profile.id
                                    ? 'bg-primary/10 border-primary/20 shadow-sm'
                                    : 'hover:bg-surface border-transparent hover:border-border/50'
                                    }`}
                            >
                                <div className="font-bold text-text-main truncate text-sm">
                                    {profile.profile_name}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                                    <Calendar size={12} />
                                    <span>{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content: Measurements Details */}
            <div className="flex-1 overflow-y-auto bg-background-content/5 relative min-h-[500px]">
                {selectedProfile ? (
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-text-main tracking-tight mb-2">
                                    {selectedProfile.profile_name}
                                </h2>
                                <p className="text-sm text-text-muted max-w-md">
                                    {selectedProfile.notes || "No notes available for this profile."}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <ModernButton variant="outline" size="sm" icon={ExternalLink}>Edit Profile</ModernButton>
                            </div>
                        </div>

                        {/* Body Measurements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(() => {
                                const records = selectedProfile.records || [];
                                const latestRecord = records.find(r => r.is_latest) || records[0];

                                if (!latestRecord || !latestRecord.values || latestRecord.values.length === 0) {
                                    return (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-text-muted opacity-50 bg-background/50 rounded-2xl border border-dashed border-border">
                                            <Ruler size={48} className="mb-4" />
                                            <p className="font-medium">No measurement values recorded</p>
                                        </div>
                                    );
                                }

                                return latestRecord.values.map((val, idx) => (
                                    <div key={idx} className="bg-surface border border-border/50 p-4 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-colors shadow-sm">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                                            {val.measurement_type?.name || 'Dimension'}
                                        </span>
                                        <div className="flex items-end gap-1">
                                            <span className="text-2xl font-black text-primary">
                                                {val.value}
                                            </span>
                                            <span className="text-xs font-bold text-text-muted pb-1">
                                                {val.unit || 'in'}
                                            </span>
                                        </div>
                                        {val.notes && (
                                            <p className="text-[10px] text-text-muted mt-2 border-t border-border/30 pt-1 italic">
                                                {val.notes}
                                            </p>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted/50 p-12">
                        <Ruler size={64} className="mb-4 opacity-30" />
                        <p className="text-lg font-medium">Select a profile to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerMeasurementsModal;
