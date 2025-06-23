import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    Download,
    Eye,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Calendar,
    RefreshCw,
    Upload,
    ArrowUpDown,
    ArrowLeft,
    FileCheck,
    Settings,
    Shield,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getKycDocumentsByUser, approveKycDocument, rejectKycDocument } from '../Service/api';
import { useParams, useNavigate } from 'react-router-dom'

const KYCDocumentsPage = () => {
    const { userId } = useParams();

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDocType, setFilterDocType] = useState('all');
    const [sortBy, setSortBy] = useState('uploaded_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [documentsPerPage] = useState(10);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate();


    const fetchDocuments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getKycDocumentsByUser(userId);

            let documentsList = [];

            if (Array.isArray(response)) {
                documentsList = response;
            } else if (Array.isArray(response?.data)) {
                documentsList = response.data;
            } else if (Array.isArray(response?.documents)) {
                documentsList = response.documents;
            } else if (Array.isArray(response?.kyc_documents)) {
                documentsList = response.kyc_documents;
            } else {
                console.warn('Unexpected response format:', response);
            }

            setDocuments(documentsList);
            console.log('Fetched KYC documents:', documentsList);

        } catch (err) {
            console.error('Error fetching KYC documents:', err);
            toast.error('Failed to load KYC documents');
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Toast notification helper
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
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch =
            doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.document_type_display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.id?.toString().includes(searchTerm);

        const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
        const matchesDocType = filterDocType === 'all' || doc.document_type === filterDocType;

        return matchesSearch && matchesStatus && matchesDocType;
    });

    // Sorting logic
    const sortedDocuments = [...filteredDocuments].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle date sorting
        if (sortBy.includes('_at')) {
            aValue = new Date(aValue || 0);
            bValue = new Date(bValue || 0);
        }

        // Handle file size sorting
        if (sortBy === 'file_size') {
            aValue = parseFloat(aValue || 0);
            bValue = parseFloat(bValue || 0);
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination logic
    const indexOfLastDocument = currentPage * documentsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
    const currentDocuments = sortedDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
    const totalPages = Math.ceil(sortedDocuments.length / documentsPerPage);

    // Status badge component
    const StatusBadge = ({ status, statusDisplay }) => {
        const statusConfig = {
            pending: {
                icon: <Clock className="w-4 h-4" />,
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                text: statusDisplay || 'Pending Approval'
            },
            approved: {
                icon: <CheckCircle className="w-4 h-4" />,
                className: 'bg-green-100 text-green-800 border-green-200',
                text: statusDisplay || 'Approved'
            },
            rejected: {
                icon: <XCircle className="w-4 h-4" />,
                className: 'bg-red-100 text-red-800 border-red-200',
                text: statusDisplay || 'Rejected'
            },
            under_review: {
                icon: <Eye className="w-4 h-4" />,
                className: 'bg-blue-100 text-blue-800 border-blue-200',
                text: statusDisplay || 'Under Review'
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

    const DocumentTypeBadge = ({ type, typeDisplay }) => {
        const typeConfig = {
            'national_id': {
                icon: <Shield className="w-4 h-4" />,
                className: 'bg-purple-100 text-purple-800 border-purple-200'
            },
            'passport': {
                icon: <FileText className="w-4 h-4" />,
                className: 'bg-indigo-100 text-indigo-800 border-indigo-200'
            },
            'driving_license': {
                icon: <FileCheck className="w-4 h-4" />,
                className: 'bg-cyan-100 text-cyan-800 border-cyan-200'
            },
            'proof_of_address': {
                icon: <FileText className="w-4 h-4" />,
                className: 'bg-orange-100 text-orange-800 border-orange-200'
            },
            'bank_statement': {
                icon: <FileText className="w-4 h-4" />,
                className: 'bg-green-100 text-green-800 border-green-200'
            }
        };

        const config = typeConfig[type] || {
            icon: <FileText className="w-4 h-4" />,
            className: 'bg-gray-100 text-gray-800 border-gray-200'
        };

        return (
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
                {config.icon}
                <span className="ml-1">{typeDisplay || type}</span>
            </div>
        );
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format file size
    const formatFileSize = (size) => {
        if (!size) return 'N/A';
        return `${size} MB`;
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

    // Handle document actions
    const handleViewDocument = (document) => {
        if (document.document_file) {
            window.open(document.document_file, '_blank');
            toast.info(`Opening document: ${document.document_type_display}`);
        } else {
            toast.error('Document file not available');
        }
    };


    const handleApproveDocument = async (document) => {
        try {
            // Add approve API call here
            await approveKycDocument(document.id);
            toast.success(`${document.document_type_display} has been approved`);
            fetchDocuments();
        } catch (err) {
            console.log(err);
            toast.error(`Failed to approve document`);
        }
    };

    const handleRejectDocument = async (document) => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason) {
            try {
                await rejectKycDocument(document.id, reason);
                toast.success(`${document.document_type_display} has been rejected`);
                fetchDocuments();
            } catch (err) {
                console.log(err);
                toast.error(`Failed to reject document`);
            }
        }
    };

    const handleRefresh = () => {
        toast.info('Refreshing KYC documents...');
        fetchDocuments();
    };

    const handleExportAll = () => {
        toast.success('Exporting all KYC documents data...');
        // Add export logic here
    };



    const onBackbutton = () => {
        navigate(-1);
    };


    const handleSelectDocument = (documentId) => {
        setSelectedDocuments(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const handleSelectAll = () => {
        const newSelection = selectedDocuments.length === currentDocuments.length ? [] : currentDocuments.map(doc => doc.id);
        setSelectedDocuments(newSelection);
        showToast(newSelection.length > 0 ? `Selected ${newSelection.length} document(s)` : 'Deselected all documents');
    };

    // Toggle dropdown
    const toggleDropdown = (documentId) => {
        setOpenDropdown(openDropdown === documentId ? null : documentId);
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
                        <p className="text-gray-600">Loading KYC documents...</p>
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
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Documents</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDocuments}
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
                        <FileText className="w-6 h-6 mr-3 text-violet-600" />
                        KYC Documents
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Review and manage all KYC verification documents ({sortedDocuments.length} total)
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
                    <button
                        onClick={() => onBackbutton()}
                        className="px-4 py-2 bg-violet-600 text-white cursor-pointer rounded-lg hover:bg-violet-700 transition-colors flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span></span>
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
                            placeholder="Search by document type, status, ID..."
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
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select
                            value={filterDocType}
                            onChange={(e) => setFilterDocType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        >
                            <option value="all">All Document Types</option>
                            <option value="national_id">National ID</option>
                            <option value="passport">Passport</option>
                            <option value="driving_license">Driving License</option>
                            <option value="proof_of_address">Proof of Address</option>
                            <option value="bank_statement">Bank Statement</option>
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

            {/* Documents Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {currentDocuments.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterStatus !== 'all' || filterDocType !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'No KYC documents have been uploaded yet'
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
                                            checked={selectedDocuments.length === currentDocuments.length && currentDocuments.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                                        />
                                    </th>
                                    <SortableHeader field="id">Document ID</SortableHeader>
                                    <SortableHeader field="document_type">Document Type</SortableHeader>
                                    <SortableHeader field="status">Status</SortableHeader>
                                    <SortableHeader field="file_size">File Size</SortableHeader>
                                    <SortableHeader field="uploaded_at">Upload Date</SortableHeader>
                                    <SortableHeader field="reviewed_at">Review Date</SortableHeader>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentDocuments.map((document) => (
                                    <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocuments.includes(document.id)}
                                                onChange={() => handleSelectDocument(document.id)}
                                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        #{document.id}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Document ID
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <DocumentTypeBadge
                                                type={document.document_type}
                                                typeDisplay={document.document_type_display}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge
                                                status={document.status}
                                                statusDisplay={document.status_display}
                                            />
                                            {document.rejection_reason && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Reason: {document.rejection_reason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatFileSize(document.file_size)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {formatDate(document.uploaded_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {formatDate(document.reviewed_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="relative dropdown-container">
                                                <button
                                                    onClick={() => toggleDropdown(document.id)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                    title="More actions"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openDropdown === document.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                        <div className="py-1">

                                                            <button
                                                                onClick={() => {
                                                                    handleViewDocument(document);
                                                                    setOpenDropdown(null);
                                                                }}
                                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                                            >
                                                                <ExternalLink className="w-4 h-4 mr-3 text-blue-600" />
                                                                View Document
                                                            </button>

                                                            {document.status === 'pending' && (
                                                                <>
                                                                    <hr className="my-1" />
                                                                    <button
                                                                        onClick={() => {
                                                                            handleApproveDocument(document);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 w-full text-left"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                                                                        Approve Document
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleRejectDocument(document);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 w-full text-left"
                                                                    >
                                                                        <XCircle className="w-4 h-4 mr-3 text-red-600" />
                                                                        Reject Document
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
                            Showing {indexOfFirstDocument + 1} to {Math.min(indexOfLastDocument, sortedDocuments.length)} of {sortedDocuments.length} documents
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
            {selectedDocuments.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                            {selectedDocuments.length} document(s) selected
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

export default KYCDocumentsPage;