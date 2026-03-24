import type { IProduct, IPaginatedResponse } from "@/types";
export type { IProduct };

export type ProductStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';

export interface IProductSummary {
  total: number;
  lowStock: number;
  outOfStock: number;
  activePromotions: number;
}

export interface IProductFilter {
  category?: string;
  status?: ProductStatus;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating-desc';
  page?: number;
  limit?: number;
}

export type IProductListResponse = IPaginatedResponse<IProduct>;
