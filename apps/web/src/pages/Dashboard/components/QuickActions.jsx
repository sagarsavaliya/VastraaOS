import React from 'react';
import { UserPlus, FilePlus, MessageSquare, CreditCard, Calendar } from 'lucide-react';

const QuickActionItem = ({ icon: Icon, label, description, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className="flex flex-col xl:flex-row items-center xl:items-start gap-3 xl:gap-4 p-4 bg-surface rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all group w-full text-center xl:text-left"
    >
        <div className={`p-3 rounded-lg ${colorClass} group-hover:scale-110 transition-transform flex-shrink-0`}>
            <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0">
            <p className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors truncate">{label}</p>
            <p className="text-xs text-text-secondary mt-0.5 truncate hidden sm:block">{description}</p>
        </div>
    </button>
);

const QuickActions = ({ onAction }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <QuickActionItem
                icon={MessageSquare}
                label="Log Inquiry"
                description="Record lead"
                colorClass="bg-emerald-500"
                onClick={() => onAction?.('inquiry')}
            />
            <QuickActionItem
                icon={UserPlus}
                label="New Customer"
                description="Add profile"
                colorClass="bg-blue-500"
                onClick={() => onAction?.('customer')}
            />
            <QuickActionItem
                icon={FilePlus}
                label="Create Order"
                description="New bespoke order"
                colorClass="bg-indigo-500"
                onClick={() => onAction?.('order')}
            />
            <QuickActionItem
                icon={CreditCard}
                label="Record Payment"
                description="Log advance"
                colorClass="bg-amber-500"
                onClick={() => onAction?.('payment')}
            />
            <QuickActionItem
                icon={Calendar}
                label="Book Appt"
                description="Schedule visit"
                colorClass="bg-rose-500"
                onClick={() => onAction?.('appointment')}
            />
        </div>
    );
};

export default QuickActions;
