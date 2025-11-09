// API utility for patient app with proper error handling and token management

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Generic fetch wrapper with error handling
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    // Handle unauthorized - redirect to login
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  requestOTP: async (phone, role = 'Patient') => {
    return apiFetch('/v1/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone, role }),
    });
  },

  verifyOTP: async (phone, otp, role = 'Patient') => {
    return apiFetch('/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, role }),
    });
  },

  login: async (mobile, password) => {
    return apiFetch('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, password }),
    });
  },
};

// Patient APIs
export const patientAPI = {
  getPrescriptions: async () => {
    return apiFetch('/v1/patient/prescriptions');
  },

  getPrescriptionById: async (id) => {
    return apiFetch(`/v1/patient/prescriptions/${id}`);
  },

  getReports: async () => {
    return apiFetch('/v1/patient/reports');
  },

  getReportById: async (id) => {
    return apiFetch(`/v1/patient/reports/${id}`);
  },

  logAdherence: async (prescriptionId, doseTime) => {
    return apiFetch('/v1/patient/adherence', {
      method: 'POST',
      body: JSON.stringify({
        prescription_id: prescriptionId,
        dose_time: doseTime,
      }),
    });
  },
};

// Chatbot API
export const chatbotAPI = {
  query: async (queryText) => {
    return apiFetch('/v1/chatbot/query', {
      method: 'POST',
      body: JSON.stringify({ query: queryText }),
    });
  },
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('jwt_token');
};

// Get user info from localStorage
export const getUserInfo = () => {
  if (typeof window === 'undefined') return null;
  return {
    name: localStorage.getItem('user_name'),
    role: localStorage.getItem('user_role'),
    id: localStorage.getItem('user_id'),
  };
};

// Logout helper
export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.clear();
  window.location.href = '/';
};

// SWR fetcher (for use with useSWR hook)
export const fetcher = async (url) => {
  return apiFetch(url);
};