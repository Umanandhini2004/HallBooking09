
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL
const API_BASE_URL = 'http://10.72.232.254:5000/api';    

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Use global token first, fallback to AsyncStorage
      const token = global.token || await AsyncStorage.getItem('token');

      console.log('Loaded token:', token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization Header:', config.headers.Authorization);
      }
    } catch (e) {
      console.log('Token load error:', e);
    }

    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.log('API Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.log('API Error:', error.message);

    if (error.response) {
      console.log('Server Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('Network Error - No response received');
    }

    return Promise.reject(error);
  }
);

// ================= AUTH API =================

export const authAPI = {
  register: async (name, email, password, role, phone, department) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role,
      phone,
      department,
    });

    if (response.data.token) {
      global.token = response.data.token;
      console.log('Saved token after register:', global.token);

      try {
        await AsyncStorage.setItem('token', response.data.token);
      } catch (e) {
        console.log('Storage save error:', e);
      }
    }

    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    if (response.data.token) {
      global.token = response.data.token;
      console.log('Saved token after login:', global.token);

      try {
        await AsyncStorage.setItem('token', response.data.token);
      } catch (e) {
        console.log('Storage save error:', e);
      }
    }

    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/update-profile', profileData);
    return response.data;
  },

  logout: async () => {
    global.token = null;

    try {
      await AsyncStorage.removeItem('token');
    } catch (e) {
      console.log('Logout storage error:', e);
    }
  },

  adminRegister: async (name, email, password) => {
    const response = await api.post('/auth/admin/register', {
      name,
      email,
      password,
    });

    if (response.data.token) {
      global.token = response.data.token;

      try {
        await AsyncStorage.setItem('token', response.data.token);
      } catch (e) {
        console.log('Storage save error:', e);
      }
    }

    return response.data;
  },

  adminLogin: async (email, password) => {
    const response = await api.post('/auth/admin/login', {
      email,
      password,
    });

    if (response.data.token) {
      global.token = response.data.token;
      console.log('Saved admin token:', global.token);
      try {
        await AsyncStorage.setItem('token', response.data.token);
      } catch (e) {
        console.log('Storage save error:', e);
      }
    }

    return response.data;
  },
};

// ================= BOOKINGS API =================

export const bookingsAPI = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/bookings?${query}`);
    return response.data;
  },

  getMyBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/bookings/mybookings?${query}`);
    return response.data;
  },

  updateBooking: async (id, status) => {
    const response = await api.put(`/bookings/${id}`, { status });
    return response.data;
  },

  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  checkAvailability: async (availabilityData) => {
    const response = await api.post('/bookings/check-availability', availabilityData);
    return response.data;
  },

  getBookingStats: async () => {
    const response = await api.get('/bookings/stats');
    return response.data;
  },
};



// ================= USERS API =================

export const usersAPI = {
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/users?${query}`);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// ================= HALLS API =================
export const hallsAPI = {
  getHalls: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/halls?${query}`);
    return response.data;
  },

  createHall: async (hallData) => {
    const response = await api.post('/halls', hallData);
    return response.data;
  },

  updateHall: async (id, hallData) => {
    const response = await api.put(`/halls/${id}`, hallData);
    return response.data;
  },

  deleteHall: async (id) => {
    const response = await api.delete(`/halls/${id}`);
    return response.data;
  },
};

export default api;
