import { z } from "zod";

export const inventoryUpdateSchema = z.object({
  productId: z.string().min(1, "Sản phẩm là bắt buộc"),
  branchId: z.string().min(1, "Chi nhánh là bắt buộc"),
  stockQuantity: z.number().min(0, "Số lượng phải lớn hơn hoặc bằng 0"),
  type: z.enum(["ADD", "SUBTRACT", "SET"]),
  note: z.string().optional(),
});

export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;

export const stockRequestSchema = z.object({
  branchId: z.string().min(1, "Chi nhánh là bắt buộc"),
  items: z.array(z.object({
    productId: z.string().min(1, "Sản phẩm là bắt buộc"),
    quantity: z.number().min(1, "Số lượng phải ít nhất là 1"),
    name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  })).min(1, "Phải có ít nhất một sản phẩm"),
  notes: z.string().optional(),
});

export type StockRequestInput = z.infer<typeof stockRequestSchema>;

export const stockRequestStatusSchema = z.object({
  status: z.string().min(1, "Trạng thái là bắt buộc"),
  rejectionReason: z.string().min(10, "Lý do từ chối phải có ít nhất 10 ký tự").optional().or(z.literal("")),
});

export type StockRequestStatusInput = z.infer<typeof stockRequestStatusSchema>;
