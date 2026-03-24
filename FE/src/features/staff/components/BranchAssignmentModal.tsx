import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/premium/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useBranches } from "@/features/branch/hooks/useBranches";
import { useStaffById } from "../hooks/useStaff";
import type { IUser, IBranch } from "@/types";
import { Building2, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { branchAssignmentSchema, type BranchAssignmentInput } from "@/schemas/staffSchema";

interface BranchAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: IUser | null;
  onSubmit: (managedBranches: string[]) => void;
  isLoading?: boolean;
}

export function BranchAssignmentModal(props: BranchAssignmentModalProps) {
  const { staff, isOpen, onClose } = props;
  const { data: staffDetail, isLoading: isDetailLoading } = useStaffById(isOpen ? staff?._id || null : null);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="PHÂN PHỐI CHI NHÁNH QUẢN LÝ"
      maxWidth="max-w-[600px]"
    >
      {(isDetailLoading && !staffDetail) ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Đang tải dữ liệu chi tiết...</p>
        </div>
      ) : (
        <BranchAssignmentForm {...props} staffDetail={staffDetail || staff} />
      )}
    </Modal>
  );
}

function BranchAssignmentForm({ 
  staffDetail, 
  onClose, 
  onSubmit, 
  isLoading 
}: BranchAssignmentModalProps & { staffDetail: IUser | null }) {
  const { data: branchData } = useBranches();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Flag để ngăn chặn đè cập nhật
  const updatingRef = useRef(false);

  // Chuẩn hóa dữ liệu đầu vào thành chuỗi string ID
  const initialManagedBranches = useMemo(() => {
    if (!staffDetail?.managedBranches) return [];
    return staffDetail.managedBranches.map((b: string | IBranch) => {
      if (typeof b === 'string') return b;
      return String(b._id);
    }).filter(Boolean);
  }, [staffDetail]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<BranchAssignmentInput>({
    resolver: zodResolver(branchAssignmentSchema),
    defaultValues: {
      managedBranches: initialManagedBranches
    }
  });

  // Đảm bảo field được đăng ký với Hook Form
  useEffect(() => {
    register("managedBranches");
  }, [register]);

  const selectedBranches = useWatch({
    control,
    name: "managedBranches",
  }) || [];

  const onFormSubmit = (data: BranchAssignmentInput) => {
    onSubmit(data.managedBranches);
  };

  const filteredBranches = useMemo(() => {
    return branchData?.branches.filter(b => 
      b.branchName.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [branchData?.branches, searchQuery]);

  // Hàm toggle ổn định
  const handleToggleBranch = useCallback((branchId: string) => {
    if (updatingRef.current) return;
    updatingRef.current = true;

    try {
      const current = (getValues("managedBranches") || []).map(String);
      const targetId = String(branchId);
      const isSelected = current.includes(targetId);
      
      const next = isSelected 
        ? current.filter(id => id !== targetId)
        : [...current, targetId];
      
      setValue("managedBranches", next, { 
        shouldDirty: true,
        shouldValidate: false // Tắt validation để tránh loop khi đang thao tác
      });
    } finally {
      // Cho một khoảng delay nhỏ để React kịp xử lý re-render
      setTimeout(() => {
        updatingRef.current = false;
      }, 0);
    }
  }, [getValues, setValue]);

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className="space-y-8 pb-6"
    >
      <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
           <img 
             src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staffDetail?.email}`} 
             alt="Avatar" 
             className="w-10 h-10"
           />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{staffDetail?.fullName || 'Người dùng'}</p>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">{staffDetail?.role === 'BRANCH_MANAGER' ? 'Quản lý Chi nhánh' : 'Nhân viên'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
            <Building2 size={14} className="text-indigo-500" />
            Chọn danh sách cơ sở ({selectedBranches.length})
          </Label>
          {selectedBranches.length > 0 && (
            <button 
              type="button"
              onClick={() => setValue("managedBranches", [], { shouldDirty: true })}
              className="text-[9px] font-bold text-rose-500 uppercase hover:underline"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
          <Input 
            placeholder="Tìm tên chi nhánh..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10 bg-slate-50 border-slate-100 rounded-xl text-sm font-bold shadow-inner"
          />
        </div>

        <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar min-h-[100px]">
          <div className="grid grid-cols-1 gap-3">
            {filteredBranches.map((branch) => {
              const isSelected = selectedBranches.includes(String(branch._id));
              
              return (
                <div 
                  key={branch._id} 
                  onClick={() => handleToggleBranch(branch._id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-indigo-100'
                  }`}
                >
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => handleToggleBranch(branch._id)}
                    onClick={(e) => e.stopPropagation()} // Chặn click lan ra div
                    className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded-md"
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {branch.branchName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                      {branch.address.fullAddress}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {errors.managedBranches && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.managedBranches.message}</p>}
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-50">
        <Button 
          type="button"
          variant="ghost" 
          onClick={onClose}
          className="h-12 flex-1 rounded-xl font-extrabold text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50"
        >
          HỦY BỎ
        </Button>
        <Button 
          type="submit"
          disabled={isLoading || selectedBranches.length === 0}
          className="h-12 flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? "ĐANG LƯU..." : "XÁC NHẬN PHÂN PHỐI"}
        </Button>
      </div>
    </form>
  );
}
