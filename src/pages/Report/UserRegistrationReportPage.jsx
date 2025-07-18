import React, { useState, useEffect } from 'react';
import {
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Monitor,
    Globe,
    Calendar,
    Filter,
    Search,
    Eye,
    RefreshCw,
    Download,
    Users,
    Activity,
    TrendingUp,
    AlertTriangle,
    FileText,
    Image as ImageIcon,
    Plus,
    X,
    BarChart3,
    PieChart,
    TrendingDown,
    FileImage,
    Printer,
    Share2
} from 'lucide-react';
import { getAllRegistrationLogs } from '../Service/api';

const UserRegistrationReportPage = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    // Report Configuration State
    const [reportConfig, setReportConfig] = useState({
        title: 'User Registration Report',
        subtitle: 'Comprehensive analysis of user registration activities',
        logo: null,
        logoPreview: null,
        includeCharts: true,
        includeTable: true,
        includeSummary: true
    });
    // Date Range State
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
        preset: 'all'
    });
    // Show report preview
    const [showReportPreview, setShowReportPreview] = useState(false);
    // Toast notification function
    const showToast = (message, type = 'info') => {
        console.log(`${type.toUpperCase()}: ${message}`);
    };

    // Fetch registration logs
    const fetchRegistrationLogs = async () => {
        setLoading(true);
        try {
            const response = await getAllRegistrationLogs();
            setLogs(response);
            applyFilters(response);
        } catch (error) {
            console.error('Error fetching registration logs:', error);
            showToast('Failed to load registration logs. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrationLogs();
    }, []);

    // Apply filters
    const applyFilters = (logsData = logs) => {
        let filtered = logsData;
        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(log => log.status === statusFilter);
        }
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.user_details?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.user_agent?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        // Filter by date range
        if (dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date
            filtered = filtered.filter(log => {
                const logDate = new Date(log.created_at);
                return logDate >= startDate && logDate <= endDate;
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
                filtered = filtered.filter(log => new Date(log.created_at) >= filterDate);
            }
        }
        setFilteredLogs(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [logs, searchTerm, statusFilter, dateRange]);

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
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
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

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: Clock,
                label: 'Pending'
            },
            completed: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: CheckCircle,
                label: 'Completed'
            },
            failed: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: XCircle,
                label: 'Failed'
            }
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </span>
        );
    };

    // Calculate statistics
    const getStats = () => {
        const stats = {
            total: filteredLogs.length,
            pending: filteredLogs.filter(log => log.status === 'pending').length,
            completed: filteredLogs.filter(log => log.status === 'completed').length,
            failed: filteredLogs.filter(log => log.status === 'failed').length
        };
        stats.completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;
        stats.failureRate = stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : 0;
        return stats;
    };

    // Get registrations by date
    const getRegistrationsByDate = () => {
        const dateGroups = {};
        filteredLogs.forEach(log => {
            const date = new Date(log.created_at).toLocaleDateString();
            if (!dateGroups[date]) {
                dateGroups[date] = { total: 0, completed: 0, pending: 0, failed: 0 };
            }
            dateGroups[date].total++;
            dateGroups[date][log.status]++;
        });
        return Object.entries(dateGroups)
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Generate and download report
    const generateReport = () => {
        setShowReportPreview(true);
    };

    // Export report as PDF (placeholder function)
    const exportToPDF = () => {
        showToast('PDF export functionality would be implemented with a PDF library', 'info');
    };

    // Print report
    const printReport = () => {
        window.print();
    };

    const stats = getStats();
    const registrationsByDate = getRegistrationsByDate();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading registration data...</p>
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
                    </div>
                </div>
            </div>
            {/* Executive Summary */}
            {reportConfig.includeSummary && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Users className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Registrations</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-600">Completed</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                                    <p className="text-xs text-green-600">{stats.completionRate}% success rate</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <XCircle className="w-8 h-8 text-red-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-red-600">Failed</p>
                                    <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
                                    <p className="text-xs text-red-600">{stats.failureRate}% failure rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Key Insights</h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Total of {stats.total} registration attempts in the selected period</li>
                            <li>• {stats.completionRate}% completion rate indicates {stats.completionRate >= 80 ? 'excellent' : stats.completionRate >= 60 ? 'good' : 'concerning'} registration performance</li>
                            <li>• {stats.pending} registrations are still pending email verification</li>
                            {stats.failed > 0 && <li>• {stats.failed} failed registrations may require investigation</li>}
                        </ul>
                    </div>
                </div>
            )}
            {/* Charts Section */}
            {reportConfig.includeCharts && registrationsByDate.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Trends</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="font-medium text-gray-900 mb-4">Daily Registration Activity</h3>
                        <div className="space-y-3">
                            {registrationsByDate.slice(-10).map((day, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="w-20 text-xs text-gray-600">{day.date}</div>
                                    <div className="flex-1 mx-3">
                                        <div className="flex bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-green-500 h-full"
                                                style={{ width: `${(day.completed / day.total) * 100}%` }}
                                            ></div>
                                            <div
                                                className="bg-yellow-500 h-full"
                                                style={{ width: `${(day.pending / day.total) * 100}%` }}
                                            ></div>
                                            <div
                                                className="bg-red-500 h-full"
                                                style={{ width: `${(day.failed / day.total) * 100}%` }}
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
                                <span>Completed</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                                <span>Pending</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                                <span>Failed</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Detailed Table */}
            {reportConfig.includeTable && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Details</h2>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">IP Address</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLogs.slice(0, 50).map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-3 text-gray-900">
                                            {log.user_details?.email || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(log.status)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {log.ip_address || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatDate(log.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredLogs.length > 50 && (
                            <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                                Showing first 50 of {filteredLogs.length} records
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Report Footer */}
            <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                <p>This report was generated automatically from user registration logs</p>
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
                                    <h1 className="text-3xl font-bold text-gray-900">Registration Report Generator</h1>
                                    <p className="text-gray-600 mt-2">Create comprehensive reports from registration data</p>
                                </div>
                                <button
                                    onClick={fetchRegistrationLogs}
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
                                                <span className="ml-2 text-sm text-gray-700">Charts and Trends</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reportConfig.includeTable}
                                                    onChange={(e) => setReportConfig(prev => ({ ...prev, includeTable: e.target.checked }))}
                                                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Detailed Table</span>
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
                                            placeholder="Search by email, IP..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                        />
                                    </div>
                                </div>
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
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
                                        <p className="font-medium">{filteredLogs.length} records</p>
                                        <p>matching filters</p>
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
                        {/* Current Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Registrations</p>
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
                                        <p className="text-sm font-medium text-gray-500">Completed</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                                        <p className="text-xs text-green-600">{stats.completionRate}% rate</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Pending</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Failed</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                                        <p className="text-xs text-red-600">{stats.failureRate}% rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Generate Report Button */}
                        <div className="text-center">
                            <button
                                onClick={generateReport}
                                disabled={filteredLogs.length === 0}
                                className="px-8 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
                            >
                                <FileText className="w-5 h-5" />
                                <span>Generate Report</span>
                            </button>
                            {filteredLogs.length === 0 && (
                                <p className="text-sm text-gray-500 mt-2">No data available for the selected filters</p>
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
                                    <span>Export PDF </span>
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

export default UserRegistrationReportPage;
