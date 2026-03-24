import { 
  Plus, 
  Search, 
  MoreVertical,
  ExternalLink,
  LayoutGrid,
  Globe,
  Eye,
  AlertTriangle,
  RefreshCcw,
  Layers,
  ChevronRight,
  ChevronDown,
  FolderTree
} from "lucide-react"
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from "framer-motion"

import { 
  useCategories, 
  useDeleteCategory, 
  useCategory 
} from "@/features/product/hooks/useCategories"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageContainer } from "@/components/premium/PageContainer"
import { MotionWrapper } from "@/components/premium/MotionWrapper"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useAuthStore } from "@/stores/useAuthStore"
import { CategoryModal } from "./components/CategoryModal"
import type { ICategory } from "@/types"
import { useBranches } from "@/features/branch/hooks/useBranches"
import { cn } from "@/lib/utils"

interface CategoryNodeProps {
  category: ICategory;
  allCategories: ICategory[];
  level: number;
  onEdit: (cat: ICategory) => void;
  onDelete: (id: string) => void;
}

const CategoryNode = ({ category, allCategories, level, onEdit, onDelete }: CategoryNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const children = useMemo(() => {
    return allCategories.filter(cat => {
      const pId = typeof cat.parentId === 'object' ? cat.parentId?._id : cat.parentId;
      return pId === category._id;
    });
  }, [allCategories, category._id]);

  const hasChildren = children.length > 0;

  return (
    <div className="relative">
      {/* Horizontal Connector for children */}
      {level > 0 && (
        <div className="absolute left-[-32px] top-[28px] w-[32px] h-[2px] bg-indigo-100" />
      )}

      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "group relative flex items-center gap-4 p-3.5 px-5 rounded-4xl transition-all duration-500 mb-4 overflow-hidden",
          "bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-indigo-100/40 hover:-translate-y-1 hover:border-indigo-200",
        )}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Collapse/Expand Toggle */}
          {hasChildren ? (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-white hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-100 group-hover:border-indigo-200 shadow-sm cursor-pointer"
            >
              {isExpanded ? <ChevronDown size={14} className="animate-in fade-in" /> : <ChevronRight size={14} className="animate-in fade-in" />}
            </button>
          ) : (
            <div className="h-8 w-8 rounded-xl bg-slate-50/30 border border-dashed border-slate-100 flex items-center justify-center text-slate-200">
               <div className="h-1 w-1 rounded-full bg-slate-300" />
            </div>
          )}

          {/* Icon/Image */}
          <div className="h-10 w-10 rounded-xl bg-indigo-50/30 border border-indigo-100/50 overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 group-hover:rotate-2 transition-all duration-500">
            {category.image ? (
              <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
            ) : (
              <LayoutGrid size={18} className="text-indigo-500 opacity-60" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                {category.name}
              </h4>
              <Badge 
                variant="outline" 
                className={cn(
                  "h-4 px-1.5 rounded-md text-[7px] font-black uppercase tracking-widest border-transparent",
                  category.status === 'ACTIVE' 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {category.status === 'ACTIVE' ? "LIVE" : "DRAFT"}
              </Badge>
            </div>
            {category.slug && (
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate opacity-50 space-x-2">
                <span>{category.slug}</span>
                <span className="text-slate-200">•</span>
                <span>Thứ tự {category.order}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 pr-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl bg-indigo-50/50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-sm shadow-indigo-50"
              onClick={() => onEdit(category)}
            >
              <ExternalLink size={13} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer">
                  <MoreVertical size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-2 w-48 rounded-2xl shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl">
                 <DropdownMenuItem 
                   className="rounded-xl font-black text-[9px] uppercase tracking-widest py-3 text-slate-600 gap-3 cursor-pointer"
                   onClick={() => onEdit(category)}
                 >
                   <Eye size={12} className="text-indigo-500" /> Chi tiết
                 </DropdownMenuItem>
                 <DropdownMenuItem 
                   className="rounded-xl font-black text-[9px] uppercase tracking-widest py-3 text-rose-500 gap-3 cursor-pointer hover:bg-rose-50"
                   onClick={() => onDelete(category._id)}
                 >
                   <AlertTriangle size={12} /> Gỡ bỏ
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Spanning Vertical Line */}
      {hasChildren && isExpanded && (
        <div className="absolute left-[15px] top-[56px] bottom-[28px] w-[2px] bg-indigo-100/60" />
      )}

      {/* Render children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <div className="ml-12 border-l-2 border-transparent">
            {children.map(child => (
              <CategoryNode 
                key={child._id}
                category={child}
                allCategories={allCategories}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CategoryManagement() {
  const { user } = useAuthStore();
  const isBranchManager = user?.role === 'BRANCH_MANAGER';
  const isShopOwner = user?.role === 'SHOP_OWNER';

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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

  const { data: categoryData, isLoading, isFetching, isError, refetch } = useCategories(activeBranchId);
  const { data: categoryDetail, isFetching: isDetailFetching } = useCategory(editingId || "");
  const { mutate: deleteCategory } = useDeleteCategory();

  const rootCategories = useMemo(() => {
    if (!categoryData || !Array.isArray(categoryData)) return [];
    
    // Filter by search term first
    const filtered = categoryData.filter((cat: ICategory) => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If searching, we flatten the UI to show matches
    if (searchTerm) return filtered;

    // Build hierarchy for root (parentId is null/undefined/"")
    return filtered.filter(cat => {
      const pId = typeof cat.parentId === 'object' ? cat.parentId?._id : cat.parentId;
      return !pId;
    });
  }, [categoryData, searchTerm]);

  const handleEdit = (category: ICategory) => {
    setEditingId(category._id);
    setIsModalOpen(true);
  };

  if (isError) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-rose-50 border border-rose-100 rounded-[3rem] p-16 flex flex-col items-center gap-6 text-center shadow-sm max-w-lg">
          <RefreshCcw size={48} className="text-rose-500 animate-spin-slow" />
          <h3 className="text-2xl font-black text-rose-900 leading-tight">Mất kết nối dữ liệu</h3>
          <p className="text-rose-600/60 font-bold text-sm uppercase tracking-widest leading-loose">Hệ thống gặp sự cố khi đồng bộ danh mục. Vui lòng kiểm tra lại đường truyền.</p>
          <Button onClick={() => refetch()} className="rounded-2xl h-14 px-8 font-black bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-xl shadow-rose-200">Thử tải lại ngay</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="p-4 md:p-10 bg-slate-50/30">
      <div className="max-w-6xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 pb-12 border-b border-slate-100">
          <MotionWrapper className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-1.5 w-12 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full" />
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Kiến trúc dữ liệu</p>
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-slate-800 leading-[0.9]">
              Quản lý <br />
              <span className="bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent italic">Danh mục.</span>
            </h1>
          </MotionWrapper>

          <MotionWrapper className="flex flex-col sm:flex-row items-center gap-5">
            {isShopOwner && (
              <div className="relative group">
                <Select value={activeBranchId || ""} onValueChange={setSelectedBranchId}>
                  <SelectTrigger className="h-14 w-[240px] px-6 bg-slate-50/50 border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-2 border-white/20 shadow-2xl bg-white/95 backdrop-blur-xl">
                    {branchesData?.branches?.map(b => (
                      <SelectItem key={b._id} value={b._id} className="rounded-xl py-4 font-black text-[10px] uppercase tracking-widest cursor-pointer">
                        {b.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all duration-300" size={18} />
              <Input 
                placeholder="Tìm danh mục hàng hóa..." 
                className="h-14 w-[320px] pl-14 pr-8 bg-slate-50/50 border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button 
              className="h-14 px-10 rounded-2xl bg-linear-to-r from-indigo-500 to-violet-600 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-200/50 transition-all duration-500 cursor-pointer"
              onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            >
              Phân lớp mới <Plus size={18} className="ml-2" strokeWidth={3} />
            </Button>
          </MotionWrapper>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-12">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <MotionWrapper className="bg-white border border-indigo-100 p-8 rounded-4xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:bg-indigo-50 transition-colors" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Hệ thống phân lớp</span>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm shadow-black/5">
                  <Layers size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-3 relative z-10">
                <span className="text-4xl font-black tracking-tighter text-slate-800 tabular-nums">{categoryData?.length || 0}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active nodes</span>
              </div>
            </MotionWrapper>

            <MotionWrapper className="bg-white border border-emerald-100 p-8 rounded-4xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:bg-emerald-50 transition-colors" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngành hàng hoạt động</span>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm shadow-black/5">
                  <Globe size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-3 relative z-10">
                <span className="text-4xl font-black tracking-tighter text-slate-800 tabular-nums">
                  {categoryData?.filter((c: ICategory) => c.status === 'ACTIVE').length || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sẵn sàng</span>
              </div>
            </MotionWrapper>

            <div className="bg-white border border-slate-100 p-8 rounded-4xl shadow-sm group relative flex items-center justify-center text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic relative z-10">
                 Cấu trúc danh mục được tùy biến riêng cho sự phát triển của chi nhánh này.
               </p>
            </div>
          </div>

          <MotionWrapper className="space-y-8">
            {/* Tree View */}
            <div className="bg-white border border-slate-100 p-8 rounded-4xl shadow-sm relative overflow-hidden group min-h-[500px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 to-violet-500" />
              <div className="flex items-center gap-4 mb-8">
                <div className="h-3 w-3 bg-indigo-500 rounded-full animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-800">Cấu trúc phân lớp Real-time</span>
              </div>
              
              {isLoading || isFetching ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-20 w-full rounded-3xl" />
                      <div className="ml-10 space-y-4">
                        <Skeleton className="h-16 w-[90%] rounded-2xl opacity-60" />
                        <Skeleton className="h-16 w-[80%] rounded-2xl opacity-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : rootCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 text-center opacity-40">
                  <FolderTree size={64} className="text-slate-200" strokeWidth={1} />
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-900">Chưa có kiến trúc phân lớp</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bắt đầu bằng cách tạo danh mục cha đầu tiên của bạn.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-indigo-50/50" />
                  <div className="space-y-2">
                    {rootCategories.map(cat => (
                      <CategoryNode 
                        key={cat._id}
                        category={cat}
                        allCategories={categoryData || []}
                        level={0}
                        onEdit={handleEdit}
                        onDelete={(id) => deleteCategory(id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </MotionWrapper>
        </div>

        {/* Modal */}
        {activeBranchId && isModalOpen && (
          <CategoryModal 
            key={editingId || 'new-category'}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingId(null);
            }}
            initialData={categoryDetail}
            isLoading={isDetailFetching}
            branchId={activeBranchId}
            categories={categoryData}
          />
        )}
      </div>
    </PageContainer>
  )
}
