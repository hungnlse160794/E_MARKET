import { Modal } from "@/components/premium/Modal"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import type { IInventoryLog } from "@/types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Settings, 
  Package, 
  User, 
  FileText,
  History as HistoryIcon,
  MapPin
} from "lucide-react"

interface InventoryHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  logs: IInventoryLog[] | null | undefined
  isLoading?: boolean
  branchName?: string
}

export function InventoryHistoryModal({ isOpen, onClose, logs, isLoading, branchName }: InventoryHistoryModalProps) {
  
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'ADD': return { icon: <ArrowUpCircle size={16} />, color: 'emerald', label: 'NHẬP KHO' };
      case 'SUBTRACT': return { icon: <ArrowDownCircle size={16} />, color: 'rose', label: 'XUẤT KHO' };
      case 'SET': return { icon: <Settings size={16} />, color: 'amber', label: 'THIẾT LẬP' };
      default: return { icon: <Package size={16} />, color: 'indigo', label: type };
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`LỊCH SỬ BIẾN ĐỘNG - ${branchName?.toUpperCase() || 'CHI NHÁNH'}`}
      maxWidth="max-w-[700px]"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 w-full bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
            ))}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
             <HistoryIcon size={64} strokeWidth={1} />
             <p className="font-bold text-sm uppercase tracking-widest italic">Chưa có lịch sử biến động kho</p>
          </div>
        ) : (
          <StaggerContainer staggerDelay={0.03}>
            {logs.map((log) => {
              const style = getTypeStyles(log.type);
              return (
                <MotionWrapper 
                  key={log._id} 
                  variant="slideUp" 
                  className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all mb-4 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 h-1.5 w-24 bg-${style.color}-500 opacity-20`} />
                  
                  <div className="flex items-start gap-6">
                    <div className={`h-14 w-14 rounded-2xl bg-${style.color}-50 border border-${style.color}-100 flex items-center justify-center text-${style.color}-600 shrink-0`}>
                      {style.icon}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                         <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-800 tracking-tight line-clamp-1">{log.productId.name}</h4>
                            <div className="flex items-center gap-3">
                               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{format(new Date(log.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}</span>
                                {typeof log.branchId === 'object' && log.branchId !== null && (
                                   <span className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest leading-none">
                                      <MapPin size={8} /> {(log.branchId as { branchName: string }).branchName}
                                   </span>
                                )}
                               <span className={`px-2.5 py-1 rounded-md bg-${style.color}-50 text-${style.color}-600 text-[8px] font-black uppercase tracking-widest border border-${style.color}-100/50`}>
                                 {style.label}
                               </span>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-lg font-black text-slate-800 tabular-nums">
                              {log.type === 'ADD' ? '+' : log.type === 'SUBTRACT' ? '-' : ''}{log.quantity}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                               {log.oldQuantity} → {log.newQuantity}
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pb-1">
                         <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-dotted border-slate-200">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                               <User size={12} />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                               <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">THỰC HIỆN BỞI</p>
                               <p className="text-[10px] font-black text-slate-600 truncate">{log.userId.fullName}</p>
                            </div>
                         </div>
                         {log.note && (
                           <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-dotted border-slate-200">
                              <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                 <FileText size={12} />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                 <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">GHI CHÚ</p>
                                 <p className="text-[10px] font-black text-slate-600 truncate italic">"{log.note}"</p>
                              </div>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                </MotionWrapper>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </Modal>
  )
}
