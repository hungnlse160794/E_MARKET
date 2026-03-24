import type { IProduct } from "@/types"

export interface StockRequestCreateData {
  branchId: string;
  items: {
    productId: string;
    quantity: number;
    name: string;
  }[];
  notes?: string;
}

export interface StockRequestUpdateStatusData {
  id: string;
  status: string;
  rejectionReason?: string;
}

export interface InventoryItem {
  _id: string;
  productId: IProduct;
  branchId: string | { _id: string; branchName: string };
  stockQuantity: number;
  reservedStock: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}
