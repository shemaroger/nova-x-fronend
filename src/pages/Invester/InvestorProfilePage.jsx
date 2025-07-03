import React, { useState, useEffect } from 'react';
import {
    User,
    Building,
    Mail,
    Phone,
    Calendar,
    Edit3,
    Save,
    X,
    Camera,
    Upload,
    CheckCircle,
    AlertCircle,
    Clock,
    Briefcase,
    FileText,
    Shield,
    RefreshCw,
    DollarSign,
    Award,
    TrendingUp,
    UserCheck
} from 'lucide-react';
import { getInvestorUserDetail, updateInvestorProfile, updateImage } from '../Service/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InvestorProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [updating, setUpdating] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);

    // Finance range options matching Django model
    const financeRangeOptions = [
        { value: 'under_100k', label: 'Under $100,000' },
        { value: '100k_500k', label: '$100,000 - $500,000' },
        { value: '500k_1m', label: '$500,000 - $1 million' },
        { value: '1m_5m', label: '$1 million - $5 million' },
        { value: '5m_10m', label: '$5 million - $10 million' },
        { value: 'over_10m', label: 'Over $10 million' }
    ];

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = 'http://localhost:8000';
        return `${baseUrl}${imagePath}`;
    };

    // Fetch profile data using API
    const fetchProfileData = async (userId) => {
        setLoading(true);
        try {
            const response = await getInvestorUserDetail(userId);
            setProfileData(response);
            setEditData(response);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const profileDataRaw = localStorage.getItem('profile_data');
        const profileDatas = JSON.parse(profileDataRaw);

        if (profileDatas?.user_id) {
            fetchProfileData(profileDatas.user_id);
        }
    }, []);

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Enhanced image change handler with immediate upload
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPG, PNG, or GIF)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.info('Image size must be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        await uploadProfileImage(file);
    };

    const uploadProfileImage = async (imageFile) => {
        setImageUploading(true);

        try {
            const formData = new FormData();
            formData.append('profile_image', imageFile);

            console.log('Uploading image...');

            const response = await updateImage(profileData.id, formData);

            console.log('Image upload response:', response);

            if (response.success) {
                setProfileData(prev => ({
                    ...prev,
                    profile_image: response.data.image_url
                }));

                toast.success('Profile image updated successfully!');
                setShowModal(false);
                setImagePreview(null);
            } else {
                throw new Error(response.error || 'Failed to upload image');
            }

        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload profile image. Please try again.');
            setImagePreview(null);
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const formData = new FormData();
            Object.keys(editData).forEach(key => {
                if (editData[key] !== null && editData[key] !== undefined && key !== 'profile_image') {
                    formData.append(key, editData[key]);
                }
            });
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            await updateInvestorProfile(profileData.id, formData);
            setProfileData({ ...editData });
            setShowModal(false);

            toast.success('Profile updated successfully!');
            const userId = localStorage.getItem('user_id') || profileData?.id;
            if (userId) {
                await fetchProfileData(userId);
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFinanceRangeDisplay = (value) => {
        const option = financeRangeOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                <Icon className="w-4 h-4 mr-2" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getFinanceRangeColor = (range) => {
        const colorMap = {
            'under_100k': 'bg-blue-100 text-blue-800',
            '100k_500k': 'bg-green-100 text-green-800',
            '500k_1m': 'bg-yellow-100 text-yellow-800',
            '1m_5m': 'bg-orange-100 text-orange-800',
            '5m_10m': 'bg-purple-100 text-purple-800',
            'over_10m': 'bg-red-100 text-red-800'
        };
        return colorMap[range] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-4">Unable to load your profile data.</p>
                    <button
                        onClick={() => {
                            const userId = localStorage.getItem('user_id') || '1';
                            fetchProfileData(userId);
                        }}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="relative">
                        {/* Cover Background */}
                        <div className="h-32 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-t-xl"></div>

                        {/* Profile Content */}
                        <div className="relative px-6 pb-6">
                            {/* Profile Photo & Basic Info */}
                            <div className="flex items-end space-x-6 -mt-16">
                                <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
                                    {profileData?.profile_image ? (
                                        <img
                                            src={getImageUrl(profileData.profile_image)}
                                            alt="Profile Photo"
                                            className="w-full h-full object-cover rounded-full"
                                            onError={(e) => {
                                                console.log('Image failed to load:', profileData.profile_image);
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center ${profileData?.profile_image ? 'hidden' : ''}`}>
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 pb-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900">{profileData?.full_name}</h1>
                                            <p className="text-lg text-gray-600 mt-1">Investor • {profileData?.industry}</p>
                                            <div className="flex items-center space-x-3 mt-3">
                                                {getStatusBadge(profileData?.application_status)}
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFinanceRangeColor(profileData?.finance_range)}`}>
                                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                                    {getFinanceRangeDisplay(profileData?.finance_range)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center space-x-2 shadow-md"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                            <span>Update Profile</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Information Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Investment Overview */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <TrendingUp className="w-6 h-6 mr-3 text-violet-600" />
                                Investment Profile
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-3">
                                        <Award className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Investment Focus</p>
                                            <p className="text-lg font-semibold text-gray-900">{profileData?.industry}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-3">
                                        <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Investment Range</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {getFinanceRangeDisplay(profileData?.finance_range)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <UserCheck className="w-6 h-6 mr-3 text-violet-600" />
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-3">
                                        <User className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                                            <p className="text-lg font-semibold text-gray-900">{profileData?.full_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <Mail className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Email Address</p>
                                            <p className="text-lg font-semibold text-gray-900">{profileData?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                                            <p className="text-lg font-semibold text-gray-900">{profileData?.contact_phone}</p>
                                        </div>
                                    </div>

                                    {profileData?.phone_country_code && (
                                        <div className="flex items-start space-x-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Country Code</p>
                                                <p className="text-lg font-semibold text-gray-900">{profileData?.phone_country_code}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Information */}
                    <div className="space-y-6">
                        {/* Application Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-violet-600" />
                                Application Status
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Current Status</p>
                                    {getStatusBadge(profileData?.application_status)}
                                </div>

                                {profileData?.application_approved_at && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Approved On</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-1">
                                            {formatDate(profileData.application_approved_at)}
                                        </p>
                                    </div>
                                )}

                                {profileData?.application_rejected_at && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Rejected On</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-1">
                                            {formatDate(profileData.application_rejected_at)}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-medium text-gray-500">Terms & Conditions</p>
                                    <p className={`text-sm font-semibold mt-1 ${profileData?.terms_accepted ? 'text-green-600' : 'text-red-600'}`}>
                                        {profileData?.terms_accepted ? '✓ Accepted' : '✗ Not Accepted'}
                                    </p>
                                    {profileData?.terms_accepted_at && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Accepted on {formatDate(profileData.terms_accepted_at)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-violet-600" />
                                Account Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Account Created</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">
                                        {formatDate(profileData?.created_at)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">
                                        {formatDate(profileData?.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Investment Summary */}
                        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                                Investment Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Investment Capacity:</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {getFinanceRangeDisplay(profileData?.finance_range)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Focus Industry:</span>
                                    <span className="text-sm font-semibold text-gray-900">{profileData?.industry}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Account Status:</span>
                                    <span className={`text-sm font-semibold ${profileData?.application_status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {profileData?.application_status?.charAt(0).toUpperCase() + profileData?.application_status?.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Update Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Update Your Profile</h2>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setImagePreview(null);
                                            setEditData(profileData);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Profile Image - Updated with separate upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Photo
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden relative">
                                            {imageUploading && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                            {imagePreview || profileData?.profile_image ? (
                                                <img
                                                    src={imagePreview || getImageUrl(profileData.profile_image)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.log('Modal image failed to load:', profileData?.profile_image);
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full flex items-center justify-center ${(imagePreview || profileData?.profile_image) ? 'hidden' : ''}`}>
                                                <Camera className="w-8 h-8 text-gray-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2 ${imageUploading
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                                                }`}>
                                                {imageUploading ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                        <span>Uploading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4" />
                                                        <span>Upload Photo</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/jpeg,image/png,image/gif"
                                                    onChange={handleImageChange}
                                                    disabled={imageUploading}
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                JPG, PNG, GIF up to 5MB
                                            </p>
                                            {imageUploading && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    Image will be saved automatically...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.full_name || ''}
                                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={editData.email || ''}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            value={editData.contact_phone || ''}
                                            onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country Code
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.phone_country_code || ''}
                                            onChange={(e) => handleInputChange('phone_country_code', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            placeholder="e.g., +250"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Industry Focus *
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.industry || ''}
                                            onChange={(e) => handleInputChange('industry', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Investment Range *
                                        </label>
                                        <select
                                            value={editData.finance_range || ''}
                                            onChange={(e) => handleInputChange('finance_range', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            required
                                        >
                                            <option value="">Select investment range</option>
                                            {financeRangeOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setImagePreview(null);
                                            setEditData(profileData);
                                        }}
                                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {updating ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestorProfilePage;