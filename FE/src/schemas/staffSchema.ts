import { z } from "zod";

export const branchAssignmentSchema = z.object({
  managedBranches: z.array(z.string()).min(1, "Phải chọn ít nhất một chi nhánh"),
});

export type BranchAssignmentInput = z.infer<typeof branchAssignmentSchema>;

export const staffSchema = z.object({
  fullName: z
    .string()
    .min(3, "Họ tên phải có ít nhất 3 ký tự")
    .max(50, "Họ tên không được vượt quá 50 ký tự")
    .trim(),
  email: z
    .string()
    .email("Email không hợp lệ")
    .lowercase()
    .trim(),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(30, "Mật khẩu không được vượt quá 30 ký tự")
    .optional()
    .or(z.literal("")), // Cho phép rỗng khi edit
  phone: z
    .string()
    .regex(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  role: z.enum(["STAFF", "BRANCH_MANAGER"]),
  branchId: z
    .string()
    .min(1, "Vui lòng chọn cơ sở công tác")
    .optional()
    .or(z.literal("")),
});

export type StaffInput = z.infer<typeof staffSchema>;
