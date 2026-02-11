import React from 'react';
import {
    MessageSquare, Calendar, User, Phone, Tag,
    Mail, Notebook, Clock, Target, Wallet, Shirt,
    ArrowRight, Briefcase, MapPin
} from 'lucide-react';
import { ModernButton } from '../../../components/UI/CustomInputs';

const InquiryDetailsModal = ({ inquiry, onConvert, onClose }) => {
    if (!inquiry) return null;

    const DetailItem = ({ icon: Icon, label, value, colorClass = "text-text-secondary" }) => (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5 focus:outline-none">
                <Icon size={12} className="text-primary/60" />
                {label}
            </span>
            <span className={`text-sm font-medium ${colorClass}`}>
                {value || 'N/A'}
            </span>
        </div>
    );

    const Section = ({ title, children }) => (
        <div className="space-y-4 bg-background-content/10 rounded-2xl p-5 border border-border/50">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-[0.2em] border-b border-border/50 pb-3 mb-2 flex items-center justify-between">
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {children}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header / Summary Card */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquare size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-main tracking-tight">
                            {inquiry.inquiry_number}
                        </h2>
                        <div className="flex items-center justify-between gap-3 mt-1">
                            <span className="pr-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                                {inquiry.status}
                            </span>
                            <span className="text-xs text-text-muted flex items-center gap-1.5">
                                <Calendar size={12} />
                                {new Date(inquiry.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {inquiry.status?.toLowerCase() !== 'converted' && (
                    <ModernButton
                        onClick={() => onConvert(inquiry)}
                        variant="primary"
                        icon={ArrowRight}
                        size="md"
                    >
                        CONVERT TO ORDER
                    </ModernButton>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Customer Information */}
                <Section title="Customer Information">
                    <DetailItem icon={User} label="Full Name" value={inquiry.customer_name} colorClass="text-text-main" />
                    <DetailItem icon={Phone} label="Mobile" value={inquiry.customer_mobile} colorClass="text-text-main" />
                    <DetailItem icon={Mail} label="Email Address" value={inquiry.customer_email} colorClass="text-text-main" />
                    <DetailItem icon={Target} label="Type" value={inquiry.customer_type} colorClass="text-text-main uppercase" />
                    {inquiry.customer?.id && (
                        <div className="col-span-1 md:col-span-2">
                            <span className="text-[10px] font-bold text-success uppercase tracking-widest flex items-center gap-1.5">
                                <Target size={12} />
                                LINKED TO CUSTOMER PROFILE
                            </span>
                        </div>
                    )}
                </Section>

                {inquiry.customer_type === 'business' && (
                    <Section title="Business Information">
                        <DetailItem icon={Briefcase} label="Company Name" value={inquiry.company_name} colorClass="text-text-main" />
                        <DetailItem icon={User} label="Designation" value={inquiry.designation} colorClass="text-text-main" />
                        <DetailItem icon={Notebook} label="GST Number" value={inquiry.company_gst} colorClass="text-text-main uppercase" />
                        <div className="col-span-full">
                            <DetailItem icon={MapPin} label="Company Address" value={`${inquiry.company_address || ''}, ${inquiry.company_city || ''}, ${inquiry.company_state || ''} - ${inquiry.company_pincode || ''}`} colorClass="text-text-main" />
                        </div>
                    </Section>
                )}

                <Section title="Delivery Address">
                    <DetailItem icon={MapPin} label="Street Address" value={inquiry.address} colorClass="text-text-main" />
                    <DetailItem icon={MapPin} label="City" value={inquiry.city} colorClass="text-text-main" />
                    <DetailItem icon={MapPin} label="State" value={inquiry.state} colorClass="text-text-main" />
                    <DetailItem icon={MapPin} label="Pincode" value={inquiry.pincode} colorClass="text-text-main" />
                </Section>

                {/* Inquiry Specifics */}
                <Section title="Inquiry Specifics">
                    <DetailItem icon={Tag} label="Occasion" value={inquiry.occasion?.name} colorClass="text-text-main" />
                    <DetailItem icon={Target} label="Source" value={inquiry.source?.name} colorClass="text-text-main" />
                    <DetailItem icon={Shirt} label="Item Type" value={inquiry.item_type?.name} colorClass="text-text-main" />
                    <DetailItem icon={Wallet} label="Budget Range" value={inquiry.budget_range?.name} colorClass="text-text-main" />
                    <DetailItem icon={Calendar} label="Event Date" value={inquiry.event_date} colorClass="text-text-main" />
                    <DetailItem icon={Clock} label="Preferred Delivery" value={inquiry.preferred_delivery_date} colorClass="text-text-main" />
                </Section>

                {/* Requirements & Notes */}
                <div className="bg-background-content/10 rounded-2xl p-5 border border-border/50 space-y-4">
                    <h3 className="text-xs font-bold text-text-main uppercase tracking-[0.2em] border-b border-border/50 pb-3 mb-2">
                        Requirements & Notes
                    </h3>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                <Target size={12} className="text-primary/60" />
                                Requirements Detail
                            </span>
                            <div className="text-sm text-text-secondary bg-background/50 rounded-xl italic">
                                "{inquiry.requirements || 'No specific requirements mentioned.'}"
                            </div>
                        </div>
                        {inquiry.notes && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5 focus:outline-none">
                                    <Notebook size={12} className="text-primary/60" />
                                    Internal Notes
                                </span>
                                <div className="text-sm text-text-secondary bg-background/50 rounded-xl">
                                    {inquiry.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InquiryDetailsModal;
