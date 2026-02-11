import React from 'react';
import { Plus } from 'lucide-react';

const PageHeader = ({
    title,
    subtitle,
    actionLabel,
    onAction,
    icon: Icon
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Icon size={24} />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-text-main tracking-tight">{title}</h1>
                </div>
                {subtitle && (
                    <p className="text-text-secondary mt-1 ml-0 md:ml-12">{subtitle}</p>
                )}
            </div>

            {actionLabel && (
                <button
                    onClick={onAction}
                    className="
                        flex items-center justify-center gap-2 px-5 py-2.5 
                        bg-primary text-white rounded-xl font-semibold 
                        shadow-md shadow-primary/20 hover:bg-primary-hover 
                        active:scale-95 transition-all duration-200
                    "
                >
                    <Plus size={20} />
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default PageHeader;
