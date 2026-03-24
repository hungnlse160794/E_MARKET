import { useParams, Link } from "react-router-dom"
import { 
  MapPin, 
  Phone, 
  Clock, 
  ArrowLeft,
  Info,
  ShoppingBag,
  Star
} from "lucide-react"
import { useBranchById } from "./hooks/useBranches"
import { useProducts } from "../product/hooks/useProducts"
import { formatPrice } from "@/utils/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { PATHS } from "@/routes/paths"

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: branch, isLoading: isBranchLoading } = useBranchById(id || null);
  const { data: productsData, isLoading: isProductsLoading } = useProducts(id || null, { limit: 8 });

  if (isBranchLoading) {
    return (
      <div className="bg-[#FAF9F7] min-h-screen pt-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 space-y-8">
          <Skeleton className="h-[300px] w-full rounded-4xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-[#FBFCFE]">
         <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
           <Info size={40} />
         </div>
         <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy chi nhánh</h2>
            <p className="text-slate-500">Chi nhánh này không tồn tại hoặc đã ngừng hoạt động.</p>
         </div>
         <Link to={PATHS.PRODUCTS}>
            <Button variant="outline" className="rounded-full px-8">
               Quay lại mua sắm
            </Button>
         </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-[90px]">
      {/* Hero Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
         <Link to={PATHS.PRODUCTS} className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-8">
            <ArrowLeft size={16} /> Quay lại danh sách
         </Link>

         <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl z-0" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-xl">
                        {branch.isOpen ? 'Đang hoạt động' : 'Tạm đóng cửa'}
                     </Badge>
                     <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                        <Star size={16} className="fill-amber-400" />
                        <span>4.9 (2k+ đánh giá)</span>
                     </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                     {branch.branchName}
                  </h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                           <MapPin size={20} />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ</p>
                           <p className="text-[14px] font-bold text-slate-700 leading-snug">{branch.address.fullAddress}</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                           <Phone size={20} />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</p>
                           <p className="text-[14px] font-bold text-slate-700">{branch.contactPhone || 'Chưa cập nhật'}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-50/50 rounded-3xl p-8 border border-white/50 backdrop-blur-sm self-center">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Clock className="text-indigo-500" size={20} />
                           <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Giờ mở cửa</span>
                        </div>
                        <span className="text-[14px] font-bold text-slate-900">
                           {branch.workingHours?.open || '08:00'} - {branch.workingHours?.close || '22:00'}
                        </span>
                     </div>
                     <div className="h-px bg-slate-200" />
                     <Button className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg transition-all">
                        CHỈ ĐƯỜNG ĐẾN ĐÂY
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Featured Products at this Branch */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20">
         <div className="flex items-center justify-between mb-12">
            <div className="space-y-2">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sản Phẩm Tại Chi Nhánh</h2>
               <p className="text-slate-500 font-medium tracking-wide">Khám phá các ưu đãi đặc biệt dành riêng cho bạn</p>
            </div>
         </div>

         {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 rounded-4xl" />)}
            </div>
         ) : !productsData?.docs.length ? (
            <div className="py-20 text-center bg-white rounded-4xl border border-dashed border-slate-200">
               <p className="text-slate-400 font-bold">Hiện chưa có sản phẩm nào tại chi nhánh này.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {productsData.docs.map((product) => (
                  <motion.div 
                     key={product._id}
                     whileHover={{ y: -10 }}
                     className="group bg-white rounded-4xl border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 overflow-hidden shadow-sm"
                  >
                     <Link to={`/product/${product.slug}`} className="block aspect-square overflow-hidden bg-slate-50">
                        <img 
                           src={product.images[0]} 
                           alt={product.name} 
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                     </Link>
                     <div className="p-6 space-y-4">
                        <div className="space-y-1">
                           <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{product.name}</h3>
                           <p className="text-[12px] text-slate-500 font-medium line-clamp-1">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                           <span className="text-lg font-black text-slate-900">{formatPrice(product.units[0].price)}</span>
                           <Button size="icon" className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-none">
                              <ShoppingBag size={18} />
                           </Button>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         )}

         {productsData && productsData.totalDocs > 8 && (
            <div className="flex justify-center mt-16">
               <Link to={`/products`}>
                  <Button variant="outline" className="h-14 px-12 rounded-4xl border-slate-200 font-black text-[12px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-400 transition-all">
                     XEM TẤT CẢ SẢN PHẨM
                  </Button>
               </Link>
            </div>
         )}
      </section>
    </div>
  );
}
