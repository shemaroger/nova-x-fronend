
import React, { useState, useEffect } from 'react';
import {
    Users,
    Building,
    CreditCard,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    RefreshCw,
    Calendar,
    Package,
    UserCheck,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Mail,
    Phone,
    FileText,
    Shield,
    Zap,
    Target,
    PieChart,
    BarChart3
} from 'lucide-react';

import { getall_investors, getall_sme, getPayment, getSubscriptionplan, getAllRegistrationLogs } from '../Service/api';
const fetchDashboardData = async () => {
    try {
        const [investors, smes, payments, subscriptions, registrationLogs] = await Promise.all([
            getall_investors(),
            getall_sme(),
            getPayment(),
            getSubscriptionplan(),
            getAllRegistrationLogs()
        ]);
        return {
            investors: investors?.data || investors || [],
            smes: smes?.sme_profiles || smes?.data || smes || [],
            payments: payments?.results || payments?.data || payments || [],
            subscriptions: subscriptions?.results || subscriptions?.data || subscriptions || [],
            registrationLogs: registrationLogs?.results || registrationLogs?.data || registrationLogs || []
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return {
            investors: [],
            smes: [],
            payments: [],
            subscriptions: [],
            registrationLogs: []
        };
    }
};

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        investors: [],
        smes: [],
        payments: [],
        subscriptions: [],
        registrationLogs: []
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Load dashboard data
    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const data = await fetchDashboardData();
            setDashboardData(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Calculate enhanced metrics with safe array operations
    const safeInvestors = Array.isArray(dashboardData.investors) ? dashboardData.investors : [];
    const safeSMEs = Array.isArray(dashboardData.smes) ? dashboardData.smes : [];
    const safePayments = Array.isArray(dashboardData.payments) ? dashboardData.payments : [];
    const safeSubscriptions = Array.isArray(dashboardData.subscriptions) ? dashboardData.subscriptions : [];
    const safeRegistrationLogs = Array.isArray(dashboardData.registrationLogs) ? dashboardData.registrationLogs : [];

    const metrics = {
        // User metrics
        totalUsers: safeInvestors.length + safeSMEs.length,
        totalInvestors: safeInvestors.length,
        totalSMEs: safeSMEs.length,
        pendingInvestors: safeInvestors.filter(inv => inv.application_status === 'pending').length,
        pendingSMEs: safeSMEs.filter(sme => sme.application_status === 'pending').length,
        approvedInvestors: safeInvestors.filter(inv => inv.application_status === 'approved').length,
        approvedSMEs: safeSMEs.filter(sme => sme.application_status === 'approved').length,
        rejectedInvestors: safeInvestors.filter(inv => inv.application_status === 'rejected').length,
        rejectedSMEs: safeSMEs.filter(sme => sme.application_status === 'rejected').length,

        // Payment metrics
        totalPayments: safePayments.length,
        totalRevenue: safePayments
            .filter(payment => payment.status === 'succeeded')
            .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0),
        pendingPayments: safePayments.filter(payment =>
            payment.requires_approval && !payment.approved_by
        ).length,
        succeededPayments: safePayments.filter(payment => payment.status === 'succeeded').length,
        failedPayments: safePayments.filter(payment => payment.status === 'failed').length,
        averagePaymentAmount: safePayments.length > 0 ?
            safePayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) / safePayments.length : 0,

        // Subscription metrics
        totalSubscriptions: safeSubscriptions.length,
        activeSubscriptions: safeSubscriptions.filter(sub => sub.is_active).length,
        inactiveSubscriptions: safeSubscriptions.filter(sub => !sub.is_active).length,

        // Registration metrics
        totalRegistrations: safeRegistrationLogs.length,
        pendingRegistrations: safeRegistrationLogs.filter(log => log.status === 'pending').length,
        completedRegistrations: safeRegistrationLogs.filter(log => log.status === 'completed').length,
        failedRegistrations: safeRegistrationLogs.filter(log => log.status === 'failed').length,

        // Industry analysis
        topIndustries: getTopIndustries(safeInvestors, safeSMEs),

        // Time-based metrics
        todayRegistrations: getTodayCount(safeRegistrationLogs),
        thisWeekRegistrations: getThisWeekCount(safeRegistrationLogs),
        todayPayments: getTodayCount(safePayments),
        thisWeekPayments: getThisWeekCount(safePayments),

        // KYC Status
        investorsWithKYC: safeInvestors.filter(inv => inv.kyc_status === 'verified').length,
        smesWithKYC: safeSMEs.filter(sme => sme.kyc_status === 'verified').length,
    };

    // Helper functions for calculations
    function getTopIndustries(investors, smes) {
        const industries = {};
        [...investors, ...smes].forEach(user => {
            const industry = user.industry || 'Other';
            industries[industry] = (industries[industry] || 0) + 1;
        });
        return Object.entries(industries)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([industry, count]) => ({ industry, count }));
    }

    function getTodayCount(array) {
        const today = new Date().toDateString();
        return array.filter(item => {
            const itemDate = new Date(item.created_at).toDateString();
            return itemDate === today;
        }).length;
    }

    function getThisWeekCount(array) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return array.filter(item => {
            const itemDate = new Date(item.created_at);
            return itemDate >= oneWeekAgo;
        }).length;
    }

    // Recent activity data with safe array operations
    const recentActivity = [
        ...safeInvestors.slice(0, 3).map(inv => ({
            type: 'investor',
            title: `New investor registration`,
            description: inv.full_name || inv.email,
            time: inv.created_at,
            status: inv.application_status,
            icon: Users
        })),
        ...safeSMEs.slice(0, 3).map(sme => ({
            type: 'sme',
            title: `New SME registration`,
            description: sme.business_name || sme.business_email,
            time: sme.created_at,
            status: sme.application_status,
            icon: Building
        })),
        ...safePayments.slice(0, 3).map(payment => ({
            type: 'payment',
            title: `Payment received`,
            description: `${payment.amount} from ${payment.user_email}`,
            time: payment.created_at,
            status: payment.status,
            icon: CreditCard
        }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'approved': return 'text-green-600 bg-green-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'succeeded': return 'text-green-600 bg-green-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className=" border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                Last updated: {formatDate(lastUpdated)}
                            </span>
                            <button
                                onClick={loadDashboardData}
                                disabled={loading}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Users */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900">{metrics.totalUsers}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {metrics.totalInvestors} Investors • {metrics.totalSMEs} SMEs
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 font-medium">+{metrics.thisWeekRegistrations}</span>
                            <span className="text-sm text-gray-500 ml-1">this week</span>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Avg: {formatCurrency(metrics.averagePaymentAmount)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 font-medium">+{metrics.thisWeekPayments}</span>
                            <span className="text-sm text-gray-500 ml-1">payments this week</span>
                        </div>
                    </div>

                    {/* Pending Approvals */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {metrics.pendingInvestors + metrics.pendingSMEs + metrics.pendingPayments}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {metrics.pendingPayments} payments • {metrics.pendingInvestors + metrics.pendingSMEs} users
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-yellow-600 font-medium">Action required</span>
                        </div>
                    </div>

                    {/* Registration Success Rate */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Registration Success</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {metrics.totalRegistrations > 0 ?
                                        Math.round((metrics.completedRegistrations / metrics.totalRegistrations) * 100) : 0}%
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {metrics.completedRegistrations} of {metrics.totalRegistrations} completed
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 font-medium">{metrics.todayRegistrations}</span>
                            <span className="text-sm text-gray-500 ml-1">today</span>
                        </div>
                    </div>
                </div>

                {/* Additional Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* KYC Verification */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">KYC Verified</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {metrics.investorsWithKYC + metrics.smesWithKYC}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {metrics.totalUsers > 0 ?
                                        Math.round(((metrics.investorsWithKYC + metrics.smesWithKYC) / metrics.totalUsers) * 100) : 0}% verified
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    {/* Failed Payments */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Failed Payments</p>
                                <p className="text-3xl font-bold text-gray-900">{metrics.failedPayments}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {metrics.totalPayments > 0 ?
                                        Math.round((metrics.failedPayments / metrics.totalPayments) * 100) : 0}% failure rate
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Subscription Plans */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                                <p className="text-3xl font-bold text-gray-900">{metrics.activeSubscriptions}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {metrics.inactiveSubscriptions} inactive
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-cyan-600" />
                            </div>
                        </div>
                    </div>

                    {/* Top Industry */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Top Industry</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {metrics.topIndustries[0]?.industry || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {metrics.topIndustries[0]?.count || 0} users
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <PieChart className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts and Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* User Status Overview */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">User Status Overview</h3>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Investors */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                                    Investors ({metrics.totalInvestors})
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Approved</span>
                                        <div className="flex items-center">
                                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${metrics.totalInvestors > 0 ? (metrics.approvedInvestors / metrics.totalInvestors) * 100 : 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{metrics.approvedInvestors}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Pending</span>
                                        <div className="flex items-center">
                                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                                <div
                                                    className="bg-yellow-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${metrics.totalInvestors > 0 ? (metrics.pendingInvestors / metrics.totalInvestors) * 100 : 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{metrics.pendingInvestors}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SMEs */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                    <Building className="w-4 h-4 mr-2 text-indigo-600" />
                                    SMEs ({metrics.totalSMEs})
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Approved</span>
                                        <div className="flex items-center">
                                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${metrics.totalSMEs > 0 ? (metrics.approvedSMEs / metrics.totalSMEs) * 100 : 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{metrics.approvedSMEs}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Pending</span>
                                        <div className="flex items-center">
                                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                                <div
                                                    className="bg-yellow-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${metrics.totalSMEs > 0 ? (metrics.pendingSMEs / metrics.totalSMEs) * 100 : 0}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{metrics.pendingSMEs}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                                Payment Status
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{metrics.succeededPayments}</p>
                                    <p className="text-sm text-gray-600">Succeeded</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-600">{metrics.pendingPayments}</p>
                                    <p className="text-sm text-gray-600">Pending</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-600">{metrics.totalPayments}</p>
                                    <p className="text-sm text-gray-600">Total</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            <button className="text-violet-600 hover:text-violet-700 text-sm font-medium">
                                View all
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No recent activity</p>
                                </div>
                            ) : (
                                recentActivity.slice(0, 2).map((activity, index) => {  // 👈 limit to 4
                                    const Icon = activity.icon;
                                    return (
                                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                                                    <Icon className="w-4 h-4 text-violet-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {activity.title}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                                                        {activity.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(activity.time)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>


                        {/* Quick Stats in Activity Panel */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-lg font-bold text-violet-600">{metrics.todayRegistrations}</p>
                                    <p className="text-xs text-gray-500">Today's Registrations</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-green-600">{metrics.todayPayments}</p>
                                    <p className="text-xs text-gray-500">Today's Payments</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <a href='/dashboard/viewusers' className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors group">
                            <div className="flex items-center">
                                <Users className="w-5 h-5 text-violet-600 mr-3" />
                                <span className="text-sm font-medium text-gray-900">View All Users</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600" />
                        </a>

                        <a href='/dashboard/payments-management' className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors group">
                            <div className="flex items-center">
                                <CreditCard className="w-5 h-5 text-violet-600 mr-3" />
                                <span className="text-sm font-medium text-gray-900">Manage Payments</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600" />
                        </a>

                        <a href='/dashboard/subscription-plan' className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors group">
                            <div className="flex items-center">
                                <Package className="w-5 h-5 text-violet-600 mr-3" />
                                <span className="text-sm font-medium text-gray-900">Subscription Plans</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600" />
                        </a>

                        <a href='/dashboard/user-logs' className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors group">
                            <div className="flex items-center">
                                <Activity className="w-5 h-5 text-violet-600 mr-3" />
                                <span className="text-sm font-medium text-gray-900">User Logs</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;