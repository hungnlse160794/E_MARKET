import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Vui lòng chọn mức đánh giá").max(5),
  comment: z.string().min(10, "Nhận xét phải có ít nhất 10 ký tự").max(500, "Nhận xét tối đa 500 ký tự"),
  images: z.array(z.string().url("Đường dẫn ảnh không hợp lệ")).max(5, "Tối đa 5 ảnh"),
  productId: z.string().min(1, "Thiếu ID sản phẩm"),
  subOrderId: z.string().min(1, "Thiếu ID đơn hàng"),
});

export type IReviewInput = z.infer<typeof reviewSchema>;
