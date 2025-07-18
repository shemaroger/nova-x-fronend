import React, { useState } from 'react';
import { Eye, EyeOff, User, Building, ChevronDown, Loader, Upload, X } from 'lucide-react';
import { registerInvestor, registerSME } from '../Service/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const NovaXLogo = () => (
    <div className="relative mx-auto w-64 h-40 mb-6">
        <img src="/images/nova-logo.png" alt="Nova X Logo" className="" />
    </div>
);

const ProgressSteps = ({ currentStep, accountType }) => {
    const totalSteps = accountType === 'business' ? 4 : 3;

    return (
        <div className="py-6">
            <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <div key={step} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className="text-xs text-gray-600 mb-2">Step {step}</div>
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                {step <= currentStep ? '✓' : step}
                            </div>
                        </div>
                        {step < totalSteps && (
                            <div className={`w-16 h-px mx-1 mt-6 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Validation functions
const validateEmail = (value) => {
    if (!value.trim()) {
        return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
    }
    return '';
};

const validatePhoneNumber = (value, minLength = 9, maxLength = 15) => {
    if (!value.trim()) {
        return 'Phone number is required';
    }
    if (!/^[0-9]+$/.test(value)) {
        return 'Phone number can only contain numbers';
    }
    if (value.length < minLength) {
        return `Phone number must be at least ${minLength} digits long`;
    }
    if (value.length > maxLength) {
        return `Phone number must be no more than ${maxLength} digits long`;
    }
    return '';
};

const validateTextInput = (value, minLength = 2, maxLength = 100) => {
    if (!value.trim()) {
        return 'This field is required';
    }
    if (value.length < minLength) {
        return `This field must be at least ${minLength} characters long`;
    }
    if (value.length > maxLength) {
        return `This field must be no more than ${maxLength} characters long`;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        return 'This field can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
};

const validateBusinessName = (value) => {
    if (!value.trim()) {
        return 'Business name is required';
    }
    if (value.length < 2) {
        return 'Business name must be at least 2 characters long';
    }
    if (value.length > 100) {
        return 'Business name must be no more than 100 characters long';
    }
    if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(value)) {
        return 'Business name contains invalid characters';
    }
    return '';
};

const validatePosition = (value) => {
    if (!value.trim()) {
        return 'Position is required';
    }
    if (value.length < 2) {
        return 'Position must be at least 2 characters long';
    }
    if (value.length > 50) {
        return 'Position must be no more than 50 characters long';
    }
    if (!/^[a-zA-Z\s&.,'-]+$/.test(value)) {
        return 'Position contains invalid characters';
    }
    return '';
};

const validateTIN = (value) => {
    if (!value.trim()) {
        return 'TIN (Tax Identification Number) is required';
    }

    // Remove any spaces or special characters for validation
    const cleanTIN = value.replace(/[\s-]/g, '');

    // Rwanda TIN format: 9 digits
    if (!/^\d{9}$/.test(cleanTIN)) {
        return 'TIN must be exactly 9 digits';
    }

    // Basic checksum validation (you can customize this based on Rwanda's TIN algorithm)
    if (cleanTIN === '000000000' || cleanTIN === '123456789') {
        return 'Invalid TIN format';
    }

    return '';
};

// Updated Input component with real-time validation
const Input = ({ label, type = 'text', placeholder, value, onChange, required = false, error = '', validation }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState(error);

    const handleChange = (e) => {
        const newValue = e.target.value;
        onChange(e);
        if (validation) {
            const errorMessage = validation(newValue);
            setValidationError(errorMessage);
        }
    };

    // Update validation error when external error prop changes
    React.useEffect(() => {
        setValidationError(error);
    }, [error]);

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={showPassword && type === 'password' ? 'text' : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${validationError ? 'border-red-500' : 'border-gray-300'}`}
                    required={required}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {validationError && <p className="text-red-500 text-xs mt-1">{validationError}</p>}
        </div>
    );
};

const TextArea = ({ label, placeholder, value, onChange, required = false, error = '', maxLength = 500 }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            rows={4}
            className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none ${error ? 'border-red-500' : 'border-gray-300'
                }`}
            required={required}
        />
        <div className="flex justify-between items-center mt-1">
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <span className="text-xs text-gray-500 ml-auto">{value.length}/{maxLength}</span>
        </div>
    </div>
);

const Button = ({ children, variant = 'primary', onClick, disabled = false, className = '', loading = false }) => {
    const baseClasses = 'px-6 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variants[variant]} ${className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading && <Loader size={16} className="animate-spin" />}
            {children}
        </button>
    );
};

const Select = ({ label, options, value, onChange, placeholder = 'Select...', required = false, error = '' }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none bg-white ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
                required={required}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const BackgroundImage = () => (
    <div className="w-1/2 relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
        <div className="absolute inset-0 flex items-center justify-start">
            <div className="relative w-full h-full overflow-hidden">
                <div className="">
                    <img
                        src='/images/login.png'
                        alt="Login illustration"
                        className='object-cover w-full h-full absolute rounded-xl'
                    />
                </div>
            </div>
        </div>
    </div>
);

const AccountTypeSelection = ({ onNext, selectedType, setSelectedType }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center mb-14">Sign Up</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={() => setSelectedType('investor')}
                className={`p-6 border-2 rounded-lg transition-all focus:outline-none ${selectedType === 'investor'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
            >
                <User size={32} className="mx-auto mb-3" />
                <div className="font-medium">Investor</div>
            </button>

            <button
                onClick={() => setSelectedType('business')}
                className={`p-6 border-2 rounded-lg transition-all focus:outline-none ${selectedType === 'business'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
            >
                <Building size={32} className="mx-auto mb-3" />
                <div className="font-medium">Business</div>
            </button>
        </div>

        <div className="flex gap-4">
            <Button variant="secondary" className="flex-1">
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={onNext}
                disabled={!selectedType}
                className="flex-1"
            >
                Continue
            </Button>
        </div>
    </div>
);

// Investor Step 1 Form
const InvestorStep1Form = ({ data, setData, onNext, onBack }) => {
    const industries = [
        { value: 'technology', label: 'Technology' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'finance', label: 'Finance & Banking' },
        { value: 'retail', label: 'Retail & E-commerce' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'agriculture', label: 'Agriculture' },
        { value: 'education', label: 'Education' },
        { value: 'energy', label: 'Energy & Utilities' },
        { value: 'other', label: 'Other' },
    ];

    const investmentRanges = [
        { value: 'Under $100,000', label: 'Under $100,000' },
        { value: '$100,000 - $500,000', label: '$100,000 - $500,000' },
        { value: '$500,000 - $1 million', label: '$500,000 - $1 million' },
        { value: '$1 million - $5 million', label: '$1 million - $5 million' },
        { value: '$5 million - $10 million', label: '$5 million - $10 million' },
        { value: 'Over $10 million', label: 'Over $10 million' },
    ];

    const updateStep1 = (field, value) => {
        setData(prev => ({
            ...prev,
            step1: {
                ...prev.step1,
                [field]: value
            }
        }));
    };

    return (
        <div className="space-y-6">
            <ProgressSteps currentStep={1} accountType="investor" />

            <Select
                label="Select industry"
                options={industries}
                value={data.step1.industry}
                onChange={(e) => updateStep1('industry', e.target.value)}
                placeholder="Search industry..."
                required
            />

            <Select
                label="Investment Range"
                options={investmentRanges}
                value={data.step1.financeRange}
                onChange={(e) => updateStep1('financeRange', e.target.value)}
                placeholder="Select investment range"
                required
            />

            <div className="flex gap-4">
                <Button variant="secondary" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button
                    variant="primary"
                    onClick={onNext}
                    disabled={!data.step1.industry || !data.step1.financeRange}
                    className="flex-1"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

// Business Step 1 Form
const BusinessStep1Form = ({ data, setData, onNext, onBack, errors }) => {
    const [tinValidating, setTinValidating] = useState(false);
    const [tinError, setTinError] = useState('');

    const industries = [
        { value: 'technology', label: 'Technology' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'finance', label: 'Finance & Banking' },
        { value: 'retail', label: 'Retail & E-commerce' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'agriculture', label: 'Agriculture' },
        { value: 'education', label: 'Education' },
        { value: 'energy', label: 'Energy & Utilities' },
        { value: 'other', label: 'Other' },
    ];

    const updateStep1 = (field, value) => {
        setData(prev => ({
            ...prev,
            step1: {
                ...prev.step1,
                [field]: value
            }
        }));
    };

    // TIN verification function
    const verifyTIN = async (tin) => {
        if (!tin || validateTIN(tin)) {
            setTinError('');
            return;
        }

        setTinValidating(true);
        setTinError('');

        try {
            const result = await verifyTIN(tin);

            if (!result.ok) {
                if (result.error === 'TIN_EXISTS') {
                    setTinError('TIN already exists. This TIN is already registered in our system.');
                } else if (result.error === 'INVALID_TIN') {
                    setTinError('Invalid TIN. Please verify your Tax Identification Number.');
                } else {
                    setTinError('Unable to verify TIN. Please try again.');
                }
            } else {
                setTinError('');
                updateStep1('tin', tin);
            }
        } catch (error) {
            console.error('TIN verification error:', error);
            setTinError('Network error. Please check your connection and try again.');
        } finally {
            setTinValidating(false);
        }
    };

    // Debounced TIN verification
    const debouncedVerifyTIN = React.useCallback(
        debounce((tin) => verifyTIN(tin), 500),
        []
    );

    const handleTINChange = (e) => {
        const value = e.target.value;
        updateStep1('tin', value);

        // Clear previous errors
        setTinError('');

        // Trigger debounced verification
        if (value.trim()) {
            debouncedVerifyTIN(value);
        }
    };

    // Simple debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    return (
        <div className="space-y-6">
            <ProgressSteps currentStep={1} accountType="business" />

            <TextArea
                label="Business Description"
                placeholder="Brief description of your business (50-100 words recommended)"
                value={data.step1.businessDescription}
                onChange={(e) => updateStep1('businessDescription', e.target.value)}
                error={errors.businessDescription}
                maxLength={500}
            />

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    TIN (Tax Identification Number)<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Enter your 9-digit TIN"
                        value={data.step1.tin || ''}
                        onChange={handleTINChange}
                        maxLength={11} // Allow for formatting with spaces/dashes
                        className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${tinError || errors.tin ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {tinValidating && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader size={16} className="animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
                {tinError && <p className="text-red-500 text-xs mt-1">{tinError}</p>}
                {errors.tin && <p className="text-red-500 text-xs mt-1">{errors.tin}</p>}
                <p className="text-xs text-gray-500 mt-1">
                    Enter your Rwanda Revenue Authority Tax Identification Number
                </p>
            </div>

            <Input
                label="Commencement Date"
                type="date"
                value={data.step1.commencementDate}
                onChange={(e) => updateStep1('commencementDate', e.target.value)}
                required
                error={errors.commencementDate}
                max={new Date().toISOString().split('T')[0]}
            />

            <Select
                label="Industry"
                options={industries}
                value={data.step1.industry}
                onChange={(e) => updateStep1('industry', e.target.value)}
                placeholder="Select your industry"
                required
                error={errors.industry}
            />

            <div className="flex gap-4">
                <Button variant="secondary" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button
                    variant="primary"
                    onClick={onNext}
                    disabled={!data.step1.tin || !data.step1.commencementDate || !data.step1.industry || tinValidating || tinError}
                    className="flex-1"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

// Business Step 2 Form with validation
const BusinessStep2Form = ({ data, setData, onNext, onBack, errors }) => {
    const countryCodes = [
        { value: '+250', label: 'RW +250' },
        { value: '+1', label: 'US +1' },
        { value: '+44', label: 'UK +44' },
        { value: '+33', label: 'FR +33' },
        { value: '+49', label: 'DE +49' },
    ];

    const updateStep2 = (field, value) => {
        setData(prev => ({
            ...prev,
            step2: {
                ...prev.step2,
                [field]: value
            }
        }));
    };

    return (
        <div className="space-y-6">
            <ProgressSteps currentStep={2} accountType="business" />

            <Input
                label="Business Name"
                placeholder="Enter your business name"
                value={data.step2.businessName}
                onChange={(e) => updateStep2('businessName', e.target.value)}
                required
                error={errors.businessName}
                validation={validateBusinessName}
            />

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Contact Phone<span className="text-red-500">*</span>
                </label>
                <div className="flex">
                    <select
                        value={data.step2.countryCode}
                        onChange={(e) => updateStep2('countryCode', e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                    >
                        {countryCodes.map(code => (
                            <option key={code.value} value={code.value}>{code.label}</option>
                        ))}
                    </select>
                    <input
                        type="tel"
                        placeholder="Enter business phone number"
                        value={data.step2.contactPhone}
                        onChange={(e) => {
                            updateStep2('contactPhone', e.target.value);
                        }}
                        className={`flex-1 px-3 py-3 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                </div>
                {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>}
            </div>

            <Input
                label="Business Email"
                type="email"
                placeholder="business@company.com"
                value={data.step2.businessEmail}
                onChange={(e) => updateStep2('businessEmail', e.target.value)}
                required
                error={errors.businessEmail}
                validation={validateEmail}
            />

            <div className="flex gap-4">
                <Button variant="secondary" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button
                    variant="primary"
                    onClick={onNext}
                    disabled={!data.step2.businessName || !data.step2.contactPhone || !data.step2.businessEmail}
                    className="flex-1"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

// Business Step 3 Form with validation
const BusinessStep3Form = ({ data, setData, onNext, onBack, errors }) => {
    const countryCodes = [
        { value: '+250', label: 'RW +250' },
        { value: '+1', label: 'US +1' },
        { value: '+44', label: 'UK +44' },
        { value: '+33', label: 'FR +33' },
        { value: '+49', label: 'DE +49' },
    ];

    const updateStep3 = (field, value) => {
        setData(prev => ({
            ...prev,
            step3: {
                ...prev.step3,
                [field]: value
            }
        }));
    };

    return (
        <div className="space-y-6">
            <ProgressSteps currentStep={3} accountType="business" />

            <Input
                label="Representative Name"
                placeholder="Enter representative's full name"
                value={data.step3.representativeName}
                onChange={(e) => updateStep3('representativeName', e.target.value)}
                required
                error={errors.representativeName}
                validation={validateTextInput}
            />

            <Input
                label="Position/Title"
                placeholder="Enter position in the company"
                value={data.step3.position}
                onChange={(e) => updateStep3('position', e.target.value)}
                required
                error={errors.position}
                validation={validatePosition}
            />

            <Input
                label="Representative Email (Optional)"
                type="email"
                placeholder="If different from business email"
                value={data.step3.representativeEmail}
                onChange={(e) => updateStep3('representativeEmail', e.target.value)}
                error={errors.representativeEmail}
                validation={(value) => value ? validateEmail(value) : ''}
            />

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Representative Phone (Optional)
                </label>
                <div className="flex">
                    <select
                        value={data.step3.repCountryCode}
                        onChange={(e) => updateStep3('repCountryCode', e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                    >
                        {countryCodes.map(code => (
                            <option key={code.value} value={code.value}>{code.label}</option>
                        ))}
                    </select>
                    <input
                        type="tel"
                        placeholder="If different from business phone"
                        value={data.step3.representativePhone}
                        onChange={(e) => updateStep3('representativePhone', e.target.value)}
                        className={`flex-1 px-3 py-3 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${errors.representativePhone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
                {errors.representativePhone && <p className="text-red-500 text-xs mt-1">{errors.representativePhone}</p>}
            </div>

            <div className="flex gap-4">
                <Button variant="secondary" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button
                    variant="primary"
                    onClick={onNext}
                    disabled={!data.step3.representativeName || !data.step3.position}
                    className="flex-1"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

// Investor Step 2 Form with validation
const InvestorStep2Form = ({ data, setData, onNext, onBack, errors }) => {
    const countryCodes = [
        { value: '+250', label: 'RW +250' },
        { value: '+1', label: 'US +1' },
        { value: '+44', label: 'UK +44' },
        { value: '+33', label: 'FR +33' },
        { value: '+49', label: 'DE +49' },
    ];

    const updateStep2 = (field, value) => {
        setData(prev => ({
            ...prev,
            step2: {
                ...prev.step2,
                [field]: value
            }
        }));
    };

    return (
        <div className="space-y-6">
            <ProgressSteps currentStep={2} accountType="investor" />

            <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={data.step2.fullName}
                onChange={(e) => updateStep2('fullName', e.target.value)}
                required
                error={errors.fullName}
                validation={validateTextInput}
            />

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact phone<span className="text-red-500">*</span>
                </label>
                <div className="flex">
                    <select
                        value={data.step2.countryCode}
                        onChange={(e) => updateStep2('countryCode', e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                    >
                        {countryCodes.map(code => (
                            <option key={code.value} value={code.value}>{code.label}</option>
                        ))}
                    </select>
                    <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={data.step2.phone}
                        onChange={(e) => updateStep2('phone', e.target.value)}
                        className={`flex-1 px-3 py-3 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                </div>
                {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>}
            </div>

            <Input
                label="Email"
                type="email"
                placeholder="example@company.com"
                value={data.step2.email}
                onChange={(e) => updateStep2('email', e.target.value)}
                required
                error={errors.email}
                validation={validateEmail}
            />

            <div className="flex gap-4">
                <Button variant="secondary" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button
                    variant="primary"
                    onClick={onNext}
                    className="flex-1"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

// Final Step Form (Password for both types)
const FinalStepForm = ({ data, setData, onComplete, onBack, errors, loading, accountType }) => {
    const currentStep = accountType === 'business' ? 4 : 3;

    const updateFinalStep = (field, value) => {
        setData(prev => ({
            ...prev,
            finalStep: {
                ...prev.finalStep,
                [field]: value
            }
        }));
    };

    const validatePassword = (value) => {
        if (!value) {
            return 'Password is required';
        }
        if (value.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return '';
    };

    const validateConfirmPassword = (value) => {
        if (!value) {
            return 'Please confirm your password';
        }
        if (value !== data.finalStep.password) {
            return 'Passwords do not match';
        }
        return '';
    };

    return (
        <div className="space-y-6">
            <ProgressSteps currentStep={currentStep} accountType={accountType} />

            <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={data.finalStep.password}
                onChange={(e) => updateFinalStep('password', e.target.value)}
                required
                error={errors.password}
                validation={validatePassword}
            />

            <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={data.finalStep.confirm_password}
                onChange={(e) => updateFinalStep('confirm_password', e.target.value)}
                required
                error={errors.confirm_password}
                validation={validateConfirmPassword}
            />

            <div className="flex items-start">
                <input
                    id="accept-terms"
                    type="checkbox"
                    checked={data.finalStep.acceptTerms}
                    onChange={(e) => updateFinalStep('acceptTerms', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded mt-1"
                />
                <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
                    I accept the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                        terms and conditions
                    </a>
                </label>
            </div>
            {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms}</p>}

            <div className="flex gap-4">
                <Button variant="secondary" onClick={onBack} className="flex-1" disabled={loading}>
                    Back
                </Button>
                <Button
                    variant="primary"
                    onClick={onComplete}
                    className="flex-1"
                    loading={loading}
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </div>
        </div>
    );
};

// Success Message Component
const SuccessMessage = ({ message, userEmail }) => (
    <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
                We've sent a verification email to <strong>{userEmail}</strong>
            </p>
        </div>
        <Button
            variant="primary"
            onClick={() => window.location.href = '/login'}
            className="w-full"
        >
            Go to Login
        </Button>
    </div>
);

// Error Message Component
const ErrorMessage = ({ error, onRetry }) => (
    <div className="space-y-4 text-center p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Registration Failed</h3>
            <p className="text-red-700 text-sm">{error}</p>
        </div>
        <Button variant="primary" onClick={onRetry} className="w-full">
            Try Again
        </Button>
    </div>
);

// Main Sign Up Component
const SignUpApp = () => {
    const [currentStep, setCurrentStep] = useState('accountType');
    const [selectedAccountType, setSelectedAccountType] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [apiMessage, setApiMessage] = useState('');

    const navigate = useNavigate();
    const [data, setData] = useState({
        accountType: '',
        step1: {
            // Investor fields
            industry: '',
            financeRange: '',
            // Business fields
            profileImage: null,
            businessDescription: '',
            commencementDate: '',
        },
        step2: {
            // Investor fields
            fullName: '',
            countryCode: '+250',
            phone: '',
            email: '',
            // Business fields
            businessName: '',
            contactPhone: '',
            businessEmail: '',
        },
        step3: {
            // Business only fields
            representativeName: '',
            position: '',
            representativeEmail: '',
            repCountryCode: '+250',
            representativePhone: '',
        },
        finalStep: {
            password: '',
            confirm_password: '',
            acceptTerms: false
        }
    });

    const [errors, setErrors] = useState({});

    const validateInvestorStep2 = () => {
        const newErrors = {};

        if (!data.step2.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!data.step2.phone.trim()) {
            newErrors.contactPhone = 'Phone number is required';
        } else {
            const phoneError = validatePhoneNumber(data.step2.phone);
            if (phoneError) newErrors.contactPhone = phoneError;
        }

        if (!data.step2.email.trim()) {
            newErrors.email = 'Email is required';
        } else {
            const emailError = validateEmail(data.step2.email);
            if (emailError) newErrors.email = emailError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateBusinessStep1 = () => {
        const newErrors = {};

        if (!data.step1.commencementDate) {
            newErrors.commencementDate = 'Commencement date is required';
        }

        if (!data.step1.industry) {
            newErrors.industry = 'Industry is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateBusinessStep2 = () => {
        const newErrors = {};

        if (!data.step2.businessName.trim()) {
            newErrors.businessName = 'Business name is required';
        } else {
            const businessNameError = validateBusinessName(data.step2.businessName);
            if (businessNameError) newErrors.businessName = businessNameError;
        }

        if (!data.step2.contactPhone.trim()) {
            newErrors.contactPhone = 'Business phone number is required';
        } else {
            const phoneError = validatePhoneNumber(data.step2.contactPhone);
            if (phoneError) newErrors.contactPhone = phoneError;
        }

        if (!data.step2.businessEmail.trim()) {
            newErrors.businessEmail = 'Business email is required';
        } else {
            const emailError = validateEmail(data.step2.businessEmail);
            if (emailError) newErrors.businessEmail = emailError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateBusinessStep3 = () => {
        const newErrors = {};

        if (!data.step3.representativeName.trim()) {
            newErrors.representativeName = 'Representative name is required';
        } else {
            const nameError = validateTextInput(data.step3.representativeName);
            if (nameError) newErrors.representativeName = nameError;
        }

        if (!data.step3.position.trim()) {
            newErrors.position = 'Position/Title is required';
        } else {
            const positionError = validatePosition(data.step3.position);
            if (positionError) newErrors.position = positionError;
        }

        if (data.step3.representativeEmail) {
            const emailError = validateEmail(data.step3.representativeEmail);
            if (emailError) newErrors.representativeEmail = emailError;
        }

        if (data.step3.representativePhone) {
            const phoneError = validatePhoneNumber(data.step3.representativePhone);
            if (phoneError) newErrors.representativePhone = phoneError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateFinalStep = () => {
        const newErrors = {};

        if (!data.finalStep.password) {
            newErrors.password = 'Password is required';
        } else if (data.finalStep.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.finalStep.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        if (!data.finalStep.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password';
        } else if (data.finalStep.password !== data.finalStep.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        if (!data.finalStep.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAccountTypeNext = () => {
        setData(prev => ({ ...prev, accountType: selectedAccountType }));
        setCurrentStep('step1');
    };

    const handleStep1Next = () => {
        if (selectedAccountType === 'business') {
            if (validateBusinessStep1()) {
                setCurrentStep('step2');
            }
        } else {
            setCurrentStep('step2');
        }
    };

    const handleStep2Next = () => {
        if (selectedAccountType === 'business') {
            if (validateBusinessStep2()) {
                setCurrentStep('step3');
            }
        } else {
            if (validateInvestorStep2()) {
                setCurrentStep('finalStep');
            }
        }
    };

    const handleStep3Next = () => {
        if (validateBusinessStep3()) {
            setCurrentStep('finalStep');
        }
    };

    const handleSignUpComplete = async () => {
        if (!validateFinalStep()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            let registrationData;
            let response;

            if (selectedAccountType === 'investor') {
                registrationData = {
                    industry: data.step1.industry,
                    financeRange: data.step1.financeRange,
                    fullName: data.step2.fullName,
                    contactPhone: `${data.step2.countryCode}${data.step2.phone}`,
                    email: data.step2.email,
                    password: data.finalStep.password,
                    confirm_password: data.finalStep.confirm_password,
                    acceptTerms: data.finalStep.acceptTerms
                };

                response = await registerInvestor(registrationData);
            } else {
                registrationData = {
                    businessDescription: data.step1.businessDescription,
                    profileImage: data.step1.profileImage,
                    commencementDate: data.step1.commencementDate,
                    industry: data.step1.industry,
                    businessName: data.step2.businessName,
                    contactPhone: `${data.step2.countryCode}${data.step2.contactPhone}`,
                    businessEmail: data.step2.businessEmail,
                    representativeName: data.step3.representativeName,
                    position: data.step3.position,
                    representativeEmail: data.step3.representativeEmail || null,
                    representativePhone: data.step3.representativePhone ? `${data.step3.repCountryCode}${data.step3.representativePhone}` : null,
                    password: data.finalStep.password,
                    confirm_password: data.finalStep.confirm_password,
                    acceptTerms: data.finalStep.acceptTerms
                };

                if (data.step1.profileImage) {
                    const formData = new FormData();
                    formData.append('profileImage', data.step1.profileImage);
                    Object.keys(registrationData).forEach(key => {
                        if (key !== 'profileImage' && registrationData[key] !== null && registrationData[key] !== undefined) {
                            formData.append(key, registrationData[key]);
                        }
                    });

                    response = await registerSME(formData);
                } else {
                    response = await registerSME(registrationData);
                }
            }
            if (response.success) {
                toast.success('Registration successful')
                navigate("/login")
            } else {
                toast.error(response.error || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);

            if (error.message) {
                setApiMessage(error.message);
            } else if (error.details) {
                toast.error('Validation failed. Please check your information.');

                const apiErrors = {};
                if (typeof error.details === 'object') {
                    Object.keys(error.details).forEach(field => {
                        if (Array.isArray(error.details[field])) {
                            apiErrors[field] = error.details[field][0];
                        } else {
                            apiErrors[field] = error.details[field];
                        }
                    });
                    setErrors(apiErrors);
                }
            } else {
                setApiMessage('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setRegistrationStatus(null);
        setApiMessage('');
        setErrors({});
    };

    const getUserEmail = () => {
        return selectedAccountType === 'business' ? data.step2.businessEmail : data.step2.email;
    };

    if (registrationStatus === 'success') {
        return (
            <div className="min-h-screen flex p-5">
                <BackgroundImage />
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <NovaXLogo />
                        <SuccessMessage message={apiMessage} userEmail={getUserEmail()} />
                    </div>
                </div>
            </div>
        );
    }

    if (registrationStatus === 'error') {
        return (
            <div className="min-h-screen flex p-5">
                <BackgroundImage />
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <NovaXLogo />
                        <ErrorMessage error={apiMessage} onRetry={handleRetry} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex p-5">
            <BackgroundImage />

            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <NovaXLogo />
                    </div>

                    {currentStep === 'accountType' && (
                        <AccountTypeSelection
                            onNext={handleAccountTypeNext}
                            selectedType={selectedAccountType}
                            setSelectedType={setSelectedAccountType}
                        />
                    )}

                    {currentStep === 'step1' && selectedAccountType === 'investor' && (
                        <InvestorStep1Form
                            data={data}
                            setData={setData}
                            onNext={handleStep1Next}
                            onBack={() => setCurrentStep('accountType')}
                        />
                    )}

                    {currentStep === 'step1' && selectedAccountType === 'business' && (
                        <BusinessStep1Form
                            data={data}
                            setData={setData}
                            onNext={handleStep1Next}
                            onBack={() => setCurrentStep('accountType')}
                            errors={errors}
                        />
                    )}

                    {currentStep === 'step2' && selectedAccountType === 'investor' && (
                        <InvestorStep2Form
                            data={data}
                            setData={setData}
                            onNext={handleStep2Next}
                            onBack={() => setCurrentStep('step1')}
                            errors={errors}
                        />
                    )}

                    {currentStep === 'step2' && selectedAccountType === 'business' && (
                        <BusinessStep2Form
                            data={data}
                            setData={setData}
                            onNext={handleStep2Next}
                            onBack={() => setCurrentStep('step1')}
                            errors={errors}
                        />
                    )}

                    {currentStep === 'step3' && selectedAccountType === 'business' && (
                        <BusinessStep3Form
                            data={data}
                            setData={setData}
                            onNext={handleStep3Next}
                            onBack={() => setCurrentStep('step2')}
                            errors={errors}
                        />
                    )}

                    {currentStep === 'finalStep' && (
                        <FinalStepForm
                            data={data}
                            setData={setData}
                            onComplete={handleSignUpComplete}
                            onBack={() => {
                                if (selectedAccountType === 'business') {
                                    setCurrentStep('step3');
                                } else {
                                    setCurrentStep('step2');
                                }
                            }}
                            errors={errors}
                            loading={loading}
                            accountType={selectedAccountType}
                        />
                    )}

                    <div className="text-center">
                        <span className="text-gray-600 text-sm">Already have an account? </span>
                        <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 text-sm">
                            Login
                        </a>
                    </div>
                    <div className="text-center">
                        <span className="text-gray-600 text-sm">if your want back to main page, click here </span>
                        <a href="/"
                            className="font-medium text-blue-600 hover:text-blue-700 text-sm"
                        >
                            <span className='mr-10'>Home</span>

                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpApp;