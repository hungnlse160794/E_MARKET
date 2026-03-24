import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { IStaffFilter, IStaffListResponse } from "@/features/branch/types";
import { API_ENDPOINTS } from "@/constants/api";
import axiosClient from "@/config/axios";
import type { ApiResponse } from "@/types/common";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import type { IUser } from "@/types";
import type { StaffInput } from "@/schemas/staffSchema";

/**
 * Hook để lấy danh sách nhân viên
 */
export const useStaff = (filter: IStaffFilter = {}) => {
  const user = useAuthStore((state) => state.user);
  const shopId = user?.shopId;

  return useQuery<IStaffListResponse, AxiosError>({
    queryKey: ["staff", "list", { ...filter, shopId }],
    queryFn: async () => {
      if (!shopId) return { staff: [], total: 0 };
      
      const response = await axiosClient.get<ApiResponse<IUser[]>, ApiResponse<IUser[]>>(
        `/shops/${shopId}/accounts`,
        { params: filter }
      );
      return {
          staff: response.data,
          total: response.data.length
      };
    },
    enabled: !!shopId,
  });
};

/**
 * Hook để lấy thông tin chi tiết một nhân viên
 */
export const useStaffById = (userId: string | null) => {
    const user = useAuthStore((state) => state.user);
    const shopId = user?.shopId;
  
    return useQuery<IUser, AxiosError<ApiResponse<unknown>>>({
      queryKey: ["staff", "detail", userId],
      queryFn: async () => {
        if (!shopId || !userId) throw new Error("Thao tác không hợp lệ");
        
        const response = await axiosClient.get<ApiResponse<IUser>, ApiResponse<IUser>>(
          `/shops/${shopId}/accounts/${userId}`
        );
        return response.data;
      },
      enabled: !!shopId && !!userId,
    });
  };

/**
 * Hook đăng ký/tạo mới tài khoản nhân viên
 */
export const useCreateStaff = () => {
   const queryClient = useQueryClient();
   const user = useAuthStore((state) => state.user);
   const shopId = user?.shopId;

   return useMutation<IUser, AxiosError<ApiResponse<unknown>>, StaffInput>({
      mutationFn: async (data) => {
         if (!shopId) throw new Error("Shop ID không tìm thấy");
         const response = await axiosClient.post<ApiResponse<IUser>, ApiResponse<IUser>>(
            API_ENDPOINTS.SHOPS.CREATE_ACCOUNT(shopId),
            data
         );
         return response.data;
      },
      onSuccess: () => {
         toast.success("Tạo tài khoản nhân viên thành công");
         queryClient.invalidateQueries({ queryKey: ["staff", "list"] });
      },
      onError: (err) => {
         const message = err.response?.data?.message || err.message || "Không thể tạo tài khoản";
         toast.error(message);
      }
   });
}

/**
 * Hook cập nhật thông tin tài khoản nhân viên
 */
export const useUpdateStaff = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const shopId = user?.shopId;
 
    return useMutation<IUser, AxiosError<ApiResponse<unknown>>, { id: string; data: StaffInput }>({
       mutationFn: async ({ id, data }) => {
          if (!shopId) throw new Error("Shop ID không tìm thấy");
          const response = await axiosClient.patch<ApiResponse<IUser>, ApiResponse<IUser>>(
             `/shops/${shopId}/accounts/${id}`,
             data
          );
          return response.data;
       },
       onSuccess: () => {
          toast.success("Cập nhật tài khoản thành công");
          queryClient.invalidateQueries({ queryKey: ["staff", "list"] });
       },
       onError: (err) => {
          const message = err.response?.data?.message || err.message || "Không thể cập nhật tài khoản";
          toast.error(message);
       }
    });
 }

/**
 * Hook cập nhật các chi nhánh quản lý của Manager
 */
export const useUpdateManagedBranches = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const shopId = user?.shopId;
 
    return useMutation<IUser, AxiosError<ApiResponse<unknown>>, { userId: string; managedBranches: string[] }>({
       mutationFn: async ({ userId, managedBranches }) => {
          if (!shopId) throw new Error("Shop ID không tìm thấy");
          const response = await axiosClient.patch<ApiResponse<IUser>, ApiResponse<IUser>>(
             `/shops/${shopId}/accounts/${userId}/branches`,
             { managedBranches }
          );
          return response.data;
       },
       onSuccess: () => {
          toast.success("Cập nhật chi nhánh quản lý thành công");
          queryClient.invalidateQueries({ queryKey: ["staff", "list"] });
       },
       onError: (err) => {
          const message = err.response?.data?.message || err.message || "Không thể cập nhật";
          toast.error(message);
       }
    });
 }

/**
 * Hook xóa tài khoản nhân sự
 */
export const useDeleteStaff = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const shopId = user?.shopId;
 
    return useMutation<void, AxiosError<ApiResponse<unknown>>, string>({
       mutationFn: async (userId) => {
          if (!shopId) throw new Error("Shop ID không tìm thấy");
          await axiosClient.delete(`/shops/${shopId}/accounts/${userId}`);
       },
       onSuccess: () => {
          toast.success("Xóa tài khoản thành công");
          queryClient.invalidateQueries({ queryKey: ["staff", "list"] });
       },
       onError: (err) => {
          const message = err.response?.data?.message || err.message || "Không thể xóa tài khoản";
          toast.error(message);
       }
    });
 }
