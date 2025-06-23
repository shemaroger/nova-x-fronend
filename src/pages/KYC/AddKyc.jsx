import React, { useState, useEffect } from 'react';
import { Upload, FileText, Check, AlertCircle, X, Loader2, Eye, Download, Calendar, User, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { uploadKYCDocument, getKycDocumentsByUser, logout } from '../Service/api';

const KYCDocumentManager = () => {
    const navigate = useNavigate();
    const [selectedDocuments, setSelectedDocuments] = useState({});
    const [uploadStatus, setUploadStatus] = useState({});
    const [dragActive, setDragActive] = useState('');
    const [uploadProgress, setUploadProgress] = useState({});
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('upload');
    const [userId] = useState(() => localStorage.getItem('user_id'));

    const DOCUMENT_TYPES = [
        { value: 'id_document', label: 'ID Document (Passport/National ID)', icon: FileText },
        { value: 'proof_of_address', label: 'Proof of Address', icon: FileText },
        { value: 'business_document', label: 'Business Document', icon: FileText }
    ];

    const fetchDocuments = async () => {
        console.log('Fetching KYC documents...', userId);
        if (!userId) {
            setError('User ID not found. Please log in again.');
            return;
        }

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

            // Handle specific error cases
            if (err.status === 403) {
                setError('Access forbidden. You may not have permission to view these documents or your session may have expired.');
                toast.error('Access denied. Please check your permissions or try logging in again.');
            } else if (err.status === 401) {
                setError('Authentication required. Please log in again.');
                toast.error('Session expired. Please log in again.');
                // Optionally redirect to login
                setTimeout(() => {
                    handleLogout();
                }, 2000);
            } else if (err.status === 404) {
                setError('KYC documents endpoint not found.');
                toast.error('Service temporarily unavailable.');
            } else {
                setError(`Failed to load KYC documents: ${err.message || 'Unknown error'}`);
                toast.error('Failed to load KYC documents');
            }
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('User logged out successfully');
            navigate('/login', { replace: true });
        } catch (error) {
            toast.error('Logout failed');
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'documents') {
            fetchDocuments();
        }
    }, [activeTab, userId]);

    const handleFileSelect = (documentType, file) => {
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed');
            return;
        }

        setSelectedDocuments(prev => ({
            ...prev,
            [documentType]: file
        }));
        setUploadStatus(prev => ({
            ...prev,
            [documentType]: 'selected'
        }));

        toast.success(`${file.name} selected successfully`);
    };

    const handleDragOver = (e, documentType) => {
        e.preventDefault();
        setDragActive(documentType);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive('');
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


    const handleDownloadDocument = (document) => {
        if (document.document_file) {
            // Open the document in a new tab
            window.open(document.document_file, '_blank');

            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = document.document_file;
            link.download = `${document.document_type_display || 'document'}.pdf`; // Customize file name if needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.info(`Opening and downloading: ${document.document_type_display}`);
        } else {
            toast.error('Document file not available');
        }
    };



    const handleDrop = (e, documentType) => {
        e.preventDefault();
        setDragActive('');
        const file = e.dataTransfer.files[0];
        handleFileSelect(documentType, file);
    };

    const removeDocument = (documentType) => {
        const fileName = selectedDocuments[documentType]?.name;

        setSelectedDocuments(prev => {
            const updated = { ...prev };
            delete updated[documentType];
            return updated;
        });

        setUploadStatus(prev => {
            const updated = { ...prev };
            delete updated[documentType];
            return updated;
        });

        if (fileName) {
            toast.info(`${fileName} removed`);
        }
    };

    const handleSubmit = async () => {
        const documentsToUpload = Object.entries(selectedDocuments);
        if (documentsToUpload.length === 0) {
            toast.warning('Please select at least one document to upload');
            return;
        }

        try {
            toast.info('Starting document upload...');

            for (const [documentType, file] of documentsToUpload) {
                setUploadStatus(prev => ({ ...prev, [documentType]: 'uploading' }));
                setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

                try {
                    await uploadKYCDocument(documentType, file);
                    setUploadStatus(prev => ({ ...prev, [documentType]: 'success' }));
                    setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));

                    toast.success(`${file.name} uploaded successfully`);

                    setSelectedDocuments(prev => {
                        const updated = { ...prev };
                        delete updated[documentType];
                        return updated;
                    });
                } catch (error) {
                    setUploadStatus(prev => ({ ...prev, [documentType]: 'error' }));
                    toast.error(`Failed to upload ${file.name}: ${error.message || 'Upload failed'}`);
                }
            }

            const allSuccess = documentsToUpload.every(([documentType]) =>
                uploadStatus[documentType] === 'success'
            );

            if (allSuccess) {
                toast.success('All documents uploaded successfully! You will receive an email confirmation shortly.');
                // Refresh documents list
                fetchDocuments();
            }

        } catch (error) {
            toast.error(`Upload failed: ${error.message || 'Unknown error occurred'}`);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'selected': return 'bg-blue-50 border-blue-200';
            case 'uploading': return 'bg-yellow-50 border-yellow-200';
            case 'success': return 'bg-green-50 border-green-200';
            case 'error': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50 border-gray-200 hover:border-gray-300';
        }
    };

    const getStatusIcon = (documentType) => {
        const status = uploadStatus[documentType];
        switch (status) {
            case 'selected': return <FileText className="w-5 h-5 text-blue-500" />;
            case 'uploading': return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
            case 'success': return <Check className="w-5 h-5 text-green-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Upload className="w-5 h-5 text-gray-400" />;
        }
    };

    const getDocumentStatus = (status) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Approved
                </span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Pending Review
                </span>;
            case 'rejected':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <X className="w-3 h-3 mr-1" />
                    Rejected
                </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Unknown
                </span>;
        }
    };

    const formatFileSize = (bytes) => {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDocumentTypeLabel = (type) => {
        const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
        return docType ? docType.label : type;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center flex-1">
                            <User className="w-8 h-8 text-blue-600 mr-2" />
                            <h1 className="text-4xl font-bold text-gray-900">
                                KYC Document Center
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Upload and manage your KYC verification documents. Track approval status and maintain compliance.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-xl shadow-md">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'upload'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload Documents
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'documents'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FileText className="w-4 h-4 inline mr-2" />
                            My Documents
                        </button>
                    </div>
                </div>

                {/* Upload Tab */}
                {activeTab === 'upload' && (
                    <>
                        {/* Upload Cards */}
                        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 mb-8">
                            {DOCUMENT_TYPES.map((docType) => {
                                const file = selectedDocuments[docType.value];
                                const status = uploadStatus[docType.value];
                                const progress = uploadProgress[docType.value];

                                return (
                                    <div
                                        key={docType.value}
                                        className={`relative p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${dragActive === docType.value
                                            ? 'border-blue-400 bg-blue-50 scale-105'
                                            : getStatusColor(status)
                                            }`}
                                        onDragOver={(e) => handleDragOver(e, docType.value)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, docType.value)}
                                    >
                                        <div className="text-center">
                                            <div className="mb-4 flex justify-center">
                                                {getStatusIcon(docType.value)}
                                            </div>

                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {docType.label}
                                            </h3>

                                            {file && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                                        <div className="flex items-center space-x-2">
                                                            <FileText className="w-4 h-4 text-red-500" />
                                                            <span className="text-sm font-medium text-gray-700 truncate">
                                                                {file.name}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeDocument(docType.value)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>

                                                    {status === 'uploading' && (
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${progress || 0}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!file && (
                                                <div className="space-y-3">
                                                    <p className="text-gray-600 text-sm mb-4">
                                                        Drag and drop your PDF file here, or click to browse
                                                    </p>

                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            className="hidden"
                                                            onChange={(e) => handleFileSelect(docType.value, e.target.files[0])}
                                                        />
                                                        <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Choose File
                                                        </div>
                                                    </label>

                                                    <p className="text-xs text-gray-500">
                                                        PDF files only, max 10MB
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(selectedDocuments).length === 0}
                                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${Object.keys(selectedDocuments).length > 0
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {Object.values(uploadStatus).some(status => status === 'uploading')
                                    ? 'Uploading Documents...'
                                    : 'Submit Documents'
                                }
                            </button>

                            {Object.keys(selectedDocuments).length > 0 && (
                                <p className="text-sm text-gray-600 mt-4">
                                    {Object.keys(selectedDocuments).length} of {DOCUMENT_TYPES.length} documents selected
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Your KYC Documents</h2>
                            <button
                                onClick={fetchDocuments}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Refresh'
                                )}
                            </button>
                        </div>

                        {loading && (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                                <p className="text-gray-600">Loading your documents...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-red-700 font-medium">Unable to load documents</p>
                                        <p className="text-red-600 text-sm mt-1">{error}</p>
                                        {error.includes('403') || error.includes('forbidden') && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-red-600 text-sm font-medium">Possible solutions:</p>
                                                <ul className="text-red-600 text-sm list-disc list-inside space-y-1">
                                                    <li>Check if your account has KYC document access permissions</li>
                                                    <li>Verify that you're accessing documents for your own account</li>
                                                    <li>Try logging out and logging back in</li>
                                                    <li>Contact support if the issue persists</li>
                                                </ul>
                                                <button
                                                    onClick={handleLogout}
                                                    className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                                >
                                                    Log out and try again
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!loading && documents.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No documents found</h3>
                                <p className="text-gray-500 mb-6">You haven't uploaded any KYC documents yet.</p>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Upload Your First Document
                                </button>
                            </div>
                        )}

                        {!loading && documents.length > 0 && (
                            <div className="space-y-4">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <FileText className="w-5 h-5 text-gray-500" />
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {getDocumentTypeLabel(doc.document_type)}
                                                    </h3>
                                                    {getDocumentStatus(doc.status)}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center">
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        <span className="font-medium">{doc.file_name}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="font-medium">Size: </span>
                                                        <span className="ml-1">{formatFileSize(doc.file_size)}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        <span>{formatDate(doc.upload_date)}</span>
                                                    </div>
                                                </div>

                                                {doc.status === 'rejected' && doc.rejection_reason && (
                                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                                        <p className="text-sm text-red-700">
                                                            <strong>Rejection Reason:</strong> {doc.rejection_reason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex space-x-2 ml-4">
                                                <button
                                                    onClick={() => handleViewDocument(doc)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Document"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadDocument(doc)}
                                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Download Document"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KYCDocumentManager;