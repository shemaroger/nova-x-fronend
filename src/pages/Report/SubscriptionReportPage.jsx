import React, { useState, useEffect } from 'react';
import {
    Users,
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
    Phone,
    CreditCard,
    Target,
    Activity,
    UserCheck,
    UserX,
    Zap,
    Pause,
    AlertTriangle
} from 'lucide-react';
import { getSubscription } from '../Service/api';

const SubscriptionReportPage = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [cancelationFilter, setCancelationFilter] = useState('all');

    const [reportConfig, setReportConfig] = useState({
        title: 'Subscription Analysis Report',
        subtitle: 'Comprehensive subscription management analysis',
        logo: null,
        logoPreview: null,
        includeCharts: true,
        includeTable: true,
        includeSummary: true,
        includeRetentionAnalysis: true,
        includePlanBreakdown: true
    });

    const [dateRange, setDateRange] = useState({
        fromDate: '',
        toDate: ''
    });

    const [showReportPreview, setShowReportPreview] = useState(false);
    const statusConfig = {
        'active': {
            color: 'green',
            icon: CheckCircle,
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-200'
        },
        'past_due': {
            color: 'orange',
            icon: AlertCircle,
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            border: 'border-orange-200'
        },
        'unpaid': {
            color: 'red',
            icon: XCircle,
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-200'
        },
        'canceled': {
            color: 'gray',
            icon: UserX,
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            border: 'border-gray-200'
        },
        'incomplete': {
            color: 'yellow',
            icon: Clock,
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-200'
        },
        'incomplete_expired': {
            color: 'red',
            icon: AlertTriangle,
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-200'
        },
        'trialing': {
            color: 'blue',
            icon: Zap,
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-200'
        }
    };

    const currencySymbols = {
        'usd': '$',
        'eur': '€',
        'gbp': '£',
        'cad': 'C$'
    };


    const showToast = (message, type = 'info') => {
        console.log(`${type.toUpperCase()}: ${message}`);
    };

    // Fetch subscriptions from API
    const fetchSubscriptions = async () => {
        setIsLoading(true);
        try {
            const data = await getSubscription();
            console.log('Fetched subscriptions data:', data);
            const subscriptionsArray = data.results || data || [];
            setSubscriptions(subscriptionsArray);
            applyFilters(subscriptionsArray);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            showToast('Failed to load subscriptions', 'error');
            setSubscriptions([]);
            setFilteredSubscriptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // Apply filters
    const applyFilters = (subscriptionsData = subscriptions) => {
        let filtered = subscriptionsData;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(subscription =>
                subscription.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subscription.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subscription.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subscription.stripe_subscription_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(subscription => subscription.status === statusFilter);
        }

        // Plan filter
        if (planFilter !== 'all') {
            filtered = filtered.filter(subscription => subscription.plan?.id?.toString() === planFilter);
        }

        // Cancelation filter
        if (cancelationFilter !== 'all') {
            if (cancelationFilter === 'cancel_at_period_end') {
                filtered = filtered.filter(subscription => subscription.cancel_at_period_end);
            } else if (cancelationFilter === 'canceled') {
                filtered = filtered.filter(subscription => subscription.canceled_at);
            } else if (cancelationFilter === 'active_renewal') {
                filtered = filtered.filter(subscription => !subscription.cancel_at_period_end && !subscription.canceled_at);
            }
        }

        // Date range filter (based on created_at)
        if (dateRange.fromDate && dateRange.toDate) {
            const startDate = new Date(dateRange.fromDate);
            const endDate = new Date(dateRange.toDate);
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter(subscription => {
                const subscriptionDate = new Date(subscription.created_at);
                return subscriptionDate >= startDate && subscriptionDate <= endDate;
            });
        } else if (dateRange.fromDate) {
            const startDate = new Date(dateRange.fromDate);
            filtered = filtered.filter(subscription => new Date(subscription.created_at) >= startDate);
        } else if (dateRange.toDate) {
            const endDate = new Date(dateRange.toDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(subscription => new Date(subscription.created_at) <= endDate);
        }

        setFilteredSubscriptions(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [subscriptions, searchTerm, statusFilter, planFilter, cancelationFilter, dateRange]);

    // Date handlers
    const handleFromDateChange = (date) => {
        setDateRange(prev => ({ ...prev, fromDate: date }));
    };

    const handleToDateChange = (date) => {
        setDateRange(prev => ({ ...prev, toDate: date }));
    };

    const clearDateFilters = () => {
        setDateRange({ fromDate: '', toDate: '' });
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

    const removeLogo = () => {
        setReportConfig(prev => ({
            ...prev,
            logo: null,
            logoPreview: null
        }));
    };

    // Format price with currency
    const formatPrice = (amount, currency = 'usd') => {
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
        const config = statusConfig[status] || statusConfig['incomplete'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.replace('_', ' ')}
            </span>
        );
    };

    // Calculate comprehensive statistics
    const getComprehensiveStats = () => {
        const stats = {
            total: filteredSubscriptions.length,
            active: filteredSubscriptions.filter(s => s.status === 'active').length,
            pastDue: filteredSubscriptions.filter(s => s.status === 'past_due').length,
            unpaid: filteredSubscriptions.filter(s => s.status === 'unpaid').length,
            canceled: filteredSubscriptions.filter(s => s.status === 'canceled').length,
            incomplete: filteredSubscriptions.filter(s => s.status === 'incomplete').length,
            incompleteExpired: filteredSubscriptions.filter(s => s.status === 'incomplete_expired').length,
            trialing: filteredSubscriptions.filter(s => s.status === 'trialing').length,
            cancelAtPeriodEnd: filteredSubscriptions.filter(s => s.cancel_at_period_end).length,
            recentCancellations: filteredSubscriptions.filter(s => s.canceled_at).length
        };

        // Revenue calculations (assuming plan has price field)
        stats.totalMRR = filteredSubscriptions
            .filter(s => s.status === 'active' || s.status === 'trialing')
            .reduce((sum, s) => sum + parseFloat(s.plan?.price || 0), 0);

        stats.pastDueRevenue = filteredSubscriptions
            .filter(s => s.status === 'past_due')
            .reduce((sum, s) => sum + parseFloat(s.plan?.price || 0), 0);

        // Health metrics
        stats.healthySubscriptions = stats.active + stats.trialing;
        stats.atRiskSubscriptions = stats.pastDue + stats.unpaid;
        stats.churnRate = stats.total > 0 ? ((stats.canceled / stats.total) * 100).toFixed(1) : 0;
        stats.activeRate = stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0;
        stats.trialConversionOpportunity = stats.trialing;

        // Period analysis
        const now = new Date();
        stats.expiringThisMonth = filteredSubscriptions.filter(s => {
            if (!s.current_period_end) return false;
            const endDate = new Date(s.current_period_end);
            return endDate.getMonth() === now.getMonth() && endDate.getFullYear() === now.getFullYear();
        }).length;

        return stats;
    };

    // Get unique plans for filter dropdown
    const getUniquePlans = () => {
        const planMap = new Map();
        subscriptions.forEach(subscription => {
            if (subscription.plan) {
                planMap.set(subscription.plan.id, subscription.plan);
            }
        });
        return Array.from(planMap.values());
    };

    // Get subscription trends by date
    const getSubscriptionsByDate = () => {
        const dateGroups = {};
        filteredSubscriptions.forEach(subscription => {
            const date = new Date(subscription.created_at).toLocaleDateString();
            if (!dateGroups[date]) {
                dateGroups[date] = {
                    total: 0,
                    active: 0,
                    canceled: 0,
                    trialing: 0,
                    past_due: 0
                };
            }
            dateGroups[date].total++;
            dateGroups[date][subscription.status]++;
        });

        return Object.entries(dateGroups)
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Get plan breakdown
    const getPlanBreakdown = () => {
        const planGroups = {};
        filteredSubscriptions.forEach(subscription => {
            const planName = subscription.plan?.name || 'No Plan';
            if (!planGroups[planName]) {
                planGroups[planName] = {
                    count: 0,
                    active: 0,
                    canceled: 0,
                    revenue: 0,
                    trialing: 0
                };
            }
            planGroups[planName].count++;
            planGroups[planName][subscription.status]++;
            if (subscription.status === 'active' || subscription.status === 'trialing') {
                planGroups[planName].revenue += parseFloat(subscription.plan?.price || 0);
            }
        });

        return Object.entries(planGroups)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue);
    };

    const generateReport = () => {
        setShowReportPreview(true);
    };

    const printReport = () => {
        window.print();
    };

    const stats = getComprehensiveStats();
    const subscriptionsByDate = getSubscriptionsByDate();
    const planBreakdown = getPlanBreakdown();
    const uniquePlans = getUniquePlans();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading subscription data...</p>
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
                            dateRange.fromDate && dateRange.toDate
                                ? `${dateRange.fromDate} to ${dateRange.toDate}`
                                : dateRange.fromDate
                                    ? `From ${dateRange.fromDate}`
                                    : dateRange.toDate
                                        ? `Until ${dateRange.toDate}`
                                        : 'All Time'
                        }</p>
                        <p>Total Subscriptions: {filteredSubscriptions.length}</p>
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
                                <Users className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Subscriptions</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-600">Active Subscriptions</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Monthly Revenue</p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {formatPrice(stats.totalMRR, 'usd')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <TrendingDown className="w-8 h-8 text-orange-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-orange-600">Churn Rate</p>
                                    <p className="text-2xl font-bold text-orange-900">{stats.churnRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Subscription Status Breakdown</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Active:</span>
                                    <span className="font-medium text-green-600">{stats.active}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Trialing:</span>
                                    <span className="font-medium text-blue-600">{stats.trialing}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Past Due:</span>
                                    <span className="font-medium text-orange-600">{stats.pastDue}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Unpaid:</span>
                                    <span className="font-medium text-red-600">{stats.unpaid}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Canceled:</span>
                                    <span className="font-medium text-gray-600">{stats.canceled}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Incomplete:</span>
                                    <span className="font-medium text-yellow-600">{stats.incomplete}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Key Insights</h3>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li>• {stats.healthySubscriptions} healthy subscriptions ({((stats.healthySubscriptions / stats.total) * 100).toFixed(1)}%)</li>
                                <li>• {stats.atRiskSubscriptions} at-risk subscriptions requiring attention</li>
                                <li>• {stats.cancelAtPeriodEnd} subscriptions set to cancel at period end</li>
                                <li>• {stats.expiringThisMonth} subscriptions expiring this month</li>
                                <li>• {stats.trialConversionOpportunity} trial conversions opportunity</li>
                                <li>• At-risk revenue: {formatPrice(stats.pastDueRevenue, 'usd')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            {reportConfig.includeCharts && subscriptionsByDate.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Trends & Analytics</h2>

                    {/* Daily Trends */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="font-medium text-gray-900 mb-4">Daily Subscription Activity</h3>
                        <div className="space-y-3">
                            {subscriptionsByDate.slice(-10).map((day, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="w-24 text-xs text-gray-600">{day.date}</div>
                                    <div className="flex-1 mx-3">
                                        <div className="flex bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-green-500 h-full"
                                                style={{ width: `${day.total > 0 ? (day.active / day.total) * 100 : 0}%` }}
                                            ></div>
                                            <div
                                                className="bg-blue-500 h-full"
                                                style={{ width: `${day.total > 0 ? (day.trialing / day.total) * 100 : 0}%` }}
                                            ></div>
                                            <div
                                                className="bg-orange-500 h-full"
                                                style={{ width: `${day.total > 0 ? (day.past_due / day.total) * 100 : 0}%` }}
                                            ></div>
                                            <div
                                                className="bg-gray-500 h-full"
                                                style={{ width: `${day.total > 0 ? (day.canceled / day.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="w-12 text-xs text-gray-600 text-right">{day.total}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                                <span>Active</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                                <span>Trialing</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
                                <span>Past Due</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-gray-500 rounded mr-1"></div>
                                <span>Canceled</span>
                            </div>
                        </div>
                    </div>

                    {/* Plan Breakdown */}
                    {reportConfig.includePlanBreakdown && planBreakdown.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="font-medium text-gray-900 mb-4">Plan Performance</h3>
                            <div className="space-y-3">
                                {planBreakdown.map((plan, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{plan.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {plan.count} subscriptions • {plan.active} active • {plan.trialing} trialing
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-green-600">
                                                {formatPrice(plan.revenue, 'usd')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {plan.count > 0 ? (((plan.active + plan.trialing) / plan.count) * 100).toFixed(1) : 0}% healthy
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Details</h2>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Current Period</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Cancellation</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredSubscriptions.slice(0, 50).map((subscription) => (
                                    <tr key={subscription.id}>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {subscription.user?.display_name || subscription.user?.email || 'Unknown'}
                                                </div>
                                                <div className="text-gray-500 text-xs">
                                                    {subscription.user?.email || 'No email'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">
                                                {subscription.plan?.name || 'No Plan'}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {subscription.plan?.price ? formatPrice(subscription.plan.price, 'usd') : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={subscription.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs">
                                                <div className="text-gray-600">
                                                    Start: {formatDate(subscription.current_period_start)}
                                                </div>
                                                <div className="text-gray-600">
                                                    End: {formatDate(subscription.current_period_end)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {subscription.cancel_at_period_end ? (
                                                <span className="text-orange-600 text-xs">Cancel at Period End</span>
                                            ) : subscription.canceled_at ? (
                                                <div className="text-xs">
                                                    <span className="text-red-600">Canceled</span>
                                                    <div className="text-gray-500">{formatDate(subscription.canceled_at)}</div>
                                                </div>
                                            ) : (
                                                <span className="text-green-600 text-xs">Active Renewal</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatDate(subscription.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredSubscriptions.length > 50 && (
                            <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                                Showing first 50 of {filteredSubscriptions.length} records
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Retention Analysis */}
            {reportConfig.includeRetentionAnalysis && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Retention & Risk Analysis</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Healthy Subscriptions */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                <h3 className="font-medium text-green-900">Healthy Subscriptions</h3>
                            </div>
                            <div className="text-2xl font-bold text-green-900 mb-2">{stats.healthySubscriptions}</div>
                            <div className="text-sm text-green-700">
                                {((stats.healthySubscriptions / stats.total) * 100).toFixed(1)}% of total
                            </div>
                            <div className="text-xs text-green-600 mt-2">
                                Active + Trialing subscriptions
                            </div>
                        </div>

                        {/* At-Risk Subscriptions */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                                <h3 className="font-medium text-orange-900">At-Risk Subscriptions</h3>
                            </div>
                            <div className="text-2xl font-bold text-orange-900 mb-2">{stats.atRiskSubscriptions}</div>
                            <div className="text-sm text-orange-700">
                                {stats.total > 0 ? ((stats.atRiskSubscriptions / stats.total) * 100).toFixed(1) : 0}% of total
                            </div>
                            <div className="text-xs text-orange-600 mt-2">
                                Past Due + Unpaid subscriptions
                            </div>
                        </div>

                        {/* Scheduled Cancellations */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <UserX className="w-5 h-5 text-red-600 mr-2" />
                                <h3 className="font-medium text-red-900">Scheduled Cancellations</h3>
                            </div>
                            <div className="text-2xl font-bold text-red-900 mb-2">{stats.cancelAtPeriodEnd}</div>
                            <div className="text-sm text-red-700">
                                {stats.total > 0 ? ((stats.cancelAtPeriodEnd / stats.total) * 100).toFixed(1) : 0}% of total
                            </div>
                            <div className="text-xs text-red-600 mt-2">
                                Will cancel at period end
                            </div>
                        </div>
                    </div>

                    {/* Expiring This Month */}
                    {stats.expiringThisMonth > 0 && (
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                                <div>
                                    <h3 className="font-medium text-yellow-900">Expiring This Month</h3>
                                    <p className="text-sm text-yellow-700">
                                        {stats.expiringThisMonth} subscriptions are expiring this month and may need renewal attention.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Report Footer */}
            <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                <p>This report was generated automatically from subscription data</p>
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
                                    <h1 className="text-3xl font-bold text-gray-900">Subscription Report Generator</h1>
                                    <p className="text-gray-600 mt-2">Create comprehensive subscription management reports</p>
                                </div>
                                <button
                                    onClick={fetchSubscriptions}
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
                                                <span className="ml-2 text-gray-700">Detailed Subscription Table</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reportConfig.includeRetentionAnalysis}
                                                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeRetentionAnalysis: e.target.checked }))}
                                                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Retention & Risk Analysis</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reportConfig.includePlanBreakdown}
                                                    onChange={(e) => setReportConfig(prev => ({ ...prev, includePlanBreakdown: e.target.checked }))}
                                                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Plan Performance Analysis</span>
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
                                            placeholder="Search by user, email, plan..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="past_due">Past Due</option>
                                        <option value="unpaid">Unpaid</option>
                                        <option value="canceled">Canceled</option>
                                        <option value="incomplete">Incomplete</option>
                                        <option value="incomplete_expired">Incomplete Expired</option>
                                        <option value="trialing">Trialing</option>
                                    </select>
                                </div>

                                {/* Plan Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
                                    <select
                                        value={planFilter}
                                        onChange={(e) => setPlanFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <option value="all">All Plans</option>
                                        {uniquePlans.map(plan => (
                                            <option key={plan.id} value={plan.id.toString()}>
                                                {plan.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cancellation Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Status</label>
                                    <select
                                        value={cancelationFilter}
                                        onChange={(e) => setCancelationFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <option value="all">All</option>
                                        <option value="active_renewal">Active Renewal</option>
                                        <option value="cancel_at_period_end">Cancel at Period End</option>
                                        <option value="canceled">Already Canceled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date Range Filters */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">Date Range Filter (Creation Date)</h3>
                                    {(dateRange.fromDate || dateRange.toDate) && (
                                        <button
                                            onClick={clearDateFilters}
                                            className="text-sm text-violet-600 hover:text-violet-800 flex items-center space-x-1"
                                        >
                                            <X className="w-3 h-3" />
                                            <span>Clear dates</span>
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                                        <div className="relative">
                                            <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="date"
                                                value={dateRange.fromDate}
                                                onChange={(e) => handleFromDateChange(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                                        <div className="relative">
                                            <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="date"
                                                value={dateRange.toDate}
                                                onChange={(e) => handleToDateChange(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                                min={dateRange.fromDate}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Date Range Status */}
                                {(dateRange.fromDate || dateRange.toDate) && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                                            <span className="text-sm text-blue-800">
                                                Filtering subscriptions created {
                                                    dateRange.fromDate && dateRange.toDate
                                                        ? `from ${dateRange.fromDate} to ${dateRange.toDate}`
                                                        : dateRange.fromDate
                                                            ? `from ${dateRange.fromDate} onwards`
                                                            : `until ${dateRange.toDate}`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Results Summary */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="text-sm text-gray-500">
                                    <p className="font-medium">{filteredSubscriptions.length} subscriptions found</p>
                                    <p>Monthly Revenue: {formatPrice(stats.totalMRR, 'usd')} • Active Rate: {stats.activeRate}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Current Statistics Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Subscriptions</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalMRR, 'usd')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <TrendingDown className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Churn Rate</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.churnRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Generate Report Button */}
                        <div className="text-center">
                            <button
                                onClick={generateReport}
                                disabled={filteredSubscriptions.length === 0}
                                className="px-8 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
                            >
                                <FileText className="w-5 h-5" />
                                <span>Generate Report</span>
                            </button>
                            {filteredSubscriptions.length === 0 && (
                                <p className="text-sm text-gray-500 mt-2">No subscription data available for the selected filters</p>
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

export default SubscriptionReportPage;