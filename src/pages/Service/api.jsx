import axios from 'axios';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
            return Promise.reject(new Error('No access token found'));
        }

        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Clear all auth data
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('token_type');
                localStorage.removeItem('user_data');
                localStorage.removeItem('auth_data');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Error handler utility
const handleError = (error) => {
    if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;

        if (status === 400) {
            return {
                message: data.error || 'Validation failed',
                details: data.details || data,
                status: 400
            };
        } else if (status === 401) {
            return {
                message: 'Unauthorized access',
                status: 401
            };
        } else if (status === 403) {
            return {
                message: 'Access forbidden',
                status: 403
            };
        } else if (status === 404) {
            return {
                message: 'Resource not found',
                status: 404
            };
        } else if (status === 500) {
            return {
                message: 'Internal server error',
                status: 500
            };
        } else {
            return {
                message: data.error || data.message || 'An error occurred',
                details: data.details || data,
                status: status
            };
        }
    } else if (error.request) {
        // Network error
        return {
            message: 'Network error. Please check your connection.',
            status: 0
        };
    } else {
        // Something else happened
        return {
            message: error.message || 'An unexpected error occurred',
            status: 0
        };
    }
};

// Function to store authentication data consistently
const storeAuthData = (responseData) => {
    try {
        // Handle the new response structure from your backend
        if (responseData.data && responseData.data.tokens) {
            localStorage.setItem('access_token', responseData.data.tokens.access);
            localStorage.setItem('refresh_token', responseData.data.tokens.refresh);
            localStorage.setItem('token_type', responseData.data.tokens.token_type);
        }

        // Store user data
        if (responseData.data && responseData.data.user) {
            localStorage.setItem('user_data', JSON.stringify(responseData.data.user));
        }

        // Store complete response data
        localStorage.setItem('auth_data', JSON.stringify(responseData.data));

        console.log('Authentication data stored successfully');
    } catch (error) {
        console.error('Error storing authentication data:', error);
    }
};

// =================== AUTH ENDPOINTS ===================

// Investor Registration
export const registerInvestor = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/investor/register/`, userData);

        // Check for success and store auth data
        if (response.data.success && response.data.data) {
            storeAuthData(response.data);
        } else if (response.data.access) {
            // Fallback for old response format
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }

        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const registerSME = async (userData) => {

    console.log("userData:", userData)
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/sme/register/`, userData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });

        if (response.data.success && response.data.data) {
            storeAuthData(response.data);
        } else if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }

        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Business Registration
export const registerBusiness = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/business/register/`, userData);

        // Check for success and store auth data
        if (response.data.success && response.data.data) {
            storeAuthData(response.data);
        } else if (response.data.access) {
            // Fallback for old response format
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// General Registration (legacy support)
export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register/`, userData);
        // Check for success and store auth data
        if (response.data.success && response.data.data) {
            storeAuthData(response.data);
        } else if (response.data.access) {
            // Fallback for old response format
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }

        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Login
