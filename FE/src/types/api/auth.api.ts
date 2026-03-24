import type { IUser } from "@/types";
import type { ApiResponse } from "@/types/common";
import type { LoginInput, RegisterInput } from "@/schemas/authSchema";

/**
 * Authentication API Request Types
 */
export type LoginRequest = LoginInput;
export type RegisterRequest = Omit<RegisterInput, "confirmPassword">;

/**
 * Authentication API Response Types
 */
export type AuthResponse = ApiResponse<{
  user: IUser;
  accessToken: string;
}>;

export type RegisterResponse = ApiResponse<IUser>;
