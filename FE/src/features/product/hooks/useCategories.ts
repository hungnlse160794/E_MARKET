import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosClient from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { ICategory, ICategoryListResponse, ApiResponse } from "@/types";
import { toast } from "sonner";

export const useCategories = (branchId?: string | null) => {
  return useQuery<ICategoryListResponse, AxiosError>({
    queryKey: ["categories", "list", branchId],
    queryFn: async () => {
      if (!branchId) return [] as ICategoryListResponse;
      const response = await axiosClient.get<ApiResponse<ICategoryListResponse>, ApiResponse<ICategoryListResponse>>(
        API_ENDPOINTS.CATEGORIES.BRANCH(branchId)
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
    refetchOnWindowFocus: false,
    enabled: !!branchId
  });
};

export const useCategory = (id: string) => {
  return useQuery<ICategory, AxiosError>({
    queryKey: ["categories", "detail", id],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<ICategory>, ApiResponse<ICategory>>(
        API_ENDPOINTS.CATEGORIES.DETAIL(id)
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id && id !== ""
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<ICategory>, AxiosError, Partial<ICategory>>({
    mutationFn: async (data) => {
      return (await axiosClient.post<ApiResponse<ICategory>>(API_ENDPOINTS.CATEGORIES.CREATE, data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Đã tạo danh mục mới thành công");
    },
    onError: (error) => {
      const message = (error.response?.data as ApiResponse<unknown>)?.message || "Không thể tạo danh mục";
      toast.error(message);
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<ICategory>, AxiosError, { id: string; data: Partial<ICategory> }>({
    mutationFn: async ({ id, data }) => {
      return (await axiosClient.patch<ApiResponse<ICategory>>(API_ENDPOINTS.CATEGORIES.UPDATE(id), data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Đã cập nhật danh mục thành công");
    },
    onError: (error) => {
      const message = (error.response?.data as ApiResponse<unknown>)?.message || "Không thể cập nhật danh mục";
      toast.error(message);
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<void>, AxiosError, string>({
    mutationFn: async (id) => {
      return (await axiosClient.delete<ApiResponse<void>>(API_ENDPOINTS.CATEGORIES.DELETE(id))).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Đã xóa danh mục thành công");
    },
    onError: (error) => {
      const message = (error.response?.data as ApiResponse<unknown>)?.message || "Không thể xóa danh mục";
      toast.error(message);
    }
  });
};
