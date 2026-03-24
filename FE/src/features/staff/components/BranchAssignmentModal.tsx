import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/premium/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useBranches } from "@/features/branch/hooks/useBranches";
import type { IUser } from "@/types";
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper";
import { Building2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { branchAssignmentSchema, type BranchAssignmentInput } from "@/schemas/staffSchema";

interface BranchAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: IUser | null;
  onSubmit: (managedBranches: string[]) => void;
  isLoading?: boolean;
}

export function BranchAssignmentModal({ 
  isOpen, 
  onClose, 
  staff, 
  onSubmit, 
  isLoading 
}: BranchAssignmentModalProps) {
  const { data: branchData } = useBranches();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<BranchAssignmentInput>({
    resolver: zodResolver(branchAssignmentSchema),
    defaultValues: {
      managedBranches: []
    }
  });

  const selectedBranches = watch("managedBranches");

  useEffect(() => {
    if (isOpen && staff) {
      const currentIds = (staff.managedBranches || []).map(b => 
        typeof b === 'object' ? b._id : b
      );
      reset({
        managedBranches: currentIds
      });
    }
  }, [isOpen, staff, reset]);

  const onFormSubmit = (data: BranchAssignmentInput) => {
    onSubmit(data.managedBranches);
  };

  const filteredBranches = branchData?.branches.filter(b => 
    b.branchName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="PHÂN PHỐI CHI NHÁNH QUẢN LÝ"
      maxWidth="max-w-[600px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 pb-6">
        <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
             <img 
               src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff?.email}`} 
               alt="Avatar" 
               className="w-10 h-10"
             />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{staff?.fullName}</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">{staff?.role === 'BRANCH_MANAGER' ? 'Quản lý Chi nhánh' : 'Nhân viên'}</p>
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
                onClick={() => reset({ managedBranches: [] })}
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
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar min-h-[100px]">
            <Controller
              name="managedBranches"
              control={control}
              render={({ field }) => (
                <StaggerContainer className="grid grid-cols-1 gap-3">
                  {filteredBranches.map((branch) => {
                    const isSelected = field.value.includes(branch._id);
                    return (
                      <MotionWrapper 
                        key={branch._id} 
                        variant="staggerItem"
                        onClick={() => {
                          const current = field.value;
                          const next = isSelected 
                            ? current.filter(id => id !== branch._id)
                            : [...current, branch._id];
                          field.onChange(next);
                        }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                            : 'bg-white border-slate-100 hover:border-indigo-100'
                        }`}
                      >
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => {
                            const current = field.value;
                            const next = isSelected 
                              ? current.filter(id => id !== branch._id)
                              : [...current, branch._id];
                            field.onChange(next);
                          }}
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
                      </MotionWrapper>
                    );
                  })}
                  {filteredBranches.length === 0 && (
                    <div className="text-center py-10 opacity-50 space-y-2">
                       <div className="h-12 w-12 bg-slate-50 rounded-full mx-auto flex items-center justify-center">
                          <Building2 size={20} className="text-slate-300" />
                       </div>
                       <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Không tìm thấy chi nhánh nào</p>
                    </div>
                  )}
                </StaggerContainer>
              )}
            />
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
    </Modal>
  );
}
