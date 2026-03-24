import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/config/axios'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/constants/api'
import type { AxiosError } from 'axios'
import type { IStockRequest, IPaginatedResponse, ApiResponse } from '@/types'
import type { StockRequestCreateData, StockRequestUpdateStatusData } from '../types'

export const useStockRequest = (options?: { branchId?: string; shopId?: string }) => {
  const queryClient = useQueryClient()

  const branchRequests = useQuery<IPaginatedResponse<IStockRequest>, AxiosError<{ message: string }>>({
    queryKey: ['stock-requests', 'branch', options?.branchId],
    queryFn: async () => {
      const res = await (axiosInstance.get(API_ENDPOINTS.STOCK_REQUESTS.BRANCH(options!.branchId as string)) as Promise<ApiResponse<IPaginatedResponse<IStockRequest>>>);
      return res.data;
    },
    enabled: !!options?.branchId
  })

  const shopRequests = useQuery<IPaginatedResponse<IStockRequest>, AxiosError<{ message: string }>>({
    queryKey: ['stock-requests', 'shop', options?.shopId],
    queryFn: async () => {
      const res = await (axiosInstance.get(API_ENDPOINTS.STOCK_REQUESTS.SHOP(options!.shopId as string)) as Promise<ApiResponse<IPaginatedResponse<IStockRequest>>>);
      return res.data;
    },
    enabled: !!options?.shopId
  })

  const createRequestMutation = useMutation<IStockRequest, AxiosError<{ message: string }>, StockRequestCreateData>({
    mutationFn: async (requestData) => {
      const res = await (axiosInstance.post(API_ENDPOINTS.STOCK_REQUESTS.CREATE, requestData) as Promise<ApiResponse<IStockRequest>>);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] })
      toast.success('Gửi yêu cầu nhập kho thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu')
    }
  })

  const updateStatusMutation = useMutation<IStockRequest, AxiosError<{ message: string }>, StockRequestUpdateStatusData>({
    mutationFn: async ({ id, status, rejectionReason }) => {
      const res = await (axiosInstance.patch(API_ENDPOINTS.STOCK_REQUESTS.STATUS_UPDATE(id), { status, rejectionReason }) as Promise<ApiResponse<IStockRequest>>);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] }) // Important: update stock levels
      toast.success(`Đã cập nhật trạng thái yêu cầu: ${data.status}`)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái')
    }
  })

  return {
    branchRequests: branchRequests.data,
    shopRequests: shopRequests.data,
    isLoading: (!!options?.branchId && branchRequests.isPending) || (!!options?.shopId && shopRequests.isPending),
    createRequest: createRequestMutation,
    updateStatus: updateStatusMutation
  }
}
