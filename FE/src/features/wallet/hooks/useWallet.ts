import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosClient from "@/config/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { API_ENDPOINTS } from "@/constants/api";
import type { IWallet } from "@/types";
import type { ApiResponse } from "@/types/common";

export const useWallet = () => {
  const user = useAuthStore((state) => state.user);
  const shopId = user?.shopId;

  const query = useQuery<IWallet, AxiosError>({
    queryKey: ["wallet", shopId],
    queryFn: async () => {
      // Nếu không có shopId thì không nên gọi API này (thực tế query sẽ bị disable)
      if (!shopId) throw new Error("Shop ID is required for wallet access");
      
      const response = await axiosClient.get<ApiResponse<IWallet>, ApiResponse<IWallet>>(
        API_ENDPOINTS.WALLET.GET_SHOP(shopId)
      );
      return response.data;
    },
    // Tránh re-fetch liên tục nếu không cần thiết
    staleTime: 5 * 60 * 1000,
    enabled: !!shopId,
  });

  return {
    wallet: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isError: query.isError,
  };
};
