// // API Configuration and Service
// const API_BASE_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = 'https://be-stg.techstyles.ai';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Get auth token from storage
  async getAuthToken() {
    return new Promise(resolve => {
      chrome.storage.local.get(['access'], result => {
        resolve(result.access || null);
      });
    });
  }

  // Refresh access token
  async refreshToken() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['refresh'], async (result) => {
        const refresh = result.refresh;

        if (!refresh) {
          await this.logout();
          reject(new Error('No refresh token available'));
          return;
        }

        try {
          const response = await fetch(`${this.baseUrl}/user/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh }),
          });

          if (!response.ok) {
            await this.logout();
            reject(new Error('Failed to refresh token'));
            return;
          }

          const data = await response.json();
          const newAccess = data.access;

          // Save new access token
          await chrome.storage.local.set({ access: newAccess });
          resolve(newAccess);
        } catch (error) {
          await this.logout();
          reject(error);
        }
      });
    });
  }

  // Build headers with auth token
  async getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Centralized request method with interceptor
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders(options.includeAuth !== false);

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      let response = await fetch(url, config);

      // Interceptor: Check for 401 Unauthorized
      if (response.status === 401) {
        try {
          const newAccessToken = await this.refreshToken();
          
          // Retry original request with new token
          config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(url, config);
        } catch (refreshError) {
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Login
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/user/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid credentials.');
      }

      const data = await response.json();

      // Save tokens and user data to storage
      await chrome.storage.local.set({
        access: data.access,
        refresh: data.refresh,
        user: data.user, // User data is included in login response
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Extract product details using AI
  async extractProductDetails(content, imageUrls) {
    try {
      // Filter to only include real HTTP/HTTPS URLs (no data URLs)
      const filteredImageUrls = imageUrls.filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));

      return await this.request('/clipper/extract_product_details/', {
        method: 'POST',
        body: JSON.stringify({
          content: content,
          image_urls: filteredImageUrls.slice(0, 4), // Only send first 4 images
        }),
      });
    } catch (error) {
      throw error;
    }
  }

  // Save product
  async saveProduct(productData) {
    try {
      return await this.request('/clipper/save_product/', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout() {
    await chrome.storage.local.remove(['access', 'refresh', 'user']);
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getAuthToken();
    return !!token;
  }
}

// Export singleton instance
const api = new ApiService();
