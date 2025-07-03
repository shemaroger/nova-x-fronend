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
    UserCheck,
    MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getall_sme, approveSME } from '../Service/api';
import { useNavigate } from 'react-router-dom'

const AllUsersAccountsPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getall_sme();

            let usersList = [];

            // Check the correct format
            if (Array.isArray(response?.sme_profiles)) {
                usersList = response.sme_profiles;
            } else if (response?.sme_profiles) {
                usersList = response.sme_profiles;
            } else {
                console.warn('Unexpected response format:', response);
            }

            setUsers(usersList);

        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error('Failed to load SME accounts');
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
            user.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.representative_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.business_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.contact_phone?.includes(searchTerm) ||
            user.position?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || user.application_status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Sorting logic
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle date sorting
        if (sortBy.includes('_at') || sortBy === 'commencement_date') {
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

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';
        return `${baseUrl}${imagePath}`;
    };

    // Handle user actions
    const handleViewUser = (user) => {
        toast.info(`Viewing profile for ${user.business_name}`);
        navigate(`/dashboard/kycdocuments/${user.user_id}`);
    };




    const handleApproveUser = async (user) => {
        try {
            await approveSME(user.id);
            toast.success(`${user.business_name} has been approved successfully`);
            fetchUsers();
        } catch (err) {
            console.log(err)
            toast.error(`Failed to approve ${user.business_name}`);
        }
    };

    const handleRefresh = () => {
        toast.info('Refreshing SME accounts...');
        fetchUsers();
    };

    const handleExportAll = () => {
        toast.success('Exporting all SME data...');
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
        showToast(newSelection.length > 0 ? `Selected ${newSelection.length} SME(s)` : 'Deselected all SMEs');
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
                        <p className="text-gray-600">Loading SME accounts...</p>
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
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading SMEs</h3>
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
                        <Building className="w-6 h-6 mr-3 text-violet-600" />
                        SME Accounts
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage and monitor all SME business accounts ({sortedUsers.length} total)
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
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by business name, representative, email, industry..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        />
                    </div>
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
                        <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No SMEs found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'No SME accounts have been created yet'
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
                                        Business
                                    </th>
                                    <SortableHeader field="representative_name">Representative</SortableHeader>
                                    <SortableHeader field="business_email">Contact</SortableHeader>
                                    <SortableHeader field="industry">Industry</SortableHeader>
                                    <SortableHeader field="commencement_date">Commenced</SortableHeader>
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
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {user.profile_image ? (
                                                        <img
                                                            src={getImageUrl(user.profile_image)}
                                                            alt={user.business_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-white font-semibold text-sm">
                                                            {user.business_name?.charAt(0)?.toUpperCase() || 'B'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.business_name || 'Unknown Business'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {user.id}
                                                    </div>
                                                    {user.business_description && (
                                                        <div className="text-xs text-gray-400 max-w-xs truncate">
                                                            {user.business_description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <UserCheck className="w-4 h-4 mr-2 text-gray-400" />
                                                    {user.representative_name || 'No representative'}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.position || 'No position specified'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                    {user.business_email || 'No email'}
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
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {formatDate(user.commencement_date)}
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
                                                                    <hr className="my-1" />
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
                                                                    {/* <button
                                                                        onClick={() => {
                                                                            handleRejectUser(user);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 w-full text-left"
                                                                    >
                                                                        <XCircle className="w-4 h-4 mr-3 text-red-600" />
                                                                        Reject Application
                                                                    </button> */}
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
                            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, sortedUsers.length)} of {sortedUsers.length} SMEs
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
                            {selectedUsers.length} SME(s) selected
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
        </div>
    );
};

export default AllUsersAccountsPage;