import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Check,
    X,
    Clock,
    DollarSign,
    User,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    Filter,
    Search,
    ChevronDown,
    RefreshCw,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Info,
    Download,
    Mail,
    Phone,
    Badge
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getPayment, approvePayment, createNotification } from '../Service/api';

const PaymentsManagementPage = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [approvalFilter, setApprovalFilter] = useState('all');

    // Status configuration
    const statusConfig = {
        'pending': {
            color: 'yellow',
            icon: Clock,
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-200'
        },
        'requires_action': {
            color: 'orange',
            icon: AlertCircle,
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            border: 'border-orange-200'
        },
        'succeeded': {
            color: 'green',
            icon: CheckCircle,
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-200'
        },
        'failed': {
            color: 'red',
            icon: XCircle,
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-200'
        },
        'canceled': {
            color: 'gray',
            icon: XCircle,
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            border: 'border-gray-200'
        }
    };

    // Currency symbols mapping
    const currencySymbols = {
        'usd': '$',
        'eur': '€',
        'gbp': '£',
        'cad': 'C$'
    };

    // Fetch payments from API
    const fetchPayments = async () => {
        setIsLoading(true);
        try {

            const data = await getPayment();
            console.log('Fetched payments data:', data);

            // Handle different response structures
            let paymentsData = [];
            if (Array.isArray(data)) {
                paymentsData = data;
            } else if (data?.results && Array.isArray(data.results)) {
                paymentsData = data.results;
            } else if (data?.data && Array.isArray(data.data)) {
                paymentsData = data.data;
            }

            setPayments(paymentsData);
            setFilteredPayments(paymentsData);
            console.log('Fetched payments:', paymentsData);

        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
            setPayments([]);
            setFilteredPayments([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load payments on component mount
    useEffect(() => {
        fetchPayments();
    }, []);

    // Filter payments based on search and filters
    useEffect(() => {
        let filtered = payments;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.stripe_payment_intent_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.subscription?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(payment => payment.status === statusFilter);
        }

        // Approval filter
        if (approvalFilter !== 'all') {
            if (approvalFilter === 'requires_approval') {
                filtered = filtered.filter(payment => payment.requires_approval && !payment.approved_by);
            } else if (approvalFilter === 'approved') {
                filtered = filtered.filter(payment => payment.approved_by);
            } else if (approvalFilter === 'not_approved') {
                filtered = filtered.filter(payment => payment.requires_approval && !payment.approved_by);
            }
        }

        setFilteredPayments(filtered);
    }, [payments, searchTerm, statusFilter, approvalFilter]);

    // Format price with currency
    const formatPrice = (amount, currency) => {
        const symbol = currencySymbols[currency] || '$';
        return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle payment approval/rejection
    const handlePaymentAction = async (payment, action) => {
        setIsProcessing(true);

        try {

            console.log("Payment action:", payment.user)

            await createNotification({
                user: payment.user,
                message: `The payment request submitted by the user has been ${action}d by the administrator. Please review the changes if necessary.`,

            });
            await await approvePayment(payment.id);


            toast.success(`Payment ${action}d successfully!`);
            await fetchPayments();

            // Close modal if open
            setShowModal(false);
            setSelectedPayment(null);

        } catch (error) {
            console.error(`Error ${action}ing payment:`, error);
            toast.error(error.message || `Failed to ${action} payment`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle view payment details
    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    // Payment Status Badge Component
    const StatusBadge = ({ status }) => {
        const config = statusConfig[status] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border`}>
                <Icon className="w-4 h-4 mr-1" />
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    // Payment Details Modal
    const PaymentDetailsModal = ({ payment, isOpen, onClose }) => {
        if (!isOpen || !payment) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-opacity-50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Header */}
                        <div className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-3xl font-bold text-gray-900">Payment Details</h2>
                                <StatusBadge status={payment.status} />
                            </div>
                            <p className="text-gray-600">Payment ID: {payment.id}</p>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Payment Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* User Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                        <User className="w-6 h-6 mr-2 text-blue-500" />
                                        User Information
                                    </h3>
                                    <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">User ID</label>
                                            <p className="font-mono text-lg">{payment.user}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                                            <p className="text-lg">{payment.user_info.contact_phone} </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Email</label>
                                            <p className="text-lg">{payment.user_email}</p>
                                        </div>
                                        {payment.user?.username && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Username</label>
                                                <p className="text-lg">{payment.user?.username}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                        <CreditCard className="w-6 h-6 mr-2 text-green-500" />
                                        Payment Information
                                    </h3>
                                    <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Amount</label>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatPrice(payment.amount, payment.currency)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Stripe Payment Intent ID</label>
                                            <p className="font-mono text-sm bg-gray-200 p-2 rounded">
                                                {payment.stripe_payment_intent_id}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Currency</label>
                                            <p className="text-lg uppercase">{payment.currency}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Status</label>
                                            <div className="mt-1">
                                                <StatusBadge status={payment.status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subscription Information */}
                            {payment.subscription && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                        <Badge className="w-6 h-6 mr-2 text-purple-500" />
                                        Subscription Details
                                    </h3>
                                    <div className="p-6 bg-purple-50 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-purple-700">Plan Name</label>
                                                <p className="text-lg font-semibold">{payment.subscription_name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-purple-700">Duration</label>
                                                <p className="text-lg">{payment.Subscription_info.duration?.replace('_', ' ')}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-purple-700">Plan Price</label>
                                                <p className="text-lg font-semibold">
                                                    {formatPrice(payment.Subscription_info.price, payment.subscription.currency)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Approval Information */}
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <CheckCircle className="w-6 h-6 mr-2 text-indigo-500" />
                                    Approval Status
                                </h3>
                                <div className="p-6 bg-indigo-50 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-indigo-700">Requires Approval</label>
                                            <p className="text-lg font-semibold">
                                                {payment.requires_approval ? 'Yes' : 'No'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-indigo-700">Created Date</label>
                                            <p className="text-lg">
                                                <p className="text-lg">
                                                    {payment.approval_date ? formatDate(payment.created_at) : 'N/A'}
                                                </p>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-indigo-700">Approval Date</label>
                                            <p className="text-lg">
                                                {payment.approval_date ? formatDate(payment.approval_date) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="w-6 h-6 mr-2 text-gray-500" />
                                    Timeline
                                </h3>
                                <div className="p-6 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Created At</label>
                                            <p className="text-lg">{formatDate(payment.created_at)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                            <p className="text-lg">{formatDate(payment.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {payment.status === 'requires_action' && payment.requires_approval && !payment.approved_by && (
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handlePaymentAction(payment, 'approve')}
                                        disabled={isProcessing}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {isProcessing ? (
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <ThumbsUp className="w-5 h-5" />
                                        )}
                                        <span>Approve Payment</span>
                                    </button>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Payments Management</h1>
                    <p className="text-gray-600">Manage and review all payment transactions</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search payments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="requires_action">Requires Action</option>
                                <option value="succeeded">Succeeded</option>
                                <option value="failed">Failed</option>
                                <option value="canceled">Canceled</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>

                        {/* Approval Filter */}
                        <div className="relative">
                            <select
                                value={approvalFilter}
                                onChange={(e) => setApprovalFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="all">All Approvals</option>
                                <option value="requires_approval">Needs Approval</option>
                                <option value="approved">Approved</option>
                                <option value="not_approved">Not Approved</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchPayments}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredPayments.length === 0 ? (
                        <div className="text-center py-16">
                            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Payments Found</h3>
                            <p className="text-gray-600">No payments match your current filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subscription
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Approval
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <User className="h-6 w-6 text-gray-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {payment.user?.first_name} {payment.user?.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {payment.user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {formatPrice(payment.amount, payment.currency)}
                                                </div>
                                                <div className="text-sm text-gray-500 uppercase">
                                                    {payment.currency}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.subscription?.name || 'N/A'}
                                                </div>
                                                {payment.subscription?.duration && (
                                                    <div className="text-sm text-gray-500">
                                                        {payment.subscription.duration.replace('_', ' ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={payment.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {payment.requires_approval ? (
                                                    payment.approved_by ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            Pending
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(payment.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center space-x-2 justify-end">
                                                    <button
                                                        onClick={() => handleViewPayment(payment.id)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>

                                                    {payment.status === 'requires_action' && payment.requires_approval && !payment.approved_by && (
                                                        <>
                                                            <button
                                                                onClick={() => handlePaymentAction(payment, 'approve')}
                                                                disabled={isProcessing}
                                                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                                                                title="Approve Payment"
                                                            >
                                                                <ThumbsUp className="w-5 h-5" />
                                                            </button>

                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Payments</dt>
                                    <dd className="text-lg font-medium text-gray-900">{payments.length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {payments.filter(p => p.requires_approval && !p.approved_by).length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Succeeded</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {payments.filter(p => p.status === 'succeeded').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {formatPrice(
                                            payments
                                                .filter(p => p.status === 'succeeded')
                                                .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                                            'usd'
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Details Modal */}
            <PaymentDetailsModal
                payment={selectedPayment}
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedPayment(null);
                }}
            />
        </div>
    );
};

export default PaymentsManagementPage;