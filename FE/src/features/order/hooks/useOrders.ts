import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { IOrder, IOrderListResponse, IOrderSummary } from "@/types";
import axiosClient from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/api";

export interface IOrderFilter {
  search?: string;
  status?: string;
  page?: number;
}

export const useOrders = (filter: IOrderFilter = {}) => {
  return useQuery<IOrderListResponse, AxiosError>({
    queryKey: ["orders", "list", filter],
    queryFn: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {  
          resolve({
            orders: [
              { 
                _id: 'ORD-7742', 
                userId: 'USER-01', 
                items: [
                   { productId: 'PROD-01', quantity: 2, unitId: 'UNIT-01', price: 1500 }
                ],
                totalAmount: 3000, 
                status: 'PENDING',
                paymentStatus: 'UNPAID',
                branchId: 'BR-001',
                shippingAddress: { city: 'Ha Noi', district: 'Ba Dinh', detail: '123 Kim Ma' },
                createdAt: new Date().toISOString()
              },
              { 
                _id: 'ORD-7743', 
                userId: 'USER-02', 
                items: [
                   { productId: 'PROD-02', quantity: 1, unitId: 'UNIT-02', price: 500 }
                ],
                totalAmount: 500, 
                status: 'COMPLETED',
                paymentStatus: 'PAID',
                branchId: 'BR-002',
                shippingAddress: { city: 'HCM', district: 'Dist 1', detail: '456 Le Loi' },
                createdAt: new Date().toISOString()
              },
            ],
            total: 2,
            page: 1,
            totalPages: 1
          } as IOrderListResponse);
        }, 500);
      });
    },
  });
};

export const useOrderStats = () => {
  return useQuery<IOrderSummary, AxiosError>({
    queryKey: ["orders", "stats"],
    queryFn: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalOrders: 1250,
            pendingOrders: 42,
            completedOrders: 1100,
            revenue: 450000
          });
        }, 400);
      });
    }
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      try {
         const res = await axiosClient.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), { status });
         return res.data;
      } catch (error) {
         console.warn("API Hook Error:", error);
         throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
    }
  });
};

export const useOrderDetail = (orderId: string) => {
  return useQuery<IOrder, AxiosError>({
    queryKey: ["orders", "detail", orderId],
    queryFn: async () => {
      // Mocked response for realtime tracking demonstration
      return new Promise<IOrder>((resolve) => {
        setTimeout(() => {
          resolve({
             _id: orderId,
             userId: 'USER-01',
             items: [
                { productId: 'PROD-A', quantity: 2, unitId: 'UNIT-01', price: 1500 }
             ],
             totalAmount: 3000,
             status: orderId === 'ORD-7743' ? 'COMPLETED' : 'PENDING',
             paymentStatus: 'UNPAID',
             branchId: 'BR-001',
             shippingAddress: { city: 'Ha Noi', district: 'Ba Dinh', detail: '123 Kim Ma' },
             createdAt: new Date().toISOString()
          });
        }, 300);
      });
    },
    enabled: !!orderId
  });
};
