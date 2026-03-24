import { z } from "zod";

export const productUnitSchema = z.object({
  unitName: z.string().min(1, "Bắt buộc nhập tên đơn vị (VD: Cái, Bình, Lít)"),
  price: z.coerce.number().min(0, "Giá không được âm"),
  isDefault: z.boolean().default(false),
});

export const productOptionSchema = z.object({
  name: z.string().min(1, "Tên tùy chọn không được trống"),
  price: z.coerce.number().min(0, "Giá không được âm"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm tối thiểu 2 ký tự"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().min(5, "Mô tả tối thiểu 5 ký tự"),
  images: z.array(z.string().url("Ảnh phải là đường dẫn URL hợp lệ")).min(1, "Vui lòng cung cấp ít nhất 1 ảnh"),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN']).default('AVAILABLE'),
  units: z.array(productUnitSchema).min(1, "Phải có ít nhất một đơn vị tính"),
  options: z.array(productOptionSchema).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductUnitInput = z.infer<typeof productUnitSchema>;
