import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Eye,
    Download,
    RefreshCw,
    Calendar,
    Star,
    FileText,
    User,
    Clock,
    Award,
    Building,
    CreditCard,
    X,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getSMEAnalysis } from '../Service/api';

const AnalysisListingPage = () => {
    const [analyses, setAnalyses] = useState([]);
    const [filteredAnalyses, setFilteredAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(null);

    // Load analyses on component mount
    useEffect(() => {
        loadAnalyses();
    }, []);

    // Filter and sort analyses when dependencies change
    useEffect(() => {
        filterAndSortAnalyses();
    }, [analyses, searchTerm, ratingFilter, sortBy, sortOrder]);

    // Load analyses from API
    const loadAnalyses = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getSMEAnalysis();
            setAnalyses(data.results);
            toast.success('Analyses loaded successfully');
        } catch (err) {
            console.error('Error loading analyses:', err);
            setError(err.message || 'Failed to load analyses');
            toast.error('Failed to load analyses');
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort analyses
    const filterAndSortAnalyses = () => {
        let filtered = [...analyses];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(analysis => {
                const entityName = analysis.analysis_details?.entity || '';
                const accountNumber = analysis.analysis_details?.entity_info?.account_number || '';
                const tin = analysis.analysis_details?.entity_info?.tin || '';

                return (
                    entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    tin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    analysis.id.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        // Apply rating filter
        if (ratingFilter !== 'all') {
            filtered = filtered.filter(analysis => {
                const category = getRatingCategory(analysis.rating);
                return category === ratingFilter;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'rating':
                    aValue = a.rating || 0;
                    bValue = b.rating || 0;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case 'entity':
                    aValue = a.analysis_details?.entity || '';
                    bValue = b.analysis_details?.entity || '';
                    break;
                default:
                    aValue = a[sortBy] || '';
                    bValue = b[sortBy] || '';
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredAnalyses(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    };

    // Get rating category
    const getRatingCategory = (rating) => {
        if (rating === null || rating === undefined) return 'pending';
        if (rating >= 8.0) return 'excellent';
        if (rating >= 6.0) return 'good';
        if (rating >= 4.0) return 'average';
        return 'poor';
    };

    // Get rating color
    const getRatingColor = (rating) => {
        if (rating === null || rating === undefined) return 'text-gray-500 bg-gray-100';
        if (rating >= 8.0) return 'text-green-700 bg-green-100';
        if (rating >= 6.0) return 'text-yellow-700 bg-yellow-100';
        if (rating >= 4.0) return 'text-orange-700 bg-orange-100';
        return 'text-red-700 bg-red-100';
    };

    // Get rating icon
    const getRatingIcon = (rating) => {
        if (rating === null || rating === undefined) return <Clock className="w-4 h-4" />;
        if (rating >= 8.0) return <CheckCircle className="w-4 h-4" />;
        if (rating >= 6.0) return <AlertCircle className="w-4 h-4" />;
        return <XCircle className="w-4 h-4" />;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format processing time
    const formatProcessingTime = (analysis) => {
        if (!analysis.updated_at || !analysis.created_at) return 'Unknown';

        const created = new Date(analysis.created_at);
        const updated = new Date(analysis.updated_at);
        const diff = updated - created;

        if (diff < 1000) return 'Less than 1 second';
        if (diff < 60000) return `${Math.floor(diff / 1000)} seconds`;
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes`;
        return `${Math.floor(diff / 3600000)} hours`;
    };

    // Generate PDF Report
    const generatePDFReport = async (analysis) => {
        try {
            setDownloadingPdf(analysis.id);

            const details = analysis.analysis_details || {};
            const entityInfo = details.entity_info || {};
            const documentFeatures = details.document_features || {};
            const dateInfo = details.date_info || {};

            // Create PDF content as HTML
            const pdfContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>SME Analysis Report - ${details.entity || 'Unknown Entity'}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.6; 
                            color: #333;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 30px; 
                            border-bottom: 2px solid #4f46e5; 
                            padding-bottom: 20px;
                        }
                        .header h1 { 
                            color: #4f46e5; 
                            margin: 0;
                        }
                        .rating-section { 
                            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin: 20px 0; 
                            text-align: center;
                        }
                        .rating-badge { 
                            display: inline-block; 
                            padding: 10px 20px; 
                            border-radius: 20px; 
                            font-size: 24px; 
                            font-weight: bold;
                            background: ${analysis.rating >= 8.0 ? '#dcfce7' :
                    analysis.rating >= 6.0 ? '#fef3c7' :
                        analysis.rating >= 4.0 ? '#fed7aa' : '#fecaca'};
                            color: ${analysis.rating >= 8.0 ? '#166534' :
                    analysis.rating >= 6.0 ? '#a16207' :
                        analysis.rating >= 4.0 ? '#c2410c' : '#dc2626'};
                        }
                        .section { 
                            margin: 30px 0; 
                            padding: 20px; 
                            border: 1px solid #e5e7eb; 
                            border-radius: 8px;
                        }
                        .section h2 { 
                            color: #4f46e5; 
                            border-bottom: 1px solid #e5e7eb; 
                            padding-bottom: 10px; 
                            margin-top: 0;
                        }
                        .grid { 
                            display: grid; 
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                            gap: 20px; 
                            margin-top: 15px;
                        }
                        .grid-item { 
                            background: #f9fafb; 
                            padding: 15px; 
                            border-radius: 6px;
                        }
                        .grid-item strong { 
                            color: #374151; 
                            display: block; 
                            margin-bottom: 5px;
                        }
                        .metric-grid { 
                            display: grid; 
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                            gap: 15px; 
                            margin-top: 15px;
                        }
                        .metric { 
                            background: #f3f4f6; 
                            padding: 15px; 
                            border-radius: 6px; 
                            text-align: center;
                        }
                        .metric-value { 
                            font-size: 24px; 
                            font-weight: bold; 
                            color: #4f46e5;
                        }
                        .metric-label { 
                            color: #6b7280; 
                            font-size: 14px; 
                            margin-top: 5px;
                        }
                        .footer { 
                            margin-top: 40px; 
                            text-align: center; 
                            color: #6b7280; 
                            font-size: 12px; 
                            border-top: 1px solid #e5e7eb; 
                            padding-top: 20px;
                        }
                        .status { 
                            display: inline-block; 
                            padding: 5px 15px; 
                            border-radius: 15px; 
                            font-size: 12px; 
                            font-weight: bold;
                            background: ${analysis.rating ? '#dcfce7' : '#fef3c7'};
                            color: ${analysis.rating ? '#166534' : '#a16207'};
                        }
                        @media print {
                            body { margin: 0; }
                            .section { break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>SME Analysis Report</h1>
                        <p>Generated on ${new Date().toLocaleDateString()}</p>
                        <p>Analysis ID: ${analysis.id}</p>
                    </div>

                    <div class="rating-section">
                        <h2>Overall Rating</h2>
                        <div class="rating-badge">
                            ${analysis.rating ? `${analysis.rating}/10` : 'Pending'}
                        </div>
                        <p style="margin-top: 10px;">
                            <span class="status">
                                ${analysis.rating ? 'Completed' : 'Processing'}
                            </span>
                        </p>
                    </div>

                    <div class="section">
                        <h2>Entity Information</h2>
                        <div class="grid">
                            <div class="grid-item">
                                <strong>Entity Name:</strong>
                                ${details.entity || 'Unknown'}
                            </div>
                            <div class="grid-item">
                                <strong>Account Number:</strong>
                                ${entityInfo.account_number || 'Unknown'}
                            </div>
                            <div class="grid-item">
                                <strong>TIN:</strong>
                                ${entityInfo.tin || 'Unknown'}
                            </div>
                            <div class="grid-item">
                                <strong>Currency:</strong>
                                ${entityInfo.currency || 'Unknown'}
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>Document Analysis Metrics</h2>
                        <div class="metric-grid">
                            <div class="metric">
                                <div class="metric-value">${documentFeatures.transaction_count || 0}</div>
                                <div class="metric-label">Total Transactions</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">${documentFeatures.credit_count || 0}</div>
                                <div class="metric-label">Credit Transactions</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">${documentFeatures.debit_count || 0}</div>
                                <div class="metric-label">Debit Transactions</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">${documentFeatures.credit_debit_ratio || 0}</div>
                                <div class="metric-label">Credit/Debit Ratio</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">${documentFeatures.closing_balance || 0}</div>
                                <div class="metric-label">Closing Balance</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">${documentFeatures.compliance_score || 0}</div>
                                <div class="metric-label">Compliance Score</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>Date Information</h2>
                        <div class="grid">
                            <div class="grid-item">
                                <strong>Statement Period:</strong>
                                ${dateInfo.statement_start_date && dateInfo.statement_end_date
                    ? `${formatDate(dateInfo.statement_start_date)} - ${formatDate(dateInfo.statement_end_date)}`
                    : 'Unknown'
                }
                            </div>
                            <div class="grid-item">
                                <strong>Tax Clearance Validity:</strong>
                                ${dateInfo.tax_clearance_valid_from && dateInfo.tax_clearance_valid_to
                    ? `${formatDate(dateInfo.tax_clearance_valid_from)} - ${formatDate(dateInfo.tax_clearance_valid_to)}`
                    : 'Unknown'
                }
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>Processing Information</h2>
                        <div class="grid">
                            <div class="grid-item">
                                <strong>Created At:</strong>
                                ${formatDate(analysis.created_at)}
                            </div>
                            <div class="grid-item">
                                <strong>Completed At:</strong>
                                ${formatDate(analysis.updated_at)}
                            </div>
                            <div class="grid-item">
                                <strong>Processing Time:</strong>
                                ${formatProcessingTime(analysis)}
                            </div>
                            <div class="grid-item">
                                <strong>Status:</strong>
                                ${analysis.rating ? 'Completed' : 'Processing'}
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>This report was automatically generated by the SME Analysis System</p>
                        <p>Report generated at: ${new Date().toLocaleString()}</p>
                    </div>
                </body>
                </html>
            `;

            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(pdfContent);
            printWindow.document.close();

            // Wait for content to load, then print
            printWindow.onload = function () {
                printWindow.print();
                printWindow.close();
            };

            // Alternative: Download as HTML file
            const blob = new Blob([pdfContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SME_Analysis_Report_${details.entity || 'Unknown'}_${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Report downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF report');
        } finally {
            setDownloadingPdf(null);
        }
    };

    // Handle sort
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    // Handle view details
    const handleViewDetails = (analysis) => {
        setSelectedAnalysis(analysis);
        setShowDetailModal(true);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAnalyses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);

    // Table Header Component
    const TableHeader = ({ field, children }) => (
        <th
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                {sortBy === field && (
                    sortOrder === 'asc' ?
                        <ChevronUp className="w-4 h-4" /> :
                        <ChevronDown className="w-4 h-4" />
                )}
            </div>
        </th>
    );

    // Detail Modal Component
    const DetailModal = ({ analysis, onClose }) => {
        if (!analysis) return null;

        const details = analysis.analysis_details || {};
        const entityInfo = details.entity_info || {};
        const documentFeatures = details.document_features || {};
        const dateInfo = details.date_info || {};

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Analysis Details</h2>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => generatePDFReport(analysis)}
                                disabled={downloadingPdf === analysis.id}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center space-x-2 disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                <span>{downloadingPdf === analysis.id ? 'Generating...' : 'Download PDF'}</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Analysis Overview */}
                        <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <Award className="w-8 h-8 text-violet-600" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Overall Rating</h3>
                                        <p className="text-sm text-gray-600">Analysis ID: {analysis.id}</p>
                                    </div>
                                </div>
                                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getRatingColor(analysis.rating)}`}>
                                    {getRatingIcon(analysis.rating)}
                                    <span className="ml-2">
                                        {analysis.rating ? `${analysis.rating}/10` : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Entity Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Building className="w-5 h-5 mr-2" />
                                Entity Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Entity Name:</span>
                                    <p className="text-sm text-gray-900">{details.entity || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Account Number:</span>
                                    <p className="text-sm text-gray-900">{entityInfo.account_number || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">TIN:</span>
                                    <p className="text-sm text-gray-900">{entityInfo.tin || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Currency:</span>
                                    <p className="text-sm text-gray-900">{entityInfo.currency || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Document Features */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Document Analysis
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <span className="text-sm font-medium text-gray-500">Transaction Count</span>
                                    <p className="text-lg font-semibold text-gray-900">{documentFeatures.transaction_count || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <span className="text-sm font-medium text-gray-500">Credit Count</span>
                                    <p className="text-lg font-semibold text-green-600">{documentFeatures.credit_count || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <span className="text-sm font-medium text-gray-500">Debit Count</span>
                                    <p className="text-lg font-semibold text-red-600">{documentFeatures.debit_count || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <span className="text-sm font-medium text-gray-500">Credit/Debit Ratio</span>
                                    <p className="text-lg font-semibold text-blue-600">{documentFeatures.credit_debit_ratio || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <span className="text-sm font-medium text-gray-500">Closing Balance</span>
                                    <p className="text-lg font-semibold text-gray-900">{documentFeatures.closing_balance || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <span className="text-sm font-medium text-gray-500">Compliance Score</span>
                                    <p className="text-lg font-semibold text-purple-600">{documentFeatures.compliance_score || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Date Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Date Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Statement Period:</span>
                                    <p className="text-sm text-gray-900">
                                        {dateInfo.statement_start_date && dateInfo.statement_end_date
                                            ? `${formatDate(dateInfo.statement_start_date)} - ${formatDate(dateInfo.statement_end_date)}`
                                            : 'Unknown'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Tax Clearance Validity:</span>
                                    <p className="text-sm text-gray-900">
                                        {dateInfo.tax_clearance_valid_from && dateInfo.tax_clearance_valid_to
                                            ? `${formatDate(dateInfo.tax_clearance_valid_from)} - ${formatDate(dateInfo.tax_clearance_valid_to)}`
                                            : 'Unknown'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Processing Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                Processing Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Created At:</span>
                                    <p className="text-sm text-gray-900">{formatDate(analysis.created_at)}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Completed At:</span>
                                    <p className="text-sm text-gray-900">{formatDate(analysis.updated_at)}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Processing Time:</span>
                                    <p className="text-sm text-gray-900">{formatProcessingTime(analysis)}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Status:</span>
                                    <p className="text-sm text-gray-900">
                                        {analysis.rating ? 'Completed' : 'Processing'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading analyses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={loadAnalyses}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
                    <p className="text-gray-600 mt-2">View and manage your document analysis results</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by entity name, account number, TIN, or analysis ID..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                            >
                                <option value="all">All Ratings</option>
                                <option value="excellent">Excellent (8.0+)</option>
                                <option value="good">Good (6.0-7.9)</option>
                                <option value="average">Average (4.0-5.9)</option>
                                <option value="poor">Poor (&lt;4.0)</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={loadAnalyses}
                            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center space-x-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAnalyses.length)} of {filteredAnalyses.length} analyses
                    </p>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <TableHeader field="entity">Entity</TableHeader>
                                    <TableHeader field="rating">Rating</TableHeader>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account Info
                                    </th>
                                    <TableHeader field="created_at">Created</TableHeader>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((analysis) => {
                                    const entityInfo = analysis.analysis_details?.entity_info || {};

                                    return (
                                        <tr key={analysis.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {analysis.analysis_details?.entity || 'Unknown Entity'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {analysis.id.slice(0, 8)}...
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(analysis.rating)}`}>
                                                    {getRatingIcon(analysis.rating)}
                                                    <span className="ml-2">
                                                        {analysis.rating ? `${analysis.rating}/10` : 'Pending'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {entityInfo.account_number || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    TIN: {entityInfo.tin || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(analysis.created_at)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatProcessingTime(analysis)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${analysis.rating ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {analysis.rating ? 'Completed' : 'Processing'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleViewDetails(analysis)}
                                                        className="text-violet-600 hover:text-violet-900 flex items-center space-x-1"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span>View</span>
                                                    </button>
                                                    <button
                                                        onClick={() => generatePDFReport(analysis)}
                                                        disabled={downloadingPdf === analysis.id}
                                                        className="text-blue-600 hover:text-blue-900 cursor-pointer flex items-center space-x-1 disabled:opacity-50"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        <span>
                                                            {downloadingPdf === analysis.id ? 'Generating...' : 'PDF'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {filteredAnalyses.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
                        <p className="text-gray-600">
                            {searchTerm || ratingFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Start by uploading documents for analysis.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedAnalysis && (
                <DetailModal
                    analysis={selectedAnalysis}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedAnalysis(null);
                    }}
                />
            )}
        </div>
    );
};

export default AnalysisListingPage;