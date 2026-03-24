import { useWallet } from "./hooks/useWallet";
import { formatCurrency, formatDate } from "@/utils/format";
import { 
  Wallet as WalletIcon, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCcw, 
  ShieldCheck, 
  History,
  CreditCard,
  Plus,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/premium/PageContainer";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserRole } from "@/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const mockRevenueData = [
  { name: 'T2', total: 12000000 },
  { name: 'T3', total: 15000000 },
  { name: 'T4', total: 11000000 },
  { name: 'T5', total: 22000000 },
  { name: 'T6', total: 18000000 },
  { name: 'T7', total: 29000000 },
  { name: 'CN', total: 34000000 },
];

export default function WalletPage() {
  const { wallet, isLoading } = useWallet();
  const user = useAuthStore((state) => state.user);
  const isShopOwner = user?.role === UserRole.SHOP_OWNER;

  const renderWalletSkeleton = () => (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-48 rounded-2xl" />
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <Skeleton className="lg:col-span-12 h-[350px] rounded-[3.5rem]" />
        <div className="lg:col-span-8 space-y-8">
           <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-20 rounded-lg" />
           </div>
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-4xl" />)}
        </div>
        <div className="lg:col-span-4 space-y-8">
           <Skeleton className="h-[400px] w-full rounded-[3rem]" />
           <Skeleton className="h-[250px] w-full rounded-[3rem]" />
        </div>
      </div>
    </div>
  );

  return (
    <PageContainer className="p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto space-y-12">
        {isLoading ? (
          renderWalletSkeleton()
        ) : (
          <>
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-10 bg-indigo-500 rounded-full" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Hệ thống tài chính
                  </p>
                </div>
                <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
                  Tài chính <br />
                  <span className="bg-linear-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent italic">
                    Ví Node.
                  </span>
                </h1>
              </div>
              {isShopOwner ? (
                <Button className="h-14 px-10 rounded-2xl bg-amber-500 text-white font-black uppercase text-[11px] tracking-widest hover:bg-amber-600 shadow-xl shadow-amber-100 flex items-center gap-3 transition-all hover:scale-[1.02]">
                  <ArrowUpRight size={18} strokeWidth={3} /> YÊU CẦU RÚT TIỀN
                </Button>
              ) : (
                <Button className="h-14 px-10 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-3 transition-all hover:scale-[1.02]">
                  <Plus size={18} strokeWidth={3} /> NẠP TIỀN NODE
                </Button>
              )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Balance Card ... rest of the content */}
          {/* Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12 p-12 rounded-[3.5rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl"
          >
             <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent opacity-50" />
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex-1 flex flex-col md:flex-row gap-8 lg:gap-12 items-start md:items-center w-full">
                   {/* Balance */}
                   <div className="space-y-6 shrink-0">
                      <div className="flex items-center gap-4 text-indigo-400">
                         <WalletIcon size={24} />
                         <span className="text-[11px] font-black uppercase tracking-[0.3em]">AVAILABLE_LIQUIDITY</span>
                      </div>
                      <div className="space-y-2">
                         <p className="text-5xl md:text-6xl font-black tracking-tight tabular-nums">
                           {formatCurrency(wallet?.balance || 0).replace('₫', '')}<span className="text-xl text-slate-600 ml-2 font-normal">VND</span>
                         </p>
                         <div className="flex items-center gap-4">
                            <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-3 py-1 font-black text-[10px]">VERIFIED_ACCOUNT</Badge>
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">ID: {wallet?._id.slice(-12).toUpperCase()}</span>
                         </div>
                      </div>
                   </div>

                   {/* Frozen Balance (Only Shop Owner) */}
                   {isShopOwner && (
                     <div className="space-y-6 md:border-l border-white/10 md:pl-12 w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 shrink-0">
                        <div className="flex items-center gap-4 text-amber-400">
                           <ShieldCheck size={24} />
                           <span className="text-[11px] font-black uppercase tracking-[0.3em]">FROZEN_LIQUIDITY</span>
                        </div>
                        <div className="space-y-2">
                           <p className="text-4xl md:text-5xl font-black tracking-tight tabular-nums text-slate-300">
                             {formatCurrency(wallet?.frozenBalance || 0).replace('₫', '')}<span className="text-lg text-slate-600 ml-2 font-normal">VND</span>
                           </p>
                           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">TIỀN CHỜ ĐỐI SOÁT ĐƠN HÀNG</p>
                        </div>
                     </div>
                   )}
                </div>

                <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end mt-8 md:mt-0">
                   <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                      <ArrowUpRight className="text-rose-400" />
                      <span className="text-[9px] font-black uppercase text-slate-400">SEND</span>
                   </div>
                   <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                      <ArrowDownLeft className="text-emerald-400" />
                      <span className="text-[9px] font-black uppercase text-slate-400">RECIVE</span>
                   </div>
                   <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                      <CreditCard className="text-indigo-400" />
                      <span className="text-[9px] font-black uppercase text-slate-400">CARDS</span>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Revenue Chart - Only for Shop Owner */}
          {isShopOwner && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="lg:col-span-12 p-8 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm space-y-8"
            >
               <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                     <BarChart3 className="text-indigo-600" size={24} />
                     <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">DOANH THU 7 NGÀY QUA</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TỔNG QUAN TÀI CHÍNH CỬA HÀNG</p>
                     </div>
                  </div>
                  <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-2 font-black">
                     +18.4% so với tuần trước
                  </Badge>
               </div>
               <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={mockRevenueData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                         <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                       dy={10}
                     />
                     <YAxis 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                       tickFormatter={(value) => `${(value / 1000000)}Tr`}
                     />
                     <RechartsTooltip 
                       contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                       formatter={(value: number | string | readonly (number | string)[] | undefined) => [formatCurrency(Number(value) || 0), "Doanh thu"]}
                     />
                     <Area 
                       type="monotone" 
                       dataKey="total" 
                       stroke="#4f46e5" 
                       strokeWidth={3}
                       fillOpacity={1} 
                       fill="url(#colorRevenue)" 
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </motion.div>
          )}

          {/* Transactions History */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <History className="text-slate-400" size={20} />
                   <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">GIAO DỊCH GẦN ĐÂY</h2>
                </div>
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Xem tất cả</Button>
             </div>

             <div className="space-y-4">
                {wallet?.transactions && wallet.transactions.length > 0 ? (
                  wallet.transactions.map((tx, idx) => (
                    <motion.div 
                      key={tx._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-6 rounded-4xl bg-white border border-slate-100 hover:border-indigo-100 transition-all group flex items-center justify-between"
                    >
                       <div className="flex items-center gap-6">
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                             tx.type === 'DEPOSIT' || tx.type === 'ORDER_REFUND' 
                               ? 'bg-emerald-50 text-emerald-500' 
                               : 'bg-rose-50 text-rose-500'
                          }`}>
                             {tx.type === 'DEPOSIT' ? <ArrowDownLeft /> : <ArrowUpRight />}
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                {tx.type === 'ORDER_PAYMENT' ? 'Thanh toán đơn hàng' : 
                                 tx.type === 'DEPOSIT' ? 'Nạp tiền vào ví' : 
                                 tx.type === 'ORDER_REFUND' ? 'Hoàn tiền đơn hàng' : 'Giao dịch khác'}
                             </p>
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400">{formatDate(tx.createdAt)}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {tx._id.slice(-8).toUpperCase()}</span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right space-y-1">
                          <p className={`text-lg font-black font-mono ${
                             tx.type === 'DEPOSIT' || tx.type === 'ORDER_REFUND' ? 'text-emerald-500' : 'text-slate-900'
                          }`}>
                             {tx.type === 'DEPOSIT' || tx.type === 'ORDER_REFUND' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest ${
                             tx.status === 'COMPLETED' ? 'text-emerald-500 border-emerald-100' : 'text-amber-500 border-amber-100'
                          }`}>
                             {tx.status}
                          </Badge>
                       </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
                     <RefreshCcw size={48} className="animate-spin-slow" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Không tìm thấy dữ liệu giao dịch</p>
                  </div>
                )}
             </div>
          </div>

          {/* Stats / Security Panel */}
          <div className="lg:col-span-4 space-y-8">
             <div className="p-10 rounded-[3rem] bg-indigo-50 border border-indigo-100 space-y-8">
                <div className="flex items-center gap-4 text-indigo-600">
                   <ShieldCheck size={24} />
                   <h3 className="text-xl font-black uppercase tracking-tight">SECURITY_LOG</h3>
                </div>
                <div className="space-y-6">
                   <div className="p-4 rounded-2xl bg-white/50 border border-indigo-200/50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Two-Factor</span>
                      <Badge className="bg-emerald-500 text-white text-[8px] font-bold uppercase">ACTIVE</Badge>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/50 border border-indigo-200/50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encryption</span>
                      <Badge className="bg-indigo-500 text-white text-[8px] font-bold uppercase">AES-256</Badge>
                   </div>
                   <div className="pt-4 border-t border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-900/40 uppercase leading-relaxed">
                         Tất cả giao dịch trên hệ thống SaaS được bảo mật bởi lớp giao thức SSL/TLS và mã hóa dữ liệu đầu-cuối.
                      </p>
                   </div>
                </div>
             </div>

             <motion.div 
               whileHover={{ scale: 1.02 }}
               className="p-10 rounded-[3rem] bg-indigo-600 text-white space-y-6 cursor-pointer relative overflow-hidden group shadow-2xl shadow-indigo-200"
             >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                   <WalletIcon size={120} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">NÂNG CẤP HỘI VIÊN</h3>
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Hoàn tiền 2% cho mỗi giao dịch qua ví SaaS</p>
                  <Button className="w-full bg-white text-indigo-600 font-extrabold uppercase text-[10px] tracking-widest rounded-xl h-12">
                    CHI TIẾT ƯU ĐÃI
                  </Button>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
