import { z } from "zod";

export const branchSchema = z.object({
  branchName: z.string().min(3, "Tên chi nhánh phải có ít nhất 3 ký tự"),
  address: z.object({
    province: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
    street: z.string().optional(),
    fullAddress: z.string().min(5, "Địa chỉ đầy đủ phải có ít nhất 5 ký tự"),
  }),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([
      z.number().min(-180, "Kinh độ từ -180 đến 180").max(180),
      z.number().min(-90, "Vĩ độ từ -90 đến 90").max(90),
    ]),
  }),
  contactPhone: z.string().optional(),
  workingHours: z.object({
    open: z.string().optional(),
    close: z.string().optional(),
  }).optional(),
});

export type BranchInput = z.infer<typeof branchSchema>;
