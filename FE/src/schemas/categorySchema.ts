import * as z from "zod";

export const categorySchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(50, "Tên danh mục không quá 50 ký tự"),
  parentId: z.string().nullable().optional(),
  shopId: z.string().min(1, "ID Shop là bắt buộc"),
  branchId: z.string().min(1, "ID Chi nhánh là bắt buộc"),
  image: z.string()
    .url("Phải là URL hợp lệ")
    .optional()
    .or(z.literal("")),
  order: z.number().int("Phải là số nguyên").min(0, "Thứ tự không được âm"),
  status: z.enum(["ACTIVE", "HIDDEN"]),
});

export type CategoryInput = z.infer<typeof categorySchema>;
