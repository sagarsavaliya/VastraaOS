import React from 'react';
import {
    User, Phone, Mail, MapPin, Notebook, Briefcase,
    UserCircle, Ruler, ShoppingBag, Edit, Trash2,
    Calendar, Tag, Star
} from 'lucide-react';
import { ModernButton } from '../../../components/UI/CustomInputs';

const CustomerDetailsModal = ({ customer, onEdit, onMeasurements, onHistory, onDelete, onClose }) => {
    if (!customer) return null;

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

    const Section = ({ title, children, icon: Icon }) => (
        <div className="space-y-4 bg-background-content/10 rounded-2xl p-5 border border-border/50">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-[0.2em] border-b border-border/50 pb-3 mb-2 flex items-center gap-2">
                {Icon && <Icon size={14} className="text-primary" />}
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header / Summary Card */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">

                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-text-main tracking-tight">
                                {customer.name || `${customer.first_name} ${customer.last_name}`}
                            </h2>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="px-2 py-0.5 bg-background-content/50 text-text-muted text-[10px] font-bold rounded border border-border/50 uppercase tracking-widest">
                                {customer.customer_code}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${customer.customer_type === 'business'
                                ? 'bg-secondary/10 text-secondary border-secondary/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                                }`}>
                                {customer.customer_type || 'Individual'}
                            </span>
                            <span className="text-xs text-text-muted flex items-center gap-1.5">
                                <MapPin size={12} />
                                {customer.city}, {customer.state}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ModernButton
                        onClick={() => onEdit(customer)}
                        variant="secondary"
                        icon={Edit}
                        size="sm"
                    >
                        EDIT
                    </ModernButton>
                    <ModernButton
                        onClick={() => onDelete(customer)}
                        variant="secondary"
                        icon={Trash2}
                        className="!text-error hover:!bg-error/10 !border-error/20"
                        size="sm"
                    >
                        DELETE
                    </ModernButton>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Quick Stats Blocks */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background-content/5 p-4 rounded-2xl border border-border/30 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/5 hover:border-primary/20 transition-all group" onClick={() => onHistory(customer)}>
                        <ShoppingBag className="text-text-muted group-hover:text-primary mb-2 transition-colors" size={20} />
                        <span className="text-xl font-bold text-text-main">{customer.orders_count || 0}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Orders</span>
                    </div>
                    <div className="bg-background-content/5 p-4 rounded-2xl border border-border/30 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/5 hover:border-primary/20 transition-all group" onClick={() => onMeasurements(customer)}>
                        <Ruler className="text-text-muted group-hover:text-primary mb-2 transition-colors" size={20} />
                        <span className="text-xl font-bold text-text-main">{customer.measurement_profiles_count || 0}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Measurements</span>
                    </div>
                    <div className="bg-background-content/5 p-4 rounded-2xl border border-border/30 flex flex-col items-center justify-center text-center">
                        <Star className="text-amber-500 mb-2" size={20} />
                        <span className="text-xl font-bold text-text-main">{customer.customer_category || 'Regular'}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Category</span>
                    </div>
                    <div className="bg-background-content/5 p-4 rounded-2xl border border-border/30 flex flex-col items-center justify-center text-center">
                        <Calendar className="text-primary mb-2" size={20} />
                        <span className="text-sm font-bold text-text-main">
                            {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Last Visit</span>
                    </div>
                </div>

                {/* Contact Information */}
                <Section title="Contact Information" icon={Phone}>
                    <DetailItem icon={Phone} label="Primary Mobile" value={customer.mobile} colorClass="text-text-main" />
                    <DetailItem icon={Phone} label="Alternate Mobile" value={customer.alternate_mobile} />
                    <DetailItem icon={Phone} label="WhatsApp" value={customer.whatsapp_number} />
                    <DetailItem icon={Mail} label="Email Address" value={customer.email} colorClass="text-text-main" />
                    <DetailItem icon={Calendar} label="Date of Birth" value={customer.date_of_birth} />
                    <DetailItem icon={Calendar} label="Anniversary" value={customer.anniversary_date} />
                </Section>

                {/* Business Information */}
                {customer.customer_type === 'business' && (
                    <Section title="Business Details" icon={Briefcase}>
                        <DetailItem icon={Briefcase} label="Company Name" value={customer.company_name} colorClass="text-text-main" />
                        <DetailItem icon={User} label="Designation" value={customer.designation} />
                        <DetailItem icon={Notebook} label="GST Number" value={customer.gst_number} colorClass="text-text-main uppercase" />
                        <div className="col-span-full">
                            <DetailItem icon={MapPin} label="Business Address" value={`${customer.company_address || ''}, ${customer.company_city || ''}, ${customer.company_state || ''} - ${customer.company_pincode || ''}`} colorClass="text-text-main" />
                        </div>
                    </Section>
                )}

                {/* Personal Address */}
                <Section title="Personal / Delivery Address" icon={MapPin}>
                    <div className="col-span-full">
                        <DetailItem icon={MapPin} label="Street Address" value={customer.address} colorClass="text-text-main" />
                    </div>
                    <DetailItem icon={MapPin} label="City" value={customer.city} colorClass="text-text-main" />
                    <DetailItem icon={MapPin} label="State" value={customer.state} colorClass="text-text-main" />
                    <DetailItem icon={MapPin} label="Pincode" value={customer.pincode} colorClass="text-text-main" />
                </Section>

                {/* Notes */}
                {customer.notes && (
                    <div className="bg-background-content/10 rounded-2xl p-5 border border-border/50 space-y-3">
                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                            <Notebook size={12} className="text-primary" />
                            Internal Notes
                        </h3>
                        <div className="text-sm text-text-secondary bg-background/50 p-4 rounded-xl border border-border/30 italic">
                            "{customer.notes}"
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetailsModal;
