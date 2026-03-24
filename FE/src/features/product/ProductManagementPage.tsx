import { Plus, Search, MoreVertical, Edit, Trash2, Eye, LayoutGrid, RefreshCcw } from "lucide-react"
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from "framer-motion"

import { useProducts, useDeleteProduct, useCreateProduct, useUpdateProduct } from "@/features/product/hooks/useProducts"
import { useCategories } from "@/features/product/hooks/useCategories"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageContainer } from "@/components/premium/PageContainer"
import { MotionWrapper } from "@/components/premium/MotionWrapper"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/stores/useAuthStore"
import { ProductModal } from "./components/ProductModal"
import type { IProduct } from "@/types"
import { useBranches } from "@/features/branch/hooks/useBranches"
import { formatPrice } from "@/utils/format"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ProductManagementPage() {
  const { user } = useAuthStore();
  const isBranchManager = user?.role === 'BRANCH_MANAGER';
  const isShopOwner = user?.role === 'SHOP_OWNER';

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  
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

  const { data: productsData, isLoading, isError, refetch } = useProducts(activeBranchId, {
     search: searchTerm,
     category: selectedCategory !== 'all' ? selectedCategory : undefined,
     page: currentPage,
     limit: 10
  });
  const { data: categories } = useCategories(activeBranchId);
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  if (isError) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-rose-50 border border-rose-100 rounded-[3rem] p-16 flex flex-col items-center gap-6 text-center shadow-sm max-w-lg">
          <RefreshCcw size={48} className="text-rose-500 animate-spin-slow" />
          <h3 className="text-2xl font-black text-rose-900 leading-tight">Mất kết nối dữ liệu</h3>
          <p className="text-rose-600/60 font-bold text-sm uppercase tracking-widest leading-loose">Hệ thống gặp sự cố khi tải dữ liệu sản phẩm.</p>
          <Button onClick={() => refetch()} className="rounded-2xl h-14 px-8 font-black bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-xl shadow-rose-200">Thử tải lại ngay</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="p-4 md:p-10 bg-slate-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 pb-12 border-b border-slate-100">
          <MotionWrapper className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Quản lý Kho hàng</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-800 leading-[0.9]">
              Danh sách <br />
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent italic">Sản phẩm.</span>
            </h1>
          </MotionWrapper>

          <MotionWrapper className="flex flex-col sm:flex-row items-center gap-5">
            {isShopOwner && (
              <Select value={activeBranchId || ""} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="h-14 w-[240px] px-6 bg-white border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
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

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 w-[200px] px-6 bg-white border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
                  <SelectValue placeholder="Lọc danh mục" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-2 border-slate-100 shadow-2xl bg-white">
                  <SelectItem value="all" className="rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer">Tất cả danh mục</SelectItem>
                  {categories?.map(cat => (
                    <SelectItem key={cat._id} value={cat._id} className="rounded-xl font-bold py-3 text-sm cursor-pointer hover:bg-slate-50">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>

            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all duration-300" size={18} />
              <Input 
                placeholder="Tìm sản phẩm..." 
                className="h-14 w-[320px] pl-14 pr-8 bg-white border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button 
              className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200/50 transition-all duration-500 cursor-pointer"
              onClick={handleCreate}
            >
              Thêm SP <Plus size={18} className="ml-2" strokeWidth={3} />
            </Button>
          </MotionWrapper>
        </div>

        <MotionWrapper className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 min-h-[500px]">
          {isLoading || (!activeBranchId && branchesData?.branches?.length) ? (
             <div className="space-y-4">
               {[1,2,3,4,5].map(i => (
                 <Skeleton key={i} className="h-24 w-full rounded-[2rem]" />
               ))}
             </div>
          ) : !activeBranchId ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-indigo-500">
                   <LayoutGrid size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Chưa xác định chi nhánh</h3>
                <p className="text-sm font-bold text-slate-400">Vui lòng chọn một chi nhánh để quản lý sản phẩm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="hidden md:grid border-b border-slate-100 pb-4 mb-4 grid-cols-12 gap-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <div className="col-span-1">Mã</div>
                <div className="col-span-4">Thông tin sản phẩm</div>
                <div className="col-span-3">Giá & Định lượng</div>
                <div className="col-span-2 text-center">Trạng thái</div>
                <div className="col-span-2 text-right">Thao tác</div>
              </div>
              
              {!productsData || productsData.docs.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                     <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <Search className="text-slate-300" size={28} />
                     </div>
                     <h3 className="text-xl font-black text-slate-800 mb-2">Không tìm thấy sản phẩm</h3>
                     <p className="text-sm font-bold text-slate-400">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới.</p>
                 </div>
              ) : (
                <AnimatePresence>
                  {productsData?.docs?.map((product: IProduct) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={product._id} 
                      className="group flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-6 p-4 md:p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300"
                    >
                      <div className="col-span-1 hidden md:block">
                          <span className="text-[10px] font-black text-slate-300 uppercase leading-none">
                             {product._id.slice(-4)}
                          </span>
                      </div>

                      <div className="col-span-4 flex items-center gap-5 w-full">
                        <div className="h-20 w-20 rounded-2xl bg-indigo-50/50 border border-slate-100 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-300">
                              <LayoutGrid size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors truncate">
                            {product.name}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-400 truncate max-w-[200px]">{product.description || "Không có mô tả"}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {typeof product.categoryId === 'object' ? product.categoryId.name : (categories?.find(c => c._id === product.categoryId)?.name || 'Không rõ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 w-full">
                         <div className="flex flex-col gap-1.5">
                           {product.units.slice(0, 2).map((unit, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-[11px] font-bold">
                                 <span className="text-slate-400">{unit.unitName}:</span>
                                 <span className="text-emerald-600 tabular-nums">{formatPrice(unit.price)}</span>
                              </div>
                           ))}
                           {product.units.length > 2 && (
                              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                 + {product.units.length - 2} tùy chọn khác
                              </div>
                           )}
                         </div>
                      </div>

                      <div className="col-span-2 flex justify-start md:justify-center w-full">
                          <Badge 
                             variant="outline" 
                             className={`h-6 px-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-transparent ${
                                product.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' :
                                product.status === 'OUT_OF_STOCK' ? 'bg-rose-50 text-rose-600' :
                                'bg-slate-100 text-slate-500'
                             }`}
                          >
                             {product.status === 'AVAILABLE' ? 'ĐANG BÁN' :
                              product.status === 'OUT_OF_STOCK' ? 'HẾT HÀNG' : 'ĐANG ẨN'}
                          </Badge>
                      </div>

                      <div className="col-span-2 w-full flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Edit size={16} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-slate-50">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="p-2 w-48 rounded-2xl shadow-xl border-slate-100">
                               <DropdownMenuItem className="rounded-xl font-bold py-3 text-sm cursor-pointer hover:bg-slate-50">
                                 <Eye size={16} className="text-indigo-500 mr-2" /> Xem chi tiết
                               </DropdownMenuItem>
                               <DropdownMenuItem 
                                  className="rounded-xl font-bold py-3 text-sm cursor-pointer text-rose-600 hover:bg-rose-50"
                                  onClick={() => {
                                    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
                                       deleteProduct(product._id);
                                    }
                                  }}
                               >
                                 <Trash2 size={16} className="mr-2" /> Xóa sản phẩm
                               </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Premium Pagination Footer */}
          {!isLoading && productsData && productsData.totalPages > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex flex-col gap-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
                   Hiển thị <span className="text-slate-900">{productsData.docs.length}</span> / <span className="text-slate-900">{productsData.totalDocs}</span> sản phẩm
                 </p>
                 <div className="h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(productsData.docs.length / productsData.totalDocs) * 100}%` }}
                    />
                 </div>
               </div>

               <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!productsData.hasPrevPage}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 disabled:opacity-30 transition-all font-black"
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  
                  <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-xl border border-slate-100/50">
                    {Array.from({ length: productsData.totalPages }).map((_, i) => {
                       const pageNum = i + 1;
                       // Logic to show limited pages if there are many
                       if (
                         pageNum === 1 || 
                         pageNum === productsData.totalPages || 
                         (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                       ) {
                         return (
                           <Button
                             key={pageNum}
                             onClick={() => setCurrentPage(pageNum)}
                             className={`h-8 min-w-[32px] px-2 rounded-lg text-[10px] font-black transition-all ${
                               currentPage === pageNum 
                               ? "bg-white text-indigo-600 shadow-md border-indigo-100/50 scale-110" 
                               : "bg-transparent text-slate-400 hover:text-slate-600 border-transparent"
                             } border`}
                           >
                             {pageNum}
                           </Button>
                         );
                       }
                       if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <span key={pageNum} className="text-slate-300 px-1">...</span>;
                       }
                       return null;
                    })}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!productsData.hasNextPage}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 disabled:opacity-30 transition-all font-black"
                  >
                    <ChevronRight size={18} />
                  </Button>
               </div>
            </div>
          )}
        </MotionWrapper>

        {isModalOpen && activeBranchId && (
          <ProductModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialData={editingProduct}
            categories={categories}
            onSubmit={(data) => {
               const payload = {
                  ...data,
                  shopId: user?.shopId,
                  branchId: activeBranchId,
               };
               if (editingProduct) {
                  updateProduct({ id: editingProduct._id, data: payload }, {
                     onSuccess: () => setIsModalOpen(false)
                  });
               } else {
                  createProduct(payload, {
                     onSuccess: () => setIsModalOpen(false)
                  });
               }
            }}
          />
        )}
      </div>
    </PageContainer>
  )
}
