import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { 
  Star, 
  ShoppingBag, 
  Zap,
  Info,
  ArrowLeft,
  Store,
  MessageCircle,
  CheckCircle2
} from "lucide-react"
import { useProduct } from "./hooks/useProducts"
import { useCart } from "../cart/hooks/useCart"
import { formatCurrency } from "@/utils/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ReviewSection } from "./components/ReviewSection"

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");
  
  // Cart integration
  const { addItem, isAdding } = useCart();
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);

  const handleAddToCart = async () => {
    if (!product) return;
    
    const unit = product.units[selectedUnitIndex];
    try {
      await addItem({
        productId: product._id,
        quantity,
        unitName: unit.unitName,
        price: unit.price,
        shopId: typeof product.shopId === 'object' ? product.shopId._id : product.shopId,
        // branchId: product.branchId // Some products might not have a branchId yet
      });
      toast.success(`Đã thêm ${quantity} ${unit.unitName} vào giỏ hàng!`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Không thể thêm vào giỏ hàng.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#FAF9F7] min-h-screen pt-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <Skeleton className="h-[600px] w-full rounded-2xl" />
          <div className="space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-[#FBFCFE]">
         <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
           <Info size={40} />
         </div>
         <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy sản phẩm</h2>
            <p className="text-slate-500">Sản phẩm này không tồn tại hoặc đã bị gỡ bỏ.</p>
         </div>
         <Link to="/products">
            <Button variant="outline" className="rounded-full px-8">
               Quay lại danh sách
            </Button>
         </Link>
      </div>
    );
  }

  const selectedUnit = product.units[selectedUnitIndex];
  const shop = typeof product.shopId === 'object' ? product.shopId : null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#FAF9F7] min-h-screen font-sans text-[#1a1f2c] pt-[90px]"
    >
      
      {/* Dynamic Header */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8">
         <Link to="/products" className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
            <ArrowLeft size={16} /> Quay lại danh sách
         </Link>
      </div>

      {/* Top Section */}
      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Gallery (Compact) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Main Image Container (Shrink aspect ratio) */}
            <motion.div 
               layoutId="main-product-image"
               className="bg-white relative flex items-center justify-center aspect-square rounded-[24px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50"
            >
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Depth Frame for Thumbnails (No border, pure depth) */}
            <div className="bg-slate-100/50 p-4 rounded-[28px] shadow-inner mt-4">
               <div className="flex flex-wrap gap-4">
                  {product.images.map((img, idx) => (
                    <motion.button 
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveImage(idx)}
                      className={`w-14 h-14 shrink-0 bg-white p-1 rounded-xl shadow-md transition-all duration-300 ${activeImage === idx ? 'scale-110 shadow-lg shadow-black/10' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover rounded-lg" />
                    </motion.button>
                  ))}
               </div>
            </div>
          </div>
 
          {/* Right: Details & Info (Special Redesign) */}
          <div className="lg:col-span-7 flex flex-col justify-start pt-1">
            
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-3 mb-6"
            >
               <Badge className="bg-indigo-600 text-white border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-indigo-100">
                  {typeof product.categoryId === 'object' ? product.categoryId.name : product.categoryId}
               </Badge>
               <div className="h-4 w-px bg-slate-200" />
               <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                 <Star size={12} className="fill-amber-400 text-amber-400" />
                 <span>{product.rating} Rating</span>
               </div>
            </motion.div>
            
            <h1 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
              {product.name}
            </h1>

            <div className="space-y-8 bg-white/50 backdrop-blur-sm p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30">
               {/* Pricing Row */}
               <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                  <div className="space-y-1">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giá Ưu Đãi</span>
                     <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(selectedUnit.price)}</span>
                       <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">/ {selectedUnit.unitName}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-black bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest mb-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                     <span>Flash Delivery</span>
                  </div>
               </div>

               {/* Units & Quantity Group */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-5">Đơn vị tính</div>
                     <div className="flex flex-wrap gap-2">
                        {product.units.map((unit, idx) => (
                          <motion.button 
                            key={unit.unitName} 
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedUnitIndex(idx)}
                            className={`px-5 h-11 flex items-center justify-center text-[11px] font-black tracking-widest rounded-xl transition-all border ${selectedUnitIndex === idx ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-800'}`}
                          >
                            {unit.unitName.toUpperCase()}
                          </motion.button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-5">Số lượng</div>
                     <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-xl border border-slate-100 w-fit">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white transition-all font-bold">−</button>
                        <span className="text-sm font-black w-8 text-center tabular-nums">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all font-bold shadow-sm">+</button>
                     </div>
                  </div>
               </div>

               {/* Final Actions */}
               <div className="flex gap-4 pt-2">
                  <Button 
                    onClick={handleAddToCart}
                    disabled={isAdding || product.status === 'OUT_OF_STOCK'}
                    className="flex-1 h-16 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all gap-3"
                  >
                    <ShoppingBag size={18} />
                    {isAdding ? 'Đang thêm...' : 'THÊM VÀO GIỎ'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-16 h-16 rounded-2xl border-slate-200 text-slate-800 hover:border-slate-900 transition-all"
                  >
                     <Zap size={20} className="fill-amber-400 text-amber-400 border-none" />
                  </Button>
               </div>
            </div>

          </div>
        </div>

        {/* Marketplace Shop Profile Section (Inside Main - Much closer) */}
        {shop && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 p-10 overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/20 rounded-l-full blur-3xl z-0" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
               {/* Shop Identity */}
               <div className="flex items-center gap-6 pr-10 lg:border-r border-slate-100">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-[24px] overflow-hidden border-4 border-slate-50 shadow-xl">
                       <img src={shop.logo || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=200"} alt={shop.name} className="w-full h-full object-cover" />
                    </div>
                    <Badge className="absolute -bottom-1 -right-1 bg-indigo-600 text-white border-2 border-white px-1.5 py-0 rounded text-[9px] font-black">MALL</Badge>
                  </div>
                  <div className="space-y-3">
                     <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                           <h2 className="text-2xl font-black text-slate-900 tracking-tight">{shop.name}</h2>
                           <CheckCircle2 size={20} className="text-indigo-500" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Premium Partner</p>
                     </div>
                     <div className="flex gap-2">
                        <Button variant="outline" className="h-10 px-4 rounded-xl border-indigo-600 text-indigo-600 font-bold text-[11px] hover:bg-indigo-50 gap-2">
                           <MessageCircle size={14} /> CHAT
                        </Button>
                        <Button className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-lg shadow-indigo-100 gap-2">
                           <Store size={14} /> XEM SHOP
                        </Button>
                     </div>
                  </div>
               </div>

               {/* Metrics Container */}
               <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10">
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đánh giá Shop</p>
                     <p className="text-md font-black text-slate-900">4.8 <span className="text-xs font-medium text-slate-300">(1.2k)</span></p>
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng sản phẩm</p>
                     <p className="text-md font-black text-slate-900">156</p>
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tỉ lệ phản hồi</p>
                     <p className="text-md font-black text-slate-900">98%</p>
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian phản hồi</p>
                     <p className="text-md font-black text-slate-900">Vài giờ</p>
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thành viên từ</p>
                     <p className="text-md font-black text-slate-900">2 năm trước</p>
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Followers</p>
                     <p className="text-md font-black text-slate-900">5.4k</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </main>





      {/* Description Section */}
      <section className="bg-white border-y border-slate-100 py-20 mt-12">
         <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="max-w-3xl">
               <h2 className="text-2xl font-bold text-slate-800 mb-8 uppercase tracking-tight">Chi tiết sản phẩm</h2>
               <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed text-lg mb-6">
                    {product.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-4 text-slate-600 font-medium">
                     <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Chất liệu tự nhiên bền bỉ</li>
                     <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Thiết kế công thái học</li>
                     <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Dễ dàng vệ sinh bảo quản</li>
                     <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Cam kết chất lượng cao nhất</li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-white py-24">
         <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <ReviewSection productId={product._id} />
         </div>
      </section>

      {/* Similar Products Section */}
      <section className="bg-[#FAF9F7] py-32">
         <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-12 uppercase tracking-tight">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[1,2,3,4].map((i) => (
                  <div key={i} className="group cursor-pointer">
                     <div className="aspect-3/4 bg-white rounded-3xl mb-6 overflow-hidden border border-slate-100 shadow-sm relative">
                        <img 
                          src={`https://images.unsplash.com/photo-15${i+90}000000000-000000000000?auto=format&fit=crop&q=80&w=400`} 
                          alt="Related" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                     </div>
                     <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none font-bold text-[9px] uppercase tracking-widest mb-2 px-2 py-0.5">NỘI THẤT</Badge>
                     <p className="text-[15px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1">Sản phẩm tương tự {i}</p>
                     <p className="text-lg font-black text-slate-900">{formatCurrency(1200000 + i*100000)}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
    </motion.div>
  )
}
