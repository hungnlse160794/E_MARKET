import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Họ tên là bắt buộc"),
  phone: z.string().regex(/^(0|84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
  provinceId: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  districtId: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
  wardCode: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  addressLine: z.string().min(5, "Địa chỉ chi tiết là bắt buộc"),
  note: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
