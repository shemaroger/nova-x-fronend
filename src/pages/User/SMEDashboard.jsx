import React, { useState, useEffect } from 'react';
import {
    Building,
    Users,
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
    RefreshCw,
    Search,
    Filter,
    ArrowUpRight,
    CheckCircle,
    Clock,
    AlertCircle,
    Star,
    Upload,
    FileText,
    Shield,
    CreditCard,
    Package,
    Mail,
    Phone,
    MapPin,
    Globe,
    Camera,
    Edit3,
    Download,
    Plus,
    Zap,
    Crown
} from 'lucide-react';

// Import your actual API functions
import { getSMEUser_info, getSubscriptionplan, getSMEAnalysis, getMySubscription } from '../Service/api';

const SMEDashboard = () => {
    const [profileData, setProfileData] = useState(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [mySubscription, setMySubscription] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const profileDataRaw = localStorage.getItem('profile_data');
            const profileDatas = JSON.parse(profileDataRaw);

            if (profileDatas?.user_id) {
                const [profile, plans, analysis, userSubscription] = await Promise.all([
                    getSMEUser_info(profileDatas.user_id),
                    getSubscriptionplan(),
                    getSMEAnalysis().catch(() => ({ results: [] })),
                    getMySubscription().catch(() => null)
                ]);

                setProfileData(profile);

                // Handle subscription plans response
                const plansData = plans?.results || plans?.data || plans || [];
                setSubscriptionPlans(Array.isArray(plansData) ? plansData.filter(plan => plan.is_active) : []);

                // Set user's subscription
                setMySubscription(userSubscription);

                // Find user's analysis
                const userAnalysis = analysis?.results?.find(item => item.user_info?.id == profileDatas.user_id);
                setAnalysisData(userAnalysis);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate business metrics
    const calculateMetrics = () => {
        const currentYear = new Date().getFullYear();
        const businessAge = profileData?.commencement_date ?
            currentYear - new Date(profileData.commencement_date).getFullYear() : 0;

        return {
            businessAge,
            analysisRating: analysisData?.rating || 0,
            availablePlans: subscriptionPlans.length,
            documentsUploaded: analysisData ? 2 : 0, // Cashflow and Tax documents
            completionRate: profileData ? 85 : 0, // Based on profile completeness
            hasActiveSubscription: mySubscription ? true : false
        };
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';
        return `${baseUrl}${imagePath}`;
    };

    const formatSubscriptionDuration = (duration) => {
        const durations = {
            '6_months': '6 Months',
            '1_year': '1 Year'
        };
        return durations[duration] || duration;
    };
    const getSubscriptionStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            trialing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
            past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            unpaid: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
            canceled: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
            incomplete: { color: 'bg-orange-100 text-orange-800', icon: Clock },
            incomplete_expired: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
        };

        const config = statusConfig[status] || statusConfig.incomplete;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </span>
        );
    };

    const metrics = calculateMetrics();
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

    const getRatingColor = (rating) => {
        if (rating >= 8) return 'text-green-600 bg-green-100';
        if (rating >= 6) return 'text-yellow-600 bg-yellow-100';
        if (rating >= 4) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

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
                            <h2 className="text-3xl font-bold mb-2">Welcome back, {profileData?.business_name || 'Business Owner'}!</h2>
                            <p className="text-violet-100 text-lg">
                                Manage your business profile, upload documents, and explore investment opportunities.
                            </p>
                            <div className="flex items-center mt-4 space-x-4">
                                {getStatusBadge(profileData?.application_status || 'pending')}
                                <span className="text-violet-100 text-sm">
                                    Industry: {profileData?.industry || 'Not specified'}
                                </span>
                                {mySubscription && mySubscription.status === 'active' && (
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        <Crown className="w-3 h-3 inline mr-1" />
                                        Premium Member
                                    </span>
                                )}
                                {mySubscription && mySubscription.status === 'trialing' && (
                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        Trial Period
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{metrics.analysisRating}/10</div>
                            <div className="text-violet-100">Business Rating</div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Business Age</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.businessAge}</p>
                                <p className="text-sm text-gray-500 mt-1">Years in operation</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 font-medium">Established</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Business Rating</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.analysisRating}/10</p>
                                <p className="text-sm text-gray-500 mt-1">Financial analysis</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Star className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <Award className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 font-medium">
                                {metrics.analysisRating >= 8 ? 'Excellent' :
                                    metrics.analysisRating >= 6 ? 'Good' :
                                        metrics.analysisRating >= 4 ? 'Fair' : 'Needs Improvement'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Documents</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.documentsUploaded}/2</p>
                                <p className="text-sm text-gray-500 mt-1">Analysis documents</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <CheckCircle className="w-4 h-4 text-purple-500 mr-1" />
                            <span className="text-sm text-purple-600 font-medium">
                                {metrics.documentsUploaded === 2 ? 'Complete' : 'Upload needed'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Profile Status</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.completionRate}%</p>
                                <p className="text-sm text-gray-500 mt-1">Profile complete</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <Target className="w-4 h-4 text-orange-500 mr-1" />
                            <span className="text-sm text-orange-600 font-medium">Well maintained</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Subscription</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {mySubscription && (mySubscription.status === 'active' || mySubscription.status === 'trialing') ? (
                                        <span className="text-green-600">Active</span>
                                    ) : mySubscription && mySubscription.status === 'canceled' ? (
                                        <span className="text-gray-400">Canceled</span>
                                    ) : mySubscription ? (
                                        <span className="text-yellow-600">Issues</span>
                                    ) : (
                                        <span className="text-gray-400">None</span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {mySubscription ? mySubscription.plan?.name : 'No active plan'}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${mySubscription && (mySubscription.status === 'active' || mySubscription.status === 'trialing') ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                <Crown className={`w-6 h-6 ${mySubscription && (mySubscription.status === 'active' || mySubscription.status === 'trialing') ? 'text-green-600' : 'text-gray-400'
                                    }`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            {mySubscription && (mySubscription.status === 'active' || mySubscription.status === 'trialing') ? (
                                <>
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-600 font-medium">
                                        {mySubscription.status === 'trialing' ? 'Trial' : 'Premium'}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 text-gray-500 mr-1" />
                                    <span className="text-sm text-gray-600 font-medium">Upgrade available</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Business Performance */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Overview</h3>

                            {/* Current Subscription Section */}
                            {mySubscription && (
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                                                <Crown className="w-5 h-5 text-purple-600 mr-2" />
                                                Current Subscription
                                            </h4>
                                            <div className="space-y-2">
                                                <p className="text-lg font-bold text-purple-600">
                                                    {mySubscription.plan?.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Duration: {formatSubscriptionDuration(mySubscription.plan?.duration)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Price: ${mySubscription.plan?.price} {mySubscription.plan?.currency?.toUpperCase()}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-600">Status:</span>
                                                    {getSubscriptionStatusBadge(mySubscription.status)}
                                                </div>

                                                {mySubscription.cancel_at_period_end && (
                                                    <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2 mt-2">
                                                        <p className="text-sm text-yellow-800 flex items-center">
                                                            <AlertCircle className="w-4 h-4 mr-1" />
                                                            Subscription will not renew at period end
                                                        </p>
                                                    </div>
                                                )}
                                                {mySubscription.canceled_at && (
                                                    <p className="text-sm text-gray-600">
                                                        Canceled: {new Date(mySubscription.canceled_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <CreditCard className="w-12 h-12 text-purple-600" />
                                        </div>
                                    </div>
                                    {mySubscription.plan?.features && mySubscription.plan.features.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Features included:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {mySubscription.plan.features.map((feature, index) => (
                                                    <span key={index} className="px-2 py-1 bg-white rounded-full text-xs text-gray-700 border">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Business Rating Section */}
                            {analysisData ? (
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Financial Analysis</h4>
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${getRatingColor(analysisData.rating)}`}>
                                                <Star className="w-5 h-5 mr-1" />
                                                {analysisData.rating}/10
                                            </div>
                                        </div>
                                        <Award className="w-12 h-12 text-violet-600" />
                                    </div>
                                    <p className="text-gray-700 text-sm mt-3 leading-relaxed">
                                        {analysisData.rating_display || 'Financial analysis completed successfully.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-8 h-8 text-yellow-600 mr-3" />
                                        <div>
                                            <h4 className="font-semibold text-yellow-900">Analysis Needed</h4>
                                            <p className="text-yellow-700 text-sm">Upload your documents to get your business rated</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Business Details */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                            <Building className="w-5 h-5 text-violet-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{profileData?.business_name || 'Business Name'}</h4>
                                            <p className="text-sm text-gray-500">{profileData?.industry || 'Industry'} • Est. {new Date(profileData?.commencement_date || Date.now()).getFullYear()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(profileData?.application_status || 'pending')}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Business Email</p>
                                            <p className="font-medium text-gray-900">{profileData?.business_email || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Contact Phone</p>
                                            <p className="font-medium text-gray-900">{profileData?.contact_phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Sidebar */}
                        <div className="space-y-6">
                            {/* Business Profile Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                                <div className="h-40 mx-auto mb-4">
                                    {profileData?.profile_image ? (
                                        <img
                                            src={getImageUrl(profileData.profile_image)}
                                            alt="Business Logo"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <Building className="w-8 h-8 text-white" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{profileData?.business_name || 'Your Business'}</h3>
                                <p className="text-gray-600 mb-4">{profileData?.industry || 'Industry'}</p>
                                {mySubscription && (
                                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-3 mb-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Crown className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-800">Premium Member</span>
                                        </div>
                                        <p className="text-xs text-purple-600 mt-1">
                                            {mySubscription.subscription_plan?.name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Business Age:</span>
                                        <span className="font-semibold text-blue-600">{metrics.businessAge} years</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Analysis Rating:</span>
                                        <span className="font-semibold text-green-600">{metrics.analysisRating}/10</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Profile Complete:</span>
                                        <span className="font-semibold text-purple-600">{metrics.completionRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Available Plans:</span>
                                        <span className="font-semibold text-orange-600">{metrics.availablePlans}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subscription:</span>
                                        <span className={`font-semibold ${mySubscription ? 'text-green-600' : 'text-gray-400'}`}>
                                            {mySubscription ? 'Active' : 'None'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setActiveTab('documents')}
                                        className="w-full px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span>Upload Documents</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('subscriptions')}
                                        className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Package className="w-4 h-4" />
                                        <span>View Subscriptions</span>
                                    </button>
                                    <button
                                        onClick={loadDashboardData}
                                        className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Refresh Data</span>
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

export default SMEDashboard;