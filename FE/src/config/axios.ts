import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "sonner";
import type { ApiResponse } from "@/types/common";
import type { IUser } from "@/types";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export let refreshPromise: Promise<ApiResponse<{ user: IUser; accessToken: string }>> | null = null;

export const getRefreshPromise = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = axios.post(
    `${import.meta.env.VITE_API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
    {},
    { withCredentials: true }
  ).then(res => res.data).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const { logout, setAccessToken, accessToken } = useAuthStore.getState();

    // 1. Silent Refresh (401)
    if (error.response?.status === 401 && accessToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const responseData = await getRefreshPromise();
        const newAccessToken = responseData.data.accessToken;
        
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        logout();
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        return Promise.reject(refreshError);
      }
    }

    // 2. Global UI Feedback
    if (error.response?.status !== 401) {
      const errorMessage = error.response?.data?.message || "Lỗi kết nối máy chủ!";
      toast.error(errorMessage);
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
