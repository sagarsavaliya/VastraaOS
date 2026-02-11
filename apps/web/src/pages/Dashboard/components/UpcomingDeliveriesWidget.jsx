import React from 'react';
import { Truck, Clock, AlertTriangle } from 'lucide-react';

const UpcomingDeliveriesWidget = ({ deliveries = [], loading = false }) => {
    if (loading) {
        return (
            <div className="bg-surface rounded-2xl border border-border p-6">
                <div className="h-6 bg-background-content rounded w-1/2 mb-6"></div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-background-content rounded mb-3 animate-shimmer"></div>
                ))}
            </div>
        );
    }

    if (!deliveries || deliveries.length === 0) {
        return (
            <div className="bg-surface rounded-2xl border border-border p-12 text-center">
                <Truck size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
                <p className="text-text-secondary">No upcoming deliveries</p>
            </div>
        );
    }

    const getDaysColor = (days) => {
        if (days < 1) return 'text-error';
        if (days <= 3) return 'text-warning';
        return 'text-success';
    };

    const getDaysBgColor = (days) => {
        if (days < 1) return 'bg-error/10';
        if (days <= 3) return 'bg-warning/10';
        return 'bg-success/10';
    };

    return (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-3 border-b border-border">
                <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
                    <Truck size={20} />
                    Upcoming Deliveries
                </h3>
            </div>

            <div className="p-4 space-y-3 max-h-[700px] overflow-y-auto">
                {deliveries.map((delivery) => (
                    <div
                        key={delivery.id}
                        className="p-4 bg-background-content rounded-xl hover:bg-surface-hover transition-colors border border-border group"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                                    {delivery.order_number}
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                    {delivery.customer_name}
                                </p>
                                {delivery.customer_mobile && (
                                    <p className="text-xs text-text-muted mt-0.5">
                                        {delivery.customer_mobile}
                                    </p>
                                )}
                            </div>

                            <div className={`px-3 py-1 rounded-lg ${getDaysBgColor(delivery.days_remaining)}`}>
                                <div className="flex items-center gap-1">
                                    <Clock size={14} className={getDaysColor(delivery.days_remaining)} />
                                    <span className={`text-xs font-semibold ${getDaysColor(delivery.days_remaining)}`}>
                                        {delivery.days_remaining === 0 ? 'Today' :
                                            delivery.days_remaining === 1 ? 'Tomorrow' :
                                                `${delivery.days_remaining} days`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-muted">Delivery:</span>
                                <span className="text-xs font-medium text-text-main">
                                    {delivery.promised_delivery_date}
                                </span>
                            </div>

                            {delivery.priority && (
                                <span
                                    className="px-2 py-0.5 text-xs font-medium rounded"
                                    style={{
                                        backgroundColor: `${delivery.priority_color || '#64748b'}20`,
                                        color: delivery.priority_color || '#64748b'
                                    }}
                                >
                                    {delivery.priority}
                                </span>
                            )}
                        </div>

                        {delivery.days_remaining < 1 && (
                            <div className="mt-2 flex items-center gap-1 text-error">
                                <AlertTriangle size={12} />
                                <span className="text-xs font-medium">Overdue</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingDeliveriesWidget;
