import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { IShopMetrics } from "../types";

export const useShopDashboard = () => {
  return useQuery<IShopMetrics, AxiosError>({
    queryKey: ["shop", "dashboard", "metrics"],
    queryFn: async () => {
      // Mock data structured properly for Recharts and UI
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalRevenue: 1284502,
            activeSessions: 8402,
            packetVolume: 156,
            coreStability: 98.2,
            revenueTrend: [
              { month: 'WEEK 01', projected: 2000, actual: 2400 },
              { month: 'WEEK 02', projected: 3000, actual: 2398 },
              { month: 'WEEK 03', projected: 4000, actual: 3800 },
              { month: 'WEEK 04', projected: 3500, actual: 3908 },
              { month: 'WEEK 05', projected: 5000, actual: 4800 },
            ],
            recentActivities: [
              { user: { name: "K. NAKAMOTO", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=k1" }, action: "VALIDATED BRIDGE", time: "NOW" },
              { user: { name: "S. CHEN", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=s1" }, action: "RE-INIT CORE", time: "12M" },
              { user: { name: "M. BLOCK", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=m1" }, action: "PREDICT MARKET", time: "1H" },
            ]
          } as IShopMetrics);
        }, 800);
      });
    },
  });
};
