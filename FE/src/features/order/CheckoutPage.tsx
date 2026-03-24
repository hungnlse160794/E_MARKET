import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft,
  Terminal,
  Cpu,
  Zap,
  MapPin,
  Ticket,
  Wallet as WalletIcon,
  Package,
  CheckCircle2,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputPremium } from "@/components/premium/InputPremium"
import { formatCurrency } from "@/utils/format"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useCart } from "@/features/cart/hooks/useCart"
import type { IVoucher } from "@/types"
import { useCheckout } from "./hooks/useCheckout"
import { useVouchers } from "./hooks/useVouchers"
import { VoucherSelector } from "./components/VoucherSelector"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import * as z from "zod"
import type { IProduct, ICartItem } from "@/types"
import { GlassCard } from "@/components/premium/GlassCard"

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Họ tên là bắt buộc để xác thực"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại Signal không hợp lệ"),
  address: z.string().min(10, "Địa chỉ nhận hàng (Coordinates) là bắt buộc"),
  note: z.string().optional(),
})

type CheckoutInput = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const roomCode = localStorage.getItem("cart_room_code")
  
  const { cart, isLoading: isCartLoading } = useCart(roomCode || undefined)
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'WALLET' | 'VNPAY'>('COD')

  const { data: vouchers } = useVouchers()
  const checkoutMutation = useCheckout()

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
       email: "",
       fullName: "",
       phone: "",
       address: ""
    }
  })

  // Safe product name getter (No Any Policy)
  const getProductName = (productId: string | IProduct): string => {
    if (typeof productId === 'object' && productId !== null) {
      return (productId as IProduct).name;
    }
    return 'Product';
  };

  const subtotal = useMemo(() => 
    cart?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0, 
  [cart])
  
  const shippingFee = shippingMethod === 'standard' ? 0 : 25000
  
  const discountAmount = useMemo(() => {
    if (!selectedVoucher || !vouchers) return 0
    const v = vouchers.find((v: IVoucher) => v.code === selectedVoucher)
    if (!v) return 0
    if (v.discountType === 'PERCENTAGE') {
      const discounted = (subtotal * v.discountValue) / 100
      return v.maxDiscount ? Math.min(discounted, v.maxDiscount) : discounted
    }
    return v.discountValue
  }, [selectedVoucher, vouchers, subtotal])

  const total = subtotal + shippingFee - discountAmount

  const handleStep1Submit = async () => {
    const isValid = await trigger(['fullName', 'email', 'phone', 'address'])
    if (isValid) setStep(2)
    else toast.error("Vui lòng nhập đầy đủ thông tin định danh hệ thống.")
  }

  const onFinalSubmit = (data: CheckoutInput) => {
    if (!cart) return
    checkoutMutation.mutate({
      cartId: cart._id,
      paymentMethod,
      shippingAddress: {
        title: "Địa chỉ mặc định",
        fullAddress: data.address,
      },
      vouchers: selectedVoucher ? [selectedVoucher] : [],
      note: data.note,
    })
  }

  if (isCartLoading) {
     return (
        <div className="py-24 max-w-[1500px] mx-auto px-12 space-y-12">
           <Skeleton className="h-12 w-1/4 rounded-2xl" />
           <div className="grid grid-cols-12 gap-12">
              <Skeleton className="col-span-8 h-[600px] rounded-[3rem]" />
              <Skeleton className="col-span-4 h-[600px] rounded-[3rem]" />
           </div>
        </div>
     )
  }

  if (!cart || cart.items.length === 0) {
     return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8">
           <div className="h-40 w-40 rounded-[3rem] bg-indigo-50 flex items-center justify-center text-indigo-400 border border-indigo-100 shadow-xl">
              <Terminal size={64} />
           </div>
           <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">ERROR_EMPTY_BUFFER</h2>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Không có dữ liệu giỏ hàng để khởi tạo chu kỳ thanh toán.</p>
           </div>
           <Link to="/cart">
              <Button className="h-16 px-12 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[12px] tracking-[0.4em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                QUAY LẠI TỔNG ĐÀI (CART)
              </Button>
           </Link>
        </div>
     )
  }

  return (
    <div className="py-16 max-w-[1500px] mx-auto px-12 space-y-12 bg-[#FBFCFE]">
      {/* Header with Navigation & Progress */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-slate-100 pb-12">
        <Link to="/cart" className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 hover:text-slate-900 transition-all group">
          <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" /> REVERT_TO_VAULT
        </Link>
        
        <div className="flex items-center gap-12">
           {[
             { n: 1, l: "THỦ TỤC XÁC THỰC", c: "text-emerald-500" },
             { n: 2, l: "PHÂN TÁCH LÔ HÀNG", c: "text-violet-500" },
             { n: 3, l: "KẾT THÚC GIAO DỊCH", c: "text-amber-500" }
           ].map((s, i) => (
             <div key={i} className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-[12px] font-black transition-all ${
                  step >= s.n ? `${s.c} bg-current text-white shadow-xl` : 'bg-slate-100 text-slate-300'
                }`}>
                   {step > s.n ? <CheckCircle2 size={20} /> : s.n}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                  step === s.n ? 'text-slate-900' : 'text-slate-300'
                }`}>{s.l}</span>
                {i < 2 && <div className="h-px w-8 bg-slate-100 ml-4" />}
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Wizard Content */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                 <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-2xl">
                       <MapPin size={28} />
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">NODE_IDENTITY</h2>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">THỦ TỤC ĐỊNH DANH ĐIỂM ĐẾN</p>
                    </div>
                 </div>

                 <GlassCard className="space-y-10 p-12 rounded-[3.5rem] bg-white/70 backdrop-blur-3xl border border-white/40 shadow-2xl relative overflow-hidden group/form">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/form:opacity-10 transition-opacity">
                       <Cpu size={120} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                       <div className="md:col-span-2">
                          <InputPremium 
                             label="Tên định danh (Họ tên)" 
                             placeholder="NGUYEN VAN A" 
                             error={errors.fullName?.message}
                             {...register("fullName")}
                             className="bg-white/40 border-slate-200/50 backdrop-blur-sm focus:border-emerald-500/50 transition-all"
                          />
                       </div>
                       <InputPremium 
                          label="Kênh tín hiệu (Email)" 
                          type="email" 
                          placeholder="UNIT@PROTOCOL.IO" 
                          error={errors.email?.message}
                          {...register("email")}
                          className="bg-white/40 border-slate-200/50 backdrop-blur-sm"
                       />
                       <InputPremium 
                          label="Liên lạc khẩn cấp (SĐT)" 
                          placeholder="09xx xxx xxx" 
                          error={errors.phone?.message}
                          {...register("phone")}
                          className="bg-white/40 border-slate-200/50 backdrop-blur-sm"
                       />
                       <div className="md:col-span-2">
                          <InputPremium 
                             label="Tọa độ giao vận (Địa chỉ)" 
                             placeholder="VD: SỐ 1 TRẦN DUY HƯNG, HÀ NỘI" 
                             error={errors.address?.message}
                             {...register("address")}
                             className="bg-white/40 border-slate-200/50 backdrop-blur-sm"
                          />
                       </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex justify-end">
                       <Button 
                          type="button" 
                          onClick={handleStep1Submit}
                          className="h-20 px-12 rounded-4xl bg-slate-900 text-white font-black uppercase text-[12px] tracking-[0.4em] hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-6 group shadow-2xl shadow-emerald-200/20"
                       >
                          XÁC THỰC VỊ TRÍ <ArrowRight size={24} className="group-hover:translate-x-3 transition-all" />
                       </Button>
                    </div>
                 </GlassCard>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                 <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-2xl">
                       <Zap size={28} />
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">LOGISTICS_MODULE</h2>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ĐIỀU PHỐI GIAO VẬN & ƯU ĐÃI</p>
                    </div>
                 </div>

                 {/* Shipping Methods */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { id: 'standard', name: 'GIAO HÀNG TIÊU CHUẨN', desc: 'Dự kiến 2-4 chu kỳ', fee: 0, icon: Truck, color: 'text-emerald-500', glow: 'hover:border-emerald-200 hover:shadow-emerald-50/50' },
                      { id: 'express', name: 'GIAO HÀNG HỎA TỐC', desc: 'Ưu tiên trong 24h', fee: 25000, icon: Zap, color: 'text-violet-500', glow: 'hover:border-violet-200 hover:shadow-violet-50/50' }
                    ].map((m) => (
                      <motion.div 
                         key={m.id}
                         whileHover={{ scale: 1.02, y: -4 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => setShippingMethod(m.id as 'standard' | 'express')}
                         className={`p-10 rounded-[3rem] bg-white border-2 cursor-pointer transition-all ${
                            shippingMethod === m.id 
                                ? 'border-slate-900 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] ring-4 ring-slate-900/5' 
                                : `border-slate-100 opacity-70 ${m.glow}`
                         }`}
                      >
                         <div className={`h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 ${m.color} shadow-inner`}>
                            <m.icon size={32} />
                         </div>
                         <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{m.name}</h3>
                         <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{m.desc}</p>
                         <div className="mt-6 text-2xl font-black text-slate-900 tabular-nums">
                            {m.fee === 0 ? 'MIỄN PHÍ' : formatCurrency(m.fee)}
                         </div>
                      </motion.div>
                    ))}
                 </div>

                  {/* Voucher Section */}
                  <GlassCard className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl space-y-8">
                     <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <Ticket className="text-indigo-500" size={24} />
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">VOUCHER_ALLOCATION</h3>
                     </div>
                     <VoucherSelector 
                        vouchers={vouchers || []} 
                        selectedVoucherCode={selectedVoucher}
                        onSelect={setSelectedVoucher}
                        subtotal={subtotal}
                     />
                  </GlassCard>

                 <div className="flex justify-between items-center pt-8">
                    <Button 
                       variant="ghost" 
                       onClick={() => setStep(1)}
                       className="h-16 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400"
                    >
                       QUAY LẠI
                    </Button>
                    <Button 
                       onClick={() => setStep(3)}
                       className="h-20 px-12 rounded-4xl bg-slate-900 text-white font-black uppercase text-[12px] tracking-[0.4em] hover:bg-violet-600 transition-all flex items-center gap-6 shadow-2xl"
                    >
                       TIẾP TỤC THANH TOÁN <ArrowRight size={24} />
                    </Button>
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                 <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-2xl">
                       <CreditCard size={28} />
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">PAYMENT_GATEWAY</h2>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">KÍCH HOẠT GIAO THỨC THANH TOÁN</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {[
                      { id: 'COD', name: 'THANH TOÁN KHI NHẬN HÀNG (COD)', desc: 'Tính phí sau khi hàng đến node đích', icon: Truck, color: 'text-slate-400' },
                      { id: 'WALLET', name: 'VÍ ĐIỆN TỬ SAAS (WALLET)', desc: 'Khuyên dùng - Bảo mật & Nhanh chóng', icon: WalletIcon, color: 'text-emerald-500' },
                      { id: 'VNPAY', name: 'CỔNG THANH TOÁN QUỐC TẾ (VNPAY)', desc: 'Xử lý qua mạng lưới ngân hàng', icon: ShieldCheck, color: 'text-indigo-500' }
                    ].map((p) => (
                       <GlassCard 
                          key={p.id}
                          onClick={() => setPaymentMethod(p.id as 'COD' | 'WALLET' | 'VNPAY')}
                          className={`p-8 rounded-[2.5rem] bg-white border-2 cursor-pointer transition-all flex items-center gap-8 ${
                             paymentMethod === p.id ? 'border-slate-900 shadow-2xl' : 'border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'
                          }`}
                       >
                          <div className={`h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center ${p.color}`}>
                             <p.icon size={32} />
                          </div>
                          <div className="flex-1">
                             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{p.name}</h3>
                             <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{p.desc}</p>
                          </div>
                          {paymentMethod === p.id && <CheckCircle2 size={24} className="text-slate-900" />}
                       </GlassCard>
                    ))}
                 </div>

                 <div className="p-10 rounded-[3rem] bg-indigo-50 border border-indigo-100 space-y-4">
                    <div className="flex items-center gap-4 text-indigo-600">
                       <Lock size={20} />
                       <span className="text-[11px] font-black uppercase tracking-widest">GIAO GIAO THỨC BẢO MẬT V8_PROTO</span>
                    </div>
                    <p className="text-[12px] font-bold text-indigo-900/60 leading-relaxed uppercase">
                       Bằng việc xác nhận thanh toán, bạn đồng ý với các điều khoản giao dịch của hệ thống SaaS Multi-vendor và cam kết tính trung thực của các tham số đầu vào.
                    </p>
                 </div>

                 <div className="flex justify-between items-center pt-8">
                    <Button 
                       variant="ghost" 
                       onClick={() => setStep(2)}
                       className="h-16 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400"
                    >
                       QUAY LẠI
                    </Button>
                    <Button 
                       onClick={handleSubmit(onFinalSubmit)}
                       disabled={checkoutMutation.isPending}
                       className="h-20 px-16 rounded-4xl bg-slate-900 text-white font-black uppercase text-[12px] tracking-[0.4em] hover:bg-emerald-500 transition-all flex items-center gap-6 shadow-2xl shadow-emerald-200/50"
                    >
                       {checkoutMutation.isPending ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN GIAO DỊCH'} <ArrowRight size={24} />
                    </Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="lg:col-span-5">
           <motion.div 
              layout
              className="p-12 rounded-[4rem] bg-slate-900 text-white space-y-12 overflow-hidden shadow-2xl sticky top-8"
           >
              <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent opacity-50 backdrop-blur-3xl" />
              
              <div className="space-y-6 relative z-10">
                 <h2 className="text-4xl font-black uppercase tracking-tight">KẾT_TOÁN<span className="text-indigo-400">.</span></h2>
                 <div className="h-1 w-20 bg-emerald-500" />
              </div>

              <div className="space-y-10 relative z-10">
                  <div className="space-y-6 max-h-[350px] overflow-y-auto no-scrollbar pr-4">
                    {cart.items.map((item: ICartItem, i: number) => (
                      <div key={i} className="flex justify-between items-center group/item p-4 rounded-3xl hover:bg-white/5 transition-all">
                         <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                               <Package size={20} className="text-indigo-400" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-[14px] font-black text-white group-hover/item:text-indigo-400 transition-colors uppercase truncate max-w-[180px]">
                                  {getProductName(item.productId)}
                               </p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  {item.quantity} x {item.unitName}
                               </p>
                            </div>
                         </div>
                         <span className="text-[15px] font-bold font-mono text-slate-200">
                            {formatCurrency(item.price * item.quantity)}
                         </span>
                      </div>
                    ))}
                 </div>

                 <div className="pt-8 border-t border-white/10 space-y-6">
                    <div className="flex justify-between items-center text-slate-500">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">GIÁ TRỊ ASSETS</span>
                       <span className="text-lg font-bold font-mono text-slate-300">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">CƯỚC VẬN CHUYỂN</span>
                       <span className="text-lg font-bold font-mono text-slate-300">+{formatCurrency(shippingFee)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-500 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">VOUCHER GIẢM GIÁ</span>
                         <span className="text-xl font-bold font-mono">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="h-px bg-white/10" />
                    <div className="space-y-3">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">NET_REQUISITION</span>
                       <p className="text-7xl font-black tracking-tight text-white tabular-nums leading-none">
                          {formatCurrency(total).replace('₫', '')}<span className="text-2xl text-slate-600 ml-4 font-normal">VND</span>
                       </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-6 relative z-10">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="text-indigo-400" size={18} />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GIAO DỊCH ĐƯỢC BẢOHIỂM</span>
                    </div>
                    <Badge variant="outline" className="border-indigo-900 text-indigo-400 text-[8px] font-bold">ACTIVE</Badge>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  )
}
