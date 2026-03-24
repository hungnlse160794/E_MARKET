import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { IBranchFilter, IBranchListResponse, IBranchSummary } from "../types";
import { API_ENDPOINTS } from "@/constants/api";
import axiosClient from "@/config/axios";
import type { ApiResponse } from "@/types/common";
import { toast } from "sonner";
import type { IBranch } from "@/types";
import type { BranchInput } from "@/schemas/branchSchema";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Hook to fetch the list of branches for the current shop
 */
export const useBranches = (filter: IBranchFilter = {}) => {
  const user = useAuthStore((state) => state.user);
  const shopId = user?.shopId;

  return useQuery<IBranchListResponse, AxiosError>({
    queryKey: ["branches", "list", { ...filter, shopId }],
    queryFn: async () => {
      if (!shopId) return { branches: [], total: 0 };
      const response = await axiosClient.get<ApiResponse<IBranch[]>, ApiResponse<IBranch[]>>(
        API_ENDPOINTS.BRANCHES.LIST_BY_SHOP(shopId),
        { params: filter }
      );
      return {
        branches: response.data,
        total: response.data.length
      };
    },
    enabled: !!shopId,
  });
};

/**
 * Hook to fetch a single branch by ID
 */
export const useBranchById = (id: string | null) => {
  return useQuery<IBranch, AxiosError>({
    queryKey: ["branches", "detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Branch ID not found");
      const response = await axiosClient.get<ApiResponse<IBranch>, ApiResponse<IBranch>>(
        API_ENDPOINTS.BRANCHES.DETAIL(id)
      );
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch branch summary/statistics
 */
export const useBranchStats = () => {
  return useQuery<IBranchSummary, AxiosError>({
    queryKey: ["branches", "stats"],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<IBranchSummary>, ApiResponse<IBranchSummary>>(
        API_ENDPOINTS.SHOPS.DASHBOARD_METRICS
      );
      return response.data;
    }
  });
};

/**
 * Hook to create a new branch
 */
export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const shopId = user?.shopId;  

  return useMutation<IBranch, AxiosError<ApiResponse<unknown>>, BranchInput>({
    mutationFn: async (data) => {
      if (!shopId) throw new Error("Shop ID not found");
      const response = await axiosClient.post<ApiResponse<IBranch>, ApiResponse<IBranch>>(
        API_ENDPOINTS.BRANCHES.CREATE,
        { ...data, shopId }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tạo chi nhánh thành công!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message || "Lỗi khi tạo chi nhánh";
      toast.error(message);
    }
  });
};

/**
 * Hook to update an existing branch
 */
export const useUpdateBranch = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<IBranch, AxiosError<ApiResponse<unknown>>, Partial<BranchInput>>({
    mutationFn: async (data) => {
      const response = await axiosClient.patch<ApiResponse<IBranch>, ApiResponse<IBranch>>(
        API_ENDPOINTS.BRANCHES.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cập nhật chi nhánh thành công!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message || "Lỗi khi cập nhật chi nhánh";
      toast.error(message);
    }
  });
};

/**
 * Hook to delete (soft-delete) a branch
 */
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<ApiResponse<unknown>>, string>({
    mutationFn: async (id) => {
      await axiosClient.delete(API_ENDPOINTS.BRANCHES.DELETE(id));
    },
    onSuccess: () => {
      toast.success("Đã xóa chi nhánh!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message || "Lỗi khi xóa chi nhánh";
      toast.error(message);
    }
  });
};
