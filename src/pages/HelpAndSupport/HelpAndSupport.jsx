import React, { useState, useEffect, useCallback } from 'react';
import {
    HelpCircle,
    Plus,
    Edit,
    Eye,
    X,
    Search,
    ChevronDown,
    RefreshCw,
    Users,
    FileText,
    Calendar,
    Download,
    Upload,
    Save,
    AlertCircle,
    CheckCircle,
    Filter,
    Paperclip
} from 'lucide-react';

import { createHelpSupport, getAllHelpSupport, updateHelpSupport } from '../Service/api';

const HelpSupportManagementPage = () => {
    const [helpItems, setHelpItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'add', 'edit'
    const [searchTerm, setSearchTerm] = useState('');
    const [supportTypeFilter, setSupportTypeFilter] = useState('all');
    const [targetUserFilter, setTargetUserFilter] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        support_type: 'general',
        target_user_type: 'all',
        attachment: null
    });

    // Support type configuration
    const supportTypeConfig = {
        'technical': {
            color: 'blue',
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-200'
        },
        'account': {
            color: 'green',
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-200'
        },
        'billing': {
            color: 'purple',
            bg: 'bg-purple-100',
            text: 'text-purple-800',
            border: 'border-purple-200'
        },
        'general': {
            color: 'gray',
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            border: 'border-gray-200'
        }
    };

    const targetUserConfig = {
        'all': { label: 'All Users', color: 'bg-blue-100 text-blue-800' },
        'sme': { label: 'SMEs Only', color: 'bg-green-100 text-green-800' },
        'investor': { label: 'Investors Only', color: 'bg-purple-100 text-purple-800' }
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
                // You might need to adjust this based on your API endpoint
                const downloadUrl = `/api/help-support/attachments/${item.id}/download`;

                const response = await fetch(downloadUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust based on your auth
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

    // Handle input changes
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);
    const fetchHelpItems = async () => {
        setIsLoading(true);
        try {
            const data = await getAllHelpSupport();
            setHelpItems(data.results);
            setFilteredItems(data.results);
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

    // Filter items based on search and filters
    useEffect(() => {
        let filtered = helpItems;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Support type filter
        if (supportTypeFilter !== 'all') {
            filtered = filtered.filter(item => item.support_type === supportTypeFilter);
        }

        // Target user filter
        if (targetUserFilter !== 'all') {
            filtered = filtered.filter(item => item.target_user_type === targetUserFilter);
        }

        setFilteredItems(filtered);
    }, [helpItems, searchTerm, supportTypeFilter, targetUserFilter]);

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

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            support_type: 'general',
            target_user_type: 'all',
            attachment: null
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    submitData.append(key, formData[key]);
                }
            });

            if (modalMode === 'add') {
                await createHelpSupport(submitData);
            } else if (modalMode === 'edit') {
                await updateHelpSupport(selectedItem.id, submitData);
            }

            await fetchHelpItems();
            setShowModal(false);
            resetForm();
            setSelectedItem(null);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle view item
    const handleViewItem = (item) => {
        setSelectedItem(item);
        setModalMode('view');
        setShowModal(true);
    };

    // Handle edit item
    const handleEditItem = (item) => {
        setSelectedItem(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            support_type: item.support_type || 'general',
            target_user_type: item.target_user_type || 'all',
            attachment: null
        });
        setModalMode('edit');
        setShowModal(true);
    };

    // Handle add new item
    const handleAddNew = () => {
        resetForm();
        setSelectedItem(null);
        setModalMode('add');
        setShowModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        resetForm();
    };

    // Support Type Badge Component
    const SupportTypeBadge = ({ type }) => {
        const config = supportTypeConfig[type] || supportTypeConfig['general'];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
        );
    };

    // Target User Badge Component
    const TargetUserBadge = ({ type }) => {
        const config = targetUserConfig[type] || targetUserConfig['all'];
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading help items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support Management</h1>
                        <p className="text-gray-600">Manage help articles and support content</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New Item</span>
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search help items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Support Type Filter */}
                        <div className="relative">
                            <select
                                value={supportTypeFilter}
                                onChange={(e) => setSupportTypeFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="all">All Support Types</option>
                                <option value="general">General</option>
                                <option value="technical">Technical</option>
                                <option value="account">Account</option>
                                <option value="billing">Billing</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>

                        {/* Target User Filter */}
                        <div className="relative">
                            <select
                                value={targetUserFilter}
                                onChange={(e) => setTargetUserFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="all">All User Types</option>
                                <option value="all">All Users</option>
                                <option value="sme">SMEs Only</option>
                                <option value="investor">Investors Only</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchHelpItems}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Help Items Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-16">
                            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Help Items Found</h3>
                            <p className="text-gray-600 mb-6">No help items match your current filters.</p>
                            <button
                                onClick={handleAddNew}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add First Item</span>
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Support Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Target Users
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Attachment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <SupportTypeBadge type={item.support_type} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <TargetUserBadge type={item.target_user_type} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.attachment ? (
                                                    <div className="flex items-center">
                                                        <Paperclip className="w-4 h-4 text-green-600 mr-1" />
                                                        <span className="text-sm text-green-600">Yes</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">No</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center space-x-2 justify-end">
                                                    <button
                                                        onClick={() => handleViewItem(item)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditItem(item)}
                                                        className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                                                        title="Edit Item"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                                    <dd className="text-lg font-medium text-gray-900">{helpItems.length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Technical Items</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {helpItems.filter(item => item.support_type === 'technical').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">SME Specific</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {helpItems.filter(item => item.target_user_type === 'sme').length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">With Attachments</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {helpItems.filter(item => item.attachment).length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal using conditional rendering */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                    ></div>

                    {/* Modal */}
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Close Button */}
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>

                            {/* Header */}
                            <div className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {modalMode === 'add' ? 'Add New Help Item' : modalMode === 'edit' ? 'Edit Help Item' : 'Help Item Details'}
                                    </h2>
                                    {modalMode === 'view' && selectedItem && (
                                        <div className="flex space-x-2">
                                            <SupportTypeBadge type={selectedItem.support_type} />
                                            <TargetUserBadge type={selectedItem.target_user_type} />
                                        </div>
                                    )}
                                </div>
                                {modalMode === 'view' && selectedItem && (
                                    <p className="text-gray-600">ID: {selectedItem.id}</p>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                {modalMode === 'view' && selectedItem ? (
                                    // View Mode
                                    <div className="space-y-8">
                                        {/* Basic Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                                    <HelpCircle className="w-6 h-6 mr-2 text-blue-500" />
                                                    Basic Information
                                                </h3>
                                                <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Title</label>
                                                        <p className="text-lg font-semibold">{selectedItem.title}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                                        <p className="text-lg">{selectedItem.description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                                    <Users className="w-6 h-6 mr-2 text-green-500" />
                                                    Classification
                                                </h3>
                                                <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Support Type</label>
                                                        <div className="mt-1">
                                                            <SupportTypeBadge type={selectedItem.support_type} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Target Users</label>
                                                        <div className="mt-1">
                                                            <TargetUserBadge type={selectedItem.target_user_type} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attachment */}
                                        {selectedItem.attachment && (
                                            <div className="mb-8">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                                    <Paperclip className="w-6 h-6 mr-2 text-purple-500" />
                                                    Attachment
                                                </h3>
                                                <div className="p-6 bg-purple-50 rounded-lg">
                                                    <div className="flex items-center justify-between">

                                                        <button
                                                            onClick={() => handleDownloadAttachment(selectedItem)}
                                                            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                        >
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Timestamps */}
                                        <div className="mb-8">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                                <Calendar className="w-6 h-6 mr-2 text-gray-500" />
                                                Timeline
                                            </h3>
                                            <div className="p-6 bg-gray-50 rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Created At</label>
                                                        <p className="text-lg">{formatDate(selectedItem.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                                        <p className="text-lg">{formatDate(selectedItem.updated_at)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleEditItem(selectedItem)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2"
                                            >
                                                <Edit className="w-5 h-5" />
                                                <span>Edit Item</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Add/Edit Mode
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter help item title"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Support Type *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.support_type}
                                                    onChange={(e) => handleInputChange('support_type', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="general">General</option>
                                                    <option value="technical">Technical</option>
                                                    <option value="account">Account</option>
                                                    <option value="billing">Billing</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target User Type *
                                            </label>
                                            <select
                                                required
                                                value={formData.target_user_type}
                                                onChange={(e) => handleInputChange('target_user_type', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="all">All Users</option>
                                                <option value="sme">SMEs Only</option>
                                                <option value="investor">Investors Only</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description *
                                            </label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter detailed description"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Attachment
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleInputChange('attachment', e.target.files[0])}
                                                    accept=".pdf,.docx,.jpg,.png"
                                                    className="hidden"
                                                    id="attachment-upload"
                                                />
                                                <label htmlFor="attachment-upload" className="cursor-pointer">
                                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-600 mb-2">Click to upload attachment</p>
                                                    <p className="text-sm text-gray-500">PDF, DOCX, JPG, PNG (Max 10MB)</p>
                                                </label>
                                                {formData.attachment && (
                                                    <p className="mt-2 text-sm text-blue-600">
                                                        Selected: {formData.attachment.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex space-x-4 pt-6">
                                            <button
                                                type="button"
                                                onClick={handleCloseModal}
                                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                            >
                                                {isProcessing ? (
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Save className="w-5 h-5" />
                                                )}
                                                <span>{modalMode === 'add' ? 'Create Item' : 'Update Item'}</span>
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpSupportManagementPage;