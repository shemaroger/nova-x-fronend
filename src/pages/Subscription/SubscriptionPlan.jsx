import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    Calendar,
    Star,
    Eye,
    ToggleLeft,
    ToggleRight,
    Package,
    RefreshCw,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createSubscriptionPlan, getSubscriptionplan, updateSubscription } from '../Service/api';

const SubscriptionPlanPage = () => {
    const [plans, setPlans] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingPlans, setIsFetchingPlans] = useState(true);
    const [errors, setErrors] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        stripe_price_id: '',
        price: '',
        currency: 'usd',
        duration: '6_months',
        features: [],
        is_active: true
    });

    // Feature input state
    const [newFeature, setNewFeature] = useState('');

    // Currency options
    const currencyOptions = [
        { value: 'usd', label: 'USD ($)', symbol: '$' },
        { value: 'eur', label: 'EUR (€)', symbol: '€' },
        { value: 'gbp', label: 'GBP (£)', symbol: '£' },
        { value: 'cad', label: 'CAD (C$)', symbol: 'C$' }
    ];

    // Duration options
    const durationOptions = [
        { value: '6_months', label: '6 Months' },
        { value: '1_year', label: '1 Year' }
    ];

    // Fetch subscription plans
    const fetchSubscriptionPlans = async () => {
        setIsFetchingPlans(true);
        try {
            const response = await getSubscriptionplan();
            console.log('API Response:', response.results); // Debug log

            // Handle different possible response structures
            let plansData = [];
            if (Array.isArray(response.results)) {
                plansData = response.results;
            } else if (response?.results && Array.isArray(response.data)) {
                plansData = response.data;
            } else if (response?.plans && Array.isArray(response.plans)) {
                plansData = response.plans;
            } else if (response?.subscription_plans && Array.isArray(response.subscription_plans)) {
                plansData = response.subscription_plans;
            } else if (response && typeof response === 'object') {
                // If it's a single plan object, wrap it in an array
                plansData = [response];
            }

            // Ensure features is always an array
            plansData = plansData.map(plan => ({
                ...plan,
                features: Array.isArray(plan.features) ? plan.features :
                    typeof plan.features === 'string' ? plan.features.split(',').map(f => f.trim()) :
                        [],
                price: parseFloat(plan.price) || 0,
                is_active: plan.is_active !== undefined ? plan.is_active : true
            }));

            setPlans(plansData);
            console.log('Processed plans:', plansData); // Debug log
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            toast.error('Failed to fetch subscription plans');
            setPlans([]);
        } finally {
            setIsFetchingPlans(false);
        }
    };

    // Load subscription plans on component mount
    useEffect(() => {
        fetchSubscriptionPlans();
    }, []);

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            stripe_price_id: '',
            price: '',
            currency: 'usd',
            duration: '6_months',
            features: [],
            is_active: true
        });
        setNewFeature('');
        setErrors({});
        setEditingPlan(null);
        setShowAddForm(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Add feature
    const addFeature = () => {
        if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    // Remove feature
    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    // Handle feature input key press
    const handleFeatureKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Plan name is required';
        }

        if (!formData.stripe_price_id.trim()) {
            newErrors.stripe_price_id = 'Stripe Price ID is required';
        }

        if (!formData.price || formData.price <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (formData.features.length === 0) {
            newErrors.features = 'At least one feature is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            if (editingPlan) {
                // For editing, you might need an updateSubscriptionPlan API function
                await updateSubscription(editingPlan.id, formData)
                toast.success('Plan updated successfully');
                await fetchSubscriptionPlans();
            } else {
                // Create new plan
                const response = await createSubscriptionPlan(formData);
                if (response.success) {
                    toast.success('Plan created successfully');
                }
                await fetchSubscriptionPlans();
            }

            resetForm();
        } catch (error) {
            console.error('Error saving plan:', error);
            toast.error('Failed to save plan. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (plan) => {
        setFormData({
            name: plan.name || '',
            stripe_price_id: plan.stripe_price_id || '',
            price: plan.price ? plan.price.toString() : '',
            currency: plan.currency || 'usd',
            duration: plan.duration || '6_months',
            features: Array.isArray(plan.features) ? [...plan.features] : [],
            is_active: plan.is_active !== undefined ? plan.is_active : true
        });
        setEditingPlan(plan);
        setShowAddForm(true);
    };

    // Handle delete
    const handleDelete = async (planId) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                // You might need a deleteSubscriptionPlan API function
                setPlans(prev => prev.filter(plan => plan.id !== planId));
                toast.success('Plan deleted successfully');
            } catch (error) {
                console.error('Error deleting plan:', error);
                toast.error('Failed to delete plan');
            }
        }
    };

    // Toggle plan status
    const togglePlanStatus = async (planId) => {
        try {
            // You might need an updateSubscriptionPlan API function
            setPlans(prev => prev.map(plan =>
                plan.id === planId
                    ? { ...plan, is_active: !plan.is_active, updated_at: new Date().toISOString() }
                    : plan
            ));
            toast.success('Plan status updated');
        } catch (error) {
            console.error('Error updating plan status:', error);
            toast.error('Failed to update plan status');
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchSubscriptionPlans();
    };

    // Format price
    const formatPrice = (price, currency) => {
        const currencySymbol = currencyOptions.find(c => c.value === currency)?.symbol || '$';
        return `${currencySymbol}${parseFloat(price || 0).toFixed(2)}`;
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

    // Format duration
    const formatDuration = (duration) => {
        const option = durationOptions.find(d => d.value === duration);
        return option ? option.label : duration?.replace('_', ' ') || 'N/A';
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Subscription Plans
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage your subscription plans and pricing
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isFetchingPlans}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isFetchingPlans ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Plan</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isFetchingPlans && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-violet-600 mr-3" />
                            <span className="text-gray-600">Loading subscription plans...</span>
                        </div>
                    </div>
                )}

                {/* Add/Edit Form Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Form Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                                    </h2>
                                    <button
                                        onClick={resetForm}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Form */}
                                <div className="space-y-6">
                                    {/* Plan Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Plan Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="Enter plan name"
                                        />
                                        {errors.name && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Stripe Price ID */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Stripe Price ID *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.stripe_price_id}
                                            onChange={(e) => handleInputChange('stripe_price_id', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.stripe_price_id ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="price_xxxxxxxxxx"
                                        />
                                        {errors.stripe_price_id && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.stripe_price_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price and Currency */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) => handleInputChange('price', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.price ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="0.00"
                                            />
                                            {errors.price && (
                                                <p className="text-red-600 text-sm mt-1 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.price}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Currency
                                            </label>
                                            <select
                                                value={formData.currency}
                                                onChange={(e) => handleInputChange('currency', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            >
                                                {currencyOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duration
                                        </label>
                                        <select
                                            value={formData.duration}
                                            onChange={(e) => handleInputChange('duration', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        >
                                            {durationOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Features *
                                        </label>

                                        {/* Add Feature Input */}
                                        <div className="flex space-x-2 mb-3">
                                            <input
                                                type="text"
                                                value={newFeature}
                                                onChange={(e) => setNewFeature(e.target.value)}
                                                onKeyPress={handleFeatureKeyPress}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                placeholder="Enter a feature"
                                            />
                                            <button
                                                type="button"
                                                onClick={addFeature}
                                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Features List */}
                                        {formData.features.length > 0 && (
                                            <div className="space-y-2 mb-3">
                                                {formData.features.map((feature, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                                        <span className="text-sm text-gray-700">{feature}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFeature(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {errors.features && (
                                            <p className="text-red-600 text-sm mt-1 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.features}
                                            </p>
                                        )}
                                    </div>

                                    {/* Active Status */}
                                    <div className="flex items-center space-x-3">
                                        <label className="text-sm font-medium text-gray-700">
                                            Plan Status
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('is_active', !formData.is_active)}
                                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {formData.is_active ? (
                                                <ToggleRight className="w-4 h-4" />
                                            ) : (
                                                <ToggleLeft className="w-4 h-4" />
                                            )}
                                            <span>{formData.is_active ? 'Active' : 'Inactive'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>{editingPlan ? 'Update Plan' : 'Create Plan'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plans List */}
                {!isFetchingPlans && (
                    <div className="space-y-6">
                        {plans.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
                                <p className="text-gray-600 mb-6">Create your first subscription plan to get started</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center space-x-2 mx-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Plan</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {plans.map(plan => (
                                    <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        {/* Plan Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                                <p className="text-2xl font-bold text-violet-600 mt-1">
                                                    {formatPrice(plan.price, plan.currency)}
                                                    <span className="text-sm font-normal text-gray-600 ml-1">
                                                        /{formatDuration(plan.duration)}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => togglePlanStatus(plan.id)}
                                                    className={`p-1 rounded ${plan.is_active
                                                        ? 'text-green-600 hover:bg-green-50'
                                                        : 'text-gray-400 hover:bg-gray-50'
                                                        }`}
                                                    title={plan.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {plan.is_active ? (
                                                        <ToggleRight className="w-5 h-5" />
                                                    ) : (
                                                        <ToggleLeft className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Plan Details */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDuration(plan.duration)}</span>
                                            </div>

                                            {plan.stripe_price_id && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                                        {plan.stripe_price_id}
                                                    </span>
                                                </div>
                                            )}

                                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${plan.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {plan.is_active ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>

                                        {/* Features */}
                                        {plan.features && plan.features.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
                                                <ul className="space-y-1">
                                                    {plan.features.map((feature, index) => (
                                                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Plan Meta */}
                                        {plan.created_at && (
                                            <div className="text-xs text-gray-500 mb-4">
                                                Created: {formatDate(plan.created_at)}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleEdit(plan)}
                                                className="flex items-center space-x-1 text-sm text-violet-600 hover:text-violet-700"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span>Edit</span>
                                            </button>

                                            <button
                                                onClick={() => handleDelete(plan.id)}
                                                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete</span>
                                            </button>
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

export default SubscriptionPlanPage;