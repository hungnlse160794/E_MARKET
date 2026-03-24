import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Modal } from "@/components/premium/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { staffSchema, type StaffInput } from "@/schemas/staffSchema"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBranches } from "@/features/branch/hooks/useBranches"
import { useEffect, useState } from "react";
import type { IUser, IBranch } from "@/types";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface StaffModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: IUser | null
  onSubmit: (data: StaffInput) => void
  isLoading?: boolean
}

export function StaffModal({ isOpen, onClose, initialData, onSubmit, isLoading }: StaffModalProps) {
  const { data: branchData } = useBranches();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm<StaffInput>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: 'STAFF',
    }
  });

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          fullName: initialData.fullName,
          email: initialData.email,
          phone: initialData.phone || "",
          role: initialData.role as 'STAFF' | 'BRANCH_MANAGER',
          branchId: typeof initialData.branchId === 'object' ? initialData.branchId._id : initialData.branchId,
          password: "" 
        });
      } else {
        reset({
          role: 'STAFF',
          fullName: "",
          email: "",
          phone: "",
          password: "",
          branchId: undefined
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onFormSubmit = (data: StaffInput) => {
    // Validate mật khẩu chỉ khi tạo mới
    if (!initialData && (!data.password || data.password.length < 8)) {
      toast.error("Mật khẩu là bắt buộc và phải có ít nhất 8 ký tự khi tạo mới");
      return;
    }
    
    // Nếu là edit, xóa mật khẩu nếu để trống để tránh ghi đè (backend đã có check nhưng frontend nên sạch sẽ)
    const payload = { ...data };
    if (initialData && !payload.password) {
        delete payload.password;
    }

    onSubmit(payload);
  };

  const currentRole = watch("role");

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "CẬP NHẬT NHÂN SỰ" : "ĐĂNG KÝ NHÂN SỰ"}
      maxWidth="max-w-[800px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-12 pb-10">
        
        <StaggerContainer staggerDelay={0.05}>
          <div className="space-y-6">
            <div className="flex items-center gap-4 py-2 border-b border-zinc-50">
               <div className="h-2 w-2 bg-indigo-500 rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Thông tin cá nhân</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">Họ và tên</Label>
                <Input 
                   placeholder="VD: Nguyễn Văn A" 
                   {...register("fullName")}
                   className="h-12 bg-slate-50 border-slate-100 rounded-xl px-5 font-bold text-sm"
                />
                {errors.fullName && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.fullName.message}</p>}
              </MotionWrapper>

              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">Email Công vụ</Label>
                <Input 
                   placeholder="staff@example.com" 
                   {...register("email")}
                   className="h-12 bg-slate-50 border-slate-100 rounded-xl px-5 font-bold text-sm"
                   disabled={!!initialData} // Không cho đổi email khi edit
                />
                {errors.email && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.email.message}</p>}
              </MotionWrapper>

              {!initialData && (
                <MotionWrapper variant="staggerItem" className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">Mật khẩu</Label>
                    <div className="relative group">
                    <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        {...register("password")}
                        className="h-12 bg-slate-50 border-slate-100 rounded-xl px-5 pr-12 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                    {errors.password && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.password.message}</p>}
                </MotionWrapper>
              )}

              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">Số điện thoại</Label>
                <Input 
                   placeholder="0912345678" 
                   {...register("phone")}
                   className="h-12 bg-slate-50 border-slate-100 rounded-xl px-5 font-bold text-sm"
                />
                {errors.phone && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.phone.message}</p>}
              </MotionWrapper>
            </div>
          </div>
        </StaggerContainer>

        <StaggerContainer staggerDelay={0.05} delayChildren={0.2}>
          <div className="space-y-6">
            <div className="flex items-center gap-4 py-2 border-b border-zinc-50">
               <div className="h-2 w-2 bg-indigo-500 rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Công việc</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">Vai trò</Label>
                <Select 
                  value={watch("role")} 
                  onValueChange={(val: 'STAFF' | 'BRANCH_MANAGER') => {
                    setValue("role", val, { shouldValidate: true });
                  }}
                  // Role bây giờ có thể đổi khi Edit
                >
                  <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl px-5 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl overflow-hidden">
                    <SelectItem value="STAFF" className="font-bold text-xs uppercase tracking-widest py-3 focus:bg-indigo-50">Nhân viên (STAFF)</SelectItem>
                    <SelectItem value="BRANCH_MANAGER" className="font-bold text-xs uppercase tracking-widest py-3 focus:bg-indigo-50">Quản lý (MANAGER)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.role.message}</p>}
              </MotionWrapper>

              {/* Luôn cho chọn chi nhánh chi nhân viên. 
                  Với Manager, chi nhánh được chọn ở đây là chi nhánh quản lý chính. */}
              {currentRole === 'STAFF' ? (
                <MotionWrapper variant="staggerItem" className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">Cơ sở công tác</Label>
                    <Select 
                    value={watch("branchId") || undefined}
                    onValueChange={(val) => {
                        setValue("branchId", val, { shouldValidate: true });
                    }}
                    >
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl px-5 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm">
                        <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl overflow-hidden">
                        {branchData?.branches.map((b) => (
                        <SelectItem key={b._id} value={b._id} className="font-bold text-xs uppercase tracking-widest py-3 focus:bg-indigo-50">
                            {b.branchName}
                        </SelectItem>
                        ))}
                        {!branchData?.branches.length && <SelectItem value="none" disabled className="text-[10px] italic">Không có chi nhánh</SelectItem>}
                    </SelectContent>
                    </Select>
                    {errors.branchId && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.branchId.message}</p>}
                </MotionWrapper>
              ) : (
                <MotionWrapper variant="staggerItem" className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">Phạm vi quản lý hiện tại</Label>
                    <div className="min-h-12 bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-wrap gap-2 items-center shadow-inner">
                        {/* Nếu đang sửa manager và ban đầu đúng là manager, hiển thị các chi nhánh họ quản lý */}
                        {(initialData?.role === 'BRANCH_MANAGER' && (initialData?.managedBranches as (string | IBranch)[] || []).length > 0) ? (
                           (initialData?.managedBranches as (string | IBranch)[]).map((branch, i: number) => (
                             <div key={i} className="bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">
                                    {typeof branch === 'object' ? (branch as IBranch).branchName : 'CHI NHÁNH'}
                                </span>
                             </div>
                           ))
                        ) : (
                            <div className="px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">
                                    {initialData?.role === 'STAFF' ? "Manager mới (Sẽ gán sau khi lưu)" : "Chưa có phạm vi quản lý"}
                                </span>
                            </div>
                        )}
                    </div>
                </MotionWrapper>
              )}

            </div>
          </div>
        </StaggerContainer>

        <div className="pt-8 flex gap-4">
           <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-12 flex-1 rounded-xl border-slate-100 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
           >
              HỦY BỎ
           </Button>
           <Button 
              type="submit" 
              disabled={isLoading}
              className="h-12 flex-1 rounded-xl bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-lg transition-all shadow-indigo-100 disabled:opacity-50"
           >
              {isLoading ? "ĐANG XỬ LÝ..." : (initialData ? "CẬP NHẬT TÀI KHOẢN" : "TẠO TÀI KHOẢN")}
           </Button>
        </div>
        
      </form>
    </Modal>
  )
}
