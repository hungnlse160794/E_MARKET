import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  ArrowUpRight,
  Package,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react"
import { useState, useMemo } from 'react'
import { useProducts, useProductStats, useCreateProduct, useUpdateProduct } from "@/features/product/hooks/useProducts"
import { useCategories } from "@/features/product/hooks/useCategories"
import { useAuthStore } from "@/stores/useAuthStore"
import { toast } from "sonner"
import { useBranches } from "@/features/branch/hooks/useBranches"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageContainer } from "@/components/premium/PageContainer"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ProductModal } from "@/features/product/components/ProductModal"
import type { IProduct } from "@/types"
import type { ProductInput } from "@/schemas/productSchema"

const STAT_CONFIG = [
  { label: 'Tổng sản phẩm', key: 'total' as const, icon: <Package size={16} />, bgLight: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-100' },
  { label: 'Sắp hết hàng', key: 'lowStock' as const, icon: <AlertCircle size={16} />, bgLight: 'bg-amber-50', textColor: 'text-amber-600', borderColor: 'border-amber-100', highlight: true },
  { label: 'Hết hàng', key: 'outOfStock' as const, icon: <Clock size={16} />, bgLight: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-100' },
  { label: 'Khuyến mãi', key: 'activePromotions' as const, icon: <ArrowUpRight size={16} />, bgLight: 'bg-teal-50', textColor: 'text-teal-600', borderColor: 'border-teal-100' },
]

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  // === BRANCH SELECTION LOGIC ===
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

  const { data: stats, isLoading: isStatsLoading } = useProductStats();
  const { data: productData, isLoading: isListLoading } = useProducts(activeBranchId, { 
    search: searchTerm,
    page: currentPage,
    limit: 10
  });

  const { data: categoriesData } = useCategories(activeBranchId);
  
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();

  const handleCreate = () => {
    if (!activeBranchId) {
      toast.error("Vui lòng chọn hoặc thêm chi nhánh trước khi tạo sản phẩm");
      return;
    }
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: IProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: ProductInput) => {
    const payload = {
      ...data,
      shopId: user?.shopId,
      branchId: activeBranchId,
    };
    
    if (selectedProduct) {
      updateProduct({ id: selectedProduct._id, data: payload }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createProduct(payload, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const renderStats = () => {
    if (isStatsLoading) return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );

    return (
      <StaggerContainer staggerDelay={0.05} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {STAT_CONFIG.map((item, idx) => (
          <MotionWrapper key={idx} variant="staggerItem" className={`bg-white border ${item.borderColor} p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
              <div className={`h-9 w-9 rounded-xl ${item.bgLight} flex items-center justify-center ${item.textColor} group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-800">{stats?.[item.key] || 0}</span>
              <span className="text-[10px] font-medium text-slate-300">sản phẩm</span>
            </div>
          </MotionWrapper>
        ))}
      </StaggerContainer>
    );
  }

  const renderTable = () => {
    if (isListLoading) return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );

    return (
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[80px] text-center font-bold text-[10px] uppercase tracking-widest text-slate-400 py-5">Mã</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Sản phẩm</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Danh mục</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Đơn giá</TableHead>
              <TableHead className="text-center font-bold text-[10px] uppercase tracking-widest text-slate-400">Trạng thái</TableHead>
              <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-slate-400 px-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!productData || productData.docs.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                   <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                         <Search className="text-slate-300" size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-400">Không có sản phẩm nào được tìm thấy</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : productData?.docs?.map((product: IProduct) => (
              <TableRow key={product._id} className="group hover:bg-indigo-50/30 transition-all border-slate-100">
                <TableCell className="text-center py-5">
                  <span className="text-[10px] font-semibold text-slate-300">{product._id.split('-')[0]}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl border border-slate-100 p-0.5 bg-white overflow-hidden shadow-sm shrink-0">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-700">{product.name}</span>
                      <span className="text-[10px] font-medium text-slate-400">Đồng bộ OK</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-slate-200 text-slate-500 bg-slate-50 px-3 py-1 font-semibold text-[11px]">
                    {typeof product.categoryId === 'object' ? product.categoryId.name : product.categoryId}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {product.units?.map((unit, idx: number) => (
                      <div key={idx} className={`flex items-center gap-2 ${unit.isDefault ? 'opacity-100' : 'opacity-40 group-hover:opacity-70 transition-opacity'}`}>
                        <span className="text-sm font-bold text-slate-700 tabular-nums">{unit.price.toLocaleString()}đ</span>
                        <span className="text-[10px] font-medium text-slate-400">/ {unit.unitName}</span>
                        {unit.isDefault && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={product.status === 'AVAILABLE' ? 'success' : 'destructive'}
                    className="h-7 min-w-[90px] justify-center text-[10px]"
                  >
                    {product.status === 'AVAILABLE' ? 'Còn hàng' : product.status === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Ẩn'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                      onClick={() => handleEdit(product)}
                    >
                      <ExternalLink size={14} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 transition-all">
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="p-2 w-48 rounded-2xl shadow-2xl border-slate-100">
                        <DropdownMenuItem 
                          className="rounded-xl font-bold text-xs py-3 text-slate-600 flex items-center gap-3 cursor-pointer"
                          onClick={() => handleEdit(product)}
                        >
                          <ArrowUpRight size={14} />
                          Sửa thông tin
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 text-slate-600 flex items-center gap-3 cursor-pointer">
                          <Package size={14} />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-xl font-bold text-xs py-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-3 cursor-pointer"
                          onClick={() => {
                            if(confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
                              toast.success("Đã xóa sản phẩm");
                            }
                          }}
                        >
                          <AlertCircle size={14} />
                          Xóa sản phẩm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Premium Pagination Footer */}
        {!isListLoading && productData && productData.totalPages > 0 && (
          <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex flex-col gap-1">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                 Trang {productData.page} / {productData.totalPages}
               </span>
               <div className="h-1 w-24 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500" 
                    style={{ width: `${(productData.docs.length / productData.totalDocs) * 100}%` }}
                  />
               </div>
             </div>

             <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  disabled={!productData.hasPrevPage}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-9 px-4 border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-30"
                >
                   Sau
                </Button>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100">
                   {Array.from({ length: productData.totalPages }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <Button
                          key={p}
                          variant="ghost"
                          onClick={() => setCurrentPage(p)}
                          className={`h-7 min-w-[28px] px-2 rounded-lg text-[10px] font-black ${
                             productData.page === p ? "bg-indigo-50 text-indigo-600" : "text-slate-400"
                          }`}
                        >
                          {p}
                        </Button>
                      )
                   })}
                </div>

                <Button 
                  variant="outline" 
                  disabled={!productData.hasNextPage}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="h-9 px-4 bg-indigo-600 border-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 hover:border-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-30"
                >
                   Tiếp
                </Button>
             </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <PageContainer className="p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 pb-10 border-b border-slate-100">
          <StaggerContainer staggerDelay={0.05}>
            <MotionWrapper variant="slideUp" className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-1.5 w-10 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Quản lý kho hàng</p>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
                Sản phẩm <br />
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Hệ thống.</span>
              </h1>
            </MotionWrapper>
          </StaggerContainer>
          
          <MotionWrapper variant="fadeIn" delay={0.2} className="flex flex-col sm:flex-row items-center gap-4">
             {/* Branch Selector */}
             {isShopOwner && (
               <Select value={activeBranchId || ""} onValueChange={setSelectedBranchId}>
                 <SelectTrigger className="h-12 w-[240px] px-6 bg-slate-50 border-slate-200 rounded-xl font-bold text-[11px] uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
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
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <Input 
                  placeholder="Tìm kiếm sản phẩm..." 
                  className="h-12 w-[300px] pl-12 pr-6 bg-slate-50 border-slate-200 rounded-xl font-medium text-[13px] focus:ring-indigo-500 focus:border-indigo-300 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button variant="ghost" className="h-12 w-12 p-0 rounded-xl border border-slate-200 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                <Filter size={16} />
             </Button>
              <Button 
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-[12px] uppercase tracking-wider hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                onClick={handleCreate}
                disabled={!activeBranchId}
              >
                Thêm mới <Plus size={16} className="ml-2 opacity-70" />
              </Button>
          </MotionWrapper>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-8">
           {renderStats()}
           {renderTable()}
        </div>

        {/* Form Modal */}
        {isModalOpen && activeBranchId && (
          <ProductModal 
            isOpen={isModalOpen}
            initialData={selectedProduct}
            categories={categoriesData}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleFormSubmit}
          />
        )}

      </div>
    </PageContainer>
  )
}
