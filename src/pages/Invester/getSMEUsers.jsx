import React, { useState, useEffect } from 'react';
import {
    Building,
    Phone,
    Mail,
    Calendar,
    User,
    Briefcase,
    Search,
    Filter,
    X,
    Eye,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader,
    ChevronDown,
    DollarSign,
    TrendingUp,
    Plus,
    MessageCircle
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSMEUser_info, getall_sme_active, createInvestment, createOrGetChatRoom } from '../Service/api';
const StatusBadge = ({ status }) => {
    const statusConfig = {
        active: {
            color: 'bg-green-100 text-green-800',
            icon: CheckCircle,
            label: 'Active'
        },
        pending: {
            color: 'bg-yellow-100 text-yellow-800',
            icon: Clock,
            label: 'Pending'
        },
        inactive: {
            color: 'bg-red-100 text-red-800',
            icon: AlertCircle,
            label: 'Inactive'
        }
    };

    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <IconComponent size={12} className="mr-1" />
            {config.label}
        </span>
    );
};

// Chat Button Component
const ChatButton = ({ user, onChatOpen }) => {
    const handleStartChat = async () => {
        try {
            const chatRoom = await createOrGetChatRoom(user.id);

            // If you have a callback to open chat interface
            if (onChatOpen) {
                onChatOpen(chatRoom);

                // Or redirect to chat page
                window.location.href = `/dashboard/chat?room=${chatRoom.id}`;
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error('Failed to start chat. Please try again.');
        }
    };

    return (
        <button
            onClick={handleStartChat}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            title={`Start chat with ${user.business_name || user.email}`}
        >
            <MessageCircle size={14} className="mr-1" />
            Chat
        </button>
    );
};

const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-gray-600">{message}</span>
    </div>
);

