import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "sonner";

export default function VNPayResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const success = searchParams.get("success") === "true";
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (success) {
      toast.success("Thanh toán VNPay thành công!");
    } else {
      toast.error("Thanh toán không thành công hoặc đã bị hủy.");
    }
  }, [success]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-slate-50 text-center space-y-10"
      >
        <div className="flex justify-center">
          <div className={cl(
            "h-24 w-24 rounded-[2.5rem] flex items-center justify-center shadow-lg",
            success ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          )}>
            {success ? <CheckCircle2 size={48} strokeWidth={1.5} /> : <XCircle size={48} strokeWidth={1.5} />}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            {success ? "Thanh toán thành công" : "Thanh toán thất bại"}
          </h1>
          <p className="text-slate-500 text-[13px] leading-relaxed">
            {success 
              ? `Hệ thống đã ghi nhận thanh toán cho đơn hàng #${orderId?.slice(-8).toUpperCase()}. Đơn hàng đang được chuyển sang trạng thái chờ xác nhận.`
              : "Giao dịch qua cổng VNPay đã gặp sự cố hoặc bị người dùng hủy bỏ. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác."
            }
          </p>
        </div>

        <div className="space-y-4 pt-4">
          {success ? (
            <>
              <Button 
                onClick={() => navigate(`/profile/orders/${orderId}`)}
                className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
              >
                Xem chi tiết đơn hàng <Package size={18} />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="w-full h-14 rounded-2xl text-slate-400 font-bold hover:text-slate-900"
              >
                Tiếp tục mua sắm
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => navigate("/checkout")}
                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-xl flex items-center justify-center gap-3"
              >
                Thử lại thanh toán <ArrowRight size={18} />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/cart")}
                className="w-full h-14 rounded-2xl text-slate-400 font-bold hover:text-slate-900"
              >
                Quay lại giỏ hàng
              </Button>
            </>
          )}
        </div>

        <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
           <ShoppingBag size={14} /> SaaS Digital Curator
        </div>
      </motion.div>
    </div>
  );
}

// Utility for classnames
function cl(...args: (string | boolean | undefined | null)[]) {
  return args.filter(Boolean).join(' ');
}
