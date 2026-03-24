import { useState, useMemo } from "react"
import { useProducts } from "./hooks/useProducts"
import { useCategories } from "./hooks/useCategories"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  LayoutGrid, 
  List, 
  Search, 
  SlidersHorizontal, 
  Star, 
  Heart,
  X,
  ChevronDown,
  ShoppingBag,
  ArrowUpDown
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import type { IProductFilter, IProduct } from "./types"
import { formatPrice } from "@/utils/format"
import { useAuthStore } from "@/stores/useAuthStore"
import { useBranches } from "@/features/branch/hooks/useBranches"


export default function ProductListPage() {
  const { user } = useAuthStore();
  const isBranchManager = user?.role === 'BRANCH_MANAGER';
  const isShopOwner = user?.role === 'SHOP_OWNER';

  const getBranchId = (branch: string | { _id: string } | null | undefined) => {
    if (!branch) return null;
    return typeof branch === 'string' ? branch : branch._id || null;
  };

  const { data: branchesData } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const activeBranchId = useMemo(() => {
    if (isBranchManager) return getBranchId(user?.branchId);
    if (selectedBranchId) return selectedBranchId;
    if (isShopOwner && branchesData?.branches?.length) {
       const sorted = [...branchesData.branches].sort((a, b) => a.branchName.localeCompare(b.branchName));
       return sorted[0]._id;
    }
    return null;
  }, [isBranchManager, user?.branchId, selectedBranchId, isShopOwner, branchesData]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filter, setFilter] = useState<IProductFilter>({
    page: 1,
    limit: 12,
    sortBy: 'newest'
  });

  const { data: productsData, isLoading } = useProducts(activeBranchId, filter);
  const { data: categories } = useCategories(activeBranchId);

  const [localPriceRange, setLocalPriceRange] = useState<number[]>([filter.minPrice || 0, filter.maxPrice || 50000000]);

  const handlePriceChange = (values: number[]) => {
    setLocalPriceRange(values);
  };

  const handlePriceCommit = (values: number[]) => {
    setFilter(prev => ({ ...prev, minPrice: values[0], maxPrice: values[1] }));
  };

  const handleCategoryToggle = (catId: string) => {
    setFilter(prev => ({
      ...prev,
      category: prev.category === catId ? undefined : catId
    }));
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filter.category) count++;
    if (filter.minPrice || filter.maxPrice) count++;
    if (filter.rating) count++;
    if (filter.search) count++;
    return count;
  }, [filter]);

  const getCategoryName = (id: string | { _id: string; name: string }) => {
    if (typeof id === 'object' && id !== null) return id.name;
    return categories?.find(c => c._id === id)?.name || (typeof id === 'string' ? id : 'Không rõ');
  };

  const clearFilters = () => {
    setFilter({
      page: 1,
      limit: 12,
      sortBy: 'newest'
    });
    setLocalPriceRange([0, 50000000]);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Bộ Sưu Tập <br />
              <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Sản Phẩm Đẳng Cấp.</span>
            </h1>
            <p className="text-slate-500 font-semibold tracking-wide flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200" />
              {isLoading ? 'Đang cập nhật sản phẩm...' : `Tìm thấy ${productsData?.docs.length || 0} sản phẩm trong kho`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {isShopOwner && (
               <Select value={activeBranchId || ""} onValueChange={setSelectedBranchId}>
                 <SelectTrigger className="h-12 w-[240px] px-6 bg-white border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
                   <SelectValue placeholder="Chọn chi nhánh" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl p-2 border-slate-100 shadow-2xl bg-white">
                   {branchesData?.branches?.map(b => (
                     <SelectItem key={b._id} value={b._id} className="rounded-xl py-3 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-50">
                       {b.branchName}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             )}
             <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <Input 
                   placeholder="Tìm sản phẩm..."
                   value={filter.search || ''}
                   onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                   className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700 font-medium"
                />
             </div>
             <Button 
               variant="outline" 
               className="md:hidden h-12 w-12 rounded-2xl p-0 shrink-0"
               onClick={() => setShowMobileFilters(true)}
             >
                <SlidersHorizontal size={20} />
             </Button>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-72 shrink-0 space-y-10">
            {/* Category Filter */}
            <div className="space-y-5">
              <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2 mb-4">
                Danh Mục
                <ChevronDown size={14} className="text-slate-300" />
              </h3>
              <div className="space-y-3">
                {categories?.map((cat) => (
                  <label 
                    key={cat._id}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <Checkbox 
                      checked={filter.category === cat._id}
                      onCheckedChange={() => handleCategoryToggle(cat._id)}
                      className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <span className={`text-[14px] font-medium transition-colors ${filter.category === cat._id ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-800'}`}>
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-5">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Khoảng Giá</h3>
              <div className="px-2 space-y-6">
                <Slider 
                  min={0}
                  max={50000000}
                  step={500000}
                  value={localPriceRange}
                  onValueChange={handlePriceChange}
                  onValueCommit={handlePriceCommit}
                  className="py-4"
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                    <span className="text-[10px] block text-slate-400 font-black uppercase mb-0.5">Từ</span>
                    <span className="text-[13px] font-extrabold text-slate-900 tabular-nums">{formatPrice(localPriceRange[0])}</span>
                  </div>
                  <div className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                    <span className="text-[10px] block text-slate-400 font-black uppercase mb-0.5">Đến</span>
                    <span className="text-[13px] font-extrabold text-slate-900 tabular-nums">{formatPrice(localPriceRange[1])}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-5">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Đánh Giá</h3>
              <div className="space-y-3">
                {[5, 4, 3].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setFilter(prev => ({ ...prev, rating: prev.rating === star ? undefined : star }))}
                    className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
                      filter.rating === star 
                        ? 'border-indigo-200 bg-indigo-50/30 text-indigo-600 shadow-sm' 
                        : 'border-transparent text-slate-500 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < star ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                        />
                      ))}
                      <span className="text-[13px] font-bold ml-2">Từ {star} sao</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Reset Filters */}
            {activeFiltersCount > 0 && (
               <Button 
                 variant="ghost" 
                 onClick={clearFilters}
                 className="w-full h-12 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 font-bold text-[13px] gap-2 transition-all"
               >
                  <X size={16} />
                  XÓA BỘ LỌC ({activeFiltersCount})
               </Button>
            )}
          </aside>

          {/* Product Grid Area */}
          <section className="flex-1 space-y-8">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md">
               <div className="flex items-center gap-2">
                  <Button 
                    variant={view === 'grid' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    onClick={() => setView('grid')}
                    className="rounded-xl w-10 h-10"
                  >
                    <LayoutGrid size={18} />
                  </Button>
                  <Button 
                    variant={view === 'list' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    onClick={() => setView('list')}
                    className="rounded-xl w-10 h-10"
                  >
                    <List size={18} />
                  </Button>
               </div>

               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                     <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Sắp xếp:</span>
                      <Select 
                        value={filter.sortBy} 
                        onValueChange={(v) => setFilter(prev => ({ ...prev, sortBy: v as IProductFilter['sortBy'] }))}
                      >
                        <SelectTrigger className="w-[200px] h-11 border border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50/50 rounded-xl font-bold text-[13px] focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 shadow-sm">
                           <div className="flex items-center gap-2">
                             <ArrowUpDown size={14} className="text-slate-400" />
                             <SelectValue />
                           </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border border-slate-200 shadow-2xl bg-white p-2">
                           <SelectItem value="newest" className="font-extrabold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 rounded-lg cursor-pointer py-3 transition-colors">Mới nhất</SelectItem>
                           <SelectItem value="price-asc" className="font-extrabold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 rounded-lg cursor-pointer py-3 transition-colors">Giá từ thấp đến cao</SelectItem>
                           <SelectItem value="price-desc" className="font-extrabold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 rounded-lg cursor-pointer py-3 transition-colors">Giá từ cao đến thấp</SelectItem>
                           <SelectItem value="rating-desc" className="font-extrabold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 rounded-lg cursor-pointer py-3 transition-colors">Đánh giá tốt nhất</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
            </div>

            {/* Products List */}
            {isLoading ? (
               <div className={`grid gap-8 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 space-y-4">
                       <Skeleton className="aspect-square w-full rounded-2xl" />
                       <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                       </div>
                    </div>
                  ))}
               </div>
            ) : productsData?.docs.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                     <Search size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-700">Không tìm thấy sản phẩm</h3>
                    <p className="text-slate-400 font-medium">Bạn hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác nhé.</p>
                  </div>
                  <Button onClick={clearFilters} className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700">
                    Xóa tất cả bộ lọc
                  </Button>
               </div>
            ) : (
               <div className={`grid gap-8 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {productsData?.docs.map((product: IProduct) => (
                    <motion.div 
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`group bg-white rounded-[2rem] border border-slate-200 hover:border-indigo-200 hover:shadow-[0_20px_40px_rgba(79,70,229,0.06)] transition-all duration-500 flex ${view === 'grid' ? 'flex-col' : 'flex-row gap-8'} overflow-hidden relative shadow-sm`}
                    >
                       <Link to={`/product/${product.slug}`} className={`relative overflow-hidden shrink-0 ${view === 'grid' ? 'aspect-square' : 'w-64 aspect-square'}`}>
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                             <Button variant="secondary" size="icon" className="rounded-full shadow-lg h-10 w-10 bg-white/90 backdrop-blur-md">
                                <Heart size={18} className="text-slate-400 hover:text-rose-500 transition-colors" />
                             </Button>
                          </div>
                          {product.status === 'OUT_OF_STOCK' && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                               <Badge variant="destructive" className="px-4 py-1 rounded-full uppercase tracking-widest text-[10px] shadow-lg">Hết hàng</Badge>
                            </div>
                          )}
                       </Link>

                       <div className="p-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                 <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xs">
                                    {getCategoryName(product.categoryId)}
                                 </Badge>
                                <div className="flex items-center gap-1">
                                   <Star className="fill-amber-400 text-amber-400" size={14} />
                                   <span className="text-[12px] font-bold text-slate-700">{product.rating}</span>
                                </div>
                             </div>
                             <Link to={`/product/${product.slug}`}>
                                 <h3 className="text-[17px] font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors duration-300">
                                   {product.name}
                                 </h3>
                             </Link>
                             <p className="text-[13px] text-slate-600 line-clamp-2 leading-relaxed font-semibold">
                                {product.description}
                             </p>
                          </div>

                          <div className="mt-8 flex items-center justify-between gap-4">
                             <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Giá chỉ từ</span>
                                <span className="text-2xl font-black text-slate-900 tracking-tight">{product.units?.[0]?.price !== undefined ? formatPrice(product.units[0].price) : "Liên hệ"}</span>
                             </div>
                              <Button className="h-12 w-12 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 shadow-xl shadow-indigo-200/50 shrink-0 group/btn transition-all duration-300 hover:scale-105 active:scale-95 border border-indigo-400/30 overflow-hidden">
                                 <ShoppingBag size={20} className="text-white drop-shadow-sm group-hover:rotate-12 transition-transform" />
                              </Button>
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            )}
            
            {/* Pagination Placeholder */}
            {productsData && productsData.totalPages > 1 && (
               <div className="flex justify-center pt-10">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                     {Array.from({ length: productsData.totalPages }).map((_, i) => (
                        <Button 
                          key={i}
                          variant={filter.page === i + 1 ? 'default' : 'ghost'}
                          className={`w-10 h-10 rounded-xl font-bold ${filter.page === i + 1 ? 'bg-indigo-600' : 'text-slate-500'}`}
                          onClick={() => setFilter(prev => ({ ...prev, page: i + 1 }))}
                        >
                          {i + 1}
                        </Button>
                     ))}
                  </div>
               </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowMobileFilters(false)}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[60] p-8 shadow-2xl md:hidden overflow-y-auto"
            >
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold text-slate-800 font-serif">Bộ lọc</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)} className="rounded-full">
                     <X size={24} />
                  </Button>
               </div>
               
               <div className="space-y-10">
                  {/* Category Filter Mobile */}
                  <div className="space-y-5">
                    <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-800">Danh Mục</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {categories?.map((cat) => (
                        <button 
                          key={cat._id}
                          onClick={() => handleCategoryToggle(cat._id)}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            filter.category === cat._id 
                              ? 'border-indigo-200 bg-indigo-50/30 text-indigo-600 shadow-sm' 
                              : 'border-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="text-[14px] font-bold">{cat.name}</span>
                          {filter.category === cat._id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter Mobile */}
                  <div className="space-y-5">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Khoảng Giá</h3>
                    <div className="px-2 space-y-6">
                      <Slider 
                        min={0}
                        max={50000000}
                        step={500000}
                        value={localPriceRange}
                        onValueChange={handlePriceChange}
                        onValueCommit={handlePriceCommit}
                        className="py-4"
                      />
                      <div className="flex gap-4">
                        <div className="flex-1 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                          <span className="text-[10px] block text-slate-400 font-black uppercase mb-0.5">Từ</span>
                          <span className="text-[14px] font-extrabold text-slate-900">{formatPrice(localPriceRange[0])}</span>
                        </div>
                        <div className="flex-1 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                          <span className="text-[10px] block text-slate-400 font-black uppercase mb-0.5">Đến</span>
                          <span className="text-[14px] font-extrabold text-slate-900">{formatPrice(localPriceRange[1])}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter Mobile */}
                  <div className="space-y-5">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Đánh Giá</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {[5, 4, 3].map((star) => (
                        <button 
                          key={star}
                          onClick={() => setFilter(prev => ({ ...prev, rating: prev.rating === star ? undefined : star }))}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            filter.rating === star 
                              ? 'border-indigo-200 bg-indigo-50/30 text-indigo-600 shadow-sm' 
                              : 'border-slate-100 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < star ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                              />
                            ))}
                            <span className="text-[14px] font-bold ml-2">Từ {star} sao</span>
                          </div>
                          {filter.rating === star && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="ghost" 
                      onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                      className="w-full h-14 rounded-2xl text-rose-500 hover:bg-rose-50 font-black text-[11px] gap-2 transition-all uppercase tracking-widest"
                    >
                      Xóa tất cả ( {activeFiltersCount} )
                    </Button>
                  )}

                  <Button 
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest"
                  >
                    ÁP DỤNG
                  </Button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
