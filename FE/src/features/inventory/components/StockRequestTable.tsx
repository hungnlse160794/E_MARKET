import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Clock, 
  MoreVertical,
  ExternalLink,
  Ban
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { COMMON_CONSTANTS } from "@/constants/common"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import type { IStockRequest, IStockRequestItem } from "@/types"

interface StockRequestTableProps {
  requests: IStockRequest[]
  isLoading: boolean
  onUpdateStatus: (id: string, status: string, reason?: string) => void
  isOwnerView?: boolean
}

export const StockRequestTable = ({
  requests,
  isLoading,
  onUpdateStatus,
  isOwnerView = false
}: StockRequestTableProps) => {

  const getStatusBadge = (status: string) => {
    switch(status) {
      case COMMON_CONSTANTS.STOCK_REQUEST_STATUS.PENDING:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg px-2 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-amber-100/50">
             <Clock size={10} strokeWidth={2.5} /> CHỜ DUYỆT
          </Badge>
        )
      case COMMON_CONSTANTS.STOCK_REQUEST_STATUS.APPROVED:
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 rounded-lg px-2 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-indigo-100/50">
             <CheckCircle size={10} strokeWidth={2.5} /> ĐÃ DUYỆT
          </Badge>
        )
      case COMMON_CONSTANTS.STOCK_REQUEST_STATUS.SHIPPING:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 rounded-lg px-2 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-blue-100/50">
             <Truck size={10} strokeWidth={2.5} /> ĐANG GIAO
          </Badge>
        )
      case COMMON_CONSTANTS.STOCK_REQUEST_STATUS.COMPLETED:
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg px-2 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-emerald-100/50">
             <CheckCircle size={10} strokeWidth={2.5} /> HOÀN TẤT
          </Badge>
        )
      case COMMON_CONSTANTS.STOCK_REQUEST_STATUS.REJECTED:
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 rounded-lg px-2 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-rose-100/50">
             <Ban size={10} strokeWidth={2.5} /> TỪ CHỐI
          </Badge>
        )
      case COMMON_CONSTANTS.STOCK_REQUEST_STATUS.CANCELLED:
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-100 rounded-lg px-2 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-slate-100/50">
             <XCircle size={10} strokeWidth={2.5} /> ĐÃ HỦY
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-3xl" />)}
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden p-2">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-50">
            <TableHead className="w-[120px] text-center font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 py-6">Mã Yêu Cầu</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Ngày Tạo</TableHead>
            {isOwnerView && <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Chi Nhánh</TableHead>}
            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Yêu Cầu Nhập</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Trạng Thái</TableHead>
            <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 px-8">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isOwnerView ? 6 : 5} className="py-24 text-center ">
                 <div className="flex flex-col items-center gap-4 opacity-20">
                    <Package size={48} className="text-slate-900" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Chưa có yêu cầu nhập kho nào</p>
                 </div>
              </TableCell>
            </TableRow>
          ) : requests?.map((req) => (
            <TableRow key={req._id} className="group hover:bg-slate-50/50 transition-all border-slate-50 cursor-pointer">
              <TableCell className="text-center py-8">
                <span className="text-[10px] font-black text-slate-800 bg-slate-100 px-2 py-1 rounded tracking-tighter shadow-sm">{req.requestNumber}</span>
              </TableCell>
              <TableCell className="font-bold text-xs text-slate-500 tabular-nums">
                 {format(new Date(req.createdAt), 'dd/MM/yyyy HH:mm')}
              </TableCell>
              {isOwnerView && (
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-black text-slate-800 tracking-tight">
                      {typeof req.branchId === 'object' ? req.branchId.branchName : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                       bởi {typeof req.requesterId === 'object' ? req.requesterId.fullName : 'Hệ thống'}
                    </span>
                  </div>
                </TableCell>
              )}
               <TableCell>
                  <div className="flex flex-wrap gap-2 max-w-[350px]">
                    {req.items.map((item: IStockRequestItem, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="bg-slate-50 text-slate-600 border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Package size={10} className="text-slate-400" />
                        {item.name} : <span className="text-indigo-600 font-extrabold">{item.quantity}</span>
                      </Badge>
                    ))}
                  </div>
               </TableCell>
              <TableCell className="text-center">
                 {getStatusBadge(req.status)}
              </TableCell>
              <TableCell className="text-right px-8">
                <div className="flex items-center justify-end gap-2">
                   {/* Manager Actions */}
                   {!isOwnerView && req.status === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.APPROVED && (
                     <Button 
                      size="sm" 
                      onClick={() => onUpdateStatus(req._id, COMMON_CONSTANTS.STOCK_REQUEST_STATUS.COMPLETED)}
                      className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100"
                     >
                       XÁC NHẬN ĐÃ NHẬN HÀNG
                     </Button>
                   )}

                   {/* Owner Actions */}
                   {isOwnerView && req.status === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.PENDING && (
                     <div className="flex gap-2">
                       <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onUpdateStatus(req._id, COMMON_CONSTANTS.STOCK_REQUEST_STATUS.REJECTED)}
                        className="h-10 px-4 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest"
                       >
                         TỪ CHỐI
                       </Button>
                       <Button 
                        size="sm" 
                        onClick={() => onUpdateStatus(req._id, COMMON_CONSTANTS.STOCK_REQUEST_STATUS.APPROVED)}
                        className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100"
                       >
                         DUYỆT ĐƠN
                       </Button>
                     </div>
                   )}

                   {isOwnerView && req.status === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.APPROVED && (
                     <Button 
                      size="sm" 
                      onClick={() => onUpdateStatus(req._id, COMMON_CONSTANTS.STOCK_REQUEST_STATUS.SHIPPING)}
                      className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2"
                     >
                       <Truck size={14} strokeWidth={2.5} /> BẮT ĐẦU GIAO
                     </Button>
                   )}

                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all">
                           <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 w-56">
                         <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 text-slate-600 flex items-center gap-3">
                            <ExternalLink size={14} /> Xem chi tiết
                         </DropdownMenuItem>
                         {req.status === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.PENDING && (
                           <DropdownMenuItem 
                            onClick={() => onUpdateStatus(req._id, req.status === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.PENDING ? COMMON_CONSTANTS.STOCK_REQUEST_STATUS.CANCELLED : req.status)}
                            className="rounded-xl font-bold text-xs py-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                           >
                              <Ban size={14} /> Hủy yêu cầu
                           </DropdownMenuItem>
                         )}
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
