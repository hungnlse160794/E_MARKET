import { useState } from "react";
import { useOrders } from "./hooks/useOrders";
import { formatCurrency, formatDate } from "@/utils/format";
import { 
  Package, 
  Search, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/premium/PageContainer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import type { IOrder, IProduct } from "@/types";
import { ReviewModal } from "../product/components/ReviewModal";

export default function OrderHistoryPage() {
  const { data: response, isLoading } = useOrders();
  const orders = response?.orders || [];

  const [reviewingItem, setReviewingItem] = useState<{ productId: string, productName: string, subOrderId: string } | null>(null);

  if (isLoading) {
    return <PageContainer><Skeleton className="h-[600px] w-full rounded-4xl" /></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-100">
                <ShoppingBag size={24} strokeWidth={2.5} />
             </div>
             <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">LỊCH_SỬ_ĐƠN_HÀNG</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">THEO DÕI VÀ QUẢN LÝ CÁC GIAO DỊCH GIAO VẬN</p>
             </div>
          </div>
        </header>

        {/* Filters/Search */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input placeholder="Tìm kiếm mã đơn hàng..." className="h-14 pl-12 rounded-2xl bg-white border-slate-100 shadow-sm transition-all focus:ring-4 focus:ring-indigo-50" />
           </div>
           <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn tất', 'Đã hủy'].map((status) => (
                <Badge key={status} className={`h-10 px-6 rounded-xl border-none font-bold text-[10px] uppercase tracking-widest cursor-pointer whitespace-nowrap ${
                  status === 'Tất cả' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}>
                   {status}
                </Badge>
              ))}
           </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
           {orders.length > 0 ? (
             orders.map((order: IOrder, idx: number) => (
               <motion.div
                 key={order._id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="group relative bg-white border border-slate-100 rounded-4xl p-8 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all overflow-hidden"
               >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                     <div className="flex items-center gap-8">
                        <div className={`h-20 w-20 rounded-3xl flex items-center justify-center ${
                           order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-500' :
                           order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'
                        }`}>
                           {order.status === 'SHIPPING' ? <Truck size={32} /> : 
                            order.status === 'COMPLETED' ? <CheckCircle2 size={32} /> : 
                            order.status === 'PENDING' ? <Clock size={32} /> : <Package size={32} />}
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">ORDER_{order._id.slice(-8).toUpperCase()}</span>
                              <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest ${
                                 order.status === 'COMPLETED' ? 'text-emerald-500 border-emerald-100' :
                                 order.status === 'CANCELLED' ? 'text-rose-500 border-rose-100' : 'text-amber-500 border-amber-100'
                              }`}>
                                 {order.status}
                              </Badge>
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NGÀY KHỞI TẠO: {formatDate(order.createdAt)}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-12 lg:text-right">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">TỔNG GIÁ TRỊ</p>
                           <p className="text-3xl font-black text-slate-900 font-mono tracking-tighter">{formatCurrency(order.totalAmount)}</p>
                        </div>
                        <Link to={PATHS.ORDER_DETAIL.replace(':id', order._id)}>
                           <Button className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-100 transition-all flex items-center justify-center">
                              <ChevronRight size={20} strokeWidth={3} />
                           </Button>
                        </Link>
                     </div>
                  </div>

                  {/* Order Preview Items */}
                  <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap items-center gap-4">
                     {order.items.map((item, i) => (
                       <div key={i} className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 pr-4 shrink-0 hover:bg-white hover:border-indigo-100 transition-all group/item">
                          <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                             {typeof item.productId === 'object' && 'images' in item.productId ? (
                               <img src={(item.productId as IProduct).images[0]} className="h-full w-full object-cover" />
                             ) : (
                               <Package size={20} className="text-slate-300" />
                             )}
                          </div>
                          <div className="space-y-0.5 max-w-[150px]">
                             <p className="text-[11px] font-black text-slate-700 uppercase leading-none truncate">
                                {typeof item.productId === 'object' && 'name' in item.productId ? (item.productId as IProduct).name : 'Product'}
                             </p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Số lượng: {item.quantity}</p>
                          </div>
                          
                          {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setReviewingItem({
                                productId: typeof item.productId === 'string' ? item.productId : (item.productId as IProduct)._id,
                                productName: typeof item.productId === 'object' && 'name' in item.productId ? (item.productId as IProduct).name : 'Sản phẩm',
                                subOrderId: order._id
                              })}
                              className="h-8 px-3 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                               ĐÁNH GIÁ
                            </Button>
                          )}
                       </div>
                     ))}
                  </div>
               </motion.div>
             ))
           ) : (
             <div className="py-32 flex flex-col items-center justify-center space-y-8 bg-white border border-dashed border-slate-200 rounded-4xl">
                <div className="h-24 w-24 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                   <Package size={48} />
                </div>
                <div className="text-center space-y-2">
                   <h3 className="text-xl font-black text-slate-900 uppercase">NO_ORDER_DATA</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bạn chưa thực hiện bất kỳ giao dịch nào trên hệ thống.</p>
                </div>
                <Link to={PATHS.PRODUCTS}>
                   <Button className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100">
                      BẮT ĐẦU MUA SẮM NGAY
                   </Button>
                </Link>
             </div>
           )}
        </div>
      </div>

      {reviewingItem && (
        <ReviewModal 
          isOpen={!!reviewingItem}
          onClose={() => setReviewingItem(null)}
          productId={reviewingItem.productId}
          productName={reviewingItem.productName}
          subOrderId={reviewingItem.subOrderId}
        />
      )}
    </PageContainer>
  );
}
