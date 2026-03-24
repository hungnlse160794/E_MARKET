import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
}

export const useSocket = (): UseSocketReturn => {
  const { accessToken, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!accessToken || !user) return;

    // Khởi tạo Socket Client kết nối đến Backend
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const socket = io(baseUrl.replace('/api/v1', ''), {
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      setSocketInstance(socket);
      setIsConnected(true);
      // Join room tương ứng với User hoặc Shop
      socket.emit("join_room", { userId: user._id, role: user.role });
      if (user.shopId) {
        socket.emit("join_shop_room", { shopId: user.shopId });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Lỗi kết nối Socket:", err.message);
    });

    // --- CÁC SỰ KIỆN LẮNG NGHE CHUNG ---
    socket.on("notification", (data: { title: string; content: string }) => {
      toast(data.title, {
        description: data.content,
      });
    });

    socket.on("order_status_updated", (data: { subOrderId: string; status: string }) => {
      toast.info(`Trạng thái đơn hàng cập nhật: ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", data.subOrderId] });
    });

    socket.on("cart_updated", (data: { roomCode: string }) => {
      toast.success("Giỏ hàng chung đã nhận cập nhật mới!");
      queryClient.invalidateQueries({ queryKey: ["cart", data.roomCode] });
    });

    return () => {
      socket.disconnect();
      setSocketInstance(null);
      setIsConnected(false);
    };
  }, [accessToken, user, queryClient]);

  return { socket: socketInstance, isConnected };
};
