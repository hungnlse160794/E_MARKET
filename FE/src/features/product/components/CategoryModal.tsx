import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { categorySchema, type CategoryInput } from "@/schemas/categorySchema";
import { useCreateCategory, useUpdateCategory } from "../hooks/useCategories";
import { Modal } from "@/components/premium/Modal";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tag, 
  Layers, 
  SortAsc, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import type { ICategory, ApiResponse } from "@/types";
import { toast } from "sonner";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ICategory | null;
  isLoading?: boolean;
  branchId: string;
  categories?: ICategory[];
}

const getParentId = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === 'string') return val.trim();
  
  if (Array.isArray(val)) {
    if (val.length === 0) return "";
    const first = val[0];
    if (typeof first === 'object' && first !== null) {
      const item = first as Record<string, unknown>;
      return String(item._id || item.id || "").trim();
    }
  }

  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    // Direct props
    if (obj._id) return String(obj._id).trim();
    if (obj.id) return String(obj.id).trim();
    if (obj.categoryId) return String(obj.categoryId).trim();

    // If it's literally just {"parentId": "..."}
    if (obj.parentId) return String(obj.parentId).trim();

    // Deep search or fallback
    const values = Object.values(obj);
    const firstStr = values.find(v => typeof v === 'string' && (v as string).length > 10);
    return firstStr ? String(firstStr).trim() : "";
  }
  
  return String(val).trim();
};

