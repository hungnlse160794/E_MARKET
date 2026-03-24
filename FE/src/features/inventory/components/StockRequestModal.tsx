import { 
  Package, 
  Trash2,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useProducts } from "@/features/product/hooks/useProducts"
import { Skeleton } from "@/components/ui/skeleton"
import { Modal } from "@/components/premium/Modal"
import { stockRequestSchema, type StockRequestInput } from "@/schemas/inventorySchema"
import type { IProduct } from "@/types"

interface StockRequestModalProps {
  isOpen: boolean
  onClose: () => void
  branchId: string
  onSubmit: (data: StockRequestInput) => void
  isLoading: boolean
}

export const StockRequestModal = ({
  isOpen,
  onClose,
  branchId,
  onSubmit,
  isLoading
}: StockRequestModalProps) => {
  const { data: productsResult, isLoading: isProductsLoading } = useProducts(
    (isOpen && branchId !== 'all') ? branchId : null
  );
  const productsData = useMemo(() => productsResult?.docs || [], [productsResult]);
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<StockRequestInput>({
    resolver: zodResolver(stockRequestSchema),
    defaultValues: {
      branchId: branchId,
      items: [],
      notes: ""
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        branchId: branchId,
        items: [],
        notes: ""
      });
    }
  }, [isOpen, branchId, reset]);

  const onFormSubmit = (data: StockRequestInput) => {
    onSubmit(data);
    onClose();
  };

  const addItem = (productId: string) => {
    const product = productsData.find(p => p._id === productId);
    if (!product) return;

    const existingIndex = fields.findIndex(f => f.productId === productId);
    if (existingIndex > -1) {
      update(existingIndex, {
        ...fields[existingIndex],
        quantity: fields[existingIndex].quantity + 1
      });
    } else {
      append({
        productId: product._id,
        name: product.name,
        quantity: 1
      });
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={<>Yêu cầu <span className="text-indigo-600 underline underline-offset-4 decoration-indigo-200">Nhập Kho</span></>}
      maxWidth="max-w-[700px]"
    >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          {/* Product Selection */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Thêm sản phẩm cần nhập</Label>
            <div className="flex gap-3">
              <div className="flex-1">
                {isProductsLoading ? (
                  <Skeleton className="h-14 w-full rounded-2xl" />
                ) : (
                  <Select onValueChange={(val) => addItem(val)} value="">
                    <SelectTrigger className="h-14 border-slate-100 bg-slate-50/50 rounded-2xl font-bold text-sm shadow-inner transition-all hover:bg-slate-50 disabled:opacity-50">
                      <SelectValue placeholder={productsData.length === 0 ? "Không có sản phẩm nào" : "Chọn sản phẩm chi nhánh..."} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[400px]">
                      {productsData.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-300 uppercase tracking-widest font-black italic">
                           Danh mục rỗng
                        </div>
                      )}
                      {productsData.map((product: IProduct) => (
                        <SelectItem key={product._id} value={product._id} className="rounded-lg font-medium text-sm py-3 px-4 focus:bg-indigo-50">
                          <div className="flex items-center gap-3">
                             {product.images?.length > 0 ? (
                               <img src={product.images[0]} className="h-10 w-10 rounded-lg object-cover border border-slate-100" alt="" />
                             ) : (
                               <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                                  <Package size={18} />
                               </div>
                             )}
                             <div className="flex flex-col text-left">
                                <span className="font-bold text-slate-800 tracking-tight">{product.name}</span>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-tighter">{product.units[0]?.unitName}</span>
                             </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pl-1">
               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách đăng ký</Label>
               <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100/50">
                  {fields.length} SẢN PHẨM
               </span>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar min-h-[120px]">
              {fields.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-4xl border-2 border-dashed border-slate-100 text-slate-300 gap-3">
                   <Package size={32} strokeWidth={1.5} className="opacity-40" />
                   <p className="text-[10px] uppercase font-black tracking-[0.2em]">Chưa có sản phẩm nào</p>
                </div>
              ) : fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
                   <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-100">
                      <Package size={22} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate tracking-tight uppercase leading-none mb-1">{field.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        {productsData.find(p => p._id === field.productId)?.units[0]?.unitName || "Đơn vị"}
                      </p>
                   </div>
                   <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-all font-black text-lg"
                        onClick={() => {
                          const newQty = field.quantity - 1;
                          if (newQty >= 1) {
                            update(index, { ...field, quantity: newQty });
                          }
                        }}
                      >
                         -
                      </Button>
                      <Input 
                        type="number" 
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="h-9 w-12 border-none bg-transparent text-center font-black tabular-nums p-0 focus:ring-0 text-sm"
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-all font-black text-lg"
                        onClick={() => update(index, { ...field, quantity: field.quantity + 1 })}
                      >
                         +
                      </Button>
                   </div>
                   <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    onClick={() => remove(index)}
                   >
                      <Trash2 size={18} />
                   </Button>
                </div>
              ))}
            </div>
            {errors.items && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.items.message}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-4">
             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lưu ý / Ghi chú</Label>
             <Input 
                placeholder="Vd: Hàng đang rất gấp, sản phẩm đang bán chạy..." 
                {...register("notes")}
                className="h-16 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
             />
             {errors.notes && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.notes.message}</p>}
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <Button 
              type="button"
              variant="ghost" 
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100"
            >
              HỦY BỎ
            </Button>
            <Button 
              type="submit"
              disabled={fields.length === 0 || isLoading}
              className="flex-2 h-14 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              {isLoading ? 'ĐANG GỬI...' : 'XÁC NHẬN GỬI YÊU CẦU!'}
            </Button>
          </div>
        </form>
    </Modal>
  );
};
