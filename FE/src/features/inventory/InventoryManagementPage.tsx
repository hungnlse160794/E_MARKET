import { 
  Package, 
  Search, 
  History as HistoryIcon,
  AlertTriangle,
  MapPin,
  Filter,
  PlusCircle,
  Settings,
} from "lucide-react"
import { useState, useMemo } from 'react'
import { useInventory } from "./hooks/useInventory"
import { useStockRequest } from "./hooks/useStockRequest"
import { useBranches } from "@/features/branch/hooks/useBranches"
import { useAuthStore } from "@/stores/useAuthStore"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { InventoryUpdateModal } from "./components/InventoryUpdateModal"
import { InventoryHistoryModal } from "./components/InventoryHistoryModal"
import { StockRequestModal } from "./components/StockRequestModal"
import { StockRequestTable } from "./components/StockRequestTable"
import { StockRequestStatusModal } from "./components/StockRequestStatusModal"
import { UserRole } from "@/types"
import type { IStockRequest, IBranch } from "@/types"
import type { InventoryItem } from "./types"

export default function InventoryManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthStore();
  const isOwner = user?.role === UserRole.SHOP_OWNER || user?.role === UserRole.PLATFORM_ADMIN;

  const [selectedBranch, setSelectedBranch] = useState<string>(() => {
    if (!isOwner && user?.branchId) {
       return typeof user.branchId === 'string' ? user.branchId : (user.branchId as IBranch)?._id;
    }
    return "all";
  });
  const [activeTab, setActiveTab] = useState("inventory");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [isLowStockOnly, setIsLowStockOnly] = useState(false);

  const { data: branchData } = useBranches();
  
  const { 
    inventoryData, 
    lowStockData, 
    historyData, 
    isLoading, 
    isHistoryLoading,
    updateStock, 
  } = useInventory(
    selectedBranch === 'all' ? (user?.shopId as string) : selectedBranch,
    selectedBranch === 'all'
  );

  // Defensive: check for both object and _id presence
  const userBranchId = (user?.branchId && typeof user.branchId === 'object' && '_id' in user.branchId) 
    ? (user.branchId as IBranch)._id 
    : (typeof user?.branchId === 'string' ? user.branchId : undefined);

  const {
    branchRequests,
    shopRequests,
    isLoading: isRequestsLoading,
    createRequest,
    updateStatus
  } = useStockRequest({
    branchId: selectedBranch !== 'all' ? selectedBranch : (!isOwner ? userBranchId : undefined),
    shopId: (isOwner && selectedBranch === 'all') ? user?.shopId : undefined
  });

  const filteredInventory = useMemo(() => {
    let data = inventoryData || [];
    if (searchTerm) {
      data = data.filter((item: InventoryItem) => 
        item.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (isLowStockOnly) {
      data = data.filter((item: InventoryItem) => item.stockQuantity <= item.lowStockThreshold);
    }
    return data;
  }, [inventoryData, searchTerm, isLowStockOnly]);

  const stats = useMemo(() => ({
    totalProducts: inventoryData?.length || 0,
    totalStock: inventoryData?.reduce((acc: number, curr: InventoryItem) => acc + (curr.stockQuantity || 0), 0) || 0,
    lowStockCount: lowStockData?.length || 0
  }), [inventoryData, lowStockData]);

  const handleUpdate = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsUpdateModalOpen(true);
  };

  const handleShowHistory = () => {
    setIsHistoryModalOpen(true);
  };

  const renderInventoryTable = () => {
    if (isLoading) return (
      <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-6 shadow-sm overflow-hidden relative">
        <div className="flex gap-4 border-b border-slate-50 pb-6">
           {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 flex-1 rounded-lg bg-slate-100" />)}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-6 py-6 border-b last:border-0 border-slate-50 overflow-hidden">
             <Skeleton className="h-14 w-14 rounded-2xl shrink-0 bg-slate-50" />
             <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-1/3 rounded-lg bg-slate-100" />
                <Skeleton className="h-3 w-1/4 rounded-lg bg-slate-50 opacity-60" />
             </div>
             <Skeleton className="h-10 w-20 rounded-xl bg-slate-50" />
             <Skeleton className="h-10 w-32 rounded-xl bg-slate-50" />
             <Skeleton className="h-10 w-10 rounded-full bg-slate-50" />
          </div>
        ))}
      </div>
    );

    if (selectedBranch === 'all' && !isOwner) {
      return (
        <div className="py-24 flex flex-col items-center justify-center gap-8 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
           <div className="h-24 w-24 rounded-full bg-white shadow-2xl flex items-center justify-center text-indigo-500 transform hover:scale-110 transition-transform duration-500">
              <MapPin size={40} strokeWidth={1.5} />
           </div>
           <div className="text-center space-y-3 max-w-sm">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Chọn chi nhánh vận hành</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Vui lòng chọn một chi nhánh cụ thể để bắt đầu kiểm tra và điều phối hàng hóa</p>
           </div>
           <div className="flex flex-wrap justify-center gap-3 px-6">
              {branchData?.branches?.slice(0, 4).map(b => (
                <Button key={b._id} variant="outline" onClick={() => setSelectedBranch(b._id)} className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-8 text-slate-500 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                  {b.branchName}
                </Button>
              ))}
           </div>
        </div>
      );
    }

    return (
      <MotionWrapper variant="fadeIn">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="hover:bg-transparent border-slate-50">
                <TableHead className="w-[80px] text-center font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-8">ID</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Sản phẩm & Chi nhánh</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Số lượng</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Tình trạng</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 px-10">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <Package size={48} className="text-slate-100" />
                       <span className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] italic">Dữ liệu trống</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredInventory.map((item: InventoryItem) => (
                <TableRow key={String(item._id)} className={`group hover:bg-slate-50/50 transition-all border-slate-50 ${item.stockQuantity <= item.lowStockThreshold ? 'bg-rose-50/20' : ''}`}>
                  <TableCell className="text-center py-8">
                    <span className="text-[10px] font-black text-slate-300">#{item.productId?._id?.toString().slice(-6).toUpperCase() || '---'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl border border-slate-100 p-0.5 bg-white overflow-hidden shadow-sm shrink-0 relative group-hover:rotate-3 transition-transform duration-500">
                        <img src={item.productId?.images?.[0] || '/placeholder.png'} alt={item.productId?.name} className="h-full w-full object-cover rounded-xl" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-black text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors uppercase">{item.productId?.name || 'Sản phẩm không xác định'}</span>
                        <div className="flex items-center gap-3">
                           <span className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">
                              <MapPin size={8} /> {typeof item.branchId === 'object' && item.branchId !== null ? item.branchId.branchName : (isOwner ? 'Phân kho' : 'Chi nhánh')}
                           </span>
                           {item.stockQuantity <= item.lowStockThreshold && (
                             <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-rose-100 animate-pulse">
                                Sắp hết hàng
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-2xl font-black tabular-nums tracking-tighter ${item.stockQuantity <= item.lowStockThreshold ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.stockQuantity}
                      </span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-0.5">
                        {item.productId?.units?.[0]?.unitName || 'Đơn vị'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                     {item.stockQuantity > item.lowStockThreshold ? (
                       <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest shadow-sm shadow-emerald-50">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                          Ổn định
                       </div>
                     ) : item.stockQuantity > 0 ? (
                       <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-widest shadow-sm shadow-amber-50">
                          <Settings size={10} className="animate-spin-slow" />
                           Cần nhập
                       </div>
                     ) : (
                       <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-widest shadow-sm shadow-rose-50">
                          <AlertTriangle size={10} strokeWidth={3} />
                          Hết hàng
                       </div>
                     )}
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpdate(item)}
                        className="h-11 px-6 border-slate-200 bg-white hover:border-indigo-100 hover:bg-indigo-50/30 rounded-2xl shadow-sm flex items-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all text-slate-600"
                      >
                        <Settings size={14} strokeWidth={2.5} />
                        QUẢN LÝ
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setActiveTab('requests');
                          setIsRequestModalOpen(true);
                        }}
                        className="h-11 px-6 bg-slate-900 text-white hover:bg-indigo-600 rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all"
                      >
                        <PlusCircle size={14} strokeWidth={2.5} />
                        NHẬP MỚI
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MotionWrapper>
    );
  }

  return (
    <PageContainer className="p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 pb-12 border-b border-slate-100">
          <StaggerContainer staggerDelay={0.05}>
            <MotionWrapper variant="slideUp" className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-1.5 w-10 bg-indigo-500 rounded-full" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hệ thống vận hành</p>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-800 leading-tight">
                Tồn kho & <br />
                <span className="bg-linear-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent italic">Điều phối.</span>
              </h1>
            </MotionWrapper>
          </StaggerContainer>
          
          <MotionWrapper variant="fadeIn" delay={0.2} className="flex flex-col sm:flex-row items-center gap-4">
             {isOwner && (
               <div className="flex items-center gap-2 p-2 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner overflow-hidden overflow-x-auto max-w-full sm:max-w-[450px]">
                  <Button 
                    variant={selectedBranch === 'all' ? 'secondary' : 'ghost'} 
                    onClick={() => setSelectedBranch('all')}
                    className={`h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all whitespace-nowrap ${selectedBranch === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white/50 border border-slate-100 text-slate-400'}`}
                  >
                    Tất cả
                  </Button>
                      {branchData?.branches?.map(b => (
                    <Button 
                      key={b._id}
                      variant={selectedBranch === b._id ? 'secondary' : 'ghost'} 
                      onClick={() => setSelectedBranch(b._id)}
                      className={`h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all whitespace-nowrap ${selectedBranch === b._id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white/50 border border-slate-100 text-slate-400'}`}
                    >
                      {b.branchName}
                    </Button>
                  ))}
               </div>
             )}
             
             {activeTab === 'inventory' && (
               <>
                 <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <Input 
                      placeholder="Tìm sản phẩm..." 
                      className="h-14 w-full sm:w-[250px] pl-14 pr-8 bg-slate-50 border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <Button 
                  variant="outline" 
                  onClick={() => setIsLowStockOnly(!isLowStockOnly)}
                  className={`h-14 w-14 p-0 rounded-2xl border-slate-200 transition-all ${isLowStockOnly ? 'bg-rose-600 border-rose-600 text-white animate-pulse shadow-rose-100 shadow-xl' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}
                 >
                    <Filter size={20} />
                 </Button>
               </>
             )}

             <Button 
               onClick={handleShowHistory}
               disabled={selectedBranch === 'all' && !isOwner}
               variant="outline"
               className="h-14 px-6 rounded-2xl border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95 disabled:opacity-30"
             >
                LỊCH SỬ <HistoryIcon size={18} className="ml-3 opacity-50" />
             </Button>

             {activeTab === 'requests' && (
               <Button 
                onClick={() => setIsRequestModalOpen(true)}
                disabled={selectedBranch === 'all' && !isOwner}
                className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-30"
               >
                  TẠO YÊU CẦU <PlusCircle size={18} className="ml-3 opacity-50" />
               </Button>
             )}
          </MotionWrapper>
        </div>

        {/* Tab System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 h-auto">
              <TabsTrigger value="inventory" className="rounded-xl px-10 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                HÀNG TỒN KHO
              </TabsTrigger>
              <TabsTrigger value="requests" className="rounded-xl px-10 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm relative">
                YÊU CẦU NHẬP HÀNG
                {isOwner && (shopRequests?.docs || []).some((r: IStockRequest) => r.status === 'PENDING') && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 border-2 border-white animate-bounce" />
                )}
              </TabsTrigger>
            </TabsList>

            <div className="hidden lg:flex items-center gap-12">
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">TỔNG MÃ HÀNG</span>
                  <span className="text-xl font-black text-slate-800 tabular-nums leading-none mt-1">{stats.totalProducts}</span>
               </div>
               <div className="h-8 w-px bg-slate-100" />
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest leading-none">CẢNH BÁO TỒN THẤP</span>
                  <span className="text-xl font-black text-rose-600 tabular-nums leading-none mt-1">{stats.lowStockCount}</span>
               </div>
            </div>
          </div>

          <TabsContent value="inventory" className="mt-0">
             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <MotionWrapper variant="fadeIn" className="bg-white border border-slate-100 p-10 rounded-[2.5rem] flex items-center justify-between shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group">
                      <div className="space-y-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-indigo-500 transition-colors">TỔNG SẢN PHẨM TRONG KHO</span>
                         <div className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter">{stats.totalStock.toLocaleString()}</div>
                      </div>
                      <div className="h-20 w-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
                         <Package size={32} strokeWidth={2.5} />
                      </div>
                   </MotionWrapper>
                   <MotionWrapper variant="fadeIn" delay={0.1} className="bg-white border border-rose-100 p-10 rounded-[2.5rem] flex items-center justify-between shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group">
                      <div className="space-y-2">
                         <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                           CẢNH BÁO TỒN KHO THẤP
                         </span>
                         <div className="text-5xl font-black text-rose-600 tabular-nums tracking-tighter">{stats.lowStockCount} <span className="text-lg text-rose-300 ml-1">MÃ</span></div>
                      </div>
                      <div className="h-20 w-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner shrink-0">
                         <AlertTriangle size={32} strokeWidth={2.5} />
                      </div>
                   </MotionWrapper>
                </div>
                {renderInventoryTable()}
             </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-0">
             <div className="space-y-6">
                <StockRequestTable 
                  requests={((isOwner && selectedBranch === 'all') ? shopRequests?.docs : branchRequests?.docs) || []}
                  isLoading={isRequestsLoading}
                  isOwnerView={isOwner}
                  onUpdateStatus={(id, status) => {
                    setSelectedRequest(id);
                    setPendingStatus(status);
                    setIsStatusModalOpen(true);
                  }}
                />
             </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <InventoryUpdateModal 
          key={selectedItem?._id?.toString() || 'new'}
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          item={selectedItem}
          isLoading={updateStock.isPending}
          onUpdate={(data) => {
            updateStock.mutate(data, {
              onSuccess: () => setIsUpdateModalOpen(false)
            });
          }}
        />

        <InventoryHistoryModal 
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          logs={historyData}
          isLoading={isHistoryLoading}
          branchName={selectedBranch === 'all' ? "Toàn hệ thống" : branchData?.branches?.find(b => b._id === selectedBranch)?.branchName}
        />

        <StockRequestModal 
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          branchId={selectedBranch}
          onSubmit={(data) => {
            createRequest.mutate(data, {
              onSuccess: () => setIsRequestModalOpen(false)
            });
          }}
          isLoading={createRequest.isPending}
        />

        <StockRequestStatusModal 
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          status={pendingStatus}
          isLoading={updateStatus.isPending}
          onSubmit={(data) => {
            if (selectedRequest) {
              updateStatus.mutate({ 
                id: selectedRequest, 
                status: data.status, 
                rejectionReason: data.rejectionReason 
              }, {
                onSuccess: () => setIsStatusModalOpen(false)
              });
            }
          }}
        />

      </div>
    </PageContainer>
  )
}
