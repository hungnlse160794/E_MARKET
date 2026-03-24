import { 
  Plus, 
  Users, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Search,
  Trash2,
  ExternalLink,
  Briefcase
} from "lucide-react"
import { useState } from 'react'
import { useStaff, useStaffById, useCreateStaff, useUpdateStaff, useUpdateManagedBranches, useDeleteStaff } from "./hooks/useStaff"
import { useBranches } from "@/features/branch/hooks/useBranches"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2 } from "lucide-react"
import { BranchAssignmentModal } from "./components/BranchAssignmentModal"
import { ConfirmModal } from "@/components/premium/ConfirmModal"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageContainer } from "@/components/premium/PageContainer"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { StaffModal } from "./components/StaffModal"
import type { IUser, IBranch } from "@/types"
import { UserRole } from "@/types"
import type { StaffInput } from "@/schemas/staffSchema"

export default function StaffManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState<IUser | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<IUser | null>(null);

  const { data: branchData } = useBranches();
  const { data: staffData, isLoading: isListLoading, isFetching } = useStaff({ 
    search: searchTerm,
    branchId: branchFilter === 'all' ? undefined : branchFilter
  });

  const { data: staffDetail, isLoading: isDetailLoading } = useStaffById(selectedUserId);

  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();
  const updateManagedBranchesMutation = useUpdateManagedBranches();
  const deleteStaffMutation = useDeleteStaff();

  const handleCreate = () => {
    setSelectedUserId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: StaffInput) => {
    if (selectedUserId) {
      updateStaffMutation.mutate({ id: selectedUserId, data }, {
        onSuccess: () => {
             setIsModalOpen(false);
             setSelectedUserId(null);
        }
      });
    } else {
      createStaffMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleAssignBranches = (staff: IUser) => {
    setAssigningStaff(staff);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = (managedBranches: string[]) => {
    if (assigningStaff) {
      updateManagedBranchesMutation.mutate({ 
        userId: assigningStaff._id, 
        managedBranches 
      }, {
        onSuccess: () => setIsAssignModalOpen(false)
      });
    }
  };

  const handleDelete = (staff: IUser) => {
    setDeletingStaff(staff);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingStaff) {
      deleteStaffMutation.mutate(deletingStaff._id, {
        onSuccess: () => setIsDeleteModalOpen(false)
      });
    }
  };

  const renderStats = () => {
    if (isListLoading || isFetching) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2">
                   <Skeleton className="h-3 w-20 rounded-full" />
                   <Skeleton className="h-8 w-12 rounded-lg" />
                </div>
             </div>
           ))}
        </div>
      );
    }

    const stats = [
      { label: 'Tổng nhân sự', value: staffData?.total || 0, icon: <Users size={18} />, bg: 'bg-indigo-50', color: 'text-indigo-600' },
      { label: 'Đang hoạt động', value: staffData?.staff.length || 0, icon: <ShieldCheck size={18} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
      { label: 'Vai trò quản lý', value: staffData?.staff.filter(s => s.role === 'BRANCH_MANAGER').length || 0, icon: <Briefcase size={18} />, bg: 'bg-amber-50', color: 'text-amber-600' },
    ];

    return (
      <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <MotionWrapper key={idx} variant="staggerItem" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
            </div>
          </MotionWrapper>
        ))}
      </StaggerContainer>
    );
  };

  const renderTable = () => {
    if (isListLoading || isFetching) {
      return (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex gap-4 mb-10 border-b border-slate-50 pb-6 opacity-40">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-3 flex-1 rounded-full" />)}
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-8 py-6 border-b last:border-0 border-slate-50">
               <Skeleton className="h-4 w-6 rounded-md opacity-30" />
               <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3 rounded-lg" />
                    <Skeleton className="h-3 w-1/4 rounded-lg opacity-50" />
                  </div>
               </div>
               <div className="flex-1 space-y-2">
                 <Skeleton className="h-3 w-1/2 rounded-lg opacity-40" />
                 <Skeleton className="h-3 w-1/3 rounded-lg opacity-40" />
               </div>
               <Skeleton className="h-7 w-20 rounded-lg flex-1 max-w-[80px]" />
               <Skeleton className="h-10 w-28 rounded-xl flex-1 max-w-[120px]" />
               <div className="flex gap-2">
                 <Skeleton className="h-9 w-20 rounded-xl" />
                 <Skeleton className="h-9 w-20 rounded-xl" />
               </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[80px] text-center font-bold text-[10px] uppercase tracking-widest text-slate-400 py-6">STT</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Nhân viên</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Liên hệ</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Vai trò</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-center">Chi nhánh</TableHead>
              <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-slate-400 px-8">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffData?.staff.map((staff, idx) => (
              <TableRow key={staff._id} className="group hover:bg-slate-50/50 transition-colors border-slate-100 border-b last:border-0">
                <TableCell className="text-center py-6 font-bold text-slate-400 tabular-nums">
                  {(idx + 1).toString().padStart(2, '0')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.email}`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{staff.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{staff.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail size={12} />
                      <span className="text-[11px] font-medium">{staff.email}</span>
                    </div>
                    {staff.phone && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone size={12} />
                        <span className="text-[11px] font-medium">{staff.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    staff.role === 'BRANCH_MANAGER' ? 'bg-amber-100 text-amber-600 hover:bg-amber-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}>
                    {staff.role === 'BRANCH_MANAGER' ? 'Quản lý' : 'Nhân viên'}
                  </Badge>
                </TableCell>
                  <TableCell className="text-center py-6">
                    <div className="flex flex-col items-center">
                      {staff.role === UserRole.BRANCH_MANAGER ? (
                        <div className="flex flex-wrap justify-center gap-1 max-w-[150px]">
                          {(staff.managedBranches as (string | IBranch)[] || []).length > 0 ? (
                            (staff.managedBranches as (string | IBranch)[]).map((mb, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] bg-indigo-50/50 text-indigo-700 border-indigo-100 font-bold px-1.5 py-0">
                                {typeof mb === 'object' ? mb.branchName : 'Branch'}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Chưa gán chi nhánh</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] font-black text-slate-600">
                          {staff.branchId && typeof staff.branchId === 'object' ? (staff.branchId as IBranch).branchName : 'Chưa gán'}
                        </span>
                      )}
                    </div>
                </TableCell>
                <TableCell className="text-right px-8">
                  <div className="flex items-center justify-end gap-2 transition-all">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-3 rounded-xl border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-wider transition-all" 
                      onClick={() => handleEdit(staff._id)}
                    >
                      <ExternalLink size={14} className="mr-1.5" /> Sửa
                    </Button>
                    {staff.role === 'BRANCH_MANAGER' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 px-3 rounded-xl border-slate-100 hover:border-violet-100 hover:bg-violet-50 hover:text-violet-600 font-bold text-[10px] uppercase tracking-wider transition-all" 
                        onClick={() => handleAssignBranches(staff)}
                      >
                        <Building2 size={14} className="mr-1.5" /> Phân phối
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-3 rounded-xl border-slate-100 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 font-bold text-[10px] uppercase tracking-wider transition-all"
                      onClick={() => handleDelete(staff)}
                      disabled={deleteStaffMutation.isPending}
                    >
                      <Trash2 size={14} className="mr-1.5" /> Xóa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <PageContainer className="p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 pb-10 border-b border-slate-100">
          <StaggerContainer staggerDelay={0.05}>
            <MotionWrapper variant="slideUp" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-10 bg-indigo-500 rounded-full" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hệ thống nhân sự</p>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-800 leading-tight">
                Quản lý <br />
                <span className="bg-linear-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent italic">Đội ngũ.</span>
              </h1>
            </MotionWrapper>
          </StaggerContainer>

          <MotionWrapper variant="fadeIn" delay={0.2} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <Input 
                placeholder="Tìm tên, email..." 
                className="h-12 w-full sm:w-64 pl-10 pr-4 bg-slate-50 border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-48">
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/50 transition-all">
                  <SelectValue placeholder="Tất cả chi nhánh" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all" className="font-bold text-xs uppercase tracking-widest">Tất cả chi nhánh</SelectItem>
                  {branchData?.branches.map((b) => (
                    <SelectItem key={b._id} value={b._id} className="font-bold text-xs uppercase tracking-widest">
                      {b.branchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
               onClick={handleCreate}
               className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all"
            >
              Thêm nhân sự <Plus size={16} className="ml-2" strokeWidth={3} />
            </Button>
          </MotionWrapper>
        </div>

        {renderStats()}
        <MotionWrapper variant="fadeIn" delay={0.3}>
          {renderTable()}
        </MotionWrapper>

        <StaffModal 
          isOpen={isModalOpen}
          onClose={() => {
              setIsModalOpen(false);
              setSelectedUserId(null);
          }}
          initialData={staffDetail || null}
          onSubmit={handleFormSubmit}
          isLoading={createStaffMutation.isPending || updateStaffMutation.isPending || isDetailLoading}
        />

        <BranchAssignmentModal 
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          staff={assigningStaff}
          onSubmit={handleAssignSubmit}
          isLoading={updateManagedBranchesMutation.isPending}
        />

        <ConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={deleteStaffMutation.isPending}
          title="XÁC NHẬN XÓA TÀI KHOẢN"
          description={`Bạn có chắc chắn muốn xóa tài khoản ${deletingStaff?.fullName}? Hành động này không thể hoàn tác.`}
        />
      </div>
    </PageContainer>
  );
}
