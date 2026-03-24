import type { IBranch, IUser } from "@/types";

export interface IBranchSummary {
  totalBranches: number;
  activeBranches: number;
  totalStaff: number;
}

export interface IBranchFilter {
  search?: string;
  isActive?: boolean;
}

export interface IBranchListResponse {
  branches: IBranch[];
  total: number;
}

export interface IStaffFilter {
  branchId?: string;
  role?: string;
  search?: string;
}

export interface IStaffListResponse {
  staff: IUser[];
  total: number;
}
