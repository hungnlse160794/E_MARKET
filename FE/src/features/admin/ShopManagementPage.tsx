import { 
  Store, 
  Search, 
  Filter, 
  MoreVertical,
  Plus,
  Users,
  TrendingUp,
  ShieldAlert,
  Calendar,
  ExternalLink,
  Mail
} from "lucide-react"
import { useState } from 'react'
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
import { toast } from "sonner"

// Mock Data
const MOCK_STATS = [
  { label: 'Tổng số Shop', value: '1,280', icon: <Store size={18} />, bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'border-indigo-100' },
  { label: 'Shop mới (tháng)', value: '+42', icon: <Plus size={18} />, bg: 'bg-teal-50', color: 'text-teal-600', border: 'border-teal-100' },
  { label: 'Doanh thu Hệ thống', value: '2.4B', icon: <TrendingUp size={18} />, bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100' },
  { label: 'Cần kiểm duyệt', value: '8', icon: <ShieldAlert size={18} />, bg: 'bg-rose-50', color: 'text-rose-600', border: 'border-rose-100' },
];

const MOCK_SHOPS = [
  { _id: 'S-9912', name: 'Fresh Marketplace', owner: 'Nguyễn Văn A', email: 'owner1@example.com', createdAt: '2024-03-10', status: 'ACTIVE', revenue: 150000000 },
  { _id: 'S-7721', name: 'Tech World Store', owner: 'Trần Thị B', email: 'owner2@example.com', createdAt: '2024-03-15', status: 'ACTIVE', revenue: 85000000 },
  { _id: 'S-8834', name: 'Beauty Haven', owner: 'Lê Văn C', email: 'owner3@example.com', createdAt: '2024-03-18', status: 'PENDING', revenue: 0 },
  { _id: 'S-1123', name: 'Green Garden', owner: 'Phạm Minh D', email: 'owner4@example.com', createdAt: '2024-02-28', status: 'LOCKED', revenue: 45000000 },
  { _id: 'S-4456', name: 'Gourmet Delights', owner: 'Hoàng Anh E', email: 'owner5@example.com', createdAt: '2024-01-12', status: 'ACTIVE', revenue: 320000000 },
];

export default function ShopManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const isLoading = false; // Mock loading state

  const handleAction = (id: string, action: string) => {
    toast.success(`Đã thực hiện ${action} cho Shop ${id}`);
  };

  return (
    <PageContainer className="p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 pb-10 border-b border-slate-100">
          <StaggerContainer staggerDelay={0.05}>
            <MotionWrapper variant="slideUp" className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-1.5 w-10 bg-indigo-500 rounded-full" />
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Hệ thống quản trị</p>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
                Quản lý <br /> 
                <span className="bg-linear-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent italic">Đối tác Shop.</span>
              </h1>
            </MotionWrapper>
          </StaggerContainer>
          
          <MotionWrapper variant="fadeIn" delay={0.2} className="flex flex-col sm:flex-row items-center gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <Input 
                   placeholder="Tìm kiếm shop, chủ sở hữu..." 
                   className="h-12 w-[320px] pl-12 pr-6 bg-slate-50 border-slate-200 rounded-2xl font-medium text-[13px] focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all">
                <Filter size={16} />
             </Button>
             <Button 
                className="h-12 px-8 rounded-2xl bg-indigo-600 text-white font-bold text-[12px] uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
             >
                Đăng ký Shop <Plus size={16} className="ml-2" />
             </Button>
          </MotionWrapper>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {MOCK_STATS.map((stat, idx) => (
             <MotionWrapper 
                key={idx} 
                variant="staggerItem" 
                className={`bg-white border ${stat.border} p-6 rounded-3xl shadow-sm hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 group`}
             >
                <div className="flex justify-between items-start mb-4">
                   <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {stat.icon}
                   </div>
                   <Badge variant="outline" className="border-slate-100 text-slate-400 text-[10px] font-bold">24H QUA</Badge>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
             </MotionWrapper>
           ))}
        </div>

        {/* Table Content */}
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
           <Table>
              <TableHeader className="bg-slate-50/50">
                 <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[100px] text-center py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thông tin Shop</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chủ sở hữu</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày gia nhập</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Doanh thu</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</TableHead>
                    <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Hành động</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {isLoading ? (
                    [1,2,3,4,5].map(i => (
                       <TableRow key={i}>
                          <TableCell colSpan={7}><Skeleton className="h-16 w-full" /></TableCell>
                       </TableRow>
                    ))
                 ) : (
                    MOCK_SHOPS.map((shop) => (
                       <TableRow key={shop._id} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                          <TableCell className="text-center py-6">
                             <span className="text-[10px] font-bold text-slate-400">{shop._id}</span>
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold border border-indigo-100">
                                   {shop.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold text-slate-700">{shop.name}</span>
                                   <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                      <Mail size={12} /> {shop.email}
                                   </div>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-2">
                                <Users size={14} className="text-slate-300" />
                                <span className="text-sm font-semibold text-slate-600">{shop.owner}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-300" />
                                <span className="text-sm font-semibold text-slate-600">{shop.createdAt}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                             <span className="text-sm font-black text-slate-700 tabular-nums">{shop.revenue.toLocaleString()}đ</span>
                          </TableCell>
                          <TableCell className="text-center">
                             <Badge variant={shop.status === 'ACTIVE' ? 'success' : shop.status === 'PENDING' ? 'warning' : 'destructive'} className="rounded-lg px-3 py-1 font-bold text-[9px] uppercase tracking-wider">
                                {shop.status}
                             </Badge>
                          </TableCell>
                          <TableCell className="text-right px-8">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm" onClick={() => handleAction(shop._id, 'xem chi tiết')}>
                                   <ExternalLink size={16} />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white hover:text-slate-800 hover:shadow-sm">
                                   <MoreVertical size={16} />
                                </Button>
                             </div>
                          </TableCell>
                       </TableRow>
                    ))
                 )}
              </TableBody>
           </Table>

           {/* Pagination */}
           <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiển thị 5 / 1,280 shop</p>
              <div className="flex gap-2">
                 <Button variant="outline" className="rounded-xl border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-widest h-10 px-6">Trước</Button>
                 <Button className="rounded-xl bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest h-10 px-6">Tiếp theo</Button>
              </div>
           </div>
        </div>

      </div>
    </PageContainer>
  )
}
