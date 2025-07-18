import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    User,
    Mail,
    Phone,
    Building,
    DollarSign,
    Calendar,
    RefreshCw,
    Plus,
    UserPlus,
    ArrowUpDown,
    ChevronDown,
    FileText,
    Settings,
    X
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getall_investors, approveInvestor, rejectInvestor } from '../Service/api';
import { useNavigate } from 'react-router-dom';

const AllUsersAccountsPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);

    // Modal states
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedUserForRejection, setSelectedUserForRejection] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getall_investors();

            let usersList = [];
            if (Array.isArray(response?.data)) {
                usersList = response.data;
            } else if (response?.users) {
                usersList = response.users;
            } else {
                console.warn('Unexpected response format:', response);
            }
            setUsers(usersList);

        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error('Failed to load user accounts');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Load users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Toast notification simulation
    const showToast = (message, type = 'info') => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'warning':
                toast.warning(message);
                break;
            default:
                toast.info(message);
        }
    };

    // Filter and search logic
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.contact_phone?.includes(searchTerm);

        const matchesStatus = filterStatus === 'all' || user.application_status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';
        return `${baseUrl}${imagePath}`;
    };
    // Sorting logic
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle date sorting
        if (sortBy.includes('_at')) {
            aValue = new Date(aValue || 0);
            bValue = new Date(bValue || 0);
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            pending: {
                icon: <Clock className="w-4 h-4" />,
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                text: 'Pending'
            },
            approved: {
                icon: <CheckCircle className="w-4 h-4" />,
                className: 'bg-green-100 text-green-800 border-green-200',
                text: 'Approved'
            },
            rejected: {
                icon: <XCircle className="w-4 h-4" />,
                className: 'bg-red-100 text-red-800 border-red-200',
                text: 'Rejected'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
                {config.icon}
                <span className="ml-1">{config.text}</span>
            </div>
        );
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Handle user actions
    const handleViewUser = (user) => {
        toast.info(`Viewing profile for ${user.full_name}`);
        navigate(`/dashboard/kycdocuments/${user.user_id}`);
    };

    const handleApproveUser = async (user) => {
        try {
            await approveInvestor(user.id);
            toast.success(`${user.full_name} has been approved successfully`);
            fetchUsers();
        } catch (err) {
            console.log(err);
            toast.error(`Failed to approve ${user.full_name}`);
        }
    };

    // Open rejection modal - UNCOMMENTED AND UPDATED
    const handleRejectUser = (user) => {
        setSelectedUserForRejection(user);
        setRejectionReason('');
        setShowRejectModal(true);
        setOpenDropdown(null);
    };

    // Close rejection modal
    const closeRejectModal = () => {
        setShowRejectModal(false);
        setSelectedUserForRejection(null);
        setRejectionReason('');
        setIsSubmittingRejection(false);
    };

    // Submit rejection
    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            toast.warning('Please provide a reason for rejection');
            return;
        }

        setIsSubmittingRejection(true);
        try {
            await rejectInvestor(selectedUserForRejection.id, rejectionReason);
            toast.success(`${selectedUserForRejection.full_name} has been rejected`);
            fetchUsers();
            closeRejectModal();
        } catch (err) {
            console.log(err);
            toast.error(`Failed to reject ${selectedUserForRejection.full_name}`);
        } finally {
            setIsSubmittingRejection(false);
        }
    };

    const handleRefresh = () => {
        toast.info('Refreshing user accounts...');
        fetchUsers();
    };

    const handleExportAll = () => {
        toast.success('Exporting all user data...');
        // Add export logic here
    };

    // Handle user selection
    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        const newSelection = selectedUsers.length === currentUsers.length ? [] : currentUsers.map(user => user.id);
        setSelectedUsers(newSelection);
        showToast(newSelection.length > 0 ? `Selected ${newSelection.length} user(s)` : 'Deselected all users');
    };

    // Toggle dropdown
    const toggleDropdown = (userId) => {
        setOpenDropdown(openDropdown === userId ? null : userId);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // SortableHeader component
    const SortableHeader = ({ field, children, className = "" }) => (
        <th
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                <ArrowUpDown className="w-4 h-4" />
                {sortBy === field && (
                    <span className="text-violet-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                )}
            </div>
        </th>
    );

    // Loading state
    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center space-y-4">
                        <RefreshCw className="w-8 h-8 animate-spin text-violet-600" />
                        <p className="text-gray-600">Loading user accounts...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchUsers}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Users className="w-6 h-6 mr-3 text-violet-600" />
                        User Accounts
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage and monitor all investor accounts ({sortedUsers.length} total)
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search users by name, email, industry..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <button
                            onClick={handleExportAll}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Export all data"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {currentUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'No investor accounts have been created yet'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <SortableHeader field="email">Contact</SortableHeader>
                                    <SortableHeader field="industry">Industry</SortableHeader>
                                    <SortableHeader field="finance_range">Investment Range</SortableHeader>
                                    <SortableHeader field="application_status">Status</SortableHeader>
                                    <SortableHeader field="created_at">Date Joined</SortableHeader>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {user.profile_image ? (
                                                        <img
                                                            src={getImageUrl(user.profile_image)}
                                                            alt={user.full_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-white font-semibold text-sm">
                                                            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.full_name || 'Unknown User'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                    {user.email || 'No email'}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <div className="flex items-center mt-1">
                                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                    {user.contact_phone || 'No phone'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Building className="w-4 h-4 mr-2 text-gray-400" />
                                                {user.industry || 'Not specified'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                                {user.finance_range || 'Not specified'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={user.application_status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {formatDate(user.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="relative dropdown-container">
                                                <button
                                                    onClick={() => toggleDropdown(user.id)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                    title="More actions"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openDropdown === user.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => {
                                                                    handleViewUser(user);
                                                                    setOpenDropdown(null);
                                                                }}
                                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                                            >
                                                                <Eye className="w-4 h-4 mr-3 text-violet-600" />
                                                                View KYC Doc
                                                            </button>

                                                            {user.application_status === 'pending' && (
                                                                <>
                                                                    <hr className="my-2 border-gray-300" />
                                                                    <button
                                                                        onClick={() => {
                                                                            handleApproveUser(user);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 w-full text-left"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                                                        Approve Application
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectUser(user)}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 w-full text-left"
                                                                    >
                                                                        <XCircle className="w-4 h-4 mr-3 text-red-600" />
                                                                        Reject Application
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, sortedUsers.length)} of {sortedUsers.length} users
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <div className="flex items-center space-x-1">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === pageNum
                                                ? 'bg-violet-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Actions */}
            {selectedUsers.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                            {selectedUsers.length} user(s) selected
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => showToast('Bulk approve completed', 'success')}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => showToast('Bulk reject completed', 'success')}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => showToast('Export completed', 'success')}
                                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedUserForRejection?.full_name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeRejectModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please provide a clear reason for rejecting this application..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This message will be sent to the user via email.
                                </p>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-red-800 mb-1">
                                            Important Notice
                                        </h4>
                                        <p className="text-sm text-red-700">
                                            This action cannot be undone. The user will be notified of the rejection and the reason provided.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={closeRejectModal}
                                disabled={isSubmittingRejection}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRejection}
                                disabled={isSubmittingRejection || !rejectionReason.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {isSubmittingRejection ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Rejecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        <span>Reject Application</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllUsersAccountsPage;