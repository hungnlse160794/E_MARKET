import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Modal } from "@/components/premium/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import type { IInventory } from "@/types"
import { ArrowRight } from "lucide-react"
import { inventoryUpdateSchema, type InventoryUpdateInput } from "@/schemas/inventorySchema"

interface InventoryUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  item: IInventory | null
  onUpdate: (data: InventoryUpdateInput) => void
  isLoading?: boolean
}

export function InventoryUpdateModal({ isOpen, onClose, item, onUpdate, isLoading }: InventoryUpdateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors }
  } = useForm<InventoryUpdateInput>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
      type: 'ADD',
      stockQuantity: 0,
      note: '',
    }
  });

  const type = watch('type');
  const quantity = watch('stockQuantity');

  useEffect(() => {
    if (isOpen && item) {
      reset({
        productId: item.productId._id,
        branchId: typeof item.branchId === 'object' ? item.branchId._id : item.branchId,
        stockQuantity: 0,
        type: 'ADD',
        note: '',
      });
    }
  }, [isOpen, item, reset]);

  const onFormSubmit = (data: InventoryUpdateInput) => {
    onUpdate(data);
  };

  if (!item) return null;

  const currentStock = item.stockQuantity;
  const newStock = type === 'ADD' ? currentStock + quantity : type === 'SUBTRACT' ? currentStock - quantity : quantity;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="ĐIỀU CHỈNH TỒN KHO"
      maxWidth="max-w-[550px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        <StaggerContainer staggerDelay={0.05}>
          {/* Item Info */}
          <MotionWrapper variant="slideUp" className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6">
             <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden shadow-sm">
                <img src={item.productId.images[0]} alt={item.productId.name} className="h-full w-full object-cover rounded-xl" />
             </div>
             <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{item.productId.name}</h4>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tồn hiện tại: {currentStock} {item.productId.units[0].unitName}</span>
                </div>
             </div>
          </MotionWrapper>

          {/* Type Selector */}
          <MotionWrapper variant="slideUp" className="grid grid-cols-3 gap-3">
             <Controller
               name="type"
               control={control}
               render={({ field }) => (
                 <>
                   {[
                     { id: 'ADD', label: 'NHẬP THÊM', color: 'indigo' },
                     { id: 'SUBTRACT', label: 'XUẤT KHO', color: 'rose' },
                     { id: 'SET', label: 'THIẾT LẬP', color: 'amber' }
                   ].map((opt) => (
                     <button
                       key={opt.id}
                       type="button"
                       onClick={() => field.onChange(opt.id)}
                       className={`py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-wider transition-all shadow-sm ${
                         field.value === opt.id 
                          ? `bg-${opt.color}-600 border-${opt.color}-600 text-white scale-[1.05] shadow-lg` 
                          : `bg-white border-slate-100 text-slate-400 hover:border-${opt.color}-200`
                       }`}
                     >
                       {opt.label}
                     </button>
                   ))}
                 </>
               )}
             />
          </MotionWrapper>

          <div className="grid grid-cols-1 gap-6">
             <MotionWrapper variant="slideUp" className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Số lượng {type === 'SET' ? 'mới' : 'thay đổi'}</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    min={0}
                    {...register("stockQuantity", { valueAsNumber: true })}
                    className="h-16 bg-slate-50 border-slate-100 rounded-2xl px-8 font-black text-2xl tabular-nums focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                  <div className="h-16 px-8 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm uppercase tracking-widest shrink-0">
                    {item.productId.units[0].unitName}
                  </div>
                </div>
                {errors.stockQuantity && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.stockQuantity.message}</p>}
             </MotionWrapper>

             {/* Calculation Preview */}
             <MotionWrapper variant="slideUp" className="flex items-center justify-center gap-6 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <div className="text-center">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">HIỆN TẠI</p>
                   <p className="text-xl font-black text-slate-600 tabular-nums">{currentStock}</p>
                </div>
                <ArrowRight className="text-indigo-300" size={20} strokeWidth={3} />
                <div className="text-center">
                   <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">SAU CẬP NHẬT</p>
                   <p className={`text-2xl font-black tabular-nums ${newStock < 0 ? 'text-rose-600' : 'text-indigo-600'}`}>{newStock}</p>
                </div>
             </MotionWrapper>

             <MotionWrapper variant="slideUp" className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Ghi chú (Tùy chọn)</Label>
                <Textarea 
                  placeholder="Nhập lý do điều chỉnh..." 
                  {...register("note")}
                  className="bg-slate-50 border-slate-100 rounded-2xl p-6 font-bold text-sm min-h-[100px] focus:ring-4 focus:ring-indigo-500/10"
                />
                {errors.note && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.note.message}</p>}
             </MotionWrapper>
          </div>
        </StaggerContainer>

        <div className="flex gap-4 pt-4 border-t border-slate-50">
           <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-16 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50"
           >
              HỦY BỎ
           </Button>
           <Button 
            type="submit" 
            disabled={isLoading || (type === 'SUBTRACT' && newStock < 0)}
            className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
           >
              {isLoading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN CẬP NHẬT"}
           </Button>
        </div>
      </form>
    </Modal>
  )
}
