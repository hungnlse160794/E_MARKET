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
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/stores/useAuthStore"

export default function CartPage() {
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(localStorage.getItem("cart_room_code"));
  const user = useAuthStore((state) => state.user);
  const { cart, isLoading, joinRoom, updateItem, removeItem } = useCart(activeRoomCode || undefined);

  const subtotal = cart?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const shipping = 25000;
  const total = subtotal + shipping;

  const isOwner = cart && user && (cart.ownerId === user._id);

  const handleJoinOrCreate = async () => {
    try {
      const newCart = await joinRoom({});
      setActiveRoomCode(newCart.roomCode);
      toast.success("Đã khởi tạo giỏ hàng chung mới!");
    } catch {
       toast.error("Không thể khởi tạo giỏ hàng.");
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
        <Skeleton className="h-24 w-1/3 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 space-y-6">
              {[1,2].map(i => <Skeleton key={i} className="h-48 w-full rounded-[3rem]" />)}
           </div>
           <div className="lg:col-span-4">
              <Skeleton className="h-[500px] w-full rounded-[4rem]" />
           </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-12 bg-[#FBFCFE]">
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="h-40 w-40 rounded-[3rem] bg-white flex items-center justify-center text-slate-200 border border-slate-100 shadow-xl"
        >
          <ShoppingBag size={80} strokeWidth={1} />
        </motion.div>
        <div className="text-center space-y-6 max-w-md">
           <h2 className="text-4xl font-serif font-black text-slate-900 uppercase">GIỎ HÀNG TRỐNG</h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
             {activeRoomCode ? 'BẮT ĐẦU THÊM SẢN PHẨM VÀO GIỎ PHÒNG: ' + activeRoomCode : 'HÃY KHỞI TẠO HOẶC THAM GIA GIỎ HÀNG CHUNG ĐỂ BẮT ĐẦU'}
           </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/products">
            <Button className="h-16 px-10 rounded-2xl bg-indigo-600 text-white font-bold uppercase text-[12px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
              KHÁM PHÁ SẢN PHẨM
            </Button>
          </Link>
          {!activeRoomCode && (
            <Button 
               variant="outline" 
               onClick={handleJoinOrCreate}
               className="h-16 px-10 rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[12px] tracking-widest hover:bg-white transition-all shadow-md"
            >
               TẠO GIỎ CHUNG MỚI
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 max-w-[1400px] mx-auto px-6 space-y-12 bg-[#FBFCFE]">
      
      {/* Real-time Status Bar (Phase 2 Feature) */}
      <motion.div 
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
      >
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
               <Users size={28} />
            </div>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phòng giỏ hàng chung</span>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">ĐANG HOẠT ĐỘNG</Badge>
               </div>
               <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{cart.roomCode}</h2>
                  <Button variant="ghost" size="icon" onClick={copyRoomCode} className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                     <Copy size={14} />
                  </Button>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="flex -space-x-3 overflow-hidden">
               {cart.members.map((memberId, i) => (
                  <Popover key={memberId}>
                     <PopoverTrigger>
                        <Avatar className="h-12 w-12 border-4 border-white shadow-md ring-1 ring-slate-100 cursor-pointer hover:-translate-y-1 transition-transform">
                           <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${memberId}`} />
                           <AvatarFallback className="bg-slate-100 text-[10px] font-bold">U{i+1}</AvatarFallback>
                        </Avatar>
                     </PopoverTrigger>
                     <PopoverContent className="w-48 rounded-xl p-3 shadow-2xl border-slate-100">
                        <div className="text-center space-y-1">
                           <p className="text-[12px] font-bold text-slate-700 uppercase">Thành viên</p>
                           <p className="text-[10px] text-slate-400 font-medium">ID: {memberId.slice(-6)}</p>
                        </div>
                     </PopoverContent>
                  </Popover>
               ))}
               <Button variant="ghost" className="h-12 w-12 rounded-full bg-slate-50 border-4 border-white text-slate-400 p-0 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600">
                  <PlusCircle size={20} />
               </Button>
            </div>
            
            <div className="flex gap-3">
               <Button variant="outline" className="rounded-2xl border-slate-100 h-12 px-6 gap-2 text-[12px] font-bold text-slate-600 hover:bg-white hover:border-slate-200">
                  <Share2 size={16} /> <span className="hidden sm:inline">MỜI BẠN</span>
               </Button>
               <Button variant="destructive" onClick={() => { setActiveRoomCode(null); localStorage.removeItem("cart_room_code"); }} className="rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 h-12 px-6 gap-2 text-[12px] font-bold border-none transition-all">
                  RỜI PHÒNG
               </Button>
            </div>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-8">
           <AnimatePresence mode="popLayout">
            {cart.items.map((item) => (
              <motion.div 
                key={item._id} 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 flex flex-col sm:flex-row items-center gap-10"
              >
                <div className="h-40 w-40 rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative">
                  <img src={typeof item.productId !== 'string' ? item.productId.images[0] : "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=400"} alt="Product" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3">
                     <Badge className="bg-white/90 backdrop-blur-md text-slate-600 text-[10px] font-bold border-none">{item.unitName}</Badge>
                  </div>
                </div>
                
                <div className="flex-1 space-y-6 w-full">
                   <div className="flex justify-between items-start">
                      <div className="space-y-2">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                               SẢN PHẨM TIÊU BIỂU
                            </span>
                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
                               <Avatar className="h-4 w-4">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.addedBy}`} />
                               </Avatar>
                               <span className="text-[8px] font-bold text-slate-400">Added by {item.addedBy.slice(-4)}</span>
                            </div>
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{typeof item.productId !== 'string' ? item.productId.name : `Product ID: ${item.productId.slice(-8)}`}</h3>
                      </div>
                      <button 
                         onClick={() => removeItem(item._id)}
                         className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center border border-slate-100"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>

                   <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-50 gap-6">
                      <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <Button 
                          variant="ghost" 
                          onClick={() => updateItem({ itemId: item._id, quantity: Math.max(1, item.quantity - 1) })}
                          className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </Button>
                        <span className="text-xl font-black w-8 text-center tabular-nums text-slate-700">{item.quantity}</span>
                        <Button 
                          onClick={() => updateItem({ itemId: item._id, quantity: item.quantity + 1 })}
                          className="h-10 w-10 p-0 rounded-xl bg-slate-800 text-white hover:bg-black shadow-lg transition-all"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </Button>
                      </div>
                      <div className="text-center sm:text-right">
                         <p className="text-2xl font-black text-slate-800 tabular-nums">{formatCurrency(item.price * item.quantity)}</p>
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{formatCurrency(item.price)} / ĐƠN VỊ</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
           </AnimatePresence>
        </div>

        {/* Right: Summary Hud */}
        <div className="lg:col-span-4">
          <motion.div 
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="p-10 rounded-[4rem] bg-slate-900 text-white space-y-12 relative overflow-hidden shadow-2xl sticky top-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />
            
            <div className="space-y-6 relative z-10">
               <h2 className="text-3xl font-serif font-black uppercase tracking-tight">THANH TOÁN<span className="text-indigo-400">.</span></h2>
               <div className="h-1 w-16 bg-indigo-400" />
            </div>

            <div className="space-y-8 relative z-10 font-bold">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] uppercase tracking-widest">Tồng Tiền Hàng</span>
                <span className="text-lg tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] uppercase tracking-widest">Phi vận chuyển</span>
                <span className="text-lg tabular-nums">{formatCurrency(shipping)}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                   <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">TỔNG CỘNG</span>
                   <p className="text-5xl font-black border-none tracking-tighter text-white tabular-nums">{formatCurrency(total)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 relative z-10 pt-4">
               {isOwner ? ( 
                  <Button className="w-full h-24 rounded-[2rem] bg-indigo-500 text-white font-black uppercase text-[14px] tracking-[0.4em] hover:bg-indigo-600 shadow-2xl shadow-indigo-900/50 transition-all flex items-center justify-center gap-6 group">
                    TIẾN HÀNH ĐẶT HÀNG <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </Button>
               ) : (
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 text-center">
                     <Lock size={32} className="mx-auto text-indigo-400 opacity-50" />
                     <p className="text-[12px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                        Chỉ chủ phòng <br /> mới có quyền thanh toán
                     </p>
                  </div>
               )}
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-3">
                     <ShieldCheck size={20} className="text-emerald-500" />
                     <span className="text-[8px] font-black uppercase tracking-[0.2em] text-center text-slate-400">ĐÃ XÁC THỰC</span>
                  </div>
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-3">
                     <Zap size={20} className="text-amber-500" />
                     <span className="text-[8px] font-black uppercase tracking-[0.2em] text-center text-slate-400">ĐỒNG BỘ TỨC THÌ</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
