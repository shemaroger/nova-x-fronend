import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Check,
    Star,
    Calendar,
    DollarSign,
    Shield,
    Zap,
    RefreshCw,
    CheckCircle,
    Package,
    Crown,
    Users,
    X,
    Info,
    Clock,
    Tag,
    Globe
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSubscriptionplan, createPaymentIntent, confirmPayment, getSMEAnalysis } from '../Service/api';

const SubscriptionPage = () => {
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [paymentStep, setPaymentStep] = useState('plan_details');

    // Currency symbols mapping
    const currencySymbols = {
        'usd': '$',
        'eur': '€',
        'gbp': '£',
        'cad': 'C$'
    };

    // Duration display mapping
    const durationLabels = {
        '3_months': '3 Months',
        '6_months': '6 Months',
        '1_year': '1 Year'
    };

    // Fetch subscription plans
    const fetchSubscriptionPlans = async () => {
        setIsLoading(true);
        try {
            const response = await getSubscriptionplan();


            let plansData = [];

            if (Array.isArray(response)) {
                plansData = response;
            } else if (response?.results && Array.isArray(response.results)) {
                plansData = response.results;
            } else if (response?.data && Array.isArray(response.data)) {
                plansData = response.data;
            } else if (response && typeof response === 'object') {
                plansData = [response];
            }

            plansData = plansData
                .filter(plan => plan.is_active)
                .map(plan => ({
                    ...plan,
                    id: plan.id,
                    name: plan.name || 'Unnamed Plan',
                    stripe_price_id: plan.stripe_price_id || '',
                    price: parseFloat(plan.price) || 0,
                    currency: plan.currency || 'usd',
                    duration: plan.duration || '6_months',
                    features: Array.isArray(plan.features) ? plan.features :
                        typeof plan.features === 'string' ? JSON.parse(plan.features) :
                            [],
                    is_active: plan.is_active,
                    created_at: plan.created_at,
                    updated_at: plan.updated_at
                }));

            setSubscriptionPlans(plansData);

        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            toast.error('Failed to load subscription plans');
            setSubscriptionPlans([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load subscription plans on component mount
    useEffect(() => {
        fetchSubscriptionPlans();
    }, []);

    // Format price with currency
    const formatPrice = (price, currency) => {
        const symbol = currencySymbols[currency] || '$';
        return `${symbol}${parseFloat(price || 0).toFixed(2)}`;
    };

    // Format duration
    const formatDuration = (duration) => {
        return durationLabels[duration] || duration?.replace('_', ' ') || 'N/A';
    };



    // Get plan popularity (you can customize this logic)
    const isPlanPopular = (plan, allPlans) => {
        if (allPlans.length <= 1) return false;

        // Simple logic: middle-priced plan is popular
        const prices = allPlans.map(p => p.price).sort((a, b) => a - b);
        const middleIndex = Math.floor(prices.length / 2);
        return plan.price === prices[middleIndex];
    };

    // Get plan color scheme
    const getPlanColorScheme = (plan, isPopular) => {
        if (isPopular) {
            return {
                border: 'border-violet-300',
                background: 'bg-gradient-to-br from-violet-50 to-purple-50',
                button: 'bg-violet-600 hover:bg-violet-700 text-white',
                price: 'text-violet-600',
                ring: 'ring-violet-500'
            };
        } else if (plan.price >= 50) {
            return {
                border: 'border-yellow-300',
                background: 'bg-gradient-to-br from-yellow-50 to-orange-50',
                button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
                price: 'text-yellow-600',
                ring: 'ring-yellow-500'
            };
        } else {
            return {
                border: 'border-gray-200',
                background: 'bg-white',
                button: 'bg-gray-800 hover:bg-gray-900 text-white',
                price: 'text-gray-900',
                ring: 'ring-gray-500'
            };
        }
    };

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setShowModal(true);

    };

    const handleSubscribe = async (plan) => {
        setIsProcessing(true);
        setPaymentStep('payment_processing');

        try {

            const user_id = localStorage.getItem('user_id');
            const check_user = await getSMEAnalysis();

            const found = check_user.results.find(item => item.user_info?.id == user_id);
            if (!found) {
                console.log('🆕 No existing rating found — proceed to create a new one.');
                toast.info('Please provide your SME analysis to proceed with the subscription.');

            } else {
                // Get user data from localStorage
                const profileDataRaw = localStorage.getItem('profile_data');
                const profileData = JSON.parse(profileDataRaw);

                console.log('User data:', check_user);


                console.log('User profile data:', user_id);

                if (!user_id) {
                    throw new Error('User profile data not found. Please login again.');
                }
                const paymentPayload = {
                    user: user_id,
                    subscription: plan.id,
                    amount: plan.price,
                    currency: plan.currency,

                    metadata: {
                        plan_name: plan.name,
                        plan_duration: plan.duration,
                        stripe_price_id: plan.stripe_price_id,
                        user_email: profileData.email || '',
                        user_name: profileData.name || profileData.username || ''
                    }
                };

                console.log('Creating payment intent with payload:', paymentPayload);

                // Step 1: Create payment intent
                const paymentResponse = await createPaymentIntent(paymentPayload);

                if (paymentResponse.error) {
                    throw new Error(paymentResponse.error);
                }

                console.log('Payment intent created:', paymentResponse);

                // Store payment data for confirmation step
                setPaymentData({
                    paymentId: paymentResponse.payment_id,
                    clientSecret: paymentResponse.client_secret,
                    status: paymentResponse.status,
                    plan: plan
                });

                setPaymentStep('payment_confirmation');
                toast.success('Payment intent created successfully!');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            toast.error(error.message || 'Failed to process subscription. Please try again.');
            setPaymentStep('plan_details');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle payment confirmation
    const handleConfirmPayment = async () => {
        if (!paymentData) return;

        setIsProcessing(true);

        try {
            console.log('Confirming payment:', paymentData.paymentId);

            // Step 2: Confirm payment
            const confirmResponse = await confirmPayment(paymentData.paymentId);

            if (confirmResponse.error) {
                throw new Error(confirmResponse.error);
            }

            console.log('Payment confirmed:', confirmResponse);

            toast.success(`Payment confirmed! ${confirmResponse.status}`);

            // Reset modal state
            setPaymentData(null);
            setPaymentStep('plan_details');
            setShowModal(false);

        } catch (error) {
            console.error('Payment confirmation error:', error);
            toast.error(error.message || 'Failed to confirm payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle modal close with state reset
    const handleCloseModal = () => {
        setShowModal(false);
        setPaymentStep('plan_details');
        setPaymentData(null);
        setIsProcessing(false);
    };

    // Plan Details Modal Component
    const PlanDetailsModal = ({ plan, isOpen, onClose }) => {
        if (!isOpen || !plan) return null;

        const isPopular = isPlanPopular(plan, subscriptionPlans);
        const colorScheme = getPlanColorScheme(plan, isPopular);

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-opacity-50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Header */}
                        <div className={`p-8 pb-6 ${colorScheme.background} rounded-t-2xl`}>
                            <div className="text-center">
                                {/* Popular Badge */}
                                {isPopular && (
                                    <div className="inline-flex items-center space-x-2 bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span>Most Popular</span>
                                    </div>
                                )}

                                <h2 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                                <div className="mb-4">
                                    <span className={`text-5xl font-bold ${colorScheme.price}`}>
                                        {formatPrice(plan.price, plan.currency)}
                                    </span>
                                    <span className="text-gray-600 text-xl ml-2">
                                        / {formatDuration(plan.duration)}
                                    </span>
                                </div>

                                {/* Payment Step Indicator */}
                                <div className="flex items-center justify-center space-x-4 mt-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${paymentStep === 'plan_details' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                        }`}>
                                        {paymentStep === 'plan_details' ? '1' : <Check className="w-4 h-4" />}
                                    </div>
                                    <div className={`h-1 w-8 ${paymentStep !== 'plan_details' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${paymentStep === 'payment_processing' ? 'bg-blue-500 text-white' :
                                        paymentStep === 'payment_confirmation' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        {paymentStep === 'payment_confirmation' ? <Check className="w-4 h-4" /> : '2'}
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600 mt-2 max-w-xs mx-auto">
                                    <span>Plan Details</span>
                                    <span>Payment</span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 pt-6">
                            {/* Plan Details Step */}
                            {paymentStep === 'plan_details' && (
                                <>
                                    {/* Features */}
                                    <div className="mb-8">
                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span>Plan Features</span>
                                        </h4>
                                        {plan.features.length > 0 ? (
                                            <ul className="space-y-3">
                                                {plan.features.map((feature, index) => (
                                                    <li key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-600 italic">No features specified for this plan.</p>
                                        )}
                                    </div>

                                    {/* Pricing Breakdown */}
                                    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-4">Pricing Breakdown</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Plan Price:</span>
                                                <span className="font-semibold">{formatPrice(plan.price, plan.currency)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Billing Cycle:</span>
                                                <span className="font-semibold">{formatDuration(plan.duration)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Monthly Equivalent:</span>
                                                <span className="font-semibold">
                                                    {formatPrice(
                                                        plan.duration === '3_months' ? plan.price / 3 :
                                                            plan.duration === '6_months' ? plan.price / 6 :
                                                                plan.duration === '1_year' ? plan.price / 12 :
                                                                    plan.price,
                                                        plan.currency
                                                    )}
                                                </span>
                                            </div>
                                            <hr className="my-3" />
                                            <div className="flex justify-between text-lg">
                                                <span className="font-semibold text-gray-900">Total Amount:</span>
                                                <span className={`font-bold ${colorScheme.price}`}>
                                                    {formatPrice(plan.price, plan.currency)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Payment Confirmation Step */}
                            {paymentStep === 'payment_confirmation' && paymentData && (
                                <div className="space-y-6">
                                    <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-green-900 mb-2">Payment Intent Created!</h3>
                                        <p className="text-green-700">Your payment is ready for confirmation.</p>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="p-6 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-4">Payment Details</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payment ID:</span>
                                                <span className="font-mono text-sm font-semibold">{paymentData.paymentId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Plan:</span>
                                                <span className="font-semibold">{paymentData.plan.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Amount:</span>
                                                <span className="font-semibold">{formatPrice(paymentData.plan.price, paymentData.plan.currency)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-semibold text-yellow-600 capitalize">{paymentData.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Important Note */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                                            <div>
                                                <h5 className="font-semibold text-blue-900">Important</h5>
                                                <p className="text-blue-700 text-sm">
                                                    Confirming this payment will submit it for admin approval.
                                                    You will receive a notification once your payment is processed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-4 mt-8">
                                {paymentStep === 'plan_details' && (
                                    <>
                                        <button
                                            onClick={() => handleSubscribe(plan)}
                                            disabled={isProcessing}
                                            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${colorScheme.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    <span>Creating Payment...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    <span>Pay Now</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}

                                {paymentStep === 'payment_confirmation' && (
                                    <>
                                        <button
                                            onClick={handleConfirmPayment}
                                            disabled={isProcessing}
                                            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${colorScheme.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    <span>Confirming...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Confirm Payment</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setPaymentStep('plan_details')}
                                            disabled={isProcessing}
                                            className="px-6 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                                        >
                                            Back
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Plan Card Component
    const PlanCard = ({ plan, isPopular }) => {
        const colorScheme = getPlanColorScheme(plan, isPopular);

        return (
            <div
                className={`relative rounded-2xl border-2 p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 ${colorScheme.border} ${colorScheme.background}`}
                onClick={() => handleSelectPlan(plan)}
            >
                {/* Popular Badge */}
                {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 shadow-lg">
                            <Star className="w-4 h-4 fill-current" />
                            <span>Most Popular</span>
                        </span>
                    </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                    <div className="mb-4">
                        <span className={`text-4xl font-bold ${colorScheme.price}`}>
                            {formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className="text-gray-600 text-lg ml-2">
                            / {formatDuration(plan.duration)}
                        </span>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Billed every {formatDuration(plan.duration).toLowerCase()}</span>
                    </div>
                </div>

                {/* Features List */}
                <div className="mb-8">
                    <ul className="space-y-4">
                        {plan.features.slice(0, 4).map((feature, index) => (
                            <li key={index} className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-base">{feature}</span>
                            </li>
                        ))}
                        {plan.features.length > 4 && (
                            <li className="text-gray-500 text-sm italic">
                                +{plan.features.length - 4} more features...
                            </li>
                        )}
                    </ul>
                </div>

                {/* View Details Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan);
                    }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${colorScheme.button} flex items-center justify-center space-x-2`}
                >
                    <Info className="w-5 h-5" />
                    <span>View Details</span>
                </button>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading subscription plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Select the perfect subscription plan that fits your needs.
                        Click on any plan to view detailed information.
                    </p>
                </div>

                {/* Plans Grid */}
                {subscriptionPlans.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                            No Plans Available
                        </h3>
                        <p className="text-gray-600 text-lg">
                            We're working on bringing you amazing subscription plans.
                            Please check back soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {subscriptionPlans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isPopular={isPlanPopular(plan, subscriptionPlans)}
                            />
                        ))}
                    </div>
                )}

                {/* Features Section */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        Why Choose Our Platform?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                            <p className="text-gray-600">Bank-level security with 99.9% uptime guarantee</p>
                        </div>
                        <div className="text-center">
                            <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                            <p className="text-gray-600">Optimized performance for the best user experience</p>
                        </div>
                        <div className="text-center">
                            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
                            <p className="text-gray-600">Round-the-clock customer support when you need it</p>
                        </div>
                    </div>
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Frequently Asked Questions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan later?</h4>
                            <p className="text-gray-600">Yes, you can upgrade, downgrade, or cancel your subscription at any time.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
                            <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
                            <p className="text-gray-600">Yes, all plans come with a 14-day free trial period.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">How does billing work?</h4>
                            <p className="text-gray-600">You'll be billed automatically based on your selected plan duration.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan Details Modal */}
            <PlanDetailsModal
                plan={selectedPlan}
                isOpen={showModal}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default SubscriptionPage;