import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import axiosClient from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { IProduct, IProductFilter, IProductListResponse, IProductSummary } from "../types";
import type { ApiResponse } from "@/types/common";

export const useProducts = (branchId: string | null, filter: IProductFilter = {}) => {
  return useQuery<IProductListResponse, AxiosError<{ message: string }>>({
    queryKey: ["products", "list", branchId, filter],
    queryFn: async () => {
      if (!branchId) {
        return {
          docs: [],
          totalDocs: 0,
          limit: 10,
          totalPages: 1,
          page: 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null
        };
      }
      try {
        const response = await axiosClient.get<ApiResponse<IProductListResponse>, ApiResponse<IProductListResponse>>(
          API_ENDPOINTS.PRODUCTS.LIST_BY_BRANCH(branchId), 
          { params: filter }
        );
        return response.data;
      } catch (error) {
        console.warn("Products API failed, using mock data", error);
        // Fallback mock for development
        return {
          docs: [
            { 
              _id: '1', 
              name: 'Sản phẩm mẫu 1', 
              categoryId: 'Nội thất', 
              units: [{ unitName: 'Cái', price: 1200000, isDefault: true }],
              description: 'Mô tả sản phẩm mẫu 1',
              images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=400'],
              status: 'AVAILABLE',
              rating: 4.5,
              shopId: 'S-01',
              branchId: branchId || '',
              slug: 'san-pham-mau-1',
              isDeleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            { 
              _id: '2', 
              name: 'Sản phẩm mẫu 2', 
              categoryId: 'Đồ gia dụng', 
              units: [{ unitName: 'Bộ', price: 450000, isDefault: true }],
              description: 'Mô tả sản phẩm mẫu 2',
              images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'],
              status: 'AVAILABLE',
              rating: 4.2,
              shopId: 'S-01',
              branchId: branchId || '',
              slug: 'san-pham-mau-2',
              isDeleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
          ],
          totalDocs: 25,
          page: 1,
          totalPages: 3,
          limit: 10,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: true,
          prevPage: null,
          nextPage: 2
        } as IProductListResponse;
      }
    },
    enabled: !!branchId,
  });
};

export const useProductStats = () => {
  return useQuery<IProductSummary, AxiosError>({
    queryKey: ["products", "stats"],
    queryFn: async () => {
      try {
        const response = await axiosClient.get<ApiResponse<IProductSummary>, ApiResponse<IProductSummary>>(API_ENDPOINTS.SHOPS.DASHBOARD_METRICS);
        return response.data;
      } catch (error) {
        console.warn("Product stats API failed, using mock data", error);
        return {
          total: 120,
          lowStock: 5,
          outOfStock: 2,
          activePromotions: 3
        };
      }
    }
  });
};

export const useProduct = (idOrSlug: string) => {
  return useQuery<IProduct, AxiosError>({
    queryKey: ["products", "detail", idOrSlug],
    queryFn: async () => {
      try {
        const response = await axiosClient.get<ApiResponse<IProduct>, ApiResponse<IProduct>>(API_ENDPOINTS.PRODUCTS.DETAIL(idOrSlug));
        return response.data;
      } catch (error) {
        console.warn("Product detail API failed, using mock data", error);
        return {
          _id: idOrSlug,
          name: 'Heritage Linen Artisan Jacket',
          categoryId: 'Fashion',
          units: [{ unitName: 'Cái', price: 1200000, isDefault: true }],
          description: 'Mô tả chi tiết sản phẩm mẫu.',
          images: [
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=800'
          ],
          status: 'AVAILABLE',
          rating: 4.8,
          shopId: 'S-01',
          slug: idOrSlug,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as IProduct;
      }
    },
    enabled: !!idOrSlug
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<IProduct>, AxiosError<{message: string}>, unknown>({
    mutationFn: async (data) => {
      const response = await axiosClient.post<ApiResponse<IProduct>>(API_ENDPOINTS.PRODUCTS.CREATE, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tạo sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      const data = error.response?.data as { message?: string } | undefined;
      toast.error(data?.message || "Lỗi khi tạo sản phẩm");
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<IProduct>, AxiosError<{message: string}>, { id: string; data: unknown }>({
    mutationFn: async ({ id, data }) => {
      const response = await axiosClient.patch<ApiResponse<IProduct>>(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cập nhật sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      const data = error.response?.data as { message?: string } | undefined;
      toast.error(data?.message || "Lỗi khi cập nhật sản phẩm");
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<null>, AxiosError<{message: string}>, string>({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete<ApiResponse<null>>(API_ENDPOINTS.PRODUCTS.DELETE(id));
      return response.data;
    },
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      const data = error.response?.data as { message?: string } | undefined;
      toast.error(data?.message || "Lỗi khi xóa sản phẩm");
    }
  });
};
