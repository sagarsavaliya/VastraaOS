import React, { useState, useEffect } from 'react';
import { Package, User, Calendar, CreditCard, CheckCircle, Clock, MapPin, FileText } from 'lucide-react';
import { getOrder } from '../services/orderService';
import Modal from '../../../components/UI/Modal';

const OrderDetailsModal = ({ isOpen, onClose, orderId }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails();
        }
    }, [isOpen, orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const data = await getOrder(orderId);
            setOrder(data.data || data);
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (color) => ({
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`
    });

    const getPriorityStyle = (color) => ({
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={loading ? 'Loading Order...' : `Order ${order?.order_number}`}
            size="xl"
        >
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : order ? (
                    <div className="space-y-6">
                        {/* Status & Priority Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-background-content/50 rounded-xl p-4 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={16} className="text-text-muted" />
                                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Status</span>
                                </div>
                                <span
                                    className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
                                    style={getStatusStyle(order.status?.color || '#6366f1')}
                                >
                                    {order.status?.name || 'N/A'}
                                </span>
                            </div>
                            <div className="bg-background-content/50 rounded-xl p-4 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock size={16} className="text-text-muted" />
                                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Priority</span>
                                </div>
                                <span
                                    className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
                                    style={getPriorityStyle(order.priority?.color || '#64748b')}
                                >
                                    {order.priority?.name || 'N/A'}
                                </span>
                            </div>
                            <div className="bg-background-content/50 rounded-xl p-4 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={16} className="text-text-muted" />
                                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Order Date</span>
                                </div>
                                <p className="text-sm font-semibold text-text-main">{order.order_date || 'N/A'}</p>
                            </div>
                            <div className="bg-background-content/50 rounded-xl p-4 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin size={16} className="text-text-muted" />
                                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Delivery Date</span>
                                </div>
                                <p className="text-sm font-semibold text-text-main">{order.promised_delivery_date || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-background-content/50 rounded-xl p-6 border border-border">
                            <div className="flex items-center gap-2 mb-4">
                                <User size={18} className="text-primary" />
                                <h3 className="text-lg font-bold text-text-main">Customer Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-text-muted mb-1">Name</p>
                                    <p className="text-sm font-medium text-text-main">{order.customer?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted mb-1">Mobile</p>
                                    <p className="text-sm font-medium text-text-main">{order.customer?.mobile || 'N/A'}</p>
                                </div>
                                {order.customer?.email && (
                                    <div className="">
                                        <p className="text-xs text-text-muted mb-1">Email</p>
                                        <p className="text-sm font-medium text-text-main">{order.customer.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-background-content/50 rounded-xl p-6 border border-border">
                            <div className="flex items-center gap-2 mb-4">
                                <Package size={18} className="text-primary" />
                                <h3 className="text-lg font-bold text-text-main">Order Items</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                        <div key={item.id || index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-text-main">
                                                    {item.item_type?.name || item.item_name || `Item ${index + 1}`}
                                                </p>
                                                {item.description && (
                                                    <p className="text-xs text-text-muted mt-1">{item.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                                                <p className="text-sm font-bold text-text-main">₹{item.total_price?.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    )))
                                    :
                                    (
                                        <p className="text-sm text-text-muted text-center py-4">No items found</p>
                                    )
                                }
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-background-content/50 rounded-xl p-6 border border-border">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard size={18} className="text-primary" />
                                <h3 className="text-lg font-bold text-text-main">Payment Summary</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-text-muted">Subtotal</span>
                                    <span className="text-sm font-medium text-text-main">₹{order.subtotal?.toLocaleString('en-IN')}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-text-muted">Discount</span>
                                        <span className="text-sm font-medium text-error">-₹{order.discount_amount?.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                {order.tax_amount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-text-muted">Tax</span>
                                        <span className="text-sm font-medium text-text-main">₹{order.tax_amount?.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="border-t border-border pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-bold text-text-main">Total Amount</span>
                                        <span className="text-xl font-bold text-primary">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                                {order.payment_summary && (
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                                        <div>
                                            <p className="text-xs text-text-muted mb-1">Paid Amount</p>
                                            <p className="text-sm font-bold text-success">₹{order.payment_summary.paid_amount?.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-text-muted mb-1">Pending Amount</p>
                                            <p className="text-sm font-bold text-warning">₹{order.payment_summary.pending_amount?.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Special Instructions */}
                        {order.special_instructions && (
                            <div className="bg-background-content/50 rounded-xl p-6 border border-border">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={18} className="text-primary" />
                                    <h3 className="text-lg font-bold text-text-main">Special Instructions</h3>
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed">{order.special_instructions}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-text-muted">Order not found</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default OrderDetailsModal;
