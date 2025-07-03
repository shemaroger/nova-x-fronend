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
    Award
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DocumentUploadPage = () => {
    const [formData, setFormData] = useState({
        cashflow_document: null,
        tax_clearance_document: null
    });

    const [previews, setPreviews] = useState({
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

    // Enhanced file validation - ONLY PDF allowed
    const allowedTypes = ['application/pdf'];
    const allowedExtensions = ['.pdf'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    // Enhanced file validation function
    const validateFile = (file) => {
        const errors = [];

        // Check file type by MIME type
        if (!allowedTypes.includes(file.type)) {
            toast('Only PDF documents are allowed. Please select a PDF file.');
        }

        // Additional check by file extension (backup validation)
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExtension) {
            errors.push('Invalid file format. Only PDF files (.pdf) are accepted.');
        }

        // Check file size
        if (file.size > maxFileSize) {
            errors.push('File size must be less than 10MB. Please compress your PDF or select a smaller file.');
        }

        // Check if file is empty
        if (file.size === 0) {
            errors.push('The selected file appears to be empty. Please select a valid PDF document.');
        }

        return errors;
    };


    // Handle file selection with enhanced validation
    const handleFileSelect = (documentType, file) => {
        // Immediate validation
        const validationErrors = validateFile(file);

        if (validationErrors.length > 0) {
            // Set error state
            setErrors(prev => ({
                ...prev,
                [documentType]: validationErrors[0]
            }));

            // Show error notification
            toast.error(validationErrors[0], 'error');

            // Reset file input
            const fileInput = document.querySelector(`input[data-document-type="${documentType}"]`);
            if (fileInput) {
                fileInput.value = '';
            }

            return;
        }

        // Clear previous errors
        setErrors(prev => ({
            ...prev,
            [documentType]: null
        }));

        // Update form data
        setFormData(prev => ({
            ...prev,
            [documentType]: file
        }));

        // Clear preview (PDFs don't have previews)
        setPreviews(prev => ({
            ...prev,
            [documentType]: null
        }));

        // Set success status
        setUploadStatus(prev => ({
            ...prev,
            [documentType]: 'success'
        }));

        // Show success message
        const documentName = documentType === 'cashflow_document' ? 'Cashflow Document' : 'Tax Clearance Document';
        toast.success(`${documentName} uploaded successfully! Ready for analysis.`, 'success');
    };

    // Enhanced drag event handling with file type checking
    const handleDrag = (e, documentType) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            // Check if dragged files contain non-PDF files
            if (e.dataTransfer && e.dataTransfer.items) {
                const hasInvalidFiles = Array.from(e.dataTransfer.items).some(item => {
                    return item.type !== 'application/pdf';
                });

                if (hasInvalidFiles) {
                    // Show visual indication of invalid file type
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
            toast.error('No files detected. Please try again.', 'error');
            return;
        }

        if (files.length > 1) {
            toast.error('Please upload only one PDF document at a time.', 'error');
            return;
        }

        const file = files[0];

        // Pre-validate file type before processing
        if (file.type !== 'application/pdf') {
            setErrors(prev => ({
                ...prev,
                [documentType]: 'Only PDF documents are allowed'
            }));
            toast.error('Invalid file type! Only PDF documents (.pdf) are accepted. Please select a PDF file.', 'error');
            return;
        }

        handleFileSelect(documentType, file);
    };

    // Enhanced file input change handler
    const handleFileInputChange = (e, documentType) => {
        const file = e.target.files[0];

        if (!file) return;

        // Pre-validate before processing
        if (file.type !== 'application/pdf') {
            setErrors(prev => ({
                ...prev,
                [documentType]: 'Only PDF documents are allowed'
            }));
            toast.error('Invalid file type! Please select a PDF document only.', 'error');

            // Clear the input
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

        // Clear file input
        const fileInput = document.querySelector(`input[data-document-type="${documentType}"]`);
        if (fileInput) {
            fileInput.value = '';
        }

        toast.success('File removed successfully', 'info');
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get rating color
    const getRatingColor = (rating) => {
        if (rating >= 8) return 'text-green-600 bg-green-100';
        if (rating >= 6) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    // Handle form submission
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
            toast.error('Please upload both required PDF documents', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock response
            const mockResult = {
                id: 'analysis_123456789',
                rating: 8.5,
                rating_category: 'excellent',
                rating_display: 'Your financial documents show strong performance with good cashflow management and tax compliance.',
                processing_time: 1.87,
                is_completed: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            setAnalysisResult(mockResult);
            setShowResults(true);
            toast.success('Documents uploaded and analyzed successfully!', 'success');

        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Network error occurred. Please check your connection and try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle new analysis
    const handleNewAnalysis = () => {
        setShowResults(false);
        setAnalysisResult(null);
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

    // Results Display Component
    const ResultsDisplay = ({ result }) => {
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

                    <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <Award className="w-8 h-8 text-violet-600" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Overall Rating</h3>
                                        <p className="text-sm text-gray-600 capitalize">{result.rating_category}</p>
                                    </div>
                                </div>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${getRatingColor(result.rating)}`}>
                                    <Star className="w-5 h-5 mr-1" />
                                    {result.rating}/10
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {result.rating_display}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                Processing Details
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Processing Time:</span>
                                    <span className="font-medium text-gray-900">
                                        {result.processing_time?.toFixed(2)} seconds
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium ${result.is_completed ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {result.is_completed ? 'Completed' : 'In Progress'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
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
                                    <span className="text-gray-600 block">Completed:</span>
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
            </div>
        </div>
    );
};

export default DocumentUploadPage;