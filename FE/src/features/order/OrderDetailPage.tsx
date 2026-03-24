import { useParams, Link } from "react-router-dom";
import { useOrderDetail } from "./hooks/useOrders";
import { PageContainer } from "@/components/premium/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  CreditCard,
  ShieldCheck,
  Phone
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrderDetail(id as string);

  if (isLoading || !order) {
    return (
      <PageContainer className="p-4 md:p-10">
        <Skeleton className="h-[500px] w-full rounded-4xl" />
      </PageContainer>
    );
  }

  // Define tracking steps
  const TIMELINE_STEPS = [
    { title: "Chờ xác nhận", desc: "Đơn hàng đã được tiếp nhận", status: "PENDING", icon: Clock },
    { title: "Đang chuẩn bị", desc: "Shop đang đóng gói", status: "CONFIRMED", icon: Package },
    { title: "Đang giao hàng", desc: "Đơn hàng đang trên đường đi", status: "SHIPPING", icon: Truck },
    { title: "Giao thành công", desc: "Đơn hàng đã đến tay bạn", status: "COMPLETED", icon: CheckCircle2 }
  ];

  // Calculate current step index based on order status
  const currentStatusIndex = TIMELINE_STEPS.findIndex(s => s.status === order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <PageContainer className="p-4 md:p-10">
      <div className="max-w-4xl mx-auto space-y-12 pb-24">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
           <Link to="/profile/orders" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all group">
             <div className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                <ChevronLeft size={16} />
             </div>
             Quay lại danh sách
           </Link>
           <Badge variant="outline" className="border-indigo-100 text-indigo-500 font-bold bg-indigo-50 px-4 py-1.5 text-[10px] uppercase tracking-widest hidden sm:inline-flex">
              LIVE_TRACKING_ACTIVE
           </Badge>
        </div>

        {/* Title Area */}
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">
                ORDER<span className="text-slate-300 mx-2">#</span>{order._id.slice(-8).toUpperCase()}
              </h1>
              {isCancelled && <Badge className="bg-rose-500 text-white font-bold">ĐÃ HỦY</Badge>}
           </div>
           <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">NGÀY ĐẶT HÀNG: {formatDate(order.createdAt)}</p>
        </div>

        {/* Map / Visualization Area (Mocked visually) */}
        {!isCancelled && (
          <div className="h-[250px] w-full rounded-[3rem] bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
             <div className="relative z-10 space-y-4 text-center">
                <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-300 relative">
                   <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20" />
                   <Truck size={32} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-indigo-900 uppercase tracking-tight">HỆ THỐNG THEO DÕI THỜI GIAN THỰC</h3>
                   <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Tự động cập nhật vị trí và trạng thái</p>
                </div>
             </div>
          </div>
        )}

        {/* Realtime Timeline */}
        {!isCancelled && (
          <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12 text-center md:text-left">TIẾN ĐỘ ĐƠN HÀNG</h3>
             
             <div className="relative">
                {/* Connecting Line background */}
                <div className="absolute left-[31px] md:left-auto md:top-[31px] md:w-full h-full md:h-2 w-2 md:-translate-y-1/2 bg-slate-100 rounded-full" />
                
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: `${currentStatusIndex === -1 ? 0 : (currentStatusIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute left-[31px] md:left-0 md:top-[31px] h-full md:h-2 w-2 md:-translate-y-1/2 bg-linear-to-b md:bg-linear-to-r from-indigo-500 to-emerald-500 rounded-full origin-left" 
                />

                <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-4 relative z-10 w-full pl-0 min-h-[300px] md:min-h-auto">
                   {TIMELINE_STEPS.map((step, idx) => {
                      const isCompleted = currentStatusIndex >= idx;
                      const isActive = currentStatusIndex === idx;
                      
                      return (
                         <div key={idx} className="flex md:flex-col items-center gap-6 md:gap-4 flex-1 md:text-center shrink-0">
                            {/* Icon Circle */}
                            <motion.div 
                               initial={{ scale: 0.8, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               transition={{ delay: idx * 0.2 }}
                               className={`h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${
                                  isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110' : 
                                  isCompleted ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 border-2 border-slate-100 text-slate-300'
                               }`}
                            >
                               <step.icon size={24} />
                               {isActive && (
                                 <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
                               )}
                            </motion.div>
                            
                            {/* Text Info */}
                            <div className="flex-1 md:w-full space-y-1">
                               <p className={`text-[13px] font-black uppercase tracking-tight ${isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                  {step.title}
                               </p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{step.desc}</p>
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>
        )}

        {/* Order Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Address */}
           <div className="p-8 rounded-[3rem] bg-white border border-slate-100 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">THÔNG TIN GIAO HÀNG</h3>
                 <MapPin className="text-slate-300" size={20} />
              </div>
              <div className="space-y-4">
                 <p className="text-lg font-black text-slate-800 uppercase leading-snug">
                    {order.userId.split('-')[1] || 'Khách hàng'}
                 </p>
                 <div className="flex items-center gap-3">
                    <Phone className="text-indigo-400" size={16} />
                    <span className="text-[13px] font-bold text-slate-500">098X XXX XXX</span>
                 </div>
                 <div className="flex items-start gap-3">
                    <MapPin className="text-indigo-400 mt-1 shrink-0" size={16} />
                    <span className="text-[13px] font-bold text-slate-500 leading-relaxed">
                       {order.shippingAddress?.detail}, {order.shippingAddress?.district}, {order.shippingAddress?.city}
                    </span>
                 </div>
              </div>
           </div>

           {/* Payment Details */}
           <div className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 space-y-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <CreditCard size={100} />
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">THÔNG TIN THANH TOÁN</h3>
                 <ShieldCheck className="text-indigo-400" size={20} />
              </div>
              <div className="space-y-6 relative z-10">
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PHƯƠNG THỨC</p>
                    <p className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-3">
                       <CreditCard size={16} className="text-indigo-400" />
                       THANH TOÁN COD
                    </p>
                 </div>
                 <div className="space-y-2 pt-4 border-t border-white/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TỔNG CỘNG</p>
                    <p className="text-4xl font-black font-mono tracking-tighter text-emerald-400">
                       {formatCurrency(order.totalAmount)}
                    </p>
                 </div>
                 <div className="pt-2">
                    <Badge className={order.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border-none' : 'bg-amber-500/20 text-amber-400 border-none'}>
                       {order.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                    </Badge>
                 </div>
              </div>
           </div>
        </div>

        {/* Order Items */}
        <div className="p-8 rounded-[3rem] bg-white border border-slate-100 space-y-6">
           <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">DANH SÁCH MÓN ({order.items.length})</h3>
              <Package className="text-slate-300" size={20} />
           </div>
           <div className="space-y-4">
              {order.items.map((item: { productId: { name?: string } | string, price: number, quantity: number }, idx: number) => (
                 <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                          <Package className="text-indigo-400" size={20} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">
                             {typeof item.productId === 'object' && item.productId?.name ? item.productId.name : 'Sản phẩm'}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đơn giá: {formatCurrency(item.price)}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">X {item.quantity}</p>
                       <p className="text-[14px] font-bold font-mono text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </PageContainer>
  );
}
