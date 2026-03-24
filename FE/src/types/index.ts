/**
 * Enums cho Hệ thống Phân quyền (RBAC) - Đồng bộ 100% với Backend
 */
export const UserRole = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  SHOP_OWNER: 'SHOP_OWNER',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface IProductUnit {
  unitName: string;
  price: number;
  isDefault: boolean;
}

export interface IProductOption {
  name: string;
  price: number;
}

export interface IProduct {
  _id: string;
  shopId: string | { _id: string; name: string; logo?: string };
  branchId: string | { _id: string; branchName: string; address?: IAddressBranch; contactPhone?: string };
  categoryId: string | { _id: string; name: string };
  name: string;
  slug: string;
  description: string;
  images: string[];
  units: IProductUnit[];
  options: IProductOption[];
  tags: string[];
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';
  rating: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  shopId: string;
  branchId: string;
  parentId?: string | ICategory | null;
  status: 'ACTIVE' | 'HIDDEN';
  order: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ICategoryListResponse = ICategory[];

export interface IAddressBranch {
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  fullAddress: string;
}

export interface IWorkingHours {
  open: string;
  close: string;
}

export interface IBranch {
  _id: string;
  shopId: string;
  branchName: string;
  address: IAddressBranch;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  contactPhone?: string;
  workingHours?: IWorkingHours;
  isOpen: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  shopId?: string;
  branchId?: string | IBranch;
  managedBranches?: string[] | IBranch[];
  phone?: string;
}

export interface IAddress {
  label: string; // Home, Office...
  street: string;
  city: string;
  isDefault: boolean;
}

export interface ICartItem {
  _id: string;
  productId: string | IProduct;
  shopId: string;
  branchId: string;
  unitName: string;
  quantity: number;
  price: number;
  addedBy: string;
}

export interface ICart {
  _id: string;
  ownerId: string;
  roomCode: string;
  items: ICartItem[];
  members: string[];
  status: 'ACTIVE' | 'COMPLETED';
}

export interface IOrder {
  _id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    unitId: string;
    price: number;
  }[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  branchId: string;
  shippingAddress: {
    city: string;
    district: string;
    detail: string;
  };
  createdAt: string;
}

export interface IPaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface IOrderListResponse {
  orders: IOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IOrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
}

export interface IVoucher {
  _id: string;
  code: string;
  shopId: string | null;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit: number;
  usedCount: number;
  isDeleted: boolean;
}

export interface IWallet {
  _id: string;
  userId?: string;
  shopId?: string;
  balance: number;
  frozenBalance: number;
  currency: string;
  status: 'ACTIVE' | 'LOCKED';
  transactions?: ITransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  _id: string;
  walletId: string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
export interface IInventory {
  _id: string;
  productId: IProduct;
  branchId: string | { _id: string; branchName: string };
  stockQuantity: number;
  reservedStock: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface IInventoryLog {
  _id: string;
  productId: IProduct;
  branchId: string | { _id: string; branchName: string };
  userId: IUser;
  type: 'ADD' | 'SUBTRACT' | 'SET' | 'ORDER_RESERVE' | 'ORDER_RELEASE' | 'ORDER_COMPLETE';
  quantity: number;
  oldQuantity: number;
  newQuantity: number;
  note?: string;
  createdAt: string;
}
export interface IStockRequestItem {
  productId: string | IProduct;
  quantity: number;
  name: string;
}

export interface IStockRequest {
  _id: string;
  requestNumber: string;
  branchId: string | IBranch;
  shopId: string | { _id: string; name: string; logo?: string };
  requesterId: string | IUser;
  approverId?: string | IUser;
  items: IStockRequestItem[];
  status: 'PENDING' | 'APPROVED' | 'SHIPPING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
