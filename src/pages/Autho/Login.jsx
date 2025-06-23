import React, { useState } from 'react';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { login } from '../Service/api';

const NovaXLogo = () => (
    <div className="relative mx-auto w-64 h-40 mb-14">
        <img src="/images/nova-logo.png" alt="Nova X Logo" className="" />
    </div>
);

const Button = ({ children, variant = 'primary', onClick, disabled = false, className = '', loading = false }) => {
    const baseClasses = 'px-6 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 w-full';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
        link: 'bg-transparent text-blue-600 hover:text-blue-700 focus:ring-blue-600 p-0'
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

const BackgroundImage = () => (
    <div className="w-1/2 relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
        <div className="absolute inset-0 flex items-center justify-start">
            <div className="relative w-full h-full overflow-hidden">
                <img
                    src='/images/login.png'
                    alt="Login illustration"
                    className='object-cover w-full h-full absolute rounded-xl'
                />
            </div>
        </div>
    </div>
);

const SuccessMessage = ({ message, userData }) => (
    <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {userData && (
                <p className="text-sm text-gray-500">
                    Logged in as <strong>{userData.email}</strong>
                </p>
            )}
        </div>
        <Button
            variant="primary"
            onClick={() => window.location.href = '/dashboard'}
            className="w-full"
        >
            Go to Dashboard
        </Button>
    </div>
);

const ErrorMessage = ({ error, onRetry }) => (
    <div className="space-y-4 text-center p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Login Failed</h3>
            <p className="text-red-700 text-sm">{error}</p>
        </div>
        <Button variant="primary" onClick={onRetry} className="w-full">
            Try Again
        </Button>
    </div>
);

const LoginForm = ({ data, setData, onSubmit, errors, loading }) => {
    const [showPassword, setShowPassword] = useState(false);

    const updateField = (field, value) => {
        setData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSubmit();
        }
    };

    return (
        <div className="space-y-6">
            <div className="">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back 👋</h2>
                <p className="text-gray-600">Sign in to accelerate your growth and lead the market!</p>
            </div>

            <div className="space-y-6">
                {/* Email Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="ava.wright@gmail.com"
                        value={data.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                        <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••••"
                            value={data.password}
                            onChange={(e) => updateField('password', e.target.value)}
                            className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {/* Space for remember me checkbox if needed */}
                    </div>
                    <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-700 "
                        onClick={() => window.location.href = '/forgot-password'}
                    >
                        Forgot password?
                    </button>
                </div>

                <div onKeyPress={handleKeyPress}>
                    <Button
                        variant="primary"
                        onClick={onSubmit}
                        loading={loading}
                        disabled={loading || !data.email || !data.password}
                        className="w-full"
                    >
                        {loading ? 'Signing in...' : 'Continue'}
                    </Button>
                </div>
            </div>

            <div className="text-center">
                <span className="text-gray-600 text-sm">Don't you have an account? </span>
                <a href="/signup"
                    className="font-medium text-blue-600 hover:text-blue-700 text-sm "
                >
                    Sign Up
                </a>
            </div>
        </div>
    );
};

const LoginApp = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};

        if (!data.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!data.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const storeAuthData = (responseData) => {
        try {
            if (responseData.data && responseData.data.tokens) {
                localStorage.setItem('access_token', responseData.data.tokens.access);
                localStorage.setItem('refresh_token', responseData.data.tokens.refresh);
                localStorage.setItem('token_type', responseData.data.tokens.token_type);
            }

            if (responseData.data && responseData.data.user) {
                localStorage.setItem('user_data', JSON.stringify(responseData.data.user));
            }
            localStorage.setItem('auth_data', JSON.stringify(responseData.data));

            console.log('Authentication data stored successfully');

        } catch (error) {
            console.error('Error storing authentication data:', error);
        }
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const loginData = {
                email: data.email,
                password: data.password,
                remember_me: data.rememberMe
            };

            const response = await login(loginData);

            if (response.success) {
                storeAuthData(response);
                if (response.data.user.profile_data.application_status == "rejected" || response.data.user.profile_data.application_status == "pending" || response.data.user.profile_data.kyc_status == "") {
                    toast.error("Your application is still pending. Please wait for the approval from the admin.")
                    console.log("Your application is still pending. Please wait for the approval from the admin.")
                    localStorage.setItem('user_id', response.data.user.id);
                    window.location.href = '/addkyc';
                } else {
                    toast.success("Login successful. Welcome back!")

                    localStorage.setItem('user_id', response.data.user.id);
                    localStorage.setItem('email', response.data.user.email);
                    localStorage.setItem('profile_data', JSON.stringify(response.data.user.profile_data));
                    localStorage.setItem('name', response.data.user.name);
                    localStorage.setItem('user', response.data.user.user_type);
                    if (response.data.user.user_type == "investor") {
                        window.location.href = '/dashboard';
                    } else if (response.data.user.user_type == "sme") {
                        window.location.href = '/dashboard';
                    } else if (response.data.user.user_type == "admin") {
                        window.location.href = '/dashboard/admin-dashboard';
                    } else {
                        toast.error("Invalid user type.")
                        window.location.href = '/login';
                    }
                }

            } else {
                toast.error(response.error || 'Login failed');

            }

        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'An unexpected error occurred. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.details) {
                errorMessage = 'Login failed. Please check your credentials.';
            }

            toast.error(errorMessage);


            // Map API errors to form fields
            if (error.details && typeof error.details === 'object') {
                const apiErrors = {};
                Object.keys(error.details).forEach(field => {
                    if (Array.isArray(error.details[field])) {
                        apiErrors[field] = error.details[field][0];
                    } else {
                        apiErrors[field] = error.details[field];
                    }
                });
                setErrors(apiErrors);
            }
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="min-h-screen flex p-5">
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <NovaXLogo />

                    <LoginForm
                        data={data}
                        setData={setData}
                        onSubmit={handleLogin}
                        errors={errors}
                        loading={loading}
                    />
                </div>
            </div>
            <BackgroundImage />
        </div>
    );
};

export default LoginApp;