export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login/`, credentials);
        if (response.data.success && response.data.data) {
            storeAuthData(response.data);
        } else if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Logout
export const logout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_data');

};



export const getall_investors = async (params = {}) => {
    try {
        const response = await api.get('/investor/all_investors/', {
            params: params
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const approveInvestor = async (investorId) => {
    try {
        const response = await api.put(`/investor/${investorId}/approve_investor/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const approveSME = async (SMEId) => {
    try {
        const response = await api.put(`/sme/${SMEId}/approve_SME/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const uploadKYCDocument = async (documentType, file, additionalData = {}) => {
    try {
        const formData = new FormData();
        formData.append('document_file', file);
        formData.append('document_type', documentType);
        Object.keys(additionalData).forEach(key => {
            if (additionalData[key] !== null && additionalData[key] !== undefined) {
                formData.append(key, additionalData[key]);
            }
        });

        const response = await api.post('/kyc/documents/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getall_kyc_documents = async (params = {}) => {
    try {
        const response = await api.get('/kyc/documents/', {
            params: params
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const getKycDocumentsByUser = async (userId, params = {}) => {
    try {
        const response = await api.get(`/kyc/documents/users/${userId}/`, {
            params: params
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const approveKycDocument = async (documentId) => {
    try {
        const response = await api.post(`/kyc/documents/${documentId}/approve/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};



export const rejectKycDocument = async (documentId, rejectionReason) => {
    const formData = new FormData();
    formData.append('rejection_reason', rejectionReason);

    console.log("FormData created with rejection_reason:", rejectionReason);

    try {
        const response = await api.put(`/kyc/documents/${documentId}/reject/`, formData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const rejectSME = async (userId, rejectionReason) => {
    try {
        const response = await api.put(`/sme/${userId}/reject_SME/`, {
            rejection_reason: rejectionReason
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const rejectInvestor = async (investorId, rejectionReason) => {
    try {
        const response = await api.put(`/investor/${investorId}/reject_investor/`, {
            rejection_reason: rejectionReason
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const getall_sme = async (params = {}) => {
    try {
        const response = await api.get('/sme/all_sme/', {
            params: params
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const getSMEUserDetail = async (user_id) => {
    try {
        const response = await api.get(`/sme/${user_id}/user_details/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const getSMEUser_info = async (user_id) => {
    try {
        const response = await api.get(`/sme/${user_id}/user_info/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getInvestorUserDetail = async (user_id) => {
    try {
        const response = await api.get(`/investor/${user_id}/user_info/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const getSMEUpdate = async (user_id, smedata) => {
    try {
        const response = await api.put(`/sme/${user_id}/`, smedata, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });

        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateInvestorProfile = async (user_id, investordata) => {
    try {
        const response = await api.put(`/investor/${user_id}/`, investordata, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });

        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};




export const updateImage = async (user_id, imageData) => {
    try {
        const response = await api.post(`/applications/upload-profile-image/`, imageData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });

        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};



export const getall_sme_active = async () => {
    try {
        const response = await api.get('/sme-active/');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};



export const getSMEAnalysis = async () => {
    try {
        const response = await api.get('/analyses/');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const uploadAnalyisisDocument = async (AnalysisData = {}) => {
    try {

        const response = await api.post('/analyses/', AnalysisData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};
//======================User Registration Logs======================

export const getAllRegistrationLogs = async () => {
    try {
        const response = await api.get('/registration-logs/');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const verifyTIN = async (tin) => {
    try {
        const response = await api.post('/sme/verify-tin/', {
            tin: tin.replace(/[\s-]/g, ''),
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Optionally: Get logs filtered by user ID
export const getRegistrationLogsByUser = async (userId) => {
    try {
        const response = await api.get(`/registration-logs/?user=${userId}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Optionally: Get logs filtered by status
export const getRegistrationLogsByStatus = async (status) => {
    try {
        const response = await api.get(`/registration-logs/?status=${status}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// =================== Subscription ===================

export const getSubscriptionplan = async () => {
    try {
        const response = await api.get(`/subscription-plans/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createSubscriptionPlan = async (subscriptionData) => {
    try {
        const response = await api.post("/subscription-plans/", subscriptionData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateSubscription = async (subid, subscriptionData) => {
    try {
        const response = await api.patch(`/subscription-plans/${subid}/`, subscriptionData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const cancelSubscription = async (userId) => {
    try {
        const response = await api.delete(`/subscription/${userId}/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const createSubscription = async (userId) => {
    try {
        const response = await api.delete(`/subscription/${userId}/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};



export const getCurrentUser = async (userId) => {
    try {
        const response = await api.delete(`/subscription/${userId}/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


// =================== ENDPOINTS ===================


//===================Payments=======================

export const getPayment = async () => {
    try {
        const response = await api.get('/admin-payments/');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createPaymentIntent = async (paymentData) => {
    try {
        const response = await api.post(`/payments/create_payment_intent/`, paymentData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const confirmPayment = async (paymentId, paymentData) => {
    try {
        const response = await api.post(`/payments/${paymentId}/confirm_payment/`, paymentData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const approvePayment = async (paymentId) => {
    try {
        const response = await api.post(`/admin-payments/${paymentId}/approve/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};



//======================Notificaitons=================
export const getNotifications = async () => {
    try {
        const response = await api.get('/notifications/');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const markAsRead = async (notificationId) => {
    try {
        const response = await api.patch(`/notifications/${notificationId}/mark_as_read/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};
export const createNotification = async (notificationData) => {
    try {
        const response = await api.post('/notifications/', notificationData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};




export const getMySubscription = async () => {
    try {
        const response = await api.get('/subscriptions/me/');
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};

// =================== INVESTMENT ENDPOINTS ===================

// Create a new investment
export const createInvestment = async (investmentData) => {
    try {
        const response = await api.post('/investments/', investmentData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateamountInvestment = async (investmentData) => {
    try {
        const response = await api.post('/investments/update-amount/', investmentData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get all investments for current user
export const getMyInvestments = async (params = {}) => {
    try {
        const response = await api.get('/investments/', {
            params: params
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get investments by role (investor or sme)
export const getInvestmentsByRole = async (role = 'all', params = {}) => {
    try {
        const response = await api.get('/investments/my-investments/', {
            params: {
                role: role,
                ...params
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get all investments (with filtering)
export const getAllInvestments = async (params = {}) => {
    try {
        const response = await api.get('/investments/', {
            params: params
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get a specific investment by ID
export const getInvestment = async (investmentId) => {
    try {
        const response = await api.get(`/investments/${investmentId}/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Update an investment
export const updateInvestment = async (investmentId, updateData) => {
    try {
        const response = await api.patch(`/investments/${investmentId}/`, updateData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Delete an investment
export const deleteInvestment = async (investmentId) => {
    try {
        const response = await api.delete(`/investments/${investmentId}/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// SME responds to investment proposal
export const smeRespondToInvestment = async (investmentId, action, response = '') => {
    try {
        const responseData = await api.post(`/investments/${investmentId}/respond/`, {
            action: action, // 'accept' or 'reject'
            response: response
        });
        return responseData.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Accept investment proposal (SME)
export const acceptInvestment = async (investmentId, response = '') => {
    try {
        const responseData = await api.post(`/investments/${investmentId}/respond/`, {
            action: 'accept',
            response: response
        });
        return responseData.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Reject investment proposal (SME)
export const rejectInvestment = async (investmentId, response = '') => {
    try {
        const responseData = await api.post(`/investments/${investmentId}/respond/`, {
            action: 'reject',
            response: response
        });
        return responseData.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Activate investment after payment
export const activateInvestment = async (investmentId) => {
    try {
        const response = await api.post(`/investments/${investmentId}/activate/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Complete investment
export const completeInvestment = async (investmentId) => {
    try {
        const response = await api.post(`/investments/${investmentId}/complete/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get investment statistics
export const getInvestmentStats = async () => {
    try {
        const response = await api.get('/investments/stats/');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get investments for a specific SME
export const getInvestmentsForSME = async (smeId, params = {}) => {
    try {
        const response = await api.get('/investments/', {
            params: {
                sme: smeId,
                ...params
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get investments made by a specific investor
export const getInvestmentsByInvestor = async (investorId, params = {}) => {
    try {
        const response = await api.get('/investments/', {
            params: {
                investor: investorId,
                ...params
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get investments by status
export const getInvestmentsByStatus = async (status, params = {}) => {
    try {
        const response = await api.get('/investments/', {
            params: {
                status: status,
                ...params
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get investments by type
export const getInvestmentsByType = async (investmentType, params = {}) => {
    try {
        const response = await api.get('/investments/', {
            params: {
                investment_type: investmentType,
                ...params
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Mark investment payment as completed
export const markPaymentCompleted = async (investmentId) => {
    try {
        const response = await api.patch(`/investments/${investmentId}/`, {
            payment_completed: true
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Update investment returns paid
export const updateReturnsPaid = async (investmentId, returnAmount) => {
    try {
        const response = await api.patch(`/investments/${investmentId}/`, {
            returns_paid: returnAmount
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get pending investments for SME
export const getPendingInvestments = async () => {
    try {
        const response = await api.get('/investments/my-investments/', {
            params: {
                role: 'sme',
                status: 'pending'
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Get active investments for investor
export const getActiveInvestments = async () => {
    try {
        const response = await api.get('/investments/my-investments/', {
            params: {
                role: 'investor',
                status: 'active'
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Cancel investment (if allowed)
export const cancelInvestment = async (investmentId, reason = '') => {
    try {
        const response = await api.patch(`/investments/${investmentId}/`, {
            status: 'cancelled',
            investor_notes: reason
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Helper function to calculate investment metrics
export const calculateInvestmentMetrics = (investment) => {
    const amount = parseFloat(investment.amount);
    const returnPercentage = parseFloat(investment.expected_return_percentage);
    const durationMonths = parseInt(investment.duration_months);

    const annualReturn = amount * (returnPercentage / 100);
    const totalReturn = annualReturn * (durationMonths / 12);
    const totalValue = amount + totalReturn;
    const remainingReturns = Math.max(totalReturn - parseFloat(investment.returns_paid || 0), 0);

    return {
        principalAmount: amount,
        expectedAnnualReturn: annualReturn,
        expectedTotalReturn: totalReturn,
        totalExpectedValue: totalValue,
        returnsPaid: parseFloat(investment.returns_paid || 0),
        remainingReturns: remainingReturns,
        durationYears: durationMonths / 12,
        monthlyReturn: totalReturn / durationMonths
    };
};

// Helper function to get investment status color
export const getInvestmentStatusColor = (status) => {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-blue-100 text-blue-800',
        active: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        rejected: 'bg-red-100 text-red-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to get investment type display name
export const getInvestmentTypeDisplayName = (type) => {
    const typeNames = {
        equity: 'Equity Investment',
        loan: 'Business Loan',
        partnership: 'Partnership'
    };
    return typeNames[type] || type;
};




export const getChatRooms = async () => {
    try {
        const response = await api.get('/chat-rooms/');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createOrGetChatRoom = async (otherUserId) => {
    try {
        const response = await api.post('/chat-rooms/', {
            other_user_id: otherUserId
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getChatMessages = async (chatRoomId) => {
    try {
        const response = await api.get(`/chat-rooms/${chatRoomId}/messages/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


export const sendMessage = async (chatRoomId, content) => {
    try {
        const response = await api.post(`/chat-rooms/${chatRoomId}/send_message/`, {
            content: content
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const markMessagesAsRead = async (chatRoomId) => {
    try {
        const response = await api.post(`/chat-rooms/${chatRoomId}/mark_read/`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createMessage = async (chatRoomId, content) => {
    try {
        const response = await api.post('/messages/', {
            chat_room_id: chatRoomId,
            content: content
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getAllMessages = async (params = {}) => {
    try {
        const response = await api.get('/messages/', {
            params: params
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

















// =================== UTILITY FUNCTIONS ===================

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token'); // Updated key
};

// Get stored tokens
export const getTokens = () => {
    return {
        accessToken: localStorage.getItem('access_token'), // Updated key
        refreshToken: localStorage.getItem('refresh_token'), // Updated key
        tokenType: localStorage.getItem('token_type')
    };
};

// Get stored user data
export const getUserData = () => {
    try {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

// Get complete auth data
export const getAuthData = () => {
    try {
        const authData = localStorage.getItem('auth_data');
        return authData ? JSON.parse(authData) : null;
    } catch (error) {
        console.error('Error parsing auth data:', error);
        return null;
    }
};

// Clear all stored data
export const clearStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_data');
    // Clear any other stored user data
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
};

// File Upload Helper
export const uploadFile = async (file, endpoint, additionalData = {}) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        // Append additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        const response = await api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// Generic API call function
export const apiCall = async (method, endpoint, data = null, config = {}) => {
    try {
        const response = await api({
            method,
            url: endpoint,
            data,
            ...config
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export default api;