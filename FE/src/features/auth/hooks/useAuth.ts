import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosClient from "@/config/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import { type LoginInput } from "@/schemas/authSchema";
import { API_ENDPOINTS } from "@/constants/api";
import { PATHS } from "@/routes/paths";
import type { AuthResponse, RegisterResponse, RegisterRequest } from "@/types/api/auth.api";
import { UserRole } from "@/types";
import { toast } from "sonner";
import type { LocationState } from "@/features/auth/types";

export const useAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const loginMutation = useMutation<AuthResponse, AxiosError, LoginInput>({
    mutationFn: async (credentials: LoginInput) => {
      const response = await axiosClient.post<AuthResponse, AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response;
    },
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      
      toast.success(`Chào mừng ${user.fullName} trở lại!`);

      // Senior Redirect Logic: Ưu tiên quay lại trang cũ nếu có, nếu không thì theo Role
      const state = location.state as LocationState;
      const from = state?.from?.pathname;
      
      if (from && from !== PATHS.AUTH.LOGIN) {
        navigate(from, { replace: true });
        return;
      }

      // Role-based Navigation Mapping
      switch (user.role) {
        case UserRole.CUSTOMER:
          navigate(PATHS.HOME, { replace: true });
          break;
        default:
          navigate(PATHS.DASHBOARD, { replace: true });
      }
    },
    onError: (error: AxiosError) => {
      console.error("Login Error Details:", error);
    }
  });

  const registerMutation = useMutation<RegisterResponse, AxiosError, RegisterRequest>({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await axiosClient.post<RegisterResponse, RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response;
    },
    onSuccess: () => {
      toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
      navigate(PATHS.AUTH.LOGIN);
    },
    onError: (error: AxiosError) => {
      console.error("Registration Error Details:", error);
    }
  });

  const logout = async () => {
    try {
      await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      toast.info("Đã đăng xuất.");
    } finally {
      logoutStore();
      navigate(PATHS.AUTH.LOGIN);
    }
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
};
