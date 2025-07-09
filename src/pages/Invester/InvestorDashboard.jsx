import React, { useState, useEffect } from 'react';
import {
    User,
    Building,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    Eye,
    Calendar,
    Award,
    Target,
    PieChart,
    BarChart3,
    Briefcase,
    Bell,
    Settings,
    LogOut,
    RefreshCw,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle,
    Clock,
    AlertCircle,
    Star,
    Heart,
    Bookmark,
    MapPin,
    Phone,
    Mail,
    Globe,
    Users,
    FileText,
    Shield,
    CreditCard,
    Package
} from 'lucide-react';

// Import your actual API functions
import { getInvestorUserDetail, getall_sme_active } from '../Service/api';

const InvestorDashboard = () => {
    const [profileData, setProfileData] = useState(null);
    const [smeCompanies, setSmeCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [industryFilter, setIndustryFilter] = useState('');

    // Finance range display mapping
    const financeRangeOptions = {
        'under_100k': 'Under $100,000',
        '100k_500k': '$100,000 - $500,000',
        '500k_1m': '$500,000 - $1 million',
        '1m_5m': '$1 million - $5 million',
        '5m_10m': '$5 million - $10 million',
        'over_10m': 'Over $10 million'
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const userId = localStorage.getItem('user_id') || '1';

            const [profile, companies] = await Promise.all([
                getInvestorUserDetail(userId),
                getall_sme_active()
            ]);

            setProfileData(profile);
            // Handle different response structures
            const companiesData = companies?.results || companies?.sme_profiles || companies || [];
            setSmeCompanies(Array.isArray(companiesData) ? companiesData : []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setProfileData(null);
            setSmeCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    // Calculate basic metrics from available data
    const calculateMetrics = () => {
        return {
            totalCompanies: smeCompanies.length,
            activeCompanies: smeCompanies.filter(company => company.status === 'active').length,
            industries: [...new Set(smeCompanies.map(company => company.industry).filter(Boolean))].length,
            memberSince: profileData?.created_at ? new Date(profileData.created_at).getFullYear() : new Date().getFullYear()
        };
    };

    const metrics = calculateMetrics();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
            active: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredCompanies = smeCompanies.filter(company => {
        const matchesSearch = !searchTerm ||
            company.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.industry?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesIndustry = !industryFilter || company.industry === industryFilter;

        return matchesSearch && matchesIndustry;
    });

    const uniqueIndustries = [...new Set(smeCompanies.map(company => company.industry).filter(Boolean))];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl text-white p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Welcome back, {profileData?.full_name || 'Investor'}!</h2>
                            <p className="text-violet-100 text-lg">
                                Discover investment opportunities and connect with promising SME businesses.
                            </p>
                            <div className="flex items-center mt-4 space-x-4">
                                {getStatusBadge(profileData?.application_status)}
                                <span className="text-violet-100 text-sm">
                                    Investment Range: {financeRangeOptions[profileData?.finance_range] || 'Not specified'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{metrics.totalCompanies}</div>
                            <div className="text-violet-100">Available SMEs</div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Available SMEs</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalCompanies}</p>
                                <p className="text-sm text-gray-500 mt-1">Companies to explore</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <Eye className="w-4 h-4 text-blue-500 mr-1" />
                            <span className="text-sm text-blue-600 font-medium">Explore now</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Companies</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.activeCompanies}</p>
                                <p className="text-sm text-gray-500 mt-1">Currently active</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <Activity className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 font-medium">Ready to invest</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Industries</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.industries}</p>
                                <p className="text-sm text-gray-500 mt-1">Different sectors</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <PieChart className="w-4 h-4 text-purple-500 mr-1" />
                            <span className="text-sm text-purple-600 font-medium">Diversified</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Member Since</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.memberSince}</p>
                                <p className="text-sm text-gray-500 mt-1">Years of experience</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <Calendar className="w-4 h-4 text-orange-500 mr-1" />
                            <span className="text-sm text-orange-600 font-medium">Experienced</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'overview', label: 'Overview', icon: PieChart },
                                { id: 'explore', label: 'Explore SMEs', icon: Building },
                                { id: 'profile', label: 'My Profile', icon: User }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-violet-500 text-violet-600'
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

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Company Overview */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Investment Opportunities</h3>
                            {smeCompanies.length === 0 ? (
                                <div className="text-center py-12">
                                    <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Available</h3>
                                    <p className="text-gray-600">No SME companies are currently available for investment.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {smeCompanies.slice(0, 5).map((company, index) => (
                                        <div key={company.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                                    <Building className="w-5 h-5 text-violet-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{company.business_name || 'Business Name'}</h4>
                                                    <p className="text-sm text-gray-500">{company.industry || 'Industry'} • {company.representative_name || 'Representative'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {getStatusBadge(company.status || 'active')}
                                            </div>
                                        </div>
                                    ))}
                                    {smeCompanies.length > 5 && (
                                        <div className="text-center pt-4">
                                            <button
                                                onClick={() => setActiveTab('explore')}
                                                className="px-4 py-2 text-violet-600 hover:text-violet-700 font-medium"
                                            >
                                                View all {smeCompanies.length} companies →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Investment Profile Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Profile</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Primary Industry</span>
                                        <span className="font-medium">{profileData?.industry || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Investment Range</span>
                                        <span className="font-medium">{financeRangeOptions[profileData?.finance_range] || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status</span>
                                        {getStatusBadge(profileData?.application_status)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Member Since</span>
                                        <span className="font-medium">{formatDate(profileData?.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Capacity</h3>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-violet-600 mb-2">
                                        {financeRangeOptions[profileData?.finance_range] || 'Not specified'}
                                    </div>
                                    <p className="text-gray-600 text-sm">Available investment range</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Available SMEs:</span>
                                        <span className="font-semibold text-blue-600">{metrics.totalCompanies}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Active Companies:</span>
                                        <span className="font-semibold text-green-600">{metrics.activeCompanies}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Industries:</span>
                                        <span className="font-semibold text-purple-600">{metrics.industries}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'investments' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Investment Portfolio</h3>
                        </div>

                        <div className="text-center py-12">
                            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Investment Feature Coming Soon</h3>
                            <p className="text-gray-600 mb-6">Investment tracking and portfolio management will be available in future updates</p>
                            <button
                                onClick={() => setActiveTab('explore')}
                                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                Explore SME Opportunities
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'explore' && (
                    <div className="space-y-6">
                        {/* Search and Filter */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative md:col-span-2">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search companies..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <select
                                        value={industryFilter}
                                        onChange={(e) => setIndustryFilter(e.target.value)}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none bg-white"
                                    >
                                        <option value="">All Industries</option>
                                        {uniqueIndustries.map((industry) => (
                                            <option key={industry} value={industry}>{industry}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SME Companies Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCompanies.map((company) => (
                                <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                    {company.profile_image ? (
                                                        <img
                                                            src={company.profile_image}
                                                            alt={company.business_name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <Building className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{company.business_name || 'Business Name'}</h3>
                                                    <p className="text-sm text-gray-600">{company.industry || 'Industry'}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Heart className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {company.business_description || 'No description available'}
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User className="w-4 h-4 mr-2" />
                                                <span>{company.representative_name || 'Representative not specified'}</span>
                                            </div>
                                            {company.business_email && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    <span className="truncate">{company.business_email}</span>
                                                </div>
                                            )}
                                            {company.contact_phone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    <span>{company.contact_phone}</span>
                                                </div>
                                            )}
                                            {company.commencement_date && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    <span>Since {new Date(company.commencement_date).getFullYear()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center space-x-2">
                                                {getStatusBadge(company.status)}
                                                {company.funding_stage && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                        {company.funding_stage}
                                                    </span>
                                                )}
                                            </div>
                                            <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 transition-colors flex items-center space-x-1">
                                                <Eye className="w-4 h-4" />
                                                <span>View Details</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredCompanies.length === 0 && (
                            <div className="text-center py-12">
                                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm || industryFilter
                                        ? 'Try adjusting your search filters to see more results.'
                                        : 'No SME companies are available at the moment.'
                                    }
                                </p>
                                {(searchTerm || industryFilter) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setIndustryFilter('');
                                        }}
                                        className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Information */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                                <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center space-x-2">
                                    <Settings className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-start space-x-3">
                                            <User className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                                <p className="text-lg font-semibold text-gray-900">{profileData?.full_name || 'Not specified'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Mail className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Email Address</p>
                                                <p className="text-lg font-semibold text-gray-900">{profileData?.email || 'Not specified'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                                                <p className="text-lg font-semibold text-gray-900">{profileData?.contact_phone || 'Not specified'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Industry Focus</p>
                                                <p className="text-lg font-semibold text-gray-900">{profileData?.industry || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Investment Preferences */}
                                <div className="pt-6 border-t border-gray-200">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Investment Preferences</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-start space-x-3">
                                            <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Investment Range</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {financeRangeOptions[profileData?.finance_range] || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Target className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Focus Industry</p>
                                                <p className="text-lg font-semibold text-gray-900">{profileData?.industry || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Status */}
                                <div className="pt-6 border-t border-gray-200">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Account Status</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Application Status</span>
                                            {getStatusBadge(profileData?.application_status)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Terms & Conditions</span>
                                            <span className={`text-sm font-medium ${profileData?.terms_accepted ? 'text-green-600' : 'text-red-600'}`}>
                                                {profileData?.terms_accepted ? '✓ Accepted' : '✗ Not Accepted'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Member Since</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(profileData?.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Sidebar */}
                        <div className="space-y-6">
                            {/* Profile Picture */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                                <div className="w-24 h-24 mx-auto mb-4">
                                    {profileData?.profile_image ? (
                                        <img
                                            src={profileData.profile_image}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <User className="w-12 h-12 text-white" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{profileData?.full_name || 'Investor'}</h3>
                                <p className="text-gray-600 mb-4">Investor • {profileData?.industry || 'Various Industries'}</p>
                                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                    Update Photo
                                </button>
                            </div>

                            {/* Investment Summary */}
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Award className="w-5 h-5 mr-2 text-violet-600" />
                                    Investment Capacity
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Investment Range:</span>
                                        <span className="text-sm font-semibold text-violet-600">
                                            {financeRangeOptions[profileData?.finance_range] || 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Focus Industry:</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {profileData?.industry || 'Various'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available SMEs:</span>
                                        <span className="text-sm font-semibold text-blue-600">
                                            {metrics.totalCompanies}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Account Status:</span>
                                        <span className={`text-sm font-semibold ${profileData?.application_status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {profileData?.application_status?.charAt(0).toUpperCase() + profileData?.application_status?.slice(1) || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setActiveTab('explore')}
                                        className="w-full px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Building className="w-4 h-4" />
                                        <span>Explore SMEs</span>
                                    </button>
                                    <button
                                        onClick={loadDashboardData}
                                        className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Refresh Data</span>
                                    </button>
                                    <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                                        <Shield className="w-4 h-4" />
                                        <span>Update KYC</span>
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

export default InvestorDashboard;
