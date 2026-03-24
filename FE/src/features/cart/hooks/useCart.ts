import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosClient from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { ICart, ICartItem } from "@/types";
import type { ApiResponse } from "@/types/common";
import { toast } from "sonner";

export const useCart = (roomCode?: string) => {
  const queryClient = useQueryClient();

  // Fetch Cart Details
  const cartQuery = useQuery<ICart, AxiosError>({
    queryKey: ["cart", roomCode],
    queryFn: async () => {
      if (!roomCode) throw new Error("Room code is required");
      const response = await axiosClient.get<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.GET(roomCode));
      return response.data;
    },
    enabled: !!roomCode,
    refetchInterval: 5000, // Real-time sync every 5s for Phase 2
  });

  // Join/Create Room
  const joinRoomMutation = useMutation<ICart, AxiosError, { roomCode?: string }>({
    mutationFn: async (data) => {
      const response = await axiosClient.post<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.JOIN, data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("cart_room_code", data.roomCode);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  // Add Item
  const addItemMutation = useMutation<ICart, AxiosError, Partial<ICartItem>>({
    mutationFn: async (item) => {
      if (!roomCode) throw new Error("No room joined");
      const response = await axiosClient.post<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.ADD_ITEM(roomCode), item);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", roomCode] });
      toast.success("Đã thêm vào giỏ hàng chung!");
    }
  });

  // Update Item
  const updateItemMutation = useMutation<ICart, AxiosError, { itemId: string, quantity: number }>({
    mutationFn: async ({ itemId, quantity }) => {
      if (!roomCode) throw new Error("No room joined");
      const response = await axiosClient.patch<ApiResponse<ICart>, ApiResponse<ICart>>(API_ENDPOINTS.CART.UPDATE_ITEM(roomCode, itemId), { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", roomCode] });
    }
  });

  // Remove Item
  const removeItemMutation = useMutation<void, AxiosError, string>({
    mutationFn: async (itemId) => {
      if (!roomCode) throw new Error("No room joined");
      await axiosClient.delete(API_ENDPOINTS.CART.REMOVE_ITEM(roomCode, itemId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", roomCode] });
      toast.info("Đã xóa sản phẩm khỏi giỏ.");
    }
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    joinRoom: joinRoomMutation.mutateAsync,
    addItem: addItemMutation.mutate,
    isAdding: addItemMutation.isPending,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
  };
};
