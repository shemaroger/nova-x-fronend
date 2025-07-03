import React, { useState, useEffect } from 'react';
import {
    Bell,
    Mail,
    MailOpen,
    Search,
    Filter,
    ChevronDown,
    RefreshCw,
    Eye,
    Check,
    User,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    X,
    Archive
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getNotifications, markAsRead } from '../Service/api';

const NotificationsManagementPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Status configuration
    const statusConfig = {
        'unread': {
            color: 'blue',
            icon: Mail,
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-200'
        },
        'read': {
            color: 'gray',
            icon: MailOpen,
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            border: 'border-gray-200'
        }
    };

    // Fetch notifications from API
    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await getNotifications();
            console.log('Fetched notifications data:', data);

            // Handle different response structures
            let notificationsData = [];
            if (Array.isArray(data)) {
                notificationsData = data;
            } else if (data?.results && Array.isArray(data.results)) {
                notificationsData = data.results;
            } else if (data?.data && Array.isArray(data.data)) {
                notificationsData = data.data;
            }

            setNotifications(notificationsData);
            setFilteredNotifications(notificationsData);
            console.log('Fetched notifications:', notificationsData);

        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
            setNotifications([]);
            setFilteredNotifications([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load notifications on component mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Filter notifications based on search and filters
    useEffect(() => {
        let filtered = notifications;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(notification =>
                notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(notification => notification.status === statusFilter);
        }

        setFilteredNotifications(filtered);
    }, [notifications, searchTerm, statusFilter]);

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

    // Get relative time
    const getRelativeTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return formatDate(dateString);
    };

    // Handle mark as read
    const handleMarkAsRead = async (notificationId) => {
        setIsProcessing(true);
        try {
            await markAsRead(notificationId);
            toast.success('Notification marked as read!');
            await fetchNotifications();

            // Close modal if open
            if (selectedNotification?.id === notificationId) {
                setShowModal(false);
                setSelectedNotification(null);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error(error.message || 'Failed to mark notification as read');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle view notification details
    const handleViewNotification = (notification) => {
        setSelectedNotification(notification);
        setShowModal(true);

        // Automatically mark as read when viewing details
        if (notification.status === 'unread') {
            handleMarkAsRead(notification.id);
        }
    };

    // Truncate message for table display
    const truncateMessage = (message, maxLength = 80) => {
        if (!message) return 'N/A';
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    // Notification Status Badge Component
    const StatusBadge = ({ status }) => {
        const config = statusConfig[status] || statusConfig['unread'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border`}>
                <Icon className="w-4 h-4 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Notification Details Modal
    const NotificationDetailsModal = ({ notification, isOpen, onClose }) => {
        if (!isOpen || !notification) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Header */}
                        <div className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-3xl font-bold text-gray-900">Notification Details</h2>
                                <StatusBadge status={notification.status} />
                            </div>
                            <p className="text-gray-600">Notification ID: {notification.id}</p>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* User Information */}
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="w-6 h-6 mr-2 text-blue-500" />
                                    Recipient Information
                                </h3>
                                <div className="p-6 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">User ID</label>
                                            <p className="font-mono text-lg">{notification.user}</p>
                                        </div>
                                        {notification.user_info && (
                                            <>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                                    <p className="text-lg">{notification.user_info.email}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">First Name</label>
                                                    <p className="text-lg">{notification.user_info.first_name}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Last Name</label>
                                                    <p className="text-lg">{notification.user_info.last_name}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Mail className="w-6 h-6 mr-2 text-green-500" />
                                    Message Content
                                </h3>
                                <div className="p-6 bg-green-50 rounded-lg">
                                    <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>

                            {/* Status Information */}
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <CheckCircle className="w-6 h-6 mr-2 text-purple-500" />
                                    Status Information
                                </h3>
                                <div className="p-6 bg-purple-50 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-purple-700">Current Status</label>
                                            <div className="mt-1">
                                                <StatusBadge status={notification.status} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-purple-700">Time Since Creation</label>
                                            <p className="text-lg font-semibold">
                                                {getRelativeTime(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                            <p className="text-lg">{formatDate(notification.created_at)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                            <p className="text-lg">{formatDate(notification.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            {notification.status === 'unread' && (
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        disabled={isProcessing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {isProcessing ? (
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Check className="w-5 h-5" />
                                        )}
                                        <span>Mark as Read</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Notifications Management</h1>
                    <p className="text-gray-600">Manage and review all user notifications</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search notifications..."
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
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchNotifications}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Notifications Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-16">
                            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Notifications Found</h3>
                            <p className="text-gray-600">No notifications match your current filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time
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
                                    {filteredNotifications.map((notification) => (
                                        <tr
                                            key={notification.id}
                                            className={`hover:bg-gray-50 ${notification.status === 'unread' ? 'bg-blue-25' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <User className="h-6 w-6 text-gray-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {notification.user_info?.first_name} {notification.user_info?.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {notification.user_info?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs">
                                                    {truncateMessage(notification.message)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={notification.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getRelativeTime(notification.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(notification.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center space-x-2 justify-end">
                                                    <button
                                                        onClick={() => handleViewNotification(notification)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>

                                                    {notification.status === 'unread' && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            disabled={isProcessing}
                                                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                                                            title="Mark as Read"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* Notification Details Modal */}
            <NotificationDetailsModal
                notification={selectedNotification}
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedNotification(null);
                }}
            />
        </div >
    );
};

export default NotificationsManagementPage;