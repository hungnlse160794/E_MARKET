import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Zap,
  Info,
  ArrowLeft
} from "lucide-react"
import { useProduct } from "./hooks/useProducts"
import { useCart } from "../cart/hooks/useCart"
import { formatCurrency } from "@/utils/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");
  
  // Cart integration
  const roomCode = localStorage.getItem("cart_room_code") || undefined;
  const { addItem, isAdding } = useCart(roomCode);
  
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
    } catch {
      toast.error("Không thể thêm vào giỏ hàng. Hãy tham gia phòng trước.");
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

  return (
    <div className="bg-[#FAF9F7] min-h-screen font-sans text-[#1a1f2c] pt-[90px]">
      
      {/* Dynamic Header */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8">
         <Link to="/products" className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
            <ArrowLeft size={16} /> Quay lại danh sách
         </Link>
      </div>

      {/* Top Section */}
      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-16">
          
          {/* Left: Gallery */}
          <div className="flex gap-6 h-[700px]">
            {/* Thumbnails */}
            <div className="flex flex-col gap-4 w-24 shrink-0 overflow-y-auto pr-2 no-scrollbar">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-[120px] bg-white transition duration-300 p-1 flex items-center justify-center relative overflow-hidden rounded-lg group ${activeImage === idx ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#FAF9F7]' : 'opacity-70 hover:opacity-100 border border-slate-100'}`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform duration-500" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <motion.div 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 bg-white relative flex items-center justify-center h-full rounded-2xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50"
            >
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-start pt-4">
            
            <div className="flex items-center gap-4 mb-6">
               <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg">
                  {typeof product.categoryId === 'object' ? product.categoryId.name : product.categoryId}
               </Badge>
               <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                 <Star size={14} className="fill-amber-400 text-amber-400" />
                 <span>{product.rating} (Đánh giá tuyệt vời)</span>
               </div>
            </div>
            
            <h1 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
              {product.name}
            </h1>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8">
               <div className="flex flex-col gap-1 mb-6">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Giá niêm yết</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-slate-900">{formatCurrency(selectedUnit.price)}</span>
                    <span className="text-[14px] text-slate-400 font-bold">/ {selectedUnit.unitName}</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 text-[12px] text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl w-fit">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sẵn sàng giao ngay trong 30-45 phút</span>
               </div>
            </div>

            {/* Units Selection */}
            <div className="mb-8">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                 LỰA CHỌN ĐƠN VỊ
               </div>
               <div className="flex flex-wrap gap-3">
                  {product.units.map((unit, idx) => (
                    <button 
                      key={unit.unitName} 
                      onClick={() => setSelectedUnitIndex(idx)}
                      className={`px-8 h-14 flex items-center justify-center text-[13px] font-black tracking-widest rounded-2xl transition-all border ${selectedUnitIndex === idx ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 shadow-sm'}`}
                    >
                      {unit.unitName.toUpperCase()}
                    </button>
                  ))}
               </div>
            </div>

            {/* Quantity selection */}
            <div className="mb-10">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                 SỐ LƯỢNG
               </div>
               <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold w-12 text-center tabular-nums">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl bg-slate-900 text-white hover:bg-black transition-all font-bold text-lg shadow-lg"
                  >
                    +
                  </button>
               </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-10">
              <Button 
                onClick={handleAddToCart}
                disabled={isAdding || product.status === 'OUT_OF_STOCK'}
                className="flex-1 h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl text-[14px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 transition-all gap-3 overflow-hidden group"
              >
                <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                {isAdding ? 'ĐANG XỬ LÝ...' : 'THÊM VÀO GIỎ'}
              </Button>
              <Button 
                variant="outline" 
                className="w-20 h-20 rounded-3xl border-slate-200 text-slate-800 hover:bg-white hover:border-slate-400 transition-all shadow-sm"
              >
                 <Zap size={24} className="fill-amber-400 text-amber-400 border-none" />
              </Button>
            </div>

            {/* Safety Blocks */}
            <div className="grid grid-cols-2 gap-4 mb-2">
               <div className="p-6 rounded-4xl bg-white border border-slate-50 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                     <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ĐẢM BẢO</p>
                     <p className="text-[12px] font-bold text-slate-700">Chính hãng 100%</p>
                  </div>
               </div>
               <div className="p-6 rounded-4xl bg-white border border-slate-50 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                     <Zap size={20} />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GIAO NHANH</p>
                     <p className="text-[12px] font-bold text-slate-700">Trong nội thành</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
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
    </div>
  )
}
