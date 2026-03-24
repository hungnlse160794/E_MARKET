import { 
  Plus, 
  MapPin, 
  MoreVertical,
  ArrowUpRight,
  Store,
  Users,
  ExternalLink,
  Search,
  LayoutGrid,
  Map as MapIcon,
  Trash2,
} from "lucide-react"
import { useState } from 'react'
import { useAuthStore } from "@/stores/useAuthStore"
import { useBranches, useBranchStats, useBranchById, useCreateBranch, useUpdateBranch, useDeleteBranch } from "./hooks/useBranches"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageContainer } from "@/components/premium/PageContainer"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import LocationMap from "./components/LocationMap"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { BranchModal } from "./components/BranchModal"
import type { BranchInput } from "@/schemas/branchSchema"

export default function BranchManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const { data: stats, isLoading: isStatsLoading } = useBranchStats();
  const { data: branchData, isLoading: isListLoading } = useBranches({ search: searchTerm });
  
  const { data: branchDetail, isLoading: isDetailLoading } = useBranchById(selectedBranchId);
  
  const user = useAuthStore(state => state.user);
  console.log("Current User:", user);
  console.log("Branch Data:", branchData);

  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch(selectedBranchId || "");
  const deleteBranchMutation = useDeleteBranch();

  const handleCreate = () => {
    setSelectedBranchId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedBranchId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) {
      deleteBranchMutation.mutate(id);
    }
  };

  const handleFormSubmit = (data: BranchInput) => {
    console.log(data);
    
    if (selectedBranchId) {
      updateBranchMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createBranchMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const renderStats = () => {
    if (isStatsLoading) return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
      </div>
    );

    const statItems = [
      { label: 'Chi nhánh hoạt động', value: stats?.activeBranches || 0, icon: <Store size={18} />, bgLight: 'bg-teal-50', textColor: 'text-teal-600', borderColor: 'border-teal-100' },
      { label: 'Tổng nhân viên', value: stats?.totalStaff || 0, icon: <Users size={18} />, bgLight: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-100' },
      { label: 'Hiệu suất mục tiêu', value: '98%', icon: <ArrowUpRight size={18} />, bgLight: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-100' },
    ];

    return (
      <StaggerContainer staggerDelay={0.05} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {statItems.map((item, idx) => (
          <MotionWrapper key={idx} variant="staggerItem" className={`bg-white border ${item.borderColor} p-8 rounded-4xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:bg-indigo-50 transition-colors" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
              <div className={`h-12 w-12 rounded-2xl ${item.bgLight} flex items-center justify-center ${item.textColor} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm shadow-black/5`}>
                {item.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-3 relative z-10">
              <span className="text-4xl font-black tracking-tighter text-slate-800 tabular-nums">{item.value}</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active nodes</span>
            </div>
          </MotionWrapper>
        ))}
      </StaggerContainer>
    );
  }

  const renderTable = () => {
    if (isListLoading) return (
      <div className="bg-white border border-slate-100 rounded-4xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-slate-100">
               <TableHead className="w-[60px] text-center p-6"><Skeleton className="h-4 w-6 mx-auto" /></TableHead>
               <TableHead><Skeleton className="h-4 w-32" /></TableHead>
               <TableHead><Skeleton className="h-4 w-48" /></TableHead>
               <TableHead className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableHead>
               <TableHead className="text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableHead>
               <TableHead className="text-right px-8"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map(i => (
              <TableRow key={i} className="border-slate-100">
                <TableCell className="p-6 text-center"><Skeleton className="h-3 w-4 mx-auto" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-3 w-64" /></TableCell>
                <TableCell className="text-center py-6">
                   <div className="flex justify-center"><Skeleton className="h-4 w-[100px]" /></div>
                </TableCell>
                <TableCell className="text-center py-6">
                   <div className="flex justify-center"><Skeleton className="h-8 w-[100px] rounded-full" /></div>
                </TableCell>
                <TableCell className="px-8 text-right">
                   <div className="flex justify-end gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <Skeleton className="h-10 w-10 rounded-xl" />
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );

    return (
      <div className="bg-white border border-slate-100 rounded-4xl shadow-sm overflow-hidden min-h-[400px]">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[60px] text-center font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">STT</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Chi nhánh</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Địa chỉ hoạt động</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Liên hệ</TableHead>
              <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-slate-400">Trạng thái</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400 px-8">Quản trị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branchData?.branches.map((branch, idx) => (
              <TableRow key={branch._id} className="group hover:bg-teal-50/30 transition-all border-slate-100 border-b last:border-0">
                <TableCell className="text-center py-6">
                   <span className="text-[12px] font-black text-slate-400 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl border border-slate-100 bg-teal-50 overflow-hidden shadow-sm shrink-0 flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
                       <MapPin size={22} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-black text-slate-700 tracking-tight">{branch.branchName}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[12px] font-bold text-slate-500">{branch.address.fullAddress}</span>
                </TableCell>
                <TableCell className="text-center">
                   <span className="text-sm font-bold text-slate-600 tabular-nums">{branch.contactPhone || '---'}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={branch.isOpen ? 'success' : 'destructive'}
                    className="h-8 min-w-[100px] justify-center text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm"
                  >
                    {branch.isOpen ? 'Online' : 'Offline'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-8">
                  <div className="flex items-center justify-end gap-2.5 transition-all">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl bg-slate-100/50 hover:bg-teal-500 hover:text-white transition-all duration-300"
                      onClick={() => handleEdit(branch._id)}
                    >
                      <ExternalLink size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(branch._id)}
                      className="h-10 w-10 rounded-xl bg-slate-100/50 hover:bg-rose-500 hover:text-white transition-all duration-300"
                    >
                      <Trash2 size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-100/50 hover:bg-slate-800 hover:text-white transition-all duration-300">
                      <MoreVertical size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {branchData?.branches.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                   <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                         <Store size={32} />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy chi nhánh nào</p>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <PageContainer className="p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 pb-12 border-b border-slate-100">
          <StaggerContainer staggerDelay={0.05}>
            <MotionWrapper variant="slideUp" className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-1.5 w-12 bg-linear-to-r from-teal-500 to-cyan-500 rounded-full" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Quản lý khu vực</p>
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-slate-800 leading-[0.9]">
                Hệ thống <br />
                <span className="bg-linear-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent italic">Chi nhánh.</span>
              </h1>
            </MotionWrapper>
          </StaggerContainer>
          
          <MotionWrapper variant="fadeIn" delay={0.2} className="flex flex-col sm:flex-row items-center gap-5">
             <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/40 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-inner">
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-xl shadow-black/5 hover:bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={16} className="mr-2" strokeWidth={2.5} /> Danh sách
                </Button>
                <Button 
                  variant={viewMode === 'map' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-xl shadow-black/5 hover:bg-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <MapIcon size={16} className="mr-2" strokeWidth={2.5} /> Bản đồ
                </Button>
             </div>
             <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-all duration-300" size={18} />
                <Input 
                  placeholder="Tìm kiếm chi nhánh..." 
                  className="h-14 w-[320px] pl-14 pr-8 bg-slate-50/50 border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400/50 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button 
                onClick={handleCreate}
                className="h-14 px-10 rounded-2xl bg-linear-to-r from-teal-500 to-cyan-600 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-teal-200/50 transition-all duration-500"
             >
                Đăng ký ngay <Plus size={18} className="ml-2" strokeWidth={3} />
             </Button>
          </MotionWrapper>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-12">
           {renderStats()}
           
           <MotionWrapper variant="fadeIn" delay={0.3}>
             {viewMode === 'list' ? (
               renderTable()
             ) : (
               <div className="bg-white border border-slate-100 p-8 rounded-4xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-teal-500 to-cyan-500" />
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div className="h-3 w-3 bg-teal-500 rounded-full animate-ping" />
                       <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-800">Định vị hạ tầng Real-time</span>
                    </div>
                    <Badge variant="outline" className="border-teal-100 text-teal-600 bg-teal-50 font-black text-[9px] px-3 py-1">GPS SYNCHRONIZED</Badge>
                  </div>
                  <div className="rounded-4xl overflow-hidden border border-slate-100 shadow-inner">
                    <LocationMap 
                      markers={branchData?.branches.map(b => ({
                        position: [b.location.coordinates[1], b.location.coordinates[0]],
                        label: b.branchName
                      }))}
                    />
                  </div>
               </div>
             )}
           </MotionWrapper>
        </div>

        <BranchModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBranchId(null);
          }}
          initialData={branchDetail}
          onSubmit={handleFormSubmit}
          isSubmitting={createBranchMutation.isPending || updateBranchMutation.isPending}
          isLoading={isDetailLoading} 
        />

      </div>
    </PageContainer>
  )
}
