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
    RefreshCw,
    Download,
    FileText,
    Image as ImageIcon,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Printer,
    Share2,
    Badge,
    Building,
    Mail,
    Phone
} from 'lucide-react';
import { getPayment } from '../Service/api';

const PaymentsReportPage = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [approvalFilter, setApprovalFilter] = useState('all');

    // Report Configuration State
    const [reportConfig, setReportConfig] = useState({
        title: 'Payments Analysis Report',
        subtitle: 'Comprehensive financial transaction analysis',
        logo: null,
        logoPreview: null,
        includeCharts: true,
        includeTable: true,
        includeSummary: true,
        includeUserBreakdown: true
    });

    // Date Range State
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
        preset: 'all'
    });

    // Show report preview
    const [showReportPreview, setShowReportPreview] = useState(false);

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

    // Toast notification function
    const showToast = (message, type = 'info') => {
        console.log(`${type.toUpperCase()}: ${message}`);
    };

    // Fetch payments from API
    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const data = await getPayment();
            console.log('Fetched payments data:', data);
            setPayments(data.results || []);
            applyFilters(data.results || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            showToast('Failed to load payments', 'error');
            setPayments([]);
            setFilteredPayments([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Apply filters
    const applyFilters = (paymentsData = payments) => {
        let filtered = paymentsData;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.user_info?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.user_info?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.stripe_payment_intent_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.Subscription_info?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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

        // Date range filter
        if (dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.created_at);
                return paymentDate >= startDate && paymentDate <= endDate;
            });
        } else if (dateRange.preset !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (dateRange.preset) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    filterDate.setMonth(now.getMonth() - 3);
                    break;
                case 'year':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    break;
            }

            if (dateRange.preset !== 'all') {
                filtered = filtered.filter(payment => new Date(payment.created_at) >= filterDate);
            }
        }

        setFilteredPayments(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [payments, searchTerm, statusFilter, approvalFilter, dateRange]);

    // Handle date preset change
    const handleDatePresetChange = (preset) => {
        setDateRange({
            ...dateRange,
            preset,
            startDate: '',
            endDate: ''
        });
    };

    // Handle custom date range
    const handleCustomDateRange = (startDate, endDate) => {
        setDateRange({
            ...dateRange,
            preset: 'custom',
            startDate,
            endDate
        });
    };

    // Handle logo upload
    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('Logo file size must be less than 2MB', 'error');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setReportConfig(prev => ({
                    ...prev,
                    logo: file,
                    logoPreview: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove logo
    const removeLogo = () => {
        setReportConfig(prev => ({
            ...prev,
            logo: null,
            logoPreview: null
        }));
    };

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

    // Status Badge Component
    const StatusBadge = ({ status }) => {
        const config = statusConfig[status] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </span>
        );
    };

    // Calculate comprehensive statistics
    const getComprehensiveStats = () => {
        const stats = {
            total: filteredPayments.length,
            pending: filteredPayments.filter(p => p.status === 'pending').length,
            requiresAction: filteredPayments.filter(p => p.status === 'requires_action').length,
            succeeded: filteredPayments.filter(p => p.status === 'succeeded').length,
            failed: filteredPayments.filter(p => p.status === 'failed').length,
            canceled: filteredPayments.filter(p => p.status === 'canceled').length,
            requiresApproval: filteredPayments.filter(p => p.requires_approval && !p.approved_by).length,
            approved: filteredPayments.filter(p => p.approved_by).length
        };

        // Revenue calculations
        stats.totalRevenue = filteredPayments
            .filter(p => p.status === 'succeeded')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        stats.pendingRevenue = filteredPayments
            .filter(p => p.status === 'pending' || p.status === 'requires_action')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        stats.averageTransaction = stats.succeeded > 0 ? stats.totalRevenue / stats.succeeded : 0;

        // Success rates
        stats.successRate = stats.total > 0 ? ((stats.succeeded / stats.total) * 100).toFixed(1) : 0;
        stats.failureRate = stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : 0;
        stats.approvalRate = filteredPayments.filter(p => p.requires_approval).length > 0
            ? ((stats.approved / filteredPayments.filter(p => p.requires_approval).length) * 100).toFixed(1)
            : 0;

        return stats;
    };

    // Get payments by date for trends
    const getPaymentsByDate = () => {
        const dateGroups = {};
        filteredPayments.forEach(payment => {
            const date = new Date(payment.created_at).toLocaleDateString();
            if (!dateGroups[date]) {
                dateGroups[date] = {
                    total: 0,
                    succeeded: 0,
                    pending: 0,
                    failed: 0,
                    requires_action: 0,
                    revenue: 0
                };
            }
            dateGroups[date].total++;
            dateGroups[date][payment.status]++;
            if (payment.status === 'succeeded') {
                dateGroups[date].revenue += parseFloat(payment.amount || 0);
            }
        });

        return Object.entries(dateGroups)
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Get subscription breakdown
    const getSubscriptionBreakdown = () => {
        const subscriptionGroups = {};
        filteredPayments.forEach(payment => {
            const subscriptionName = payment.Subscription_info?.name || 'No Subscription';
            if (!subscriptionGroups[subscriptionName]) {
                subscriptionGroups[subscriptionName] = {
                    count: 0,
                    revenue: 0,
                    succeeded: 0,
                    failed: 0
                };
            }
            subscriptionGroups[subscriptionName].count++;
            if (payment.status === 'succeeded') {
                subscriptionGroups[subscriptionName].succeeded++;
                subscriptionGroups[subscriptionName].revenue += parseFloat(payment.amount || 0);
            } else if (payment.status === 'failed') {
                subscriptionGroups[subscriptionName].failed++;
            }
        });

        return Object.entries(subscriptionGroups)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue);
    };

    // Generate and download report
    const generateReport = () => {
        setShowReportPreview(true);
    };



    // Print report
    const printReport = () => {
        window.print();
    };

    const stats = getComprehensiveStats();
    const paymentsByDate = getPaymentsByDate();
    const subscriptionBreakdown = getSubscriptionBreakdown();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payments data...</p>
                </div>
            </div>
        );
    }

    // Report Preview Component
    const ReportPreview = () => (
        <div className="bg-white">
            {/* Report Header */}
            <div className="border-b border-gray-200 pb-6 mb-8">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {reportConfig.logoPreview && (
                            <img
                                src={reportConfig.logoPreview}
                                alt="Company Logo"
                                className="h-16 mb-4 object-contain"
                            />
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {reportConfig.title}
                        </h1>
                        <p className="text-gray-600 mb-4">{reportConfig.subtitle}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        <p>Generated on: {new Date().toLocaleDateString()}</p>
                        <p>Report Period: {
                            dateRange.startDate && dateRange.endDate
                                ? `${dateRange.startDate} to ${dateRange.endDate}`
                                : dateRange.preset === 'all'
                                    ? 'All Time'
                                    : dateRange.preset.charAt(0).toUpperCase() + dateRange.preset.slice(1)
                        }</p>
                        <p>Total Records: {filteredPayments.length}</p>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            {reportConfig.includeSummary && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Payments</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {formatPrice(stats.totalRevenue, 'usd')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Success Rate</p>
                                    <p className="text-2xl font-bold text-purple-900">{stats.successRate}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-orange-600">Pending Approval</p>
                                    <p className="text-2xl font-bold text-orange-900">{stats.requiresApproval}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Payment Status Breakdown</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Succeeded:</span>
                                    <span className="font-medium text-green-600">{stats.succeeded}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Pending:</span>
                                    <span className="font-medium text-yellow-600">{stats.pending}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Requires Action:</span>
                                    <span className="font-medium text-orange-600">{stats.requiresAction}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Failed:</span>
                                    <span className="font-medium text-red-600">{stats.failed}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Canceled:</span>
                                    <span className="font-medium text-gray-600">{stats.canceled}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Key Insights</h3>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li>• Average transaction value: {formatPrice(stats.averageTransaction, 'usd')}</li>
                                <li>• Success rate: {stats.successRate}% indicates {stats.successRate >= 80 ? 'excellent' : stats.successRate >= 60 ? 'good' : 'concerning'} performance</li>
                                <li>• Pending revenue: {formatPrice(stats.pendingRevenue, 'usd')}</li>
                                <li>• Approval rate: {stats.approvalRate}% for payments requiring approval</li>
                                {stats.failed > 0 && <li>• {stats.failed} failed payments require investigation</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            {reportConfig.includeCharts && paymentsByDate.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Trends & Analytics</h2>

                    {/* Daily Trends */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="font-medium text-gray-900 mb-4">Daily Payment Activity</h3>
                        <div className="space-y-3">
                            {paymentsByDate.slice(-10).map((day, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="w-24 text-xs text-gray-600">{day.date}</div>
                                    <div className="flex-1 mx-3">
                                        <div className="flex bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-green-500 h-full"
                                                style={{ width: `${day.total > 0 ? (day.succeeded / day.total) * 100 : 0}%` }}
                                            ></div>
                                            <div
                                                className="bg-yellow-500 h-full"
                                                style={{ width: `${day.total > 0 ? (day.pending / day.total) * 100 : 0}%` }}
                                            ></div>
                                            <div
                                                className="bg-orange-500 h-full"
                                                style={{ width: `${day.total > 0 ? (day.requires_action / day.total) * 100 : 0}%` }}
                                            ></div>
                                            <div
                                                className="bg-red-500 h-full"
                                                style={{ width: `${day.total > 0 ? (day.failed / day.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="w-12 text-xs text-gray-600 text-right">{day.total}</div>
                                    <div className="w-16 text-xs text-gray-600 text-right">
                                        {formatPrice(day.revenue, 'usd')}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                                <span>Succeeded</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                                <span>Pending</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
                                <span>Requires Action</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                                <span>Failed</span>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Breakdown */}
                    {subscriptionBreakdown.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="font-medium text-gray-900 mb-4">Subscription Performance</h3>
                            <div className="space-y-3">
                                {subscriptionBreakdown.map((sub, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{sub.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {sub.count} payments • {sub.succeeded} successful
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-green-600">
                                                {formatPrice(sub.revenue, 'usd')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {sub.count > 0 ? ((sub.succeeded / sub.count) * 100).toFixed(1) : 0}% success
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Detailed Table */}
            {reportConfig.includeTable && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Subscription</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Approval</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPayments.slice(0, 50).map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {payment.user_info?.display_name || 'Unknown'}
                                                </div>
                                                <div className="text-gray-500">
                                                    {payment.user_info?.email || 'No email'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-900">
                                                {formatPrice(payment.amount, payment.currency)}
                                            </div>
                                            <div className="text-gray-500 uppercase text-xs">
                                                {payment.currency}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">
                                            {payment.Subscription_info?.name || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={payment.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            {payment.requires_approval ? (
                                                payment.approved_by ? (
                                                    <span className="text-green-600 text-xs">Approved</span>
                                                ) : (
                                                    <span className="text-orange-600 text-xs">Pending</span>
                                                )
                                            ) : (
                                                <span className="text-gray-500 text-xs">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatDate(payment.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPayments.length > 50 && (
                            <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                                Showing first 50 of {filteredPayments.length} records
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Report Footer */}
            <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                <p>This report was generated automatically from payment transaction data</p>
                <p>Generated on {new Date().toLocaleString()}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {!showReportPreview ? (
                    <>
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Payments Report Generator</h1>
                                    <p className="text-gray-600 mt-2">Create comprehensive financial reports from payment data</p>
                                </div>
                                <button
                                    onClick={fetchPayments}
                                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center space-x-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Refresh Data</span>
                                </button>
                            </div>
                        </div>

                        {/* Report Configuration */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Report Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Title</label>
                                        <input
                                            type="text"
                                            value={reportConfig.title}
                                            onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            placeholder="Enter report title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                                        <input
                                            type="text"
                                            value={reportConfig.subtitle}
                                            onChange={(e) => setReportConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            placeholder="Enter report subtitle"
                                        />
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                                        {!reportConfig.logoPreview ? (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500 mb-2">Upload company logo</p>
                                                <label className="cursor-pointer">
                                                    <span className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-700 transition-colors">
                                                        Choose File
                                                    </span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleLogoUpload}
                                                    />
                                                </label>
                                                <p className="text-xs text-gray-400 mt-1">Max 2MB, PNG/JPG</p>
                                            </div>
                                        ) : (
                                            <div className="border border-gray-300 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <img
                                                        src={reportConfig.logoPreview}
                                                        alt="Logo Preview"
                                                        className="h-12 object-contain"
                                                    />
                                                    <button
                                                        onClick={removeLogo}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Report Options */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Include in Report</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reportConfig.includeSummary}
                                                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeSummary: e.target.checked }))}
                                                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Executive Summary</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reportConfig.includeCharts}
                                                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                                                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Charts and Analytics</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reportConfig.includeTable}
                                                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeTable: e.target.checked }))}
                                                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Detailed Payment Table</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reportConfig.includeUserBreakdown}
                                                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeUserBreakdown: e.target.checked }))}
                                                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">User & Subscription Analysis</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Filters</h2>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by user, email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="requires_action">Requires Action</option>
                                        <option value="succeeded">Succeeded</option>
                                        <option value="failed">Failed</option>
                                        <option value="canceled">Canceled</option>
                                    </select>
                                </div>

                                {/* Date Preset */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                                    <select
                                        value={dateRange.preset}
                                        onChange={(e) => handleDatePresetChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                        <option value="quarter">Last 3 Months</option>
                                        <option value="year">Last Year</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                {/* Results Count */}
                                <div className="flex items-end">
                                    <div className="text-sm text-gray-500">
                                        <p className="font-medium">{filteredPayments.length} payments</p>
                                        <p>Total Value: {formatPrice(stats.totalRevenue, 'usd')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Date Range */}
                            {dateRange.preset === 'custom' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.startDate}
                                            onChange={(e) => handleCustomDateRange(e.target.value, dateRange.endDate)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.endDate}
                                            onChange={(e) => handleCustomDateRange(dateRange.startDate, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Current Statistics Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Payments</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue, 'usd')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Success Rate</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.requiresApproval}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Generate Report Button */}
                        <div className="text-center">
                            <button
                                onClick={generateReport}
                                disabled={filteredPayments.length === 0}
                                className="px-8 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
                            >
                                <FileText className="w-5 h-5" />
                                <span>Generate Report</span>
                            </button>
                            {filteredPayments.length === 0 && (
                                <p className="text-sm text-gray-500 mt-2">No payment data available for the selected filters</p>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Report Preview Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <button
                                onClick={() => setShowReportPreview(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                            >
                                <X className="w-4 h-4" />
                                <span>Back to Configuration</span>
                            </button>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={printReport}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print PDF</span>
                                </button>

                            </div>
                        </div>

                        {/* Report Preview */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-none">
                            <ReportPreview />
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:shadow-none,
                    .print\\:shadow-none * {
                        visibility: visible;
                    }
                    .print\\:shadow-none {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    @page {
                        margin: 1in;
                    }
                }
            `}</style>
        </div>
    );
};

export default PaymentsReportPage;