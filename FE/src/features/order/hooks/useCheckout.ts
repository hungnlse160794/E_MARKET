import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosClient from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { IOrder } from "@/types";
import type { ApiResponse } from "@/types/common";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface ICheckoutPayload {
  cartId: string;
  paymentMethod: 'COD' | 'WALLET' | 'VNPAY';
  shippingAddress: {
    fullName: string;
    phone: string;
    provinceId: string;
    districtId: string;
    wardCode: string;
    addressLine: string;
  };
  vouchers?: string[];
  note?: string;
}

export const useCheckout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<ApiResponse<IOrder & { paymentUrl?: string }>, AxiosError<ApiResponse<unknown>>, ICheckoutPayload>({
    mutationFn: async (payload) => {
      return await axiosClient.post(API_ENDPOINTS.ORDERS.CHECKOUT, payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (response.data.paymentUrl) {
         window.location.href = response.data.paymentUrl;
         return;
      }

      toast.success("Đặt hàng thành công!");
      navigate(`/profile/orders/${response.data._id}`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Thanh toán thất bại, vui lòng thử lại!";
      toast.error(message);
    }
  });
};
