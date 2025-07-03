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
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            await api.post('/auth/logout/', { refresh: refreshToken });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_data');
    }
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


export const rejectInvestor = async (investorId, rejectionReason) => {
    const formData = new FormData();
    formData.append('rejection_reason', rejectionReason);

    try {
        const response = await api.put(
            `/investor/${investorId}/reject_investor/`,
            formData
        );
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
            return null; // No subscription found
        }
        throw error; // Unexpected error
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