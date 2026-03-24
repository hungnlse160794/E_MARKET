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
    title: string;
    fullAddress: string;
  };
  vouchers?: string[];
  note?: string;
}

export const useCheckout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<ApiResponse<IOrder>, AxiosError<ApiResponse<unknown>>, ICheckoutPayload>({
    mutationFn: async (payload) => {
      return await axiosClient.post(API_ENDPOINTS.ORDERS.CHECKOUT, payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đặt hàng thành công!");
      // localStorage.removeItem("cart_room_code"); // Optional: Keep it if they want to rejoin?
      navigate(`/profile/orders/${response.data._id}`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Thanh toán thất bại, vui lòng thử lại!";
      toast.error(message);
    }
  });
};
