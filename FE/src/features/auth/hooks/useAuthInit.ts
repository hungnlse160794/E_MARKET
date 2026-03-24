import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { getRefreshPromise } from "@/config/axios";

/**
 * Senior Standard: Khởi tạo phiên làm việc khi F5 (Auth Persistence)
 * Tự động lấy Access Token mới thông qua Refresh Token HttpOnly Cookie
 */
export const useAuthInit = () => {
    const { isAuthenticated, accessToken, logout, setAuth } = useAuthStore();
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // Nếu người dùng đã từng đăng nhập nhưng chưa có accessToken (F5)
            // Hoặc nếu đang không có accessToken mà isAuthenticated là true
            if (isAuthenticated && !accessToken) {
                try {
                    const response = await getRefreshPromise();
                    const { user, accessToken: newAccessToken } = response.data;
                    setAuth(user, newAccessToken);
                } catch (error) {
                    // Nếu Cookie hết hạn hoặc lỗi -> Logout sạch sẽ
                    console.error("Session restore failed", error);
                    logout();
                }
            }
            setIsInitializing(false);
        };

        initAuth();
    }, [isAuthenticated, accessToken, logout, setAuth]);

    return { isInitializing };
};
