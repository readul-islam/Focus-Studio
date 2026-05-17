import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// api.interceptors.request.use(config => {
//   if (typeof window !== 'undefined') {
//     const token = localStorage.getItem('access');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });

const handleError = error => {
  throw new Error(error.response ? `HTTP error! status: ${error.response.status}` : error.message);
};

export const fetchData = async url => {
  if (!url) throw new Error('No URL provided');
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const postData = async ({ url, data }) => {
  if (!url) throw new Error('No post URL provided');

  try {
    const response = await api.post(url, data);
    return response.data; // + your 201 success body
  } catch (error) {
    // Axios errors carry status here
    throw error;
  }
};

// export const deleteData = async ({ url }) => {
//   if (!url) throw new Error('No URL provided');
//   try {
//     const response = await api.delete(url);
//     return response.data;
//   } catch (error) {
//     handleError(error);
//   }
// };

export const deleteData = async ({ url, data }) => {
  if (!url) throw new Error('No URL provided');

  try {
    const response = await api.delete(url, data ? { data } : undefined);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const putData = async ({ url, data }) => {
  if (!url) throw new Error('No put URL provided');
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const patchData = async ({ url, data }) => {
  if (!url) throw new Error('No patch URL provided');
  try {
    const response = await api.patch(url, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const loginUser = async ({ email, password }: { email: string; password: string }) => {
  const res = await api.post('contractor_portal/login/', { email, password });
  return res.data; // { access, refresh, user }
};

export const loginWithCode = async ({ login_code }: { login_code: string }) => {
  const res = await api.post("contractor_portal/login-with-code/", { login_code });
  return res.data;
};


api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // If the request that failed WAS the refresh token request → logout immediately
    if (originalRequest.url.includes('/user/refresh/')) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle expired access → try refresh ONCE
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await api.post('/user/refresh/', { refresh });
        const newAccess = res.data.access;

        localStorage.setItem('access', newAccess);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccess;

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails → logout gracefully
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
