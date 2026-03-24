import { useState } from "react"
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Zap,
  Users,
  Copy,
  PlusCircle,
  Share2,
  Lock,
  ChevronRight,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/utils/format"
import { Link } from "react-router-dom"
import { useCart } from "./hooks/useCart"
import { toast } from "sonner"
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/stores/useAuthStore"
import { PATHS } from "@/routes/paths"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const user = useAuthStore((state) => state.user);
  const { 
    cart, 
    isLoading, 
    joinRoom, 
    shareCart, 
    leaveRoom, 
    updateItem, 
    removeItem 
  } = useCart();

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const shipping = subtotal > 0 ? 25000 : 0;
  const total = subtotal + shipping;

  const isShared = !!cart?.roomCode;
  const isOwner = cart && user && (cart.ownerId === user._id);

  const handleJoinShared = async () => {
    if (!roomCodeInput) return;
    try {
      setIsProcessing(true);
      await joinRoom({ roomCode: roomCodeInput });
      setRoomCodeInput("");
    } catch (error) {
       console.error("Lỗi khi tạo/tham gia phòng:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateShared = async () => {
    try {
      setIsProcessing(true);
      await shareCart();
    } catch (error) {
       console.error("Lỗi khi chia sẻ giỏ hàng:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!cart?._id) return;
    try {
      setIsProcessing(true);
      await leaveRoom(cart._id);
    } catch (error) {
       console.error("Lỗi khi rời phòng:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyRoomCode = () => {
    if (cart?.roomCode) {
      navigator.clipboard.writeText(cart.roomCode);
      toast.info("Đã sao chép mã phòng!");
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 max-w-[1400px] mx-auto px-8 space-y-12">
        <Skeleton className="h-10 w-48 rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl border border-slate-50 p-6 flex gap-6">
                   <Skeleton className="h-32 w-32 rounded-3xl grow-0 shrink-0" />
                   <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-1/2 rounded-lg" />
                      <Skeleton className="h-4 w-1/3 rounded-lg" />
                      <div className="pt-4 flex justify-between items-center">
                         <Skeleton className="h-10 w-24 rounded-xl" />
                         <Skeleton className="h-8 w-32 rounded-lg" />
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <div className="lg:col-span-4">
              <div className="bg-white rounded-[3rem] border border-slate-50 p-10 space-y-10">
                 <Skeleton className="h-10 w-full rounded-2xl" />
                 <div className="space-y-4">
                    <Skeleton className="h-6 w-full rounded-lg" />
                    <Skeleton className="h-6 w-full rounded-lg" />
                    <Skeleton className="h-6 w-full rounded-lg" />
                 </div>
                 <Skeleton className="h-20 w-full rounded-4xl" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-[#FDFCF9]">
        <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative"
        >
           <div className="h-48 w-48 rounded-[3rem] bg-indigo-50/50 flex items-center justify-center text-indigo-200">
              <ShoppingBag size={80} strokeWidth={1} />
           </div>
           <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -top-3 -right-3 h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-rose-400 border border-slate-50"
           >
              <Users size={24} />
           </motion.div>
        </motion.div>

        <div className="text-center space-y-3 mt-10 max-w-sm">
           <h2 className="text-2xl font-serif font-bold text-slate-900">Giỏ hàng của bạn đang trống</h2>
           <p className="text-slate-400 text-sm leading-relaxed px-4">
             Bắt đầu hành trình mua sắm tinh tế của riêng bạn hoặc mời bạn bè cùng tham gia ngay.
           </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 w-full max-w-[300px]">
          <Link to="/products" className="w-full">
            <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              Khám phá sản phẩm
            </Button>
          </Link>
          
          <div className="relative py-2 flex items-center gap-4">
             <div className="h-px bg-slate-100 flex-1"></div>
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Hoặc dùng mã phòng</span>
             <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          <div className="space-y-3">
             <Input 
                placeholder="NHẬP MÃ PHÒNG"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="h-14 rounded-2xl border-slate-100 bg-white px-6 font-bold text-center tracking-[0.2em] uppercase focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-slate-600"
             />
             <Button 
                onClick={handleJoinShared}
                disabled={isProcessing || !roomCodeInput}
                className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold text-[13px] shadow-xl shadow-indigo-100 active:scale-95 transition-all"
             >
                {isProcessing ? 'Đang xử lý...' : 'Tham gia cùng bạn bè'}
             </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] pt-24 pb-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header - Vietnamese & Refined */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
           <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                 <div className={cn(
                    "h-2 w-2 rounded-full",
                    isShared ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                 )} />
                 <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {isShared ? `Phiên mua chung đang hoạt động` : `Giỏ hàng cá nhân`}
                 </span>
              </div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
                 Giỏ hàng của tôi<span className="text-indigo-600">.</span>
              </h1>
           </div>

           {/* Room Controls - Friendlier colors */}
           <motion.div 
             layout
             className="flex flex-wrap items-center gap-4 bg-white p-2.5 rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/40"
           >
              {isShared ? (
                <>
                  <div className="flex items-center gap-4 pl-4 pr-6 py-1.5 border-r border-slate-50">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 leading-none">MÃ PHÒNG</span>
                        <div className="flex items-center gap-2">
                           <span className="font-serif font-bold text-xl text-indigo-600 leading-none">{cart.roomCode}</span>
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={copyRoomCode} 
                              className="h-8 w-8 rounded-lg hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 transition-colors"
                           >
                              <Copy size={13} />
                           </Button>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2">
                     <div className="flex -space-x-2">
                        {cart.members.map((member, i) => (
                           <TooltipProvider key={member}>
                              <Tooltip>
                                 <TooltipTrigger>
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-50 transition-transform hover:-translate-y-1">
                                       <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member}`} />
                                       <AvatarFallback className="text-[10px] font-bold text-slate-400">U{i+1}</AvatarFallback>
                                    </Avatar>
                                 </TooltipTrigger>
                                 <TooltipContent className="bg-slate-900 text-white rounded-lg border-none shadow-xl">
                                    <p className="text-[11px] font-semibold">Thành viên: {member.slice(-6)}</p>
                                 </TooltipContent>
                              </Tooltip>
                           </TooltipProvider>
                        ))}
                     </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={handleLeaveRoom}
                    className="h-11 px-5 rounded-2xl text-[12px] font-bold text-rose-500 hover:bg-rose-50 hover:shadow-sm transition-all"
                  >
                     Rời phòng
                  </Button>
                </>
              ) : (
                <div className="px-3 py-1 flex items-center gap-6">
                   <p className="text-[12px] font-semibold text-slate-400 hidden sm:block">Mua sắm cùng bạn bè ngay?</p>
                   <Button 
                      onClick={handleCreateShared}
                      disabled={isProcessing}
                      className="h-11 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2.5 active:scale-95"
                   >
                      <Share2 size={15} /> {isProcessing ? "Đang xử lý..." : "Bật chế độ mua chung"}
                   </Button>
                </div>
              )}
           </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main List - Vietnamese & Simplified Font weights */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {cart.items.map((item, idx) => (
                <motion.div 
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                   <div className="flex flex-col sm:flex-row gap-8 bg-white p-6 sm:p-7 rounded-[2.5rem] border border-slate-50 hover:border-indigo-100 shadow-sm hover:shadow-xl transition-all duration-300">
                      {/* Image Area */}
                      <div className="w-full sm:w-44 h-44 rounded-3xl overflow-hidden bg-slate-50 border border-slate-50 shrink-0">
                         <img 
                           src={typeof item.productId !== 'string' ? item.productId.images?.[0] : "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91"} 
                           alt={item.unitName}
                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         />
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 flex flex-col justify-between">
                         <div className="space-y-2.5">
                            <div className="flex justify-between items-start">
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2.5">
                                     <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none px-2 py-0 text-[10px] font-bold rounded-lg">
                                        {item.unitName}
                                     </Badge>
                                     {isShared && (
                                       <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">
                                          <div className="w-4 h-4 rounded-full overflow-hidden bg-white ring-1 ring-slate-100">
                                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.addedBy}`} className="w-full h-full" alt="user" />
                                          </div>
                                          <span className="text-[10px] font-semibold text-slate-400">bởi {item.addedBy.slice(-4)}</span>
                                       </div>
                                     )}
                                  </div>
                                  <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight pt-1">
                                     {typeof item.productId !== 'string' ? item.productId.name : 'Sản phẩm chưa xác định'}
                                  </h3>
                               </div>

                               <Button 
                                 onClick={() => removeItem({ cartId: cart._id, itemId: item._id })}
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-9 w-9 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                               >
                                  <Trash2 size={16} />
                               </Button>
                            </div>
                         </div>

                         <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-50">
                            {/* Quantity */}
                            <div className="flex items-center gap-3.5 bg-slate-50 rounded-2xl p-1.5 border border-slate-50">
                               <Button 
                                 variant="ghost" 
                                 onClick={() => updateItem({ cartId: cart._id, itemId: item._id, quantity: Math.max(1, item.quantity - 1) })}
                                 className="h-9 w-9 text-slate-400 hover:bg-white hover:text-slate-900 rounded-xl transition-all p-0"
                               >
                                  <Minus size={14} strokeWidth={3} />
                               </Button>
                               <span className="text-[15px] font-bold text-slate-700 min-w-[20px] text-center">{item.quantity}</span>
                               <Button 
                                 variant="ghost" 
                                 onClick={() => updateItem({ cartId: cart._id, itemId: item._id, quantity: item.quantity + 1 })}
                                 className="h-9 w-9 bg-white text-slate-900 hover:shadow-sm rounded-xl transition-all p-0"
                               >
                                  <Plus size={14} strokeWidth={3} />
                               </Button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                               <p className="text-xl font-bold text-slate-900 leading-none">
                                  {formatCurrency(item.price * item.quantity)}
                               </p>
                               <p className="text-[11px] font-medium text-slate-300 mt-1">
                                  Đơn giá: {formatCurrency(item.price)}
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link to="/products" className="flex items-center justify-center gap-2.5 py-6 text-slate-300 hover:text-indigo-600 transition-all font-bold text-[12px] uppercase">
               <PlusCircle size={17} />
               Tiếp tục mua hàng
            </Link>
          </div>

          {/* Checkout Area - Vietnamese & Refined sizing */}
          <div className="lg:col-span-4 sticky top-28">
             <motion.div 
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="bg-white rounded-[3rem] p-9 border border-slate-100 shadow-[0_30px_70px_rgba(15,23,42,0.06)] space-y-9 overflow-hidden relative"
             >
                <div className="space-y-1.5 relative z-10">
                   <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest pl-0.5">Hóa đơn tạm tính</p>
                   <h2 className="text-3xl font-serif font-bold text-slate-900">Chi tiết thanh toán<span className="text-indigo-600">.</span></h2>
                </div>

                <div className="space-y-5 relative z-10 px-0.5">
                   <div className="flex justify-between items-center text-[13px] font-semibold text-slate-500">
                      <span>Tạm tính hàng</span>
                      <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[13px] font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                         <span>Phí giao hàng</span>
                         <TooltipProvider>
                            <Tooltip>
                               <TooltipTrigger asChild><AlertCircle size={14} className="text-slate-300 cursor-help" /></TooltipTrigger>
                               <TooltipContent className="bg-slate-900 text-white text-[11px]">Đã bao gồm bảo hiểm hàng hóa cơ bản.</TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                      </div>
                      <span className={cn(shipping === 0 ? "text-emerald-500 font-bold" : "text-slate-900")}>
                        {shipping === 0 ? "MIỄN PHÍ" : formatCurrency(shipping)}
                      </span>
                   </div>
                   
                   <div className="pt-6 border-t border-slate-50">
                      <div className="flex justify-between items-end mb-1">
                         <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Tổng cần trả</span>
                         <Badge className="bg-indigo-50 text-indigo-600 border-none px-2 py-0.5 text-[9px] font-bold">{cart.items.length} mặt hàng</Badge>
                      </div>
                      <p className="text-4xl font-bold text-slate-900 tracking-tight">
                         {formatCurrency(total)}
                      </p>
                   </div>
                </div>

                {/* Fixed Size Button */}
                <div className="space-y-5 relative z-10 pt-2">
                   {isShared ? (
                     <>
                       {isOwner ? (
                         <Link to={PATHS.CHECKOUT}>
                           <Button className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[15px] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                             Tiến hành đặt hàng <ArrowRight size={20} />
                           </Button>
                         </Link>
                       ) : (
                         <div className="p-7 rounded-4xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3.5 text-center">
                            <Lock size={28} className="text-slate-200" />
                            <p className="text-[13px] font-semibold text-slate-400 leading-snug">
                               Chỉ chủ phòng mới <br /> có quyền thanh toán
                            </p>
                         </div>
                       )}
                     </>
                   ) : (
                     <Link to={PATHS.CHECKOUT}>
                        <Button className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[15px] shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                           Đặt hàng ngay <ArrowRight size={20} />
                        </Button>
                     </Link>
                   )}

                   <div className="flex items-center justify-center gap-6 opacity-40 grayscale pt-2 px-4">
                      <div className="flex items-center gap-2"><ShieldCheck size={16} /><span className="text-[8px] font-bold uppercase tracking-widest">Xác thực</span></div>
                      <div className="flex items-center gap-2"><Zap size={16} /><span className="text-[8px] font-bold uppercase tracking-widest">Tức thì</span></div>
                   </div>
                </div>

                {/* Subtle backgrounds */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50/40 rounded-full blur-3xl -z-10" />
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-50/30 rounded-full blur-2xl -z-10" />
             </motion.div>
             
             <div className="mt-8 px-8 space-y-4">
                <div className="flex items-center justify-between text-slate-300">
                   <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Chính sách thanh toán</span>
                      <ChevronRight size={12} />
                   </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                   * Giá đã bao gồm thuế VAT và các phí dịch vụ tiêu chuẩn.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
