import React, { useState, useEffect } from 'react';
import {
    HelpCircle,
    Search,
    Filter,
    Download,
    ChevronRight,
    X,
    FileText,
    Users,
    Zap,
    CreditCard,
    MessageCircle,
    ArrowLeft,
    ExternalLink,
    Paperclip,
    Star,
    Clock,
    Eye,
    ThumbsUp,
    Bookmark,
    Share2,
    Phone
} from 'lucide-react';

import { getAllHelpSupport } from '../Service/api';

const UserHelpSupportPage = () => {
    const [helpItems, setHelpItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [userType] = useState('all'); // This would come from user context/auth
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());

    // Category configuration
    const categories = {
        'all': {
            label: 'All Topics',
            icon: HelpCircle,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            gradient: 'from-blue-500 to-blue-600'
        },
        'technical': {
            label: 'Technical',
            icon: Zap,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            gradient: 'from-purple-500 to-purple-600'
        },
        'account': {
            label: 'Account',
            icon: Users,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200',
            gradient: 'from-green-500 to-green-600'
        },
        'billing': {
            label: 'Billing',
            icon: CreditCard,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            gradient: 'from-orange-500 to-orange-600'
        },
        'general': {
            label: 'General',
            icon: MessageCircle,
            color: 'text-gray-600',
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            gradient: 'from-gray-500 to-gray-600'
        }
    };

    // Handle download attachment
    const handleDownloadAttachment = async (item) => {
        try {
            if (!item.attachment) {
                console.error('No attachment found');
                return;
            }

            // If attachment is a URL, download directly
            if (item.attachment.startsWith('http')) {
                const link = document.createElement('a');
                link.href = item.attachment;
                link.download = item.attachment.split('/').pop() || 'attachment';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // If attachment is a file name, construct the download URL
                const downloadUrl = `/api/help-support/attachments/${item.id}/download`;

                const response = await fetch(downloadUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = item.attachment;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } else {
                    console.error('Failed to download attachment');
                    alert('Failed to download attachment. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error downloading attachment:', error);
            alert('Error downloading attachment. Please try again.');
        }
    };

    // Handle bookmark toggle
    const handleBookmarkToggle = (itemId) => {
        setBookmarkedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // Handle share
    const handleShare = async (item) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: item.description,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    // Fetch help items from API
    const fetchHelpItems = async () => {
        setIsLoading(true);
        try {
            const data = await getAllHelpSupport();

            // Filter items based on user type (show items for 'all' or user's specific type)
            const userRelevantItems = data.results.filter(item =>
                item.target_user_type === 'all' || item.target_user_type === userType
            );

            setHelpItems(userRelevantItems);
            setFilteredItems(userRelevantItems);
        } catch (error) {
            console.error('Error fetching help items:', error);
            setHelpItems([]);
            setFilteredItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load items on component mount
    useEffect(() => {
        fetchHelpItems();
    }, []);

    // Filter items based on search and category
    useEffect(() => {
        let filtered = helpItems;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.support_type === selectedCategory);
        }

        setFilteredItems(filtered);
    }, [helpItems, searchTerm, selectedCategory]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Handle view item details
    const handleViewItem = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    // Category Filter Component
    const CategoryFilter = ({ category, isSelected, onClick }) => {
        const config = categories[category];
        const Icon = config.icon;

        return (
            <button
                onClick={() => onClick(category)}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${isSelected
                    ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg border-transparent`
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    }`}
            >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : config.color}`} />
                <span className="font-medium">{config.label}</span>
                {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                )}
            </button>
        );
    };

    // Help Item Card Component
    const HelpItemCard = ({ item }) => {
        const categoryConfig = categories[item.support_type] || categories['general'];
        const Icon = categoryConfig.icon;
        const isBookmarked = bookmarkedItems.has(item.id);

        return (
            <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryConfig.gradient} shadow-sm`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookmarkToggle(item.id);
                                }}
                                className={`p-2 rounded-lg transition-colors ${isBookmarked
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-gray-100 text-gray-400 hover:text-yellow-500'
                                    }`}
                            >
                                <Bookmark className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors mt-1" />
                        </div>
                    </div>

                    <div onClick={() => handleViewItem(item)}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {item.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                            {item.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryConfig.gradient} text-white`}>
                                    {categoryConfig.label}
                                </span>
                                {item.attachment && (
                                    <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <Paperclip className="w-3 h-3 mr-1" />
                                        <span className="text-xs font-medium">File</span>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(item.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
        );
    };

    // Detail Modal Component
    const DetailModal = ({ item, isOpen, onClose }) => {
        if (!isOpen || !item) return null;

        const categoryConfig = categories[item.support_type] || categories['general'];
        const Icon = categoryConfig.icon;
        const isBookmarked = bookmarkedItems.has(item.id);

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Header */}
                        <div className={`p-8 pb-6 bg-gradient-to-r ${categoryConfig.gradient} rounded-t-2xl relative overflow-hidden`}>
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h1 className="text-3xl font-bold text-white mb-3">
                                                {item.title}
                                            </h1>
                                            <div className="flex items-center space-x-4">
                                                <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white">
                                                    {categoryConfig.label}
                                                </span>
                                                <span className="text-white/80 flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    Updated {formatDate(item.updated_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleBookmarkToggle(item.id)}
                                            className={`p-3 rounded-xl transition-colors ${isBookmarked
                                                ? 'bg-yellow-400 text-white'
                                                : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                                                }`}
                                        >
                                            <Bookmark className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleShare(item)}
                                            className="p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <div className={`w-1 h-6 bg-gradient-to-b ${categoryConfig.gradient} rounded-full mr-3`}></div>
                                    Description
                                </h2>
                                <div className="prose prose-lg max-w-none">
                                    <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-400">
                                        <p className="text-gray-700 leading-relaxed text-lg">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Attachment */}
                            {item.attachment && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                                        <div className={`w-1 h-6 bg-gradient-to-b ${categoryConfig.gradient} rounded-full mr-3`}></div>
                                        Attachment
                                    </h2>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                                                    <FileText className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-lg">{item.attachment}</p>
                                                    <p className="text-sm text-gray-600">Downloadable resource • Click to download</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownloadAttachment(item)}
                                                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                <Download className="w-5 h-5" />
                                                <span className="font-medium">Download</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Feedback Section */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <div className={`w-1 h-6 bg-gradient-to-b ${categoryConfig.gradient} rounded-full mr-3`}></div>
                                    Was this helpful?
                                </h2>
                                <div className="flex items-center space-x-4">
                                    <button className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-xl transition-colors border border-green-200">
                                        <ThumbsUp className="w-5 h-5" />
                                        <span className="font-medium">Yes, helpful</span>
                                    </button>
                                    <button className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-xl transition-colors border border-gray-200">
                                        <X className="w-5 h-5" />
                                        <span className="font-medium">Not helpful</span>
                                    </button>
                                </div>
                            </div>

                            {/* Additional Help */}
                            <div className="border-t border-gray-200 pt-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <div className={`w-1 h-6 bg-gradient-to-b ${categoryConfig.gradient} rounded-full mr-3`}></div>
                                    Need More Help?
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center mb-4">
                                            <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
                                            <h3 className="font-semibold text-gray-900">Contact Support</h3>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2">
                                            Can't find what you're looking for? Our support team is here to help.
                                        </p>

                                        {/* Phone number for calling */}
                                        <div className="flex items-center text-sm text-gray-700 mb-4">
                                            <Phone className="w-4 h-4 text-blue-600 mr-2" />
                                            <a href="tel:+250788123456" className="hover:underline text-blue-700">
                                                +250 788 123 456
                                            </a>
                                        </div>

                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                                            <ExternalLink className="w-4 h-4 mr-1" />
                                            Contact Support
                                        </button>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center mb-4">
                                            <ArrowLeft className="w-6 h-6 text-purple-600 mr-2" />
                                            <h3 className="font-semibold text-gray-900">Browse More Topics</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Explore other help articles that might be useful.
                                        </p>
                                        <button
                                            onClick={onClose}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                                        >
                                            <HelpCircle className="w-4 h-4 mr-1" />
                                            Back to Help Center
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8">
                            <HelpCircle className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                            Help & Support Center
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                            Find answers to your questions and get the help you need to succeed on our platform.
                            Our comprehensive knowledge base is here to guide you every step of the way.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto mt-12">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                            <input
                                type="text"
                                placeholder="Search help articles, guides, and documentation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 text-lg bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl border-0 shadow-2xl focus:ring-4 focus:ring-white/30 focus:ring-opacity-50 transition-all placeholder-gray-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Category Filters */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {Object.keys(categories).map((category) => (
                            <CategoryFilter
                                key={category}
                                category={category}
                                isSelected={selectedCategory === category}
                                onClick={setSelectedCategory}
                            />
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {searchTerm ? (
                                <span>
                                    Search Results
                                    <span className="ml-2 text-lg font-normal text-gray-600">
                                        ({filteredItems.length} found)
                                    </span>
                                </span>
                            ) : (
                                'Help Articles'
                            )}
                        </h2>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Clear Search
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
                                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                                    <div className="space-y-2 mb-4">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HelpCircle className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Articles Found</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                {searchTerm
                                    ? "No help articles match your search. Try different keywords or browse by category."
                                    : "No help articles are available for the selected category."}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredItems.map((item) => (
                                <HelpItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Detail Modal */}
            <DetailModal
                item={selectedItem}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedItem(null);
                }}
            />
        </div>
    );
};

export default UserHelpSupportPage;