import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Calendar,
    User,
    Building,
    Search,
    Filter,
    ChevronDown,
    Loader,
    RefreshCw,
    Plus,
    Eye,
    Mail,
    Phone,
    X,
    FilterX
} from 'lucide-react';
import { getMyInvestments, updateamountInvestment } from '../Service/api';

// Loading Spinner Component
const LoadingSpinner = ({ message = "Loading investments..." }) => (
    <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-gray-600">{message}</span>
    </div>
);

// View Investment Modal Component
const ViewInvestmentModal = ({ isOpen, onClose, investment }) => {
    if (!isOpen || !investment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Investment Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Investment Overview */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Investment Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 2
                                    }).format(investment.amount || 0)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Investment ID</p>
                                <p className="text-sm font-mono text-gray-900">#{investment.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Investor Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <User className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Investor Details</h3>
                                <p className="text-sm text-gray-600">Investment source</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <p className="text-sm text-gray-900">
                                    {investment.investor_details?.contact_phone || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <p className="text-sm text-gray-900">
                                    {investment.investor_details?.email || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SME Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <Building className="text-green-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">SME Details</h3>
                                <p className="text-sm text-gray-600">Investment recipient</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <p className="text-sm text-gray-900">
                                    {investment.sme_details?.contact_phone || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <p className="text-sm text-gray-900">
                                    {investment.sme_details?.email || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Investment Timeline */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <Calendar className="text-gray-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Timeline</h3>
                                <p className="text-sm text-gray-600">Investment dates</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Created Date
                                </label>
                                <p className="text-sm text-gray-900">
                                    {investment.created_at ? new Date(investment.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Investment Modal Component
const InvestmentModal = ({ isOpen, onClose, selectedUser, onInvestmentCreated }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!amount) {
            setError('Amount must be at least $100');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await updateamountInvestment({
                amount: parseFloat(amount),
                sme: selectedUser.id
            });
            setAmount('');
            onClose();
            // Call the callback to refresh investments
            if (onInvestmentCreated) {
                onInvestmentCreated();
            }
        } catch (err) {
            setError(err.message || 'Failed to create investment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !selectedUser) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Create Investment
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* User Info */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                {selectedUser.user_type === 'sme' ? (
                                    <Building className="text-blue-600" size={20} />
                                ) : (
                                    <User className="text-blue-600" size={20} />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {selectedUser.business_name || selectedUser.email}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {selectedUser.user_type === 'sme' ? 'SME' : 'Investor'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Investment Amount ($)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount (minimum $100)"
                                min="100"
                                step="0.01"
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin mr-2" size={16} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2" size={16} />
                                    Create Investment
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Filter Component
const InvestmentFilters = ({ filters, onFilterChange, investments }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Get unique values for filter options
    const getUniqueValues = (key) => {
        const values = investments
            .map(inv => {
                if (key === 'investor_email') return inv.investor_details?.email;
                if (key === 'sme_email') return inv.sme_details?.email;
                if (key === 'investor_phone') return inv.investor_details?.contact_phone;
                if (key === 'sme_phone') return inv.sme_details?.contact_phone;
                return inv[key];
            })
            .filter(value => value && value.toString().trim() !== '');
        return [...new Set(values)].sort();
    };

    // Get amount ranges
    const getAmountRanges = () => {
        const amounts = investments.map(inv => inv.amount).filter(amount => amount);
        if (amounts.length === 0) return [];

        const min = Math.min(...amounts);
        const max = Math.max(...amounts);

        return [
            { label: 'All Amounts', value: 'all' },
            { label: `$0 - $1,000`, value: '0-1000' },
            { label: `$1,001 - $5,000`, value: '1001-5000' },
            { label: `$5,001 - $10,000`, value: '5001-10000' },
            { label: `$10,001 - $50,000`, value: '10001-50000' },
            { label: `$50,001+`, value: '50001+' }
        ];
    };

    // Get date ranges
    const getDateRanges = () => {
        return [
            { label: 'All Time', value: 'all' },
            { label: 'Last 7 days', value: 'last7days' },
            { label: 'Last 30 days', value: 'last30days' },
            { label: 'Last 3 months', value: 'last3months' },
            { label: 'Last 6 months', value: 'last6months' },
            { label: 'Last year', value: 'lastyear' }
        ];
    };

    const clearAllFilters = () => {
        onFilterChange({
            search: '',
            amountRange: 'all',
            dateRange: 'all',
            investorEmail: 'all',
            smeEmail: 'all',
            sortBy: 'newest'
        });
    };

    const activeFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.amountRange !== 'all') count++;
        if (filters.dateRange !== 'all') count++;
        if (filters.investorEmail !== 'all') count++;
        if (filters.smeEmail !== 'all') count++;
        return count;
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 min-w-64">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search investments..."
                            value={filters.search}
                            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        />
                    </div>
                </div>

                {/* Amount Range Filter */}
                <div className="min-w-40">
                    <select
                        value={filters.amountRange}
                        onChange={(e) => onFilterChange({ ...filters, amountRange: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    >
                        {getAmountRanges().map(range => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort By */}
                <div className="min-w-40">
                    <select
                        value={filters.sortBy}
                        onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount_high">Highest Amount</option>
                        <option value="amount_low">Lowest Amount</option>
                    </select>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    <Filter size={16} className="mr-2" />
                    Advanced
                    <ChevronDown size={16} className={`ml-1 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                {/* Clear Filters */}
                {activeFiltersCount() > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                    >
                        <FilterX size={16} className="mr-2" />
                        Clear ({activeFiltersCount()})
                    </button>
                )}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                            >
                                {getDateRanges().map(range => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Investor Email Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Investor Email
                            </label>
                            <select
                                value={filters.investorEmail}
                                onChange={(e) => onFilterChange({ ...filters, investorEmail: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                            >
                                <option value="all">All Investors</option>
                                {getUniqueValues('investor_email').map(email => (
                                    <option key={email} value={email}>
                                        {email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* SME Email Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SME Email
                            </label>
                            <select
                                value={filters.smeEmail}
                                onChange={(e) => onFilterChange({ ...filters, smeEmail: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                            >
                                <option value="all">All SMEs</option>
                                {getUniqueValues('sme_email').map(email => (
                                    <option key={email} value={email}>
                                        {email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InvestmentPage = () => {
    const [investments, setInvestments] = useState([]);
    const [filteredInvestments, setFilteredInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        amountRange: 'all',
        dateRange: 'all',
        investorEmail: 'all',
        smeEmail: 'all',
        sortBy: 'newest'
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState(null);

    // Fetch investments on component mount
    useEffect(() => {
        fetchInvestments();
    }, []);

    // Apply filters when investments or filters change
    useEffect(() => {
        applyFilters();
    }, [investments, filters]);

    const fetchInvestments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getMyInvestments();
            const investmentData = response.results || response.data || response || [];
            setInvestments(investmentData);
        } catch (err) {
            setError(err.message || 'Failed to load investments');
            setInvestments([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...investments];

        // Apply search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(investment => {
                const investorEmail = investment.investor_details?.email || '';
                const smeEmail = investment.sme_details?.email || '';
                const investorPhone = investment.investor_details?.contact_phone || '';
                const smePhone = investment.sme_details?.contact_phone || '';
                const amount = investment.amount?.toString() || '';
                const id = investment.id?.toString() || '';

                return investorEmail.toLowerCase().includes(searchTerm) ||
                    smeEmail.toLowerCase().includes(searchTerm) ||
                    investorPhone.toLowerCase().includes(searchTerm) ||
                    smePhone.toLowerCase().includes(searchTerm) ||
                    amount.includes(searchTerm) ||
                    id.includes(searchTerm);
            });
        }

        // Apply amount range filter
        if (filters.amountRange !== 'all') {
            filtered = filtered.filter(investment => {
                const amount = investment.amount || 0;
                switch (filters.amountRange) {
                    case '0-1000': return amount <= 1000;
                    case '1001-5000': return amount > 1000 && amount <= 5000;
                    case '5001-10000': return amount > 5000 && amount <= 10000;
                    case '10001-50000': return amount > 10000 && amount <= 50000;
                    case '50001+': return amount > 50000;
                    default: return true;
                }
            });
        }

        // Apply date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date();
            let filterDate = new Date();

            switch (filters.dateRange) {
                case 'last7days':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'last30days':
                    filterDate.setDate(now.getDate() - 30);
                    break;
                case 'last3months':
                    filterDate.setMonth(now.getMonth() - 3);
                    break;
                case 'last6months':
                    filterDate.setMonth(now.getMonth() - 6);
                    break;
                case 'lastyear':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    filterDate = null;
            }

            if (filterDate) {
                filtered = filtered.filter(investment => {
                    const investmentDate = new Date(investment.created_at);
                    return investmentDate >= filterDate;
                });
            }
        }

        // Apply investor email filter
        if (filters.investorEmail !== 'all') {
            filtered = filtered.filter(investment =>
                investment.investor_details?.email === filters.investorEmail
            );
        }

        // Apply SME email filter
        if (filters.smeEmail !== 'all') {
            filtered = filtered.filter(investment =>
                investment.sme_details?.email === filters.smeEmail
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'amount_high':
                    return (b.amount || 0) - (a.amount || 0);
                case 'amount_low':
                    return (a.amount || 0) - (b.amount || 0);
                default:
                    return 0;
            }
        });

        setFilteredInvestments(filtered);
    };

    const handleCreateInvestment = (userData) => {
        console.log('Selected user data:', userData); // Debug log
        if (!userData) {
            console.error('No user data provided');
            return;
        }
        setSelectedUser(userData);
        setIsModalOpen(true);
    };

    const handleViewInvestment = (investment) => {
        setSelectedInvestment(investment);
        setIsViewModalOpen(true);
    };

    // This function will be called after successful investment creation
    const handleInvestmentCreated = async () => {
        // Refresh the investments list
        await fetchInvestments();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
                            <p className="text-gray-600 mt-1">
                                Manage your investment portfolio
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={fetchInvestments}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={16} className="mr-2" />
                                Refresh
                            </button>
                            <div className="text-sm text-gray-500">
                                {filteredInvestments.length} of {investments.length} investment{filteredInvestments.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <InvestmentFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    investments={investments}
                />

                {/* Content */}
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="text-red-600 mb-4">{error}</div>
                        <button
                            onClick={fetchInvestments}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredInvestments.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No investments found
                        </h3>
                        <p className="text-gray-600">
                            {filters.search || filters.amountRange !== 'all' || filters.dateRange !== 'all' || filters.investorEmail !== 'all' || filters.smeEmail !== 'all'
                                ? 'Try adjusting your filters to see more results.'
                                : 'Start by creating your first investment.'}
                        </p>
                    </div>
                ) : (
                    /* Investment Table */
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Investor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SME
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredInvestments.map((investment) => (
                                        <tr key={investment.id} className="hover:bg-gray-50">
                                            {/* Investor */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                        <User className="text-blue-600" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {investment.investor_details?.contact_phone || 'Unknown Investor'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {investment.investor_details?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* SME */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                                        <Building className="text-green-600" size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {investment.sme_details?.contact_phone || 'Unknown SME'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {investment.sme_details?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(investment.amount)}
                                                </div>
                                            </td>

                                            {/* Date Created */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(investment.created_at)}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleCreateInvestment(investment.sme_details || investment.sme)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors mr-2"
                                                >
                                                    <Plus size={14} className="mr-1" />
                                                    Invest
                                                </button>
                                                <button
                                                    onClick={() => handleViewInvestment(investment)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                                                >
                                                    <Eye size={14} className="mr-1" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Investment Modal */}
            <InvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedUser={selectedUser}
                onInvestmentCreated={handleInvestmentCreated}
            />

            {/* View Investment Modal */}
            <ViewInvestmentModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                investment={selectedInvestment}
            />
        </div>
    );
};

export default InvestmentPage;