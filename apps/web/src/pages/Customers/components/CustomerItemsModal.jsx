import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Calendar, ArrowRight, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../../components/UI/Toast';
import { getCustomerOrders } from '../services/customerService';
import { ModernButton } from '../../../components/UI/CustomInputs';

const CustomerItemsModal = ({ customer, setFooter }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (customer) {
            fetchOrders();
        } else {
            setOrders([]);
        }
    }, [customer]);

    useEffect(() => {
        if (setFooter) {
            setFooter(null); // Orders modal usually doesn't need footer actions besides close
        }
    }, [setFooter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getCustomerOrders(customer.id);
            // Handle both { data: [...] } and directly [...]
            const ordersList = data?.data || data || [];
            setOrders(Array.isArray(ordersList) ? ordersList : []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            showToast('Failed to load order history', 'error');
            setOrders([]); // Reset on error
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'text-success bg-success/10 border-success/20';
            case 'cancelled': return 'text-error bg-error/10 border-error/20';
            case 'processing': return 'text-primary bg-primary/10 border-primary/20';
            default: return 'text-text-muted bg-surface border-border';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return CheckCircle;
            case 'cancelled': return AlertCircle;
            case 'processing': return Clock;
            default: return Package;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
                <p className="text-text-muted font-medium">Loading orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-text-muted/50">
                <ShoppingBag size={64} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">No orders found for this customer</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-1">
            {orders.map(order => {
                const StatusIcon = getStatusIcon(order.status?.name);
                return (
                    <div key={order.id} className="bg-surface border border-border/50 rounded-2xl p-5 hover:border-secondary/30 transition-all hover:shadow-sm group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                            {/* Order Info */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-background-content/50 border border-border/50 text-text-muted">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-lg font-black text-text-main tracking-tight">
                                            {order.order_number}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${getStatusColor(order.status?.name)}`}>
                                            <StatusIcon size={10} />
                                            {order.status?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-text-muted">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} />
                                            Ordered: {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            Due: {order.promised_delivery_date ? new Date(order.promised_delivery_date).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Items & Amount */}
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Total Amount</div>
                                    <div className="text-xl font-black text-text-main">
                                        ₹{parseFloat(order.total_amount || 0).toLocaleString()}
                                    </div>
                                </div>

                                <div className="hidden md:block w-px h-10 bg-border/50"></div>

                                <div className="text-right hidden md:block border-r border-border/50 pr-8">
                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Items</div>
                                    <div className="text-sm font-bold text-text-main">
                                        {order.items?.length || 0} items
                                    </div>
                                </div>

                                <ModernButton
                                    variant="secondary"
                                    size="sm"
                                    icon={ArrowRight}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    View Details
                                </ModernButton>
                            </div>
                        </div>

                        {/* Items Preview */}
                        {order.items && order.items.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border/30 flex gap-2 overflow-x-auto pb-2">
                                {order.items.map((item, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-background-content/50 rounded-lg text-xs font-medium text-text-secondary whitespace-nowrap border border-border/30">
                                        {item.quantity}x {item.item_type?.name || 'Item'}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CustomerItemsModal;
