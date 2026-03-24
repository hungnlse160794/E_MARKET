import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosClient from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { ICart, ICartItem } from "@/types";
import type { ApiResponse } from "@/types/common";
import { toast } from "sonner";

export const useCart = () => {
  const queryClient = useQueryClient();

  // Fetch Cart Details (Personal or Shared)
  const cartQuery = useQuery<ICart, AxiosError>({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.GET);
      return response.data;
    },
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  // Join Room
  const joinRoomMutation = useMutation<ICart, AxiosError, { roomCode: string }>({
    mutationFn: async (data) => {
      const response = await axiosClient.post<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.JOIN, data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("cart_room_code", data.roomCode);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Đã tham gia giỏ hàng chia sẻ!");
    }
  });

  // Share/Create Room
  const shareCartMutation = useMutation<ICart, AxiosError, void>({
    mutationFn: async () => {
       const response = await axiosClient.post<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.SHARE);
       return response.data;
    },
    onSuccess: (data) => {
       localStorage.setItem("cart_room_code", data.roomCode);
       queryClient.invalidateQueries({ queryKey: ["cart"] });
       toast.success("Đã kích hoạt chế độ chia sẻ giỏ hàng!");
    }
  });

  // Leave Room
  const leaveRoomMutation = useMutation<ICart, AxiosError, string>({
    mutationFn: async (cartId) => {
       const response = await axiosClient.post<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.LEAVE(cartId));
       return response.data;
    },
    onSuccess: () => {
       localStorage.removeItem("cart_room_code");
       queryClient.invalidateQueries({ queryKey: ["cart"] });
       toast.info("Đã rời khỏi phòng.");
    }
  });

  // Add Item
  const addItemMutation = useMutation<ICart, AxiosError, Partial<ICartItem>>({
    mutationFn: async (item) => {
      const response = await axiosClient.post<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.ADD_ITEM, item);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
      // Removed generic toast to let the page handle product-specific success
    }
  });

  // Update Item
  const updateItemMutation = useMutation<ICart, AxiosError, { cartId: string, itemId: string, quantity: number }>({
    mutationFn: async ({ cartId, itemId, quantity }) => {
      const response = await axiosClient.patch<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.UPDATE_ITEM(cartId, itemId), { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  // Remove Item
  const removeItemMutation = useMutation<void, AxiosError, { cartId: string, itemId: string }>({
    mutationFn: async ({ cartId, itemId }) => {
      await axiosClient.delete(API_ENDPOINTS.CART.REMOVE_ITEM(cartId, itemId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.info("Đã xóa sản phẩm khỏi giỏ.");
    }
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    joinRoom: joinRoomMutation.mutateAsync,
    shareCart: shareCartMutation.mutateAsync,
    leaveRoom: leaveRoomMutation.mutateAsync,
    addItem: addItemMutation.mutateAsync,
    isAdding: addItemMutation.isPending,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
  };
};
