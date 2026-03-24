import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  location: z.string().optional(),
  bio: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const securitySchema = z.object({
  twoFactorAuth: z.boolean(),
});

export type SecurityInput = z.infer<typeof securitySchema>;

export const preferencesSchema = z.object({
  language: z.string(),
  currency: z.string(),
  visualTheme: z.enum(["LIGHT", "DARK"]), 
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
