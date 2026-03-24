import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Package,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Truck,
  LayoutGrid,
  List as ListIcon
} from "lucide-react"
import { useState, useEffect } from 'react'
import { useOrders, useOrderStats, useUpdateOrderStatus } from "@/features/order/hooks/useOrders"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageContainer } from "@/components/premium/PageContainer"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import { Modal } from "@/components/premium/Modal"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { toast } from "sonner"
import type { IOrder } from "@/types"

const STAT_CONFIG = [
  { label: 'Chờ xác nhận', key: 'pending', icon: <Clock size={16} />, bgLight: 'bg-amber-50', textColor: 'text-amber-600', borderColor: 'border-amber-100', highlight: true },
  { label: 'Đang vận chuyển', key: 'shipping', icon: <Truck size={16} />, bgLight: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-100' },
  { label: 'Hoàn thành', key: 'completed', icon: <CheckCircle2 size={16} />, bgLight: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-100' },
  { label: 'Doanh thu', key: 'revenue', icon: <Activity size={16} />, bgLight: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-100' },
]

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const { data: stats, isLoading: isStatsLoading } = useOrderStats();
  const { data: orderData, isLoading: isListLoading } = useOrders({ search: searchTerm });
  
  const [localOrders, setLocalOrders] = useState<IOrder[]>([]);
  const [pendingDrop, setPendingDrop] = useState<{ orderId: string, status: string } | null>(null);
  const { mutate: updateStatus } = useUpdateOrderStatus();

  useEffect(() => {
     if (orderData?.orders) {
        const timeoutId = setTimeout(() => {
           setLocalOrders(orderData.orders);
        }, 0);
        return () => clearTimeout(timeoutId);
     }
  }, [orderData?.orders]);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
     e.dataTransfer.setData("orderId", orderId);
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
     e.preventDefault();
     const orderId = e.dataTransfer.getData("orderId");
     if (!orderId) return;

     const currentOrder = localOrders.find(o => o._id === orderId);
     if (currentOrder?.status === status) return;

     setPendingDrop({ orderId, status });
  }

  const confirmDrop = () => {
    if (!pendingDrop) return;
    const { orderId, status } = pendingDrop;

    // Optimistic UI update
    setLocalOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: status as IOrder['status'] } : o));
    
    // Call API
    updateStatus({ orderId, status });
    setPendingDrop(null);
  }

  const cancelDrop = () => {
    setPendingDrop(null);
  }

  const handleDragOver = (e: React.DragEvent) => {
     e.preventDefault();
  }

  const renderStats = () => {
    if (isStatsLoading) return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );

    const statValues: Record<string, string | number> = {
      pending: stats?.pendingOrders || 0,
      shipping: 18,
      completed: stats?.completedOrders || 0,
      revenue: (stats?.revenue || 0).toLocaleString() + 'đ',
    };

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
              <span className="text-3xl font-extrabold tracking-tight text-slate-800">{statValues[item.key]}</span>
              <span className="text-[10px] font-medium text-slate-300">đơn hàng</span>
            </div>
          </MotionWrapper>
        ))}
      </StaggerContainer>
    );
  }

  const renderKanban = () => {
    if (isListLoading) return <div className="h-[400px] flex items-center justify-center"><Skeleton className="h-full w-full rounded-4xl" /></div>;

    const KANBAN_COLUMNS = [
      { id: 'PENDING', label: 'Chờ xử lý', color: 'border-amber-200 bg-amber-50', headerColor: 'bg-amber-100 text-amber-700' },
      { id: 'CONFIRMED', label: 'Đang chuẩn bị', color: 'border-blue-200 bg-blue-50', headerColor: 'bg-blue-100 text-blue-700' },
      { id: 'SHIPPING', label: 'Đang giao', color: 'border-indigo-200 bg-indigo-50', headerColor: 'bg-indigo-100 text-indigo-700' },
      { id: 'COMPLETED', label: 'Hoàn thành', color: 'border-emerald-200 bg-emerald-50', headerColor: 'bg-emerald-100 text-emerald-700' },
    ]

    return (
      <div className="flex xl:grid xl:grid-cols-4 gap-6 overflow-x-auto pb-6 h-[calc(100vh-350px)] min-h-[500px]">
        {KANBAN_COLUMNS.map(col => {
           const colOrders = localOrders.filter(o => o.status === col.id);
           
           return (
             <div 
               key={col.id}
               className={`shrink-0 w-[300px] xl:w-auto h-full flex flex-col rounded-3xl border ${col.color}`}
               onDragOver={handleDragOver}
               onDrop={(e) => handleDrop(e, col.id)}
             >
               <div className={`px-5 py-4 rounded-t-3xl border-b border-black/5 font-extrabold uppercase text-[11px] tracking-widest flex items-center justify-between ${col.headerColor}`}>
                 {col.label}
                 <span className="bg-white/60 px-2 py-0.5 rounded-full text-[10px] text-slate-800">{colOrders.length}</span>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                 {colOrders.map(order => (
                   <div 
                     key={order._id}
                     draggable
                     onDragStart={(e) => handleDragStart(e, order._id)}
                     className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all space-y-4"
                   >
                     <div className="flex justify-between items-start">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{order._id}</span>
                       <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-100 rounded-lg"><MoreVertical size={14} /></Button>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                         <Package size={16} className="text-indigo-400" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-700">{order.userId.split('-')[1] || 'Khách hàng'}</p>
                         <p className="text-[10px] font-semibold text-slate-400">Chi nhánh: {order.branchId}</p>
                       </div>
                     </div>
                     <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-[11px] font-bold text-slate-400">{order.items.length} món</span>
                       <span className="text-sm font-black text-indigo-600 tabular-nums">{order.totalAmount.toLocaleString()}đ</span>
                     </div>
                   </div>
                 ))}
                 {colOrders.length === 0 && (
                    <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200/50 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       Kéo thả vào đây
                    </div>
                 )}
               </div>
             </div>
           )
        })}
      </div>
    )
  }

  const renderTable = () => {
    if (isListLoading) return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );

    const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
      COMPLETED: { label: "Hoàn thành", variant: "success" },
      PENDING: { label: "Chờ xử lý", variant: "warning" },
      CONFIRMED: { label: "Đã xác nhận", variant: "success" },
      SHIPPING: { label: "Đang giao", variant: "warning" },
      CANCELLED: { label: "Đã huỷ", variant: "destructive" },
    };

    return (
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[100px] text-center font-bold text-[10px] uppercase tracking-widest text-slate-400 py-5">Mã đơn</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Khách hàng</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Số lượng</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Tổng tiền</TableHead>
              <TableHead className="text-center font-bold text-[10px] uppercase tracking-widest text-slate-400">Trạng thái</TableHead>
              <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-slate-400 px-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localOrders.map((order: IOrder) => (
              <TableRow key={order._id} className="group hover:bg-indigo-50/30 transition-all border-slate-100 cursor-pointer">
                <TableCell className="text-center py-5">
                  <span className="text-[10px] font-semibold text-slate-300">{order._id}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full border border-slate-100 bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-400">
                      <Package size={14} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-700">{order.userId.split('-')[1] || 'Khách hàng'}</span>
                      <span className="text-[10px] font-medium text-slate-400">Chi nhánh: {order.branchId}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[12px] font-semibold text-slate-500">{order.items.length} sản phẩm</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-700 tabular-nums">{order.totalAmount.toLocaleString()}đ</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={statusMap[order.status]?.variant || 'destructive'}
                    className="h-7 min-w-[90px] justify-center text-[10px]"
                  >
                    {statusMap[order.status]?.label || order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                      onClick={(e) => { e.stopPropagation(); toast.info(`Xem đơn hàng ${order._id}`) }}
                    >
                      <ExternalLink size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 transition-all">
                      <MoreVertical size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination Footer */}
        <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              Trang {orderData?.page} / {orderData?.totalPages}
            </span>
            <div className="flex gap-2">
               <Button variant="outline" className="h-9 px-6 border-slate-200 text-slate-400 font-semibold text-[11px] rounded-lg hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all">
                  Trước
               </Button>
               <Button variant="outline" className="h-9 px-6 bg-indigo-500 border-indigo-500 text-white font-semibold text-[11px] rounded-lg hover:bg-indigo-600 transition-all">
                  Tiếp
               </Button>
            </div>
        </div>
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
                 <div className="h-1.5 w-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Quản lý giao dịch</p>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
                Đơn hàng <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Trung tâm.</span>
              </h1>
            </MotionWrapper>
          </StaggerContainer>
          
          <MotionWrapper variant="fadeIn" delay={0.2} className="flex flex-col sm:flex-row items-center gap-4">
             <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shrink-0">
               <button 
                 onClick={() => setViewMode('kanban')} 
                 className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <LayoutGrid size={16} /> <span className="hidden xl:inline-block">KANBAN</span>
               </button>
               <button 
                 onClick={() => setViewMode('table')} 
                 className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center gap-2 ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <ListIcon size={16} /> <span className="hidden xl:inline-block">LIST</span>
               </button>
             </div>
             
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <Input 
                  placeholder="Tìm kiếm đơn hàng..." 
                  className="h-12 w-full sm:w-[250px] pl-12 pr-6 bg-slate-50 border-slate-200 rounded-xl font-medium text-[13px] focus:ring-indigo-500 focus:border-indigo-300 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button variant="ghost" className="h-12 w-12 p-0 rounded-xl border border-slate-200 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shrink-0">
                <Filter size={16} />
             </Button>
             <Button className="h-12 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[12px] uppercase tracking-wider hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200 transition-all">
                Tạo đơn <Plus size={16} className="ml-2 opacity-70" />
             </Button>
          </MotionWrapper>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-8">
           {renderStats()}
           
           <MotionWrapper variant="fadeIn" delay={0.4}>
              {viewMode === 'kanban' ? renderKanban() : renderTable()}
           </MotionWrapper>
        </div>

        {/* Drop Confirmation Modal */}
        <Modal 
          isOpen={!!pendingDrop} 
          onClose={cancelDrop} 
          title="Xác nhận trạng thái"
          maxWidth="max-w-md"
        >
          <div className="space-y-6">
            <p className="text-[13px] font-medium text-slate-600 leading-relaxed">
              Xác nhận thay đổi trạng thái đơn hàng 
              <span className="font-bold text-indigo-600 px-2">{pendingDrop?.orderId}</span>
              thành <span className="font-bold text-slate-800 uppercase px-1">{pendingDrop?.status}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button onClick={cancelDrop} variant="outline" className="h-11 px-6 rounded-xl font-bold bg-white text-slate-500 hover:bg-slate-50 border-slate-200">Không, Quay lại</Button>
              <Button onClick={confirmDrop} className="h-11 px-8 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100">Xác nhận</Button>
            </div>
          </div>
        </Modal>

      </div>
    </PageContainer>
  )
}