export const CategoryModal = ({ isOpen, onClose, initialData, isLoading, branchId, categories }: CategoryModalProps) => {
  const { user } = useAuthStore();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      parentId: "",
      shopId: user?.shopId || "",
      branchId: branchId || "",
      image: "",
      order: 0,
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (initialData) {
      const parentIdString = getParentId(initialData.parentId);
      form.reset({
        name: initialData.name,
        parentId: parentIdString,
        shopId: initialData.shopId || user?.shopId || "",
        branchId: initialData.branchId || branchId || "",
        image: initialData.image || "",
        order: initialData.order || 0,
        status: initialData.status || "ACTIVE",
      });
      // Force trigger value change for the select component to catch it
      form.setValue("parentId", parentIdString, { shouldDirty: false, shouldValidate: true });
    } else {
      form.reset({
        name: "",
        parentId: "",
        shopId: user?.shopId || "",
        branchId: branchId || "",
        image: "",
        order: 0,
        status: "ACTIVE",
      });
    }
  }, [initialData, form, user, branchId]);

  const onSubmit = (data: CategoryInput) => {
    if (initialData) {
      // For update, we only send fields allowed by the backend
      const { name, image, order, status, parentId } = data;
      updateCategory(
        { id: initialData._id, data: { name, image, order, status, parentId } },
        { 
          onSuccess: () => {
            onClose();
            toast.success("Cập nhật danh mục thành công!");
          },
          onError: (err: AxiosError) => {
             console.error("Update error feedback:", err);
             toast.error((err?.response?.data as ApiResponse<unknown>)?.message || "Cập nhật danh mục thất bại, vui lòng thử lại.");
          }
        }
      );
    } else {
      createCategory(data, { 
        onSuccess: () => {
          onClose();
          toast.success("Tạo danh mục mới thành công!");
        },
        onError: (err: AxiosError) => {
          console.error("Create error feedback:", err);
          toast.error((err?.response?.data as ApiResponse<unknown>)?.message || "Tạo danh mục thất bại, vui lòng thử lại.");
        }
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <div className="h-1.5 w-8 bg-indigo-500 rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Thiết lập chi nhánh</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-snug">
             {initialData ? "Hiệu chỉnh" : "Xây dựng"} <br/>
             <span className="bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent italic">Danh mục riêng.</span>
          </h2>
        </div>
      }
      className="max-w-3xl bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-[3rem]"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
               <div className="md:col-span-2 h-14 bg-slate-50 rounded-2xl animate-pulse" />
               <div className="h-14 bg-slate-50 rounded-2xl animate-pulse" />
               <div className="h-14 bg-slate-50 rounded-2xl animate-pulse" />
               <div className="h-14 bg-slate-50 rounded-2xl animate-pulse" />
               <div className="h-14 bg-slate-50 rounded-2xl animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            
            {/* Tên danh mục */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <Tag size={12} className="text-indigo-500" /> Tên định danh <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ví dụ: Đồ uống, Buffet sáng..." 
                      className="h-14 px-6 bg-slate-50/50 border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-rose-500 px-2" />
                </FormItem>
              )}
            />


            {/* Danh mục cha */}
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <Layers size={12} className="text-indigo-500" /> Cấp bậc danh mục
                  </FormLabel>
                  <Select 
                    key={field.value || "select-init"}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 px-6 bg-slate-50/50 border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 transition-all data-placeholder:text-slate-300">
                        <SelectValue placeholder="Gắn vào cấp cha" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-100 p-2 max-h-64 shadow-2xl overflow-hidden">
                      <SelectItem value="none" className="rounded-xl font-bold py-3 hover:bg-slate-50 cursor-pointer">Không có (Cấp cao nhất)</SelectItem>
                      
                      {/* Inject current parent if not in the list */}
                      {(() => {
                        const pid = getParentId(initialData?.parentId);
                        if (pid && !categories?.some(c => c._id === pid)) {
                          let parentName = "Danh mục cha (Khởi tạo)";
                          if (initialData?.parentId && typeof initialData.parentId === 'object') {
                            parentName = (initialData.parentId as ICategory).name || parentName;
                          }
                          return (
                            <SelectItem value={pid} className="rounded-xl font-bold py-3 transition-colors hover:bg-slate-50 cursor-pointer text-indigo-600">
                              {parentName}
                            </SelectItem>
                          );
                        }
                        return null;
                      })()}

                      {categories && categories.length > 0 ? (
                        categories
                          .filter(cat => cat._id !== initialData?._id)
                          .map((cat) => (
                          <SelectItem key={cat._id} value={cat._id} className="rounded-xl font-bold py-3 transition-colors hover:bg-slate-50 cursor-pointer">
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-300 font-bold text-xs uppercase tracking-widest">
                           Chưa có danh mục con nào
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] font-bold text-rose-500 px-2" />
                </FormItem>
              )}
            />

            {/* Thứ tự hiển thị */}
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <SortAsc size={12} className="text-indigo-500" /> Vị trí xếp hạng
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      className="h-14 px-6 bg-slate-50/50 border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 transition-all"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-2">
                    Thứ tự nhỏ hơn sẽ hiển thị trước.
                  </FormDescription>
                  <FormMessage className="text-[10px] font-bold text-rose-500 px-2" />
                </FormItem>
              )}
            />

            {/* Trạng thái */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    {field.value === 'ACTIVE' ? <Eye size={12} className="text-emerald-500" /> : <EyeOff size={12} className="text-slate-400" />} 
                    Chế độ xem
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 px-6 bg-slate-50/50 border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-slate-100 p-2 shadow-2xl overflow-hidden">
                      <SelectItem value="ACTIVE" className="rounded-xl font-bold py-3 text-emerald-600 hover:bg-slate-50 cursor-pointer">Công khai (Hiển thị ngay)</SelectItem>
                      <SelectItem value="HIDDEN" className="rounded-xl font-bold py-3 text-slate-400 hover:bg-slate-50 cursor-pointer">Lưu kho (Ẩn danh mục)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px] font-bold text-rose-500 px-2" />
                </FormItem>
              )}
            />

            {/* Ảnh danh mục */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <ImageIcon size={12} className="text-indigo-500" /> Ảnh biểu trưng (URL)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Gắn link ảnh tại đây..." 
                      className="h-14 px-6 bg-slate-50/50 border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-rose-500 px-2" />
                </FormItem>
              )}
            />
          </div>
          )}

          {Object.keys(form.formState.errors).length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 mt-6">
               <AlertCircle size={18} />
               <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">
                  Dữ liệu chưa hợp lệ. Vui lòng kiểm tra các trường đỏ.
               </p>
            </div>
          )}

          {/* Hidden validation for shopId/branchId to notify user if something is wrong */}
          {(!form.getValues("shopId") || !form.getValues("branchId")) && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 animate-pulse">
               <AlertCircle size={20} />
               <p className="text-xs font-black uppercase tracking-widest">
                  Thiếu thông tin nhận diện hệ thống. Vui lòng thử tải lại trang.
               </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-10 border-t border-slate-50">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-[0_20px_40px_-15px_rgba(30,41,59,0.2)] transition-all flex items-center gap-3 cursor-pointer"
            >
              {isCreating || isUpdating ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {initialData ? "Cập nhật dữ liệu" : "Xác nhận tạo"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};
