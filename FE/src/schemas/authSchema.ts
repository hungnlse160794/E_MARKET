import { z } from "zod";
import { REGEXP } from "@/constants/regexp";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải từ 2 ký tự").max(50, "Họ tên tối đa 50 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string()
    .min(8, "Mật khẩu phải từ 8 ký tự")
    .max(32, "Mật khẩu tối đa 32 ký tự")
    .regex(REGEXP.PASSWORD, "Mật khẩu phải bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

