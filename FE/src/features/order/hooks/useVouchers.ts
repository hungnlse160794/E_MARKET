import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosClient from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { IVoucher } from "@/types";
import type { ApiResponse } from "@/types/common";

export const useVouchers = (shopId?: string) => {
  return useQuery<IVoucher[], AxiosError>({
    queryKey: ["vouchers", shopId],
    queryFn: async () => {
      // Kết quả Mock cho đến khi BE hoàn thiện GET /vouchers
      // Hoặc gọi song song Platform và Shop
      const platformVouchersPromise = axiosClient.get<ApiResponse<IVoucher[]>, ApiResponse<IVoucher[]>>(API_ENDPOINTS.VOUCHERS.PLATFORM);
      const shopVouchersPromise = shopId 
        ? axiosClient.get<ApiResponse<IVoucher[]>, ApiResponse<IVoucher[]>>(API_ENDPOINTS.VOUCHERS.SHOP(shopId))
        : Promise.resolve({ data: [] });

      const [platform, shop] = await Promise.all([platformVouchersPromise, shopVouchersPromise]);
      
      return [...platform.data, ...shop.data];
    },
    select: (data) => data.filter(v => !v.isDeleted),
  });
};
