import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/constants/api";
import type { AxiosError } from "axios";
import type { IInventoryLog, ApiResponse } from "@/types";
import type { InventoryItem } from "../types";

export const useInventory = (id?: string, isShop: boolean = false) => {
  const queryClient = useQueryClient();

  // Fetch all inventory (either for a branch or shop)
  const { data: inventoryData, isLoading } = useQuery<InventoryItem[], AxiosError<{ message: string }>>({
    queryKey: ["inventory", id, isShop],
    queryFn: async () => {
      if (!id || id === 'all') return [];
      const endpoint = isShop ? API_ENDPOINTS.INVENTORY.SHOP(id) : API_ENDPOINTS.INVENTORY.BRANCH(id);
      const res = await (axiosInstance.get(endpoint) as Promise<ApiResponse<InventoryItem[]>>);
      // Defensive: Filter out invalid items
      return (res.data || []).filter((item: InventoryItem) => item && item.productId);
    },
    enabled: !!id && id !== 'all',
  });

  // Fetch low stock items
  const { data: lowStockData } = useQuery<InventoryItem[], AxiosError<{ message: string }>>({
    queryKey: ["inventory-low-stock", id, isShop],
    queryFn: async () => {
      if (!id || id === 'all') return [];
      const endpoint = isShop ? API_ENDPOINTS.INVENTORY.SHOP(id) : API_ENDPOINTS.INVENTORY.BRANCH(id);
      const res = await (axiosInstance.get(endpoint) as Promise<ApiResponse<InventoryItem[]>>);
      return res.data;
    },
    enabled: !!id && id !== 'all',
  });

  // Fetch history
  const { data: historyData, isPending: isHistoryLoading } = useQuery<IInventoryLog[], AxiosError<{ message: string }>>({
    queryKey: ["inventory-history", id, isShop],
    queryFn: async () => {
      if (!id || id === 'all') return [];
      const endpoint = isShop ? API_ENDPOINTS.INVENTORY.HISTORY_SHOP(id) : API_ENDPOINTS.INVENTORY.HISTORY_BRANCH(id);
      const res = await (axiosInstance.get(endpoint) as Promise<ApiResponse<IInventoryLog[]>>);
      return res.data;
    },
    enabled: !!id && id !== 'all',
  });

  // Update stock mutation
  const updateStockMutation = useMutation<InventoryItem, AxiosError<{ message: string }>, { productId: string; branchId: string; stockQuantity: number; type: 'ADD' | 'SUBTRACT' | 'SET'; note?: string }>({
    mutationFn: async (payload) => {
      const res = await (axiosInstance.post(API_ENDPOINTS.INVENTORY.UPDATE, payload) as Promise<ApiResponse<InventoryItem>>);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-history"] });
      toast.success("Cập nhật kho thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi cập nhật kho");
    }
  });

  // Set threshold mutation
  const setThresholdMutation = useMutation<InventoryItem, AxiosError<{ message: string }>, { productId: string; branchId: string; lowStockThreshold: number }>({
    mutationFn: async (payload) => {
      const res = await (axiosInstance.post(API_ENDPOINTS.INVENTORY.THRESHOLD, payload) as Promise<ApiResponse<InventoryItem>>);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
      toast.success("Thiết lập ngưỡng cảnh báo thành công");
    }
  });

  return {
    inventoryData,
    lowStockData,
    historyData,
    isLoading,
    isHistoryLoading,
    updateStock: updateStockMutation,
    setThreshold: setThresholdMutation
  };
};
