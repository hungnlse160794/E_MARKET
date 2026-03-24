export interface IShopMetrics {
  totalRevenue: number;
  activeSessions: number;
  packetVolume: number; // Tương đương "Đơn hàng" trong ngữ cảnh tech-monochrome
  coreStability: number; // Conversions/Success rate
  revenueTrend: {
    month: string;
    projected: number;
    actual: number;
  }[];
  recentActivities: {
    user: {
      name: string;
      avatar: string;
    };
    action: string;
    time: string;
  }[];
}

export interface IShopInfo {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  ownerId: string;
  status: 'ACTIVE' | 'INACTIVE';
}
