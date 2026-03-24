import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft,
  MapPin,
  Ticket,
  Wallet as WalletIcon,
  Package,
  CheckCircle2,
  Store,
  Clock,
  Info,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputPremium } from "@/components/premium/InputPremium"
import { formatCurrency } from "@/utils/format"
import { Link, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useCart } from "@/features/cart/hooks/useCart"
import { useCheckout } from "./hooks/useCheckout"
import { useVouchers } from "./hooks/useVouchers"
import { VoucherSelector } from "./components/VoucherSelector"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { checkoutSchema, type CheckoutInput } from "@/schemas/orderSchema"

import type { ICartItem, IVoucher } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  
  const { cart, isLoading: isCartLoading } = useCart()
  const [selectedVoucherCodes, setSelectedVoucherCodes] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'WALLET' | 'VNPAY'>('COD')

  const { data: vouchers } = useVouchers()
  const checkoutMutation = useCheckout()

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
       fullName: "",
       phone: "",
       provinceId: "HANOI", 
       districtId: "",
       wardCode: "",
       addressLine: "",
       note: ""
    }
  })

  // Group items by Shop/Branch for multi-vendor display
  const groups = useMemo(() => {
    if (!cart) return []
    const map: Record<string, { shopId: string; branchId: string; items: ICartItem[] }> = {}
    cart.items.forEach(item => {
      const key = `${item.shopId}_${item.branchId}`
      if (!map[key]) map[key] = { shopId: item.shopId, branchId: item.branchId, items: [] }
      map[key].items.push(item)
    })
    return Object.values(map)
  }, [cart])

  const subtotal = useMemo(() => 
    cart?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0, 
  [cart])
  
  const shippingTotal = groups.length * 30000

  const discountAmount = useMemo(() => {
    if (selectedVoucherCodes.length === 0 || !vouchers) return 0
    let totalDiscount = 0
    
    selectedVoucherCodes.forEach(code => {
        const v = vouchers.find((v: IVoucher) => v.code === code)
        if (!v) return

        if (v.shopId) {
            const shopTotal = cart?.items.filter(item => item.shopId === v.shopId).reduce((acc, item) => acc + item.price * item.quantity, 0) || 0
            if (shopTotal < v.minOrderValue) return
            
            if (v.discountType === 'PERCENTAGE') {
                const discounted = (shopTotal * v.discountValue) / 100
                totalDiscount += v.maxDiscount ? Math.min(discounted, v.maxDiscount) : discounted
            } else {
                totalDiscount += v.discountValue
            }
        } else {
            if (subtotal < v.minOrderValue) return
            if (v.discountType === 'PERCENTAGE') {
                const discounted = (subtotal * v.discountValue) / 100
                totalDiscount += v.maxDiscount ? Math.min(discounted, v.maxDiscount) : discounted
            } else {
                totalDiscount += v.discountValue
            }
        }
    })
    return totalDiscount
  }, [selectedVoucherCodes, vouchers, subtotal, cart])

  const total = subtotal + shippingTotal - discountAmount

  const handleStep1Submit = async () => {
    const isValid = await trigger(['fullName', 'phone', 'provinceId', 'districtId', 'wardCode', 'addressLine'])
    if (isValid) setStep(2)
    else toast.error("Vui lòng nhập đầy đủ thông tin vận chuyển")
  }

  const onFinalSubmit = (data: CheckoutInput) => {
    if (!cart) return
    checkoutMutation.mutate({
      cartId: cart._id,
      paymentMethod,
      shippingAddress: {
        fullName: data.fullName,
        phone: data.phone,
        provinceId: data.provinceId,
        districtId: data.districtId,
        wardCode: data.wardCode,
        addressLine: data.addressLine
      },
      vouchers: selectedVoucherCodes,
      note: data.note,
    })
  }

  if (isCartLoading) {
     return (
        <div className="py-24 max-w-[1500px] mx-auto px-12 space-y-12 bg-slate-50 min-h-screen">
           <Skeleton className="h-10 w-48 rounded-2xl bg-slate-200" />
           <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <Skeleton className="md:col-span-8 h-[600px] rounded-[3rem] bg-white opacity-50" />
              <Skeleton className="md:col-span-4 h-[600px] rounded-[3rem] bg-white opacity-50" />
           </div>
        </div>
     )
  }

  if (!cart || cart.items.length === 0) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCF9]">
           <div className="h-44 w-44 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
              <ShoppingBag size={80} strokeWidth={1} />
           </div>
           <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-serif font-bold text-slate-900">Giỏ hàng rỗng</h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Không có sản phẩm nào để tiến hành thanh toán. Hãy quay lại và chọn những món đồ ưng ý nhé.
              </p>
           </div>
           <Button 
             onClick={() => navigate("/cart")} 
             className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-bold text-[13px] hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
           >
             Quay lại giỏ hàng
           </Button>
        </div>
     )
  }

  return (
    <div className="py-12 min-h-screen max-w-[1600px] mx-auto px-6 lg:px-12 bg-[#FDFCF9]">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-100 pb-12 mb-16">
        <Link 
          to="/cart" 
          className="flex items-center gap-3 text-[12px] font-bold text-slate-400 hover:text-slate-900 transition-all py-2"
        >
          <ChevronLeft size={18} /> Quay lại giỏ hàng
        </Link>
        
        {/* Step Indicator - Vietnamese & Elegant */}
        <div className="flex items-center gap-6 bg-white p-2.5 rounded-4xl shadow-sm border border-slate-50">
           {[
             { n: 1, l: "Giao hàng", color: "indigo" },
             { n: 2, l: "Thanh toán", color: "emerald" },
             { n: 3, l: "Hoàn tất", color: "amber" }
           ].map((s, i) => (
             <div key={i} className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center text-[13px] font-bold transition-all",
                  step >= s.n 
                    ? `bg-${s.color}-500 text-white shadow-lg scale-110` 
                    : 'bg-slate-50 text-slate-300'
                )}>
                   {step > s.n ? <CheckCircle2 size={18} /> : s.n}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    step === s.n ? 'text-slate-900' : 'text-slate-300'
                  )}>{s.l}</span>
                </div>
                {i < 2 && <div className="h-px w-8 bg-slate-100 mx-1" />}
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-7 space-y-16">
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
                    <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl">
                       <MapPin size={24} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-serif font-bold text-slate-900">Thông tin nhận hàng</h2>
                       <p className="text-[12px] font-semibold text-slate-400">Định danh điểm đến cho các kiện hàng kỹ thuật số</p>
                    </div>
                 </div>

                 <div className="space-y-10 bg-white p-10 rounded-[3rem] border border-slate-50 shadow-xl shadow-slate-200/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="md:col-span-2">
                          <InputPremium 
                             label="Họ tên người nhận" 
                             placeholder="VD: Nguyễn Văn A" 
                             error={errors.fullName?.message}
                             {...register("fullName")}
                             className="h-14 rounded-2xl bg-slate-50/50"
                          />
                       </div>
                       <InputPremium 
                          label="Số điện thoại" 
                          placeholder="09xx xxx xxx" 
                          error={errors.phone?.message}
                          {...register("phone")}
                          className="h-14 rounded-2xl bg-slate-50/50"
                       />
                       
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 ml-4">Tỉnh / Thành phố</label>
                          <Select onValueChange={(val) => setValue("provinceId", val)} defaultValue="HANOI">
                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50/50 border-none font-bold text-slate-700 px-6">
                              <SelectValue placeholder="Chọn Tỉnh/Thành" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                              <SelectItem value="HANOI" className="font-bold">Hà Nội</SelectItem>
                              <SelectItem value="HCM" className="font-bold">TP. Hồ Chí Minh</SelectItem>
                              <SelectItem value="DANANG" className="font-bold">Đà Nẵng</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>

                       <InputPremium 
                          label="Quận / Huyện" 
                          placeholder="VD: Cầu Giấy" 
                          error={errors.districtId?.message}
                          {...register("districtId")}
                          className="h-14 rounded-2xl bg-slate-50/50"
                       />
                       <InputPremium 
                          label="Phường / Xã" 
                          placeholder="VD: Dịch Vọng" 
                          error={errors.wardCode?.message}
                          {...register("wardCode")}
                          className="h-14 rounded-2xl bg-slate-50/50"
                       />

                       <div className="md:col-span-2">
                         <InputPremium 
                             label="Địa chỉ cụ thể" 
                             placeholder="Số nhà, tên đường, tòa nhà..." 
                             error={errors.addressLine?.message}
                             {...register("addressLine")}
                             className="h-14 rounded-2xl bg-slate-50/50"
                           />
                       </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 flex justify-end">
                       <Button 
                          type="button" 
                          onClick={handleStep1Submit}
                          className="h-16 px-12 rounded-2xl bg-indigo-600 text-white font-bold text-[14px] hover:bg-indigo-700 transition-all flex items-center gap-4 group shadow-lg"
                       >
                          Tiếp tục thanh toán <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                       </Button>
                    </div>
                 </div>
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
                    <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl">
                       <CreditCard size={24} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-serif font-bold text-slate-900">Phương thức thanh toán</h2>
                       <p className="text-[12px] font-semibold text-slate-400">Lựa chọn giải pháp tài chính an toàn nhất</p>
                    </div>
                 </div>

                 {/* Vouchers Section */}
                 <div className="space-y-6">
                    <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Ticket size={16} className="text-indigo-400" /> Ưu đãi giảm giá
                    </h3>
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                       <VoucherSelector 
                          vouchers={vouchers || []} 
                          selectedVoucherCode={selectedVoucherCodes[0] || null}
                          onSelect={(code) => setSelectedVoucherCodes(code ? [code] : [])} 
                          subtotal={subtotal}
                       />
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Ticket size={60} strokeWidth={1} />
                       </div>
                    </div>
                 </div>

                 {/* Payment Methods */}
                 <div className="space-y-6">
                    <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest ml-1">Chọn phương thức trả tiền</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { id: 'COD', name: 'Tiền mặt khi nhận', desc: 'Thanh toán tại địa chỉ giao hàng', icon: Truck, color: 'text-slate-400' },
                        { id: 'WALLET', name: 'Ví điện tử (Escrow)', desc: 'Thanh toán an toàn, bảo vệ người mua', icon: WalletIcon, color: 'text-emerald-500' },
                        { id: 'VNPAY', name: 'VNPay Cổng nội địa', desc: 'Hỗ trợ tất cả ngân hàng Việt Nam', icon: CreditCard, color: 'text-indigo-500' },
                      ].map((p) => (
                        <motion.div 
                          key={p.id}
                          whileHover={{ y: -4 }}
                          onClick={() => setPaymentMethod(p.id as 'COD' | 'WALLET' | 'VNPAY')}
                          className={cn(
                             "p-8 rounded-3xl bg-white border-2 cursor-pointer transition-all flex items-center gap-5",
                             paymentMethod === p.id 
                               ? "border-indigo-600 shadow-xl shadow-indigo-100/50" 
                               : "border-slate-50 hover:border-slate-100"
                          )}
                        >
                          <div className={cn(
                             "h-12 w-12 rounded-xl flex items-center justify-center bg-slate-50 shadow-inner shrink-0",
                             p.color
                          )}>
                             <p.icon size={22} />
                          </div>
                          <div>
                             <h4 className="text-[15px] font-bold text-slate-900">{p.name}</h4>
                             <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{p.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                 </div>

                 {/* Final Actions */}
                 <div className="flex justify-between items-center pt-8">
                    <Button 
                      variant="ghost" 
                      onClick={() => setStep(1)} 
                      className="h-14 px-8 rounded-2xl text-[12px] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                    >
                       Quay lại bước trước
                    </Button>
                    <Button 
                       onClick={handleSubmit(onFinalSubmit)}
                       disabled={checkoutMutation.isPending}
                       className="h-16 px-12 rounded-2xl bg-indigo-600 text-white font-bold text-[14px] hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95 transition-all"
                    >
                       {checkoutMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đặt hàng'} <ArrowRight size={20} />
                    </Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
           <div className="sticky top-28 space-y-8">
              <motion.div 
                layout
                className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.05)] overflow-hidden relative"
              >
                <div className="space-y-1.5 mb-10 relative z-10">
                   <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest pl-0.5">Danh mục hàng hóa</p>
                   <h2 className="text-3xl font-serif font-bold text-slate-900">Chi tiết đơn hàng<span className="text-emerald-500">.</span></h2>
                </div>

                <div className="space-y-10 relative z-10">
                   <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {groups.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-5">
                           <div className="flex items-center gap-3 text-slate-400 border-b border-slate-50 pb-3">
                              <Store size={15} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Chi nhánh: {group.branchId ? group.branchId.slice(-6).toUpperCase() : "N/A"}</span>
                           </div>
                           <div className="space-y-5">
                              {group.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center group/item">
                                  <div className="flex items-center gap-4">
                                      <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-50 flex items-center justify-center shrink-0">
                                        <Package size={18} className="text-slate-300" />
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-[14px] font-bold text-slate-800 line-clamp-1 max-w-[140px]">
                                            {typeof item.productId === 'object' ? item.productId.name : 'Sản phẩm'}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-400">
                                            {item.quantity} x {item.unitName}
                                        </p>
                                      </div>
                                  </div>
                                  <span className="text-[14px] font-bold text-slate-700">
                                      {formatCurrency(item.price * item.quantity)}
                                  </span>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="pt-8 border-t border-slate-50 space-y-5 px-1">
                      <div className="flex justify-between text-[13px] font-semibold text-slate-500">
                         <span>Tổng tiền hàng</span>
                         <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                      </div>

                      <div className="flex justify-between text-[13px] font-semibold text-slate-500">
                         <span>Phí vận chuyển</span>
                         <span className="text-indigo-600">+{formatCurrency(shippingTotal)}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-[13px] font-bold text-emerald-500 bg-emerald-50/50 p-2 rounded-lg -mx-2">
                           <span className="flex items-center gap-1.5"><Ticket size={14} /> Giảm giá voucher</span>
                           <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                      )}

                      <div className="pt-6 border-t border-slate-50">
                         <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-1">Tổng cộng</span>
                            <p className="text-4xl font-bold text-slate-900 tracking-tight">
                               {formatCurrency(total)}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Decoration Circles */}
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl -z-10" />
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-50/30 rounded-full blur-2xl -z-10" />
              </motion.div>

              {/* Safety Badges */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-5 rounded-3xl border border-slate-50 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><ShieldCheck size={16} /></div>
                    <div className="space-y-0.5">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bảo mật</p>
                       <p className="text-[10px] font-bold text-slate-800">100% Verified</p>
                    </div>
                 </div>
                 <div className="bg-white p-5 rounded-3xl border border-slate-50 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500"><Clock size={16} /></div>
                    <div className="space-y-0.5">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Giao nhanh</p>
                       <p className="text-[10px] font-bold text-slate-800">24/7 Delivery</p>
                    </div>
                 </div>
              </div>

              {/* Escrow Help */}
              <div className="p-7 rounded-[2.5rem] bg-indigo-950 text-white flex gap-4 items-start shadow-xl shadow-indigo-900/10">
                  <Info size={18} className="text-indigo-400 mt-1 shrink-0" />
                  <div className="space-y-1.5 text-slate-300">
                    <p className="text-[12px] font-semibold leading-relaxed">
                      Sử dụng <span className="text-white font-bold underline decoration-indigo-400 underline-offset-4 cursor-help">Ví điện tử</span> để được bảo vệ bởi hệ thống Ký quỹ (Escrow). Tiền chỉ được chuyển khi khách hàng xác nhận đã nhận sản phẩm.
                    </p>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
