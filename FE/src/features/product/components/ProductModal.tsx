import { useForm, useFieldArray, Controller, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, CheckCircle2 } from "lucide-react"
import { Modal } from "@/components/premium/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { productSchema, type ProductInput } from "@/schemas/productSchema"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { IProduct, ICategory } from "@/types"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: IProduct | null
  onSubmit: (data: ProductInput) => void
  categories?: ICategory[]
}

export function ProductModal({ isOpen, onClose, initialData, onSubmit, categories = [] }: ProductModalProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      categoryId: typeof initialData.categoryId === 'string' ? initialData.categoryId : initialData.categoryId?._id,
      description: initialData.description,
      images: initialData.images,
      status: initialData.status ?? 'AVAILABLE',
      tags: initialData.tags || [],
      options: initialData.options?.map(o => ({
        name: o.name,
        price: o.price
      })) || [],
      units: initialData.units?.map(u => ({
         unitName: u.unitName,
         price: u.price,
         isDefault: !!u.isDefault
      })) || [{ unitName: 'Cái', price: 0, isDefault: true }],
    } : {
      name: '',
      categoryId: '',
      description: 'Sản phẩm mới chất lượng cao.',
      units: [{ unitName: 'Cái', price: 0, isDefault: true }],
      status: 'AVAILABLE',
      images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'],
      options: [],
      tags: [],
    }
  });

  const { fields: unitFields, append: appendUnit, remove: removeUnit } = useFieldArray({
    control,
    name: "units"
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: "options"
  });

  const onFormSubmit = (data: ProductInput) => {
    onSubmit(data);
  };

  const onFormError = (err: FieldErrors<ProductInput>) => {
    console.error("Product Form Errors:", err);
    toast.error("Vui lòng kiểm tra lại các thông tin sản phẩm");
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "CẬP NHẬT SẢN PHẨM" : "ĐĂNG KÝ SẢN PHẨM"}
      maxWidth="max-w-[850px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-12">
        
        {/* Basic Info Section */}
        <StaggerContainer staggerDelay={0.05}>
          <div className="space-y-6">
            <div className="flex items-center gap-4 py-2 border-b border-zinc-50">
               <div className="h-2 w-2 bg-black rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-widest text-black">Thông tin cơ bản</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Tên sản phẩm</Label>
                <Input 
                   placeholder="VD: Coca Cola 330ml" 
                   {...register("name")}
                   className="h-12 bg-slate-50 border-slate-200 rounded-xl px-5 font-bold text-sm text-slate-900"
                />
                {errors.name && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.name.message}</p>}
              </MotionWrapper>

              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Danh mục</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl px-5 font-bold text-sm text-slate-900 data-[placeholder]:text-slate-400">
                        <SelectValue placeholder="Chọn phân loại..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-xl bg-white p-2">
                        {!categories ? (
                           <div className="p-4 text-center text-xs font-bold text-slate-400">Đang tải danh mục...</div>
                        ) : categories.length === 0 ? (
                           <div className="p-4 text-center text-xs font-bold text-slate-400">Không có danh mục nào. Hãy tạo danh mục trước!</div>
                        ) : categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id} className="rounded-xl font-bold py-3 text-sm cursor-pointer hover:bg-slate-50">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.categoryId.message}</p>}
              </MotionWrapper>

              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Trạng thái</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl px-5 font-bold text-sm text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-xl bg-white p-2">
                         <SelectItem value="AVAILABLE" className="rounded-xl font-bold py-3 text-sm hover:bg-emerald-50 text-emerald-600">Sẵn sàng bán</SelectItem>
                         <SelectItem value="OUT_OF_STOCK" className="rounded-xl font-bold py-3 text-sm hover:bg-rose-50 text-rose-600">Hết hàng</SelectItem>
                         <SelectItem value="HIDDEN" className="rounded-xl font-bold py-3 text-sm hover:bg-slate-50 text-slate-400">Tạm ẩn</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </MotionWrapper>
            </div>

            <MotionWrapper variant="staggerItem" className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Mô tả sản phẩm</Label>
              <Textarea 
                 placeholder="Nhập chi tiết về sản phẩm..." 
                 {...register("description")}
                 className="min-h-[100px] bg-slate-50 border-slate-200 rounded-xl p-5 font-bold text-sm text-slate-900"
              />
              {errors.description && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.description.message}</p>}
            </MotionWrapper>

            <MotionWrapper variant="staggerItem" className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Hình ảnh (URL)</Label>
              <Input 
                 placeholder="Dán link ảnh tại đây..." 
                 defaultValue={initialData?.images?.[0] || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'}
                 onChange={(e) => setValue("images", [e.target.value])}
                 className="h-12 bg-slate-50 border-slate-200 rounded-xl px-5 font-bold text-sm text-slate-900"
              />
              {errors.images && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.images[0]?.message || errors.images.message}</p>}
            </MotionWrapper>
          </div>
        </StaggerContainer>

        {/* Multi-Unit Management Section */}
        <StaggerContainer staggerDelay={0.05} delayChildren={0.2}>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-2 border-b border-zinc-50">
               <div className="flex items-center gap-4">
                  <div className="h-2 w-2 bg-black rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Quản lý Đơn vị & Giá</span>
               </div>
               <Button 
                  type="button" 
                  onClick={() => appendUnit({ unitName: '', price: 0, isDefault: false })}
                  variant="outline" 
                   className="h-8 px-4 rounded-lg border-slate-200 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm text-slate-600"
               >
                  Thêm đơn vị <Plus size={12} className="ml-2" />
               </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {unitFields.map((field, index) => (
                 <MotionWrapper 
                   key={field.id} 
                   variant="staggerItem" 
                   className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 relative group flex gap-4"
                 >
                   <div className="flex-1 space-y-3">
                     <Input 
                       placeholder="Tên đơn vị (Cái, Chai...)" 
                       {...register(`units.${index}.unitName`)}
                       className="h-10 bg-white border-slate-100 text-xs font-bold text-slate-800"
                     />
                     <Input 
                       type="number" 
                       placeholder="Giá bán" 
                       {...register(`units.${index}.price`)}
                       className="h-10 bg-white border-slate-100 text-xs font-bold tabular-nums text-slate-800"
                     />
                   </div>
                   <div className="flex flex-col gap-2 shrink-0">
                     <Button 
                       type="button" 
                       onClick={() => removeUnit(index)}
                       variant="ghost" 
                       className="h-10 w-10 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-lg"
                       disabled={unitFields.length <= 1}
                     >
                       <Trash2 size={16} />
                     </Button>
                     <label className="flex items-center h-10 w-10 justify-center cursor-pointer group/check">
                       <input 
                          type="radio" 
                          className="hidden peer"
                          name="default_unit"
                          checked={field.isDefault}
                          onChange={() => {
                             unitFields.forEach((_, i) => setValue(`units.${i}.isDefault`, i === index));
                          }}
                       />
                       <CheckCircle2 size={18} className="text-slate-300 peer-checked:text-indigo-600 hover:text-slate-500 transition-all" />
                     </label>
                   </div>
                 </MotionWrapper>
               ))}
             </div>

            {errors.units && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.units.message}</p>}
          </div>
        </StaggerContainer>

        {/* Options Section */}
        <StaggerContainer staggerDelay={0.05} delayChildren={0.3}>
           <div className="space-y-6">
              <div className="flex items-center justify-between py-2 border-b border-zinc-50">
                 <div className="flex items-center gap-4">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">Tùy chọn thêm (Toppings/Options)</span>
                 </div>
                 <Button 
                    type="button" 
                    onClick={() => appendOption({ name: '', price: 0 })}
                    variant="outline" 
                    className="h-8 px-4 rounded-lg border-emerald-100 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm text-emerald-600"
                 >
                    Thêm tùy chọn <Plus size={12} className="ml-2" />
                 </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {optionFields.map((field, index) => (
                    <MotionWrapper key={field.id} className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-50 flex flex-col gap-3 relative group overflow-visible">
                       <Input 
                          placeholder="Tên (VD: Trân châu)" 
                          {...register(`options.${index}.name`)}
                          className="h-9 bg-white border-emerald-50 text-[11px] font-bold"
                       />
                       {errors.options?.[index]?.name && <p className="text-[8px] text-rose-500 font-bold uppercase">{errors.options[index].name?.message}</p>}
                       <Input 
                          type="number" 
                          placeholder="Giá" 
                          {...register(`options.${index}.price`)}
                          className="h-9 bg-white border-emerald-50 text-[11px] font-bold tabular-nums"
                       />
                       <Button 
                          type="button" 
                          onClick={() => removeOption(index)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-emerald-100 text-rose-500 shadow-sm p-0 flex items-center justify-center hover:bg-rose-50 transition-colors"
                       >
                          <Trash2 size={10} />
                       </Button>
                    </MotionWrapper>
                 ))}
                 {optionFields.length === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Không có tùy chọn thêm nào</p>
                    </div>
                 )}
              </div>
           </div>
        </StaggerContainer>

        {/* Action Controls */}
        <div className="pt-8 border-t border-slate-50 flex gap-4">
           <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-12 flex-1 rounded-xl border-slate-200 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
           >
              HỦY BỎ
           </Button>
           <Button 
              type="submit" 
              className="h-12 flex-1 rounded-xl bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-lg transition-all shadow-indigo-100/50"
           >
              {initialData ? "CẬP NHẬT" : "THÊM SẢN PHẨM"}
           </Button>
        </div>
        
      </form>
    </Modal>
  )
}