const InvestmentModal = ({ smeDetail, isOpen, onClose, onInvestmentSubmit }) => {
    const [formData, setFormData] = useState({
        amount: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});



    const handleSubmit = async (e) => {
        e.preventDefault();


        setLoading(true);
        try {
            const investmentData = {
                ...formData,
                amount: parseFloat(formData.amount),
                sme: smeDetail.user_id
            };


            console.log('investmentData', investmentData)
            await onInvestmentSubmit(investmentData);

            // Reset form
            setFormData({
                amount: '',
            });

            toast.success('Investment proposal submitted successfully!');
            onClose();
        } catch (error) {
            console.error('Error submitting investment:', error);
            toast.info(error.message || 'Failed to submit investment proposal');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };


    if (!isOpen || !smeDetail) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <DollarSign className="text-green-600 mr-2" size={24} />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Invest in {smeDetail.business_name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Business Summary */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {smeDetail.profile_image ? (
                                    <img
                                        src={
                                            smeDetail.profile_image.startsWith('http')
                                                ? smeDetail.profile_image
                                                : `http://localhost:8000${smeDetail.profile_image}`
                                        }
                                        alt={`${smeDetail.business_name} logo`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="text-gray-400 w-8 h-8 m-4" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {smeDetail.business_name}
                                </h3>
                                <p className="text-gray-600">{smeDetail.industry}</p>
                            </div>
                        </div>
                    </div>

                    {/* Investment Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">


                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Investment Amount ($)
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="Enter amount (minimum $10)"
                                    min="100"
                                    step="0.01"
                                    className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin mr-2" size={16} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2" size={16} />
                                        Submit Investment
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// SME Card Component
const SMECard = ({ sme, onViewDetails }) => {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="p-10 ">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                            {sme.profile_image ? (
                                <img
                                    src={
                                        sme.profile_image.startsWith('http')
                                            ? sme.profile_image
                                            : `http://localhost:8000${sme.profile_image}`
                                    }
                                    alt={`${sme.business_name} logo`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <User className="text-gray-400 w-12 h-12" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {sme.business_name || 'Business Name'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                                {sme.industry || 'Industry'}
                            </p>
                            <StatusBadge status={sme.status || 'active'} />
                        </div>
                    </div>
                </div>

                {/* Business Description */}
                {sme.business_description && (
                    <p className="text-gray-600 text-sm mt-4 line-clamp-2">
                        {sme.business_description}
                    </p>
                )}

                {/* Contact Information */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                        <User size={14} className="mr-2 flex-shrink-0" />
                        <span>{sme.representative_name || 'Representative'}</span>
                        {sme.position && (
                            <>
                                <span className="mx-1">•</span>
                                <span className="text-gray-500">{sme.position}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <Mail size={14} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{sme.business_email || sme.email}</span>
                    </div>

                    {sme.contact_phone && (
                        <div className="flex items-center text-sm text-gray-600">
                            <Phone size={14} className="mr-2 flex-shrink-0" />
                            <span>{sme.contact_phone}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        <span>
                            Since {sme.commencement_date ? new Date(sme.commencement_date).getFullYear() : 'N/A'}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <ChatButton
                            user={sme}
                            onChatOpen={() => {
                                toast.success('Chat started successfully!');
                            }}
                        />
                        <button
                            onClick={() => onViewDetails(sme.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Eye size={14} className="mr-1" />
                            View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Filter Controls Component
const FilterControls = ({ filters, onFilterChange, industries = [] }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search businesses..."
                        value={filters.search || ''}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                </div>

                {/* Industry Filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                        value={filters.industry || ''}
                        onChange={(e) => onFilterChange({ ...filters, industry: e.target.value })}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none bg-white"
                    >
                        <option value="">All Industries</option>
                        {industries.map((industry) => (
                            <option key={industry} value={industry}>
                                {industry}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={filters.status || ''}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none bg-white"
                    >
                        <option value="">All Status</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

// Detail Modal Component
const SMEDetailModal = ({ smeId, isOpen, onClose, onInvestNow }) => {
    const [smeDetail, setSmeDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && smeId) {
            fetchSMEDetail();
        }
    }, [isOpen, smeId]);

    const fetchSMEDetail = async () => {
        setLoading(true);
        try {
            const data = await getSMEUser_info(smeId);
            setSmeDetail(data);
            toast.success('Business details loaded successfully');
        } catch (err) {
            console.error('Error fetching SME details:', err);
            toast.error(err.message || 'Failed to load business details');
            setSmeDetail(null);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const defaultAvatar = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Business Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading && (
                        <LoadingSpinner message="Loading business details..." />
                    )}

                    {!loading && !smeDetail && (
                        <div className="text-center py-8">
                            <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
                            <p className="text-red-600 mb-4">Failed to load business details</p>
                            <button
                                onClick={fetchSMEDetail}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && smeDetail && (
                        <div className="space-y-6">
                            {/* Company Header with Invest Button */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-6">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img
                                            src={
                                                smeDetail.profile_image
                                                    ? smeDetail.profile_image.startsWith('http')
                                                        ? smeDetail.profile_image
                                                        : `http://localhost:8000${smeDetail.profile_image}`
                                                    : defaultAvatar
                                            }
                                            alt={`${smeDetail.business_name} logo`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = defaultAvatar;
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {smeDetail.business_name}
                                        </h3>
                                        <p className="text-gray-600 mb-3">{smeDetail.industry}</p>
                                        <StatusBadge status={smeDetail.status || 'active'} />
                                    </div>
                                </div>

                                {/* Invest Now Button */}
                                <div className="flex items-center space-x-3">
                                    <ChatButton
                                        user={smeDetail}
                                        onChatOpen={() => {
                                            toast.success('Chat started successfully!');
                                            // You can add additional logic here if needed
                                        }}
                                    />
                                    <button
                                        onClick={() => onInvestNow(smeDetail)}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        <DollarSign size={20} className="mr-2" />
                                        Invest Now
                                    </button>
                                </div>
                            </div>

                            {/* Business Description */}
                            {smeDetail.business_description && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">About</h4>
                                    <p className="text-gray-600 leading-relaxed">
                                        {smeDetail.business_description}
                                    </p>
                                </div>
                            )}

                            {/* Business Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <Building className="text-gray-400 mr-3" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-500">Business Name</p>
                                            <p className="font-medium">{smeDetail.business_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <Building className="text-gray-400 mr-3" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-500">Industry</p>
                                            <p className="font-medium">{smeDetail.industry}</p>
                                        </div>
                                    </div>
                                    {smeDetail.commencement_date && (
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <Calendar className="text-gray-400 mr-3" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Established</p>
                                                <p className="font-medium">
                                                    {new Date(smeDetail.commencement_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <Mail className="text-gray-400 mr-3" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-500">Business Email</p>
                                            <p className="font-medium">{smeDetail.business_email || smeDetail.email}</p>
                                        </div>
                                    </div>

                                    {smeDetail.contact_phone && (
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <Phone className="text-gray-400 mr-3" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Business Phone</p>
                                                <p className="font-medium">{smeDetail.contact_phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Representative Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Representative</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <User className="text-gray-400 mr-3" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium">{smeDetail.representative_name}</p>
                                        </div>
                                    </div>

                                    {smeDetail.position && (
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <Briefcase className="text-gray-400 mr-3" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Position</p>
                                                <p className="font-medium">{smeDetail.position}</p>
                                            </div>
                                        </div>
                                    )}

                                    {smeDetail.representative_email && (
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <Mail className="text-gray-400 mr-3" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Representative Email</p>
                                                <p className="font-medium">{smeDetail.representative_email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {smeDetail.representative_phone && (
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <Phone className="text-gray-400 mr-3" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Representative Phone</p>
                                                <p className="font-medium">{smeDetail.representative_phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SMEListingPage = () => {
    const [allSmeUsers, setAllSmeUsers] = useState([]);
    const [filteredSmeUsers, setFilteredSmeUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        industry: '',
        status: ''
    });
    const [selectedSMEId, setSelectedSMEId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
    const [selectedSMEForInvestment, setSelectedSMEForInvestment] = useState(null);
    const [industries, setIndustries] = useState([]);

    useEffect(() => {
        fetchAllSMEUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, allSmeUsers]);

    const fetchAllSMEUsers = async () => {
        setLoading(true);
        try {
            const sme_active = await getall_sme_active();
            console.log("User Active", sme_active);

            const users = sme_active.results || sme_active.results || sme_active || [];
            setAllSmeUsers(users);
            const uniqueIndustries = [...new Set(users.map(user => user.industry).filter(Boolean))];
            setIndustries(uniqueIndustries);

            const count = users.length;
            if (count === 0) {
                toast.warning('No businesses found in the system');
            } else {
                toast.success(`Loaded ${count} business${count !== 1 ? 'es' : ''}`);
            }
        } catch (err) {
            console.error('Error fetching SME users:', err);
            toast.error(err.message || 'Failed to load SME businesses');
            setAllSmeUsers([]);
            setIndustries([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allSmeUsers];

        // Apply search filter
        if (filters.search && filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim();
            filtered = filtered.filter(sme => {
                const businessName = (sme.business_name || '').toLowerCase();
                const representativeName = (sme.representative_name || '').toLowerCase();
                const industry = (sme.industry || '').toLowerCase();
                const email = (sme.business_email || sme.email || '').toLowerCase();
                const description = (sme.business_description || '').toLowerCase();

                return businessName.includes(searchTerm) ||
                    representativeName.includes(searchTerm) ||
                    industry.includes(searchTerm) ||
                    email.includes(searchTerm) ||
                    description.includes(searchTerm);
            });
        }

        // Apply industry filter
        if (filters.industry) {
            filtered = filtered.filter(sme => sme.industry === filters.industry);
        }

        // Apply status filter
        if (filters.status) {
            filtered = filtered.filter(sme => {
                const status = sme.status || 'active';
                return status === filters.status;
            });
        }

        setFilteredSmeUsers(filtered);

        // Show filter results toast
        if (filters.search || filters.industry || filters.status) {
            const filterCount = filtered.length;
            if (filterCount === 0) {
                toast.warning('No businesses match your current filters');
            } else {
                toast.info(`Found ${filterCount} business${filterCount !== 1 ? 'es' : ''} matching your filters`);
            }
        }
    };

    const handleViewDetails = (smeId) => {
        setSelectedSMEId(smeId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSMEId(null);
    };

    const handleInvestNow = (smeDetail) => {
        setSelectedSMEForInvestment(smeDetail);
        setIsInvestmentModalOpen(true);
        setIsModalOpen(false); // Close the detail modal
    };

    const handleCloseInvestmentModal = () => {
        setIsInvestmentModalOpen(false);
        setSelectedSMEForInvestment(null);
    };

    const handleInvestmentSubmit = async (investmentData) => {
        try {
            // Create the investment using the API service
            const response = await createInvestment(investmentData);

            console.log('Investment created successfully:', response);
            return Promise.resolve(response);
        } catch (error) {
            console.error('Investment submission error:', error);
            throw error;
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);

        // Show toast for specific filter changes
        if (newFilters.search !== filters.search && newFilters.search) {
            toast.info(`Searching for: "${newFilters.search}"`);
        }
        if (newFilters.industry !== filters.industry && newFilters.industry) {
            toast.info(`Filtering by industry: ${newFilters.industry}`);
        }
        if (newFilters.status !== filters.status && newFilters.status) {
            toast.info(`Filtering by status: ${newFilters.status}`);
        }
    };

    const clearAllFilters = () => {
        setFilters({ search: '', industry: '', status: '' });
        toast.info('All filters cleared');
    };

    const hasActiveFilters = filters.search || filters.industry || filters.status;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">SME Businesses</h1>
                            <p className="text-gray-600 mt-1">
                                Discover and connect with registered businesses
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">
                                {filteredSmeUsers.length} of {allSmeUsers.length} businesses
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-xs text-blue-600 hover:text-blue-700 underline mt-1"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <FilterControls
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    industries={industries}
                />

                {loading && <LoadingSpinner message="Loading SME businesses..." />}

                {!loading && filteredSmeUsers.length === 0 && (
                    <div className="text-center py-12">
                        <Building className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {hasActiveFilters ? 'No Businesses Match Your Filters' : 'No Businesses Found'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {hasActiveFilters
                                ? 'Try adjusting your filters to see more results.'
                                : 'No SME businesses are registered yet.'}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                        {!hasActiveFilters && allSmeUsers.length === 0 && (
                            <button
                                onClick={fetchAllSMEUsers}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Refresh
                            </button>
                        )}
                    </div>
                )}

                {!loading && filteredSmeUsers.length > 0 && (
                    <>
                        {hasActiveFilters && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-blue-800">
                                        <span className="font-medium">Active filters:</span>
                                        {filters.search && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">Search: "{filters.search}"</span>}
                                        {filters.industry && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">Industry: {filters.industry}</span>}
                                        {filters.status && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">Status: {filters.status}</span>}
                                    </div>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-blue-600 hover:text-blue-700 text-sm underline"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Business Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSmeUsers.map((sme) => (
                                <SMECard
                                    key={sme.id || sme.user_id}
                                    sme={sme}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* SME Detail Modal */}
            <SMEDetailModal
                smeId={selectedSMEId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onInvestNow={handleInvestNow}
            />

            {/* Investment Modal */}
            <InvestmentModal
                smeDetail={selectedSMEForInvestment}
                isOpen={isInvestmentModalOpen}
                onClose={handleCloseInvestmentModal}
                onInvestmentSubmit={handleInvestmentSubmit}
            />

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default SMEListingPage;