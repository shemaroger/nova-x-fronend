
import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    TrendingUp,
    CreditCard,
    Check,
    X,
    Clock,
    DollarSign,
    Mail,
    Phone,
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
    User,
    FileText,
    Award,
    Globe,
    Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getall_investors, getall_sme, getPayment } from '../Service/api';
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [smeProfiles, setSmeProfiles] = useState([]);
    const [investorProfiles, setInvestorProfiles] = useState([]);
    const [payments, setPayments] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    // Currency symbols mapping
    const currencySymbols = {
        'usd': '$',
        'eur': '€',
        'gbp': '£',
        'cad': 'C$'
    };
    // Status configuration
    const statusConfig = {
        'pending': {
            color: 'yellow',
            icon: Clock,
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-200'
        },
        'approved': {
            color: 'green',
            icon: CheckCircle,
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-200'
        },
        'rejected': {
            color: 'red',
            icon: XCircle,
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-200'
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
    // Fetch SME profiles
    const fetchSMEProfiles = async () => {
        try {
            const response = await getall_sme();
            let usersList = [];
            if (Array.isArray(response?.sme_profiles)) {
                usersList = response.sme_profiles;
            } else if (response?.sme_profiles) {
                usersList = response.sme_profiles;
            } else {
                console.warn('Unexpected SME response format:', response);
            }
            setSmeProfiles(usersList);
            return usersList;
        } catch (err) {
            console.error('Error fetching SME profiles:', err);
            toast.error('Failed to load SME profiles');
            setSmeProfiles([]);
            return [];
        }
    };
    // Fetch Investor profiles
    const fetchInvestorProfiles = async () => {
        try {
            const response = await getall_investors();
            let usersList = [];
            if (Array.isArray(response?.data)) {
                usersList = response.data;
            } else if (response?.users) {
                usersList = response.users;
            } else {
                console.warn('Unexpected Investor response format:', response);
            }
            setInvestorProfiles(usersList);
            return usersList;
        } catch (err) {
            console.error('Error fetching investor profiles:', err);
            toast.error('Failed to load investor profiles');
            setInvestorProfiles([]);
            return [];
        }
    };
    // Fetch payments
    const fetchPayments = async () => {
        try {
            const data = await getPayment();
            console.log('Fetched payments data:', data);
            let paymentsData = [];
            if (Array.isArray(data)) {
                paymentsData = data;
            } else if (data?.results && Array.isArray(data.results)) {
                paymentsData = data.results;
            } else if (data?.data && Array.isArray(data.data)) {
                paymentsData = data.data;
            }
            setPayments(paymentsData);
            return paymentsData;
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
            setPayments([]);
            return [];
        }
    };
    // Fetch all data
    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchSMEProfiles(),
                fetchInvestorProfiles(),
                fetchPayments()
            ]);
        } finally {
            setIsLoading(false);
        }
    };
    // Load data on component mount
    useEffect(() => {
        fetchAllData();
    }, []);
    // Filter data based on active tab, search, and status
    useEffect(() => {
        let data = [];

        if (activeTab === 'sme') {
            data = smeProfiles;
        } else if (activeTab === 'investors') {
            data = investorProfiles;
        } else if (activeTab === 'payments') {
            data = payments;
        }
        // Apply search filter
        if (searchTerm) {
            data = data.filter(item => {
                if (activeTab === 'sme') {
                    return item.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.representative_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.business_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.industry?.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (activeTab === 'investors') {
                    return item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.industry?.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (activeTab === 'payments') {
                    return item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.stripe_payment_intent_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.subscription?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                }
                return false;
            });
        }
        // Apply status filter
        if (statusFilter !== 'all') {
            data = data.filter(item => {
                if (activeTab === 'payments') {
                    return item.status === statusFilter;
                } else {
                    return item.application_status === statusFilter;
                }
            });
        }
        setFilteredData(data);
    }, [activeTab, smeProfiles, investorProfiles, payments, searchTerm, statusFilter]);
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
    // Handle approve/reject actions
    const handleAction = async (itemId, action, type) => {
        setIsProcessing(true);

        try {
            let endpoint = '';
            if (type === 'sme') {
                endpoint = `/api/sme-profiles/${itemId}/${action}/`;
            } else if (type === 'investor') {
                endpoint = `/api/investor-profiles/${itemId}/${action}/`;
            } else if (type === 'payment') {
                endpoint = `/api/payments/${itemId}/${action}/`;
            }
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${action} ${type}`);
            }
            toast.success(`${type.toUpperCase()} ${action}d successfully!`);

            // Refresh data
            await fetchAllData();

            // Close modal if open
            setShowModal(false);
            setSelectedItem(null);
        } catch (error) {
            console.error(`Error ${action}ing ${type}:`, error);
            toast.error(error.message || `Failed to ${action} ${type}`);
        } finally {
            setIsProcessing(false);
        }
    };
    // Status Badge Component
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
    // Summary cards data
    const getSummaryData = () => {
        return {
            totalSME: smeProfiles.length,
            pendingSME: smeProfiles.filter(p => p.application_status === 'pending').length,
            totalInvestors: investorProfiles.length,
            pendingInvestors: investorProfiles.filter(p => p.application_status === 'pending').length,
            totalPayments: payments.length,
            pendingPayments: payments.filter(p => p.status === 'requires_action' && p.requires_approval).length,
            totalRevenue: payments
                .filter(p => p.status === 'succeeded')
                .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
        };
    };
    const summaryData = getSummaryData();
    // Tab configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'sme', label: 'SME Profiles', icon: Building2 },
        { id: 'investors', label: 'Investors', icon: Users },
        { id: 'payments', label: 'Payments', icon: CreditCard }
    ];
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage SME profiles, investors, and payments</p>
                </div>
                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setSearchTerm('');
                                            setStatusFilter('all');
                                        }}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">SME Profiles</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">{summaryData.totalSME}</div>
                                                <div className="ml-2 flex items-baseline text-sm font-semibold text-orange-600">
                                                    {summaryData.pendingSME} pending
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Investors</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">{summaryData.totalInvestors}</div>
                                                <div className="ml-2 flex items-baseline text-sm font-semibold text-orange-600">
                                                    {summaryData.pendingInvestors} pending
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Payments</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">{summaryData.totalPayments}</div>
                                                <div className="ml-2 flex items-baseline text-sm font-semibold text-orange-600">
                                                    {summaryData.pendingPayments} pending
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-yellow-600" />
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                            <dd className="text-2xl font-semibold text-gray-900">
                                                {formatPrice(summaryData.totalRevenue, 'usd')}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setActiveTab('sme')}
                                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                                >
                                    <Building2 className="w-6 h-6 text-blue-600 mb-2" />
                                    <div className="font-medium text-gray-900">Review SME Applications</div>
                                    <div className="text-sm text-gray-600">{summaryData.pendingSME} pending applications</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('investors')}
                                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                                >
                                    <Users className="w-6 h-6 text-green-600 mb-2" />
                                    <div className="font-medium text-gray-900">Review Investor Applications</div>
                                    <div className="text-sm text-gray-600">{summaryData.pendingInvestors} pending applications</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('payments')}
                                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                                >
                                    <CreditCard className="w-6 h-6 text-purple-600 mb-2" />
                                    <div className="font-medium text-gray-900">Manage Payments</div>
                                    <div className="text-sm text-gray-600">{summaryData.pendingPayments} pending approvals</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Data Tables */}
                {activeTab !== 'overview' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${activeTab}...`}
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
                                        {activeTab === 'payments' ? (
                                            <>
                                                <option value="pending">Pending</option>
                                                <option value="requires_action">Requires Action</option>
                                                <option value="succeeded">Succeeded</option>
                                                <option value="failed">Failed</option>
                                                <option value="canceled">Canceled</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </>
                                        )}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                </div>
                                {/* Refresh Button */}
                                <button
                                    onClick={fetchAllData}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>
                        {/* Data Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {filteredData.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 text-gray-400 mx-auto mb-6">
                                        {activeTab === 'sme' && <Building2 className="w-16 h-16" />}
                                        {activeTab === 'investors' && <Users className="w-16 h-16" />}
                                        {activeTab === 'payments' && <CreditCard className="w-16 h-16" />}
                                    </div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Data Found</h3>
                                    <p className="text-gray-600">No {activeTab} match your current filters.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {activeTab === 'sme' && (
                                                    <>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Representative</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </>
                                                )}
                                                {activeTab === 'investors' && (
                                                    <>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investor</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finance Range</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </>
                                                )}
                                                {activeTab === 'payments' && (
                                                    <>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredData.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    {activeTab === 'sme' && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{item.business_name}</div>
                                                                    <div className="text-sm text-gray-500">{item.business_email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{item.representative_name}</div>
                                                                    <div className="text-sm text-gray-500">{item.position}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.industry}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <StatusBadge status={item.application_status} />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center space-x-2 justify-end">
                                                                    <button
                                                                        onClick={() => { setSelectedItem(item); setShowModal(true); }}
                                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    {item.application_status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleAction(item.id, 'approve', 'sme')}
                                                                                disabled={isProcessing}
                                                                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                <Check className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleAction(item.id, 'reject', 'sme')}
                                                                                disabled={isProcessing}
                                                                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                    {activeTab === 'investors' && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{item.full_name}</div>
                                                                    <div className="text-sm text-gray-500">{item.email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.industry}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {item.get_finance_range_display || item.finance_range}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <StatusBadge status={item.application_status} />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center space-x-2 justify-end">
                                                                    <button
                                                                        onClick={() => { setSelectedItem(item); setShowModal(true); }}
                                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    {item.application_status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleAction(item.id, 'approve', 'investor')}
                                                                                disabled={isProcessing}
                                                                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                <Check className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleAction(item.id, 'reject', 'investor')}
                                                                                disabled={isProcessing}
                                                                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                    {activeTab === 'payments' && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{item.user?.email || 'N/A'}</div>
                                                                    <div className="text-sm text-gray-500">{item.stripe_payment_intent_id}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatPrice(item.amount, item.currency)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {item.subscription?.name || 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <StatusBadge status={item.status} />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center space-x-2 justify-end">
                                                                    <button
                                                                        onClick={() => { setSelectedItem(item); setShowModal(true); }}
                                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    {item.status === 'requires_action' && item.requires_approval && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleAction(item.id, 'approve', 'payment')}
                                                                                disabled={isProcessing}
                                                                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                <ThumbsUp className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleAction(item.id, 'reject', 'payment')}
                                                                                disabled={isProcessing}
                                                                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                <ThumbsDown className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Modal */}
                {showModal && selectedItem && (
                    <div className="fixed inset-0 overflow-y-auto z-50">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                            {activeTab === 'sme' && <Building2 className="h-6 w-6 text-blue-600" />}
                                            {activeTab === 'investors' && <Users className="h-6 w-6 text-blue-600" />}
                                            {activeTab === 'payments' && <CreditCard className="h-6 w-6 text-blue-600" />}
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                {activeTab === 'sme' && 'SME Profile Details'}
                                                {activeTab === 'investors' && 'Investor Profile Details'}
                                                {activeTab === 'payments' && 'Payment Details'}
                                            </h3>
                                            <div className="space-y-4">
                                                {activeTab === 'sme' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-500">Business Information</h4>
                                                            <p className="text-sm text-gray-900 mt-1">
                                                                <strong>Name:</strong> {selectedItem.business_name}<br />
                                                                <strong>Email:</strong> {selectedItem.business_email}<br />
                                                                <strong>Phone:</strong> {selectedItem.contact_phone}<br />
                                                                <strong>Industry:</strong> {selectedItem.industry}<br />
                                                                <strong>Commencement Date:</strong> {formatDate(selectedItem.commencement_date)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-500">Representative Information</h4>
                                                            <p className="text-sm text-gray-900 mt-1">
                                                                <strong>Name:</strong> {selectedItem.representative_name}<br />
                                                                <strong>Position:</strong> {selectedItem.position}<br />
                                                                <strong>Email:</strong> {selectedItem.representative_email || 'N/A'}<br />
                                                                <strong>Phone:</strong> {selectedItem.representative_phone || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <h4 className="text-sm font-medium text-gray-500">Additional Information</h4>
                                                            <p className="text-sm text-gray-900 mt-1">
                                                                <strong>Status:</strong> <StatusBadge status={selectedItem.application_status} /><br />
                                                                <strong>Created At:</strong> {formatDate(selectedItem.created_at)}<br />
                                                                <strong>Updated At:</strong> {formatDate(selectedItem.updated_at)}
                                                            </p>
                                                            {selectedItem.application_status === 'rejected' && (
                                                                <p className="text-sm text-gray-900 mt-1">
                                                                    <strong>Rejection Reason:</strong> {selectedItem.rejection_reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {activeTab === 'investors' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-500">Investor Information</h4>
                                                            <p className="text-sm text-gray-900 mt-1">
                                                                <strong>Name:</strong> {selectedItem.full_name}<br />
                                                                <strong>Email:</strong> {selectedItem.email}<br />
                                                                <strong>Phone:</strong> {selectedItem.contact_phone}<br />
                                                                <strong>Industry:</strong> {selectedItem.industry}<br />
                                                                <strong>Finance Range:</strong> {selectedItem.get_finance_range_display || selectedItem.finance_range}
                                                            </p>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <h4 className="text-sm font-medium text-gray-500">Additional Information</h4>
                                                            <p className="text-sm text-gray-900 mt-1">
                                                                <strong>Status:</strong> <StatusBadge status={selectedItem.application_status} /><br />
                                                                <strong>Created At:</strong> {formatDate(selectedItem.created_at)}<br />
                                                                <strong>Updated At:</strong> {formatDate(selectedItem.updated_at)}
                                                            </p>
                                                            {selectedItem.application_status === 'rejected' && (
                                                                <p className="text-sm text-gray-900 mt-1">
                                                                    <strong>Rejection Reason:</strong> {selectedItem.rejection_reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {activeTab === 'payments' && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-500">Payment Information</h4>
                                                            <p className="text-sm text-gray-900 mt-1">
                                                                <strong>User:</strong> {selectedItem.user?.email || 'N/A'}<br />
                                                                <strong>Amount:</strong> {formatPrice(selectedItem.amount, selectedItem.currency)}<br />
                                                                <strong>Subscription:</strong> {selectedItem.subscription?.name || 'N/A'}<br />
                                                                <strong>Payment ID:</strong> {selectedItem.stripe_payment_intent_id}<br />
                                                                <strong>Status:</strong> <StatusBadge status={selectedItem.status} />
                                                            </p>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <h4 className="text-sm font-medium text-gray-500">Additional Information</h4>
                                                            <p className="text-sm text-gray-900 mt-1">
                                                                <strong>Created At:</strong> {formatDate(selectedItem.created_at)}<br />
                                                                <strong>Updated At:</strong> {formatDate(selectedItem.updated_at)}
                                                            </p>
                                                            {selectedItem.status === 'failed' && (
                                                                <p className="text-sm text-gray-900 mt-1">
                                                                    <strong>Failure Reason:</strong> {selectedItem.failure_reason || 'N/A'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
