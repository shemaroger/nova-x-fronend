import React, { useState } from 'react';
import {
    Upload,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    X,
    Download,
    Eye,
    Trash2,
    RefreshCw,
    Save,
    ArrowLeft,
    Clock,
    Star,
    Calendar,
    Award,
    User,
    Building,
    CreditCard,
    DollarSign,
    Shield,
    TrendingUp,
    Play,
    ExternalLink,
    AlertTriangle,
    Ban
} from 'lucide-react';

// Import your API function
import { uploadAnalyisisDocument } from '../Service/api';

const DocumentUploadPage = () => {
    const [formData, setFormData] = useState({
        cashflow_document: null,
        tax_clearance_document: null
    });

    const [setPreviews] = useState({
        cashflow_document: null,
        tax_clearance_document: null
    });

    const [dragActive, setDragActive] = useState({
        cashflow_document: false,
        tax_clearance_document: false
    });

    const [uploadStatus, setUploadStatus] = useState({
        cashflow_document: 'idle',
        tax_clearance_document: 'idle'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [showCreditScoreModal, setShowCreditScoreModal] = useState(false);
    const [creditScoreData, setCreditScoreData] = useState(null);

    // Enhanced file validation - ONLY PDF allowed
    const allowedTypes = ['application/pdf'];
    const allowedExtensions = ['.pdf'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    // Enhanced file validation function
    const validateFile = (file) => {
        const errors = [];

        if (!allowedTypes.includes(file.type)) {
            errors.push('Only PDF documents are allowed. Please select a PDF file.');
        }

        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExtension) {
            errors.push('Invalid file format. Only PDF files (.pdf) are accepted.');
        }

        if (file.size > maxFileSize) {
            errors.push('File size must be less than 10MB. Please compress your PDF or select a smaller file.');
        }

        if (file.size === 0) {
            errors.push('The selected file appears to be empty. Please select a valid PDF document.');
        }

        return errors;
    };

    // Handle file selection with enhanced validation
    const handleFileSelect = (documentType, file) => {
        const validationErrors = validateFile(file);

        if (validationErrors.length > 0) {
            setErrors(prev => ({
                ...prev,
                [documentType]: validationErrors[0]
            }));

            showToast(validationErrors[0], 'error');

            const fileInput = document.querySelector(`input[data-document-type="${documentType}"]`);
            if (fileInput) {
                fileInput.value = '';
            }
            return;
        }

        setErrors(prev => ({
            ...prev,
            [documentType]: null
        }));

        setFormData(prev => ({
            ...prev,
            [documentType]: file
        }));

        setPreviews(prev => ({
            ...prev,
            [documentType]: null
        }));

        setUploadStatus(prev => ({
            ...prev,
            [documentType]: 'success'
        }));

        const documentName = documentType === 'cashflow_document' ? 'Cashflow Document' : 'Tax Clearance Document';
        showToast(`${documentName} uploaded successfully! Ready for analysis.`, 'success');
    };

    // Enhanced drag event handling with file type checking
    const handleDrag = (e, documentType) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            if (e.dataTransfer && e.dataTransfer.items) {
                const hasInvalidFiles = Array.from(e.dataTransfer.items).some(item => {
                    return item.type !== 'application/pdf';
                });

                if (hasInvalidFiles) {
                    setDragActive(prev => ({
                        ...prev,
                        [documentType]: false
                    }));
                    setErrors(prev => ({
                        ...prev,
                        [documentType]: 'Only PDF files are allowed'
                    }));
                    return;
                }
            }

            setDragActive(prev => ({
                ...prev,
                [documentType]: true
            }));
        } else if (e.type === 'dragleave') {
            setDragActive(prev => ({
                ...prev,
                [documentType]: false
            }));
        }
    };

    // Enhanced drop handling
    const handleDrop = (e, documentType) => {
        e.preventDefault();
        e.stopPropagation();

        setDragActive(prev => ({
            ...prev,
            [documentType]: false
        }));

        const files = e.dataTransfer.files;

        if (!files || files.length === 0) {
            showToast('No files detected. Please try again.', 'error');
            return;
        }

        if (files.length > 1) {
            showToast('Please upload only one PDF document at a time.', 'error');
            return;
        }

        const file = files[0];

        if (file.type !== 'application/pdf') {
            setErrors(prev => ({
                ...prev,
                [documentType]: 'Only PDF documents are allowed'
            }));
            showToast('Invalid file type! Only PDF documents (.pdf) are accepted. Please select a PDF file.', 'error');
            return;
        }

        handleFileSelect(documentType, file);
    };

    // Enhanced file input change handler
    const handleFileInputChange = (e, documentType) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.type !== 'application/pdf') {
            setErrors(prev => ({
                ...prev,
                [documentType]: 'Only PDF documents are allowed'
            }));
            showToast('Invalid file type! Please select a PDF document only.', 'error');
            e.target.value = '';
            return;
        }

        handleFileSelect(documentType, file);
    };

    // Remove file function
    const removeFile = (documentType) => {
        setFormData(prev => ({
            ...prev,
            [documentType]: null
        }));

        setPreviews(prev => ({
            ...prev,
            [documentType]: null
        }));

        setUploadStatus(prev => ({
            ...prev,
            [documentType]: 'idle'
        }));

        setErrors(prev => ({
            ...prev,
            [documentType]: null
        }));

        const fileInput = document.querySelector(`input[data-document-type="${documentType}"]`);
        if (fileInput) {
            fileInput.value = '';
        }

        showToast('File removed successfully', 'success');
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString || dateString === "Unknown") return "Unknown";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get rating color and category
    const getRatingColor = (rating) => {
        if (rating >= 8) return 'text-green-600 bg-green-100';
        if (rating >= 6) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getRatingCategory = (rating) => {
        if (rating >= 8) return 'Excellent';
        if (rating >= 6) return 'Good';
        if (rating >= 4) return 'Fair';
        return 'Poor';
    };

    // Credit Score specific functions
    const getCreditScoreColor = (score) => {
        if (score >= 8) return 'text-green-600';
        if (score >= 6) return 'text-yellow-600';
        if (score >= 4) return 'text-orange-600';
        return 'text-red-600';
    };

    const getCreditScoreBgColor = (score) => {
        if (score >= 8) return 'bg-green-100 border-green-200';
        if (score >= 6) return 'bg-yellow-100 border-yellow-200';
        if (score >= 4) return 'bg-orange-100 border-orange-200';
        return 'bg-red-100 border-red-200';
    };

    // Toast notification function
    const showToast = (message, type = 'info') => {
        // Since we can't use react-toastify in this environment, we'll use console for now
        // In your actual implementation, replace this with your toast library
        console.log(`${type.toUpperCase()}: ${message}`);
    };

    // Check credit score and show notification
    const checkCreditScore = (result) => {
        const creditScore = result.rating || 0;

        if (creditScore < 5) {
            setCreditScoreData({
                score: creditScore,
                isBlocked: true,
                message: 'Your credit score is below the minimum threshold for upgrades.',
                recommendations: [
                    {
                        title: 'Improve Your Credit Score',
                        description: 'Learn essential strategies to boost your credit rating',
                        videoUrl: 'https://example.com/credit-improvement-video',
                        type: 'video'
                    },
                    {
                        title: 'Financial Planning Guide',
                        description: 'Comprehensive guide to better financial management',
                        videoUrl: 'https://example.com/financial-planning-guide',
                        type: 'guide'
                    }
                ]
            });
            setShowCreditScoreModal(true);
        } else if (creditScore < 6) {
            setCreditScoreData({
                score: creditScore,
                isBlocked: false,
                message: 'Your credit score could be improved for better opportunities.',
                recommendations: [
                    {
                        title: 'Credit Enhancement Tips',
                        description: 'Simple steps to improve your credit standing',
                        videoUrl: 'https://example.com/credit-enhancement-tips',
                        type: 'video'
                    }
                ]
            });
            setShowCreditScoreModal(true);
        }
    };

    // Handle form submission with real API
    const handleSubmit = async () => {
        // Validation
        const newErrors = {};
        if (!formData.cashflow_document) {
            newErrors.cashflow_document = 'Cashflow document is required';
        }
        if (!formData.tax_clearance_document) {
            newErrors.tax_clearance_document = 'Tax clearance document is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast('Please upload both required PDF documents', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare FormData for multipart/form-data
            const analysisData = new FormData();
            analysisData.append('cashflow_document', formData.cashflow_document);
            analysisData.append('tax_clearance_document', formData.tax_clearance_document);

            // Call the real API
            const result = await uploadAnalyisisDocument(analysisData);

            setAnalysisResult(result);
            setShowResults(true);

            // Check credit score after successful analysis
            checkCreditScore(result);

            showToast('Documents uploaded and analyzed successfully!', 'success');

        } catch (error) {
            console.error('Upload error:', error);

            if (error.response) {
                const errorMessage = error.response.data?.error || 'Server error occurred';
                const errorDetails = error.response.data?.details;

                if (error.response.status === 400) {
                    showToast(`Validation Error: ${errorMessage}`, 'error');
                } else if (error.response.status === 503) {
                    showToast(`Service Unavailable: ${errorMessage}`, 'error');
                } else if (error.response.status === 500) {
                    showToast(`Analysis Error: ${errorMessage}`, 'error');
                } else {
                    showToast(`Error: ${errorMessage}`, 'error');
                }

                if (errorDetails) {
                    console.error('Error details:', errorDetails);
                }
            } else if (error.request) {
                showToast('Network error: Unable to connect to server. Please check your internet connection.', 'error');
            } else {
                showToast('An unexpected error occurred. Please try again.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle upgrade request
    const handleUpgradeRequest = () => {
        if (creditScoreData && creditScoreData.isBlocked) {
            showToast('Upgrade blocked due to low credit score. Please improve your credit score first.', 'error');
            return;
        }

        // Proceed with upgrade logic
        showToast('Upgrade request submitted successfully!', 'success');
    };

    // Handle new analysis
    const handleNewAnalysis = () => {
        setShowResults(false);
        setAnalysisResult(null);
        setShowCreditScoreModal(false);
        setCreditScoreData(null);
        setFormData({
            cashflow_document: null,
            tax_clearance_document: null
        });
        setPreviews({
            cashflow_document: null,
            tax_clearance_document: null
        });
        setUploadStatus({
            cashflow_document: 'idle',
            tax_clearance_document: 'idle'
        });
        setErrors({});
    };

    // Credit Score Modal Component
    const CreditScoreModal = ({ isOpen, onClose, data }) => {
        if (!isOpen || !data) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                {data.isBlocked ? (
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <Ban className="w-6 h-6 text-red-600" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {data.isBlocked ? 'Upgrade Blocked' : 'Credit Score Alert'}
                                    </h3>
                                    <p className="text-sm text-gray-600">Credit Score: {data.score}/10</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className={`p-4 rounded-lg border-2 mb-6 ${getCreditScoreBgColor(data.score)}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Your Credit Score</span>
                                <span className={`text-2xl font-bold ${getCreditScoreColor(data.score)}`}>
                                    {data.score}/10
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${data.score >= 8 ? 'bg-green-500' : data.score >= 6 ? 'bg-yellow-500' : data.score >= 4 ? 'bg-orange-500' : 'bg-red-500'}`}
                                    style={{ width: `${(data.score / 10) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">{data.message}</p>

                            {data.isBlocked && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">
                                                <strong>Upgrade Blocked:</strong> Your credit score is below the minimum threshold of 5.0.
                                                Please improve your credit score before requesting an upgrade.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Recommended Resources
                            </h4>
                            <div className="space-y-3">
                                {data.recommendations.map((rec, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900 mb-1">{rec.title}</h5>
                                                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {rec.type === 'video' ? 'Video' : 'Guide'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => window.open(rec.videoUrl, '_blank')}
                                                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                                            >
                                                <Play className="w-3 h-3" />
                                                <span>Watch</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Close
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleUpgradeRequest}
                                    disabled={data.isBlocked}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${data.isBlocked
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-violet-600 text-white hover:bg-violet-700'
                                        }`}
                                >
                                    {data.isBlocked ? 'Upgrade Blocked' : 'Request Upgrade'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Document upload component
    const DocumentUpload = ({
        documentType,
        title,
        description,
        required = true
    }) => {
        const file = formData[documentType];
        const isDragActive = dragActive[documentType];
        const status = uploadStatus[documentType];
        const error = errors[documentType];

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-900">
                        {title}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {file && (
                        <button
                            type="button"
                            onClick={() => removeFile(documentType)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Remove</span>
                        </button>
                    )}
                </div>

                <p className="text-sm text-gray-600">{description}</p>

                {!file ? (
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragActive
                            ? 'border-violet-400 bg-violet-50'
                            : error
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'
                            }`}
                        onDragEnter={(e) => handleDrag(e, documentType)}
                        onDragLeave={(e) => handleDrag(e, documentType)}
                        onDragOver={(e) => handleDrag(e, documentType)}
                        onDrop={(e) => handleDrop(e, documentType)}
                    >
                        <Upload className={`w-12 h-12 mx-auto mb-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900">
                                Drop your PDF file here, or{' '}
                                <label className="text-violet-600 hover:text-violet-700 cursor-pointer underline">
                                    browse
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,application/pdf"
                                        data-document-type={documentType}
                                        onChange={(e) => handleFileInputChange(e, documentType)}
                                    />
                                </label>
                            </p>
                            <p className="text-xs text-gray-500">
                                <strong>PDF files only</strong> • Maximum 10MB
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                                <p className="text-xs text-blue-700">
                                    <AlertCircle className="w-3 h-3 inline mr-1" />
                                    Only PDF documents (.pdf) are accepted. Other formats will be rejected.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status === 'success' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {status === 'success' ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <FileText className="w-5 h-5 text-gray-600" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(file.size)} • PDF Document
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        );
    };

    // Results Display Component with real data
    const ResultsDisplay = ({ result }) => {
        const details = result.analysis_details || {};
        const entityInfo = details.entity_info || {};
        const documentFeatures = details.document_features || {};
        const dateInfo = details.date_info || {};

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                            <p className="text-gray-600 mt-1">Document analysis completed successfully</p>
                        </div>
                        <button
                            onClick={handleNewAnalysis}
                            className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                        >
                            New Analysis
                        </button>
                    </div>

                    {/* Overall Rating with Credit Score Alert */}
                    <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <Award className="w-8 h-8 text-violet-600" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Overall Rating</h3>
                                        <p className="text-sm text-gray-600">{getRatingCategory(result.rating)}</p>
                                    </div>
                                </div>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${getRatingColor(result.rating)}`}>
                                    <Star className="w-5 h-5 mr-1" />
                                    {result.rating}/10
                                </div>
                            </div>
                            {result.rating < 6 && (
                                <button
                                    onClick={() => setShowCreditScoreModal(true)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${result.rating < 5
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        }`}
                                >
                                    <Shield className="w-4 h-4" />
                                    <span>Credit Alert</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Entity Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
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
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
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
                                <span className="text-sm font-medium text-gray-500">Name Match Score</span>
                                <p className="text-lg font-semibold text-purple-600">{documentFeatures.name_match_score || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Date Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
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

                    {/* Processing Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                Processing Details
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Analysis ID:</span>
                                    <span className="font-medium text-gray-900">{result.id || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className="font-medium text-green-600">Completed</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Compliance Score:</span>
                                    <span className="font-medium text-gray-900">{documentFeatures.compliance_score || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Timeline
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-600 block">Created:</span>
                                    <span className="font-medium text-gray-900">
                                        {formatDate(result.created_at)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600 block">Updated:</span>
                                    <span className="font-medium text-gray-900">
                                        {formatDate(result.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleNewAnalysis}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>New Analysis</span>
                        </button>

                        {/* Upgrade button with credit score check */}
                        <button
                            onClick={handleUpgradeRequest}
                            disabled={result.rating < 5}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${result.rating < 5
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-violet-600 text-white hover:bg-violet-700'
                                }`}
                        >
                            <CreditCard className="w-4 h-4" />
                            <span>{result.rating < 5 ? 'Upgrade Blocked' : 'Request Upgrade'}</span>
                        </button>

                        {result.rating < 6 && (
                            <button
                                onClick={() => setShowCreditScoreModal(true)}
                                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center space-x-2"
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>Improve Score</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {showResults ? 'Analysis Results' : 'Upload Documents for Analysis'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {showResults
                                    ? 'Review your document analysis results below'
                                    : 'Upload your cashflow and tax clearance documents (PDF only) to get automated financial analysis'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {showResults && analysisResult ? (
                    <ResultsDisplay result={analysisResult} />
                ) : (
                    <>
                        {/* Upload Form */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="space-y-8 flex gap-10">
                                    <DocumentUpload
                                        documentType="cashflow_document"
                                        title="Cashflow Document"
                                        description="Upload your business cashflow statement or financial report (PDF format only)"
                                        required={true}
                                    />

                                    <DocumentUpload
                                        documentType="tax_clearance_document"
                                        title="Tax Clearance Certificate"
                                        description="Upload your valid tax clearance certificate from the revenue authority (PDF format only)"
                                        required={true}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !formData.cashflow_document || !formData.tax_clearance_document}
                                    className="px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Analyzing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Upload & Analyze</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        {(formData.cashflow_document || formData.tax_clearance_document) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-10">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Progress</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Cashflow Document (PDF)</span>
                                        <div className="flex items-center space-x-2">
                                            {formData.cashflow_document ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                            )}
                                            <span className="text-sm text-gray-500">
                                                {formData.cashflow_document ? 'Ready' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Tax Clearance Certificate (PDF)</span>
                                        <div className="flex items-center space-x-2">
                                            {formData.tax_clearance_document ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                            )}
                                            <span className="text-sm text-gray-500">
                                                {formData.tax_clearance_document ? 'Ready' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Credit Score Modal */}
                <CreditScoreModal
                    isOpen={showCreditScoreModal}
                    onClose={() => setShowCreditScoreModal(false)}
                    data={creditScoreData}
                />
            </div>
        </div>
    );
};

export default DocumentUploadPage;