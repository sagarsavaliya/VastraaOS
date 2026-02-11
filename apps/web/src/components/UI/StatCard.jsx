import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, loading = false }) => {
    if (loading) {
        return (
            <div className="bg-surface rounded-2xl border border-border p-4 overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="h-3.5 bg-background-content rounded w-1/2 mb-3 animate-shimmer"></div>
                        <div className="h-7 bg-background-content rounded w-3/4 mb-1.5 animate-shimmer"></div>
                    </div>
                    <div className="w-10 h-10 bg-background-content rounded-xl animate-shimmer"></div>
                </div>
                <div className="h-2.5 bg-background-content rounded w-1/3 animate-shimmer"></div>
            </div>
        );
    }

    return (
        <div className="group bg-surface rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-secondary mb-1 truncate">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-xl xl:text-2xl font-bold text-text-main group-hover:text-primary transition-colors">
                            {value}
                        </h3>
                        {trend && (
                            <div className="flex items-center gap-0.5 mb-1">
                                {trend.direction === 'up' ? (
                                    <TrendingUp size={14} className="text-success" />
                                ) : (
                                    <TrendingDown size={14} className="text-error" />
                                )}
                                <span className={`text-xs font-bold ${trend.direction === 'up' ? 'text-success' : 'text-error'}`}>
                                    {trend.value}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                {Icon && (
                    <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Icon size={20} className="text-primary" />
                    </div>
                )}
            </div>

            {subtitle && (
                <div className="flex items-center gap-2">
                    <p className="text-sm text-text-muted">{subtitle}</p>
                </div>
            )}
        </div>
    );
};

export default StatCard;
