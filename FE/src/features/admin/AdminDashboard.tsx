import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer 
} from 'recharts'
import { 
  Sparkles, 
  Zap, 
  Ticket, 
  Package,
  Activity,
  Users,
  CreditCard,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { PageContainer } from "@/components/premium/PageContainer"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import { Button } from "@/components/ui/button"

const SALES_DATA = [
  { name: 'Tuần 1', sales: 4000 },
  { name: 'Tuần 2', sales: 3000 },
  { name: 'Tuần 3', sales: 6000 },
  { name: 'Tuần 4', sales: 4500 },
]

const KPI_STATS = [
  { label: "Doanh thu", value: "124.5tr", icon: <CreditCard size={18} />, trend: "+12%", color: "from-indigo-500 to-violet-500", bgLight: "bg-indigo-50", textColor: "text-indigo-600", borderColor: "border-indigo-100" },
  { label: "Hoạt động", value: "3,210", icon: <Activity size={18} />, trend: "+5%", color: "from-teal-500 to-cyan-500", bgLight: "bg-teal-50", textColor: "text-teal-600", borderColor: "border-teal-100" },
  { label: "Người dùng", value: "48.2k", icon: <Users size={18} />, trend: "+8%", color: "from-amber-500 to-orange-500", bgLight: "bg-amber-50", textColor: "text-amber-600", borderColor: "border-amber-100" },
  { label: "Chờ xử lý", value: "28", icon: <Package size={18} />, trend: "Ổn định", color: "from-rose-500 to-pink-500", bgLight: "bg-rose-50", textColor: "text-rose-600", borderColor: "border-rose-100" }
]

export default function AdminDashboard() {
  return (
    <PageContainer className="p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 pb-10 border-b border-slate-100">
          <StaggerContainer staggerDelay={0.05}>
            <MotionWrapper variant="slideUp" className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-1.5 w-10 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Bảng điều khiển</p>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
                Tổng quan <br />
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Hệ thống.</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium">Theo dõi hiệu suất và quản lý mọi hoạt động trong một nơi duy nhất.</p>
            </MotionWrapper>
          </StaggerContainer>
          
          <MotionWrapper variant="fadeIn" delay={0.2} className="flex gap-3">
             <Button variant="outline" className="h-12 px-6 border-slate-200 rounded-xl font-bold text-[11px] uppercase tracking-wider text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                Xuất báo cáo
             </Button>
             <Button className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-[11px] uppercase tracking-wider hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-200 transition-all">
                Quản lý hệ thống
             </Button>
          </MotionWrapper>
        </div>

        {/* KPI Grid */}
        <StaggerContainer staggerDelay={0.05} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {KPI_STATS.map((stat, i) => (
            <MotionWrapper key={i} variant="staggerItem" className={`bg-white border ${stat.borderColor} p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group`}>
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <div className={`h-10 w-10 rounded-xl ${stat.bgLight} flex items-center justify-center ${stat.textColor} group-hover:bg-gradient-to-r group-hover:${stat.color} group-hover:text-white transition-all duration-300`}>
                  {stat.icon}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-extrabold tracking-tight text-slate-800">{stat.value}</div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-500">{stat.trend}</span>
                  <span className="text-[10px] text-slate-300 font-medium">so với kỳ trước</span>
                </div>
              </div>
            </MotionWrapper>
          ))}
        </StaggerContainer>

        {/* Main Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
           <MotionWrapper variant="slideUp" delay={0.2} className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-8 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-10">
                 <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-700">Phân tích doanh thu</h3>
                    <p className="text-[11px] font-medium text-slate-400">Dữ liệu theo tuần cập nhật realtime</p>
                 </div>
                 <div className="flex gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                 </div>
              </div>
              
              <div className="h-[380px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SALES_DATA}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} 
                      dy={16} 
                    />
                    <Tooltip 
                      cursor={{fill: '#F1F5F9'}} 
                      contentStyle={{
                        borderRadius: '12px', 
                        border: '1px solid #E2E8F0', 
                        fontSize: '12px', 
                        fontWeight: 700,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 10px 25px -5px rgba(79,70,229,0.1)'
                      }} 
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="url(#barGradient)" 
                      radius={[10, 10, 0, 0]} 
                      barSize={56} 
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="100%" stopColor="#4F46E5" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </MotionWrapper>

           <MotionWrapper variant="slideUp" delay={0.3} className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white rounded-2xl p-8 flex flex-col shadow-xl shadow-indigo-200 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-10 opacity-10 scale-125 rotate-12 transition-transform group-hover:scale-150 group-hover:rotate-0 duration-700">
                <Sparkles size={100} />
              </div>
              {/* Decorative circles */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
              <div className="absolute top-20 -right-8 w-24 h-24 bg-white/5 rounded-full" />

              <div className="relative z-10 space-y-10 h-full flex flex-col">
                <div className="space-y-4">
                   <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                     <Zap size={22} className="text-amber-300" />
                   </div>
                   <h3 className="text-2xl font-extrabold tracking-tight leading-snug">
                     Trung tâm <br />
                     <span className="text-indigo-200">Marketing.</span>
                   </h3>
                </div>

                <div className="space-y-3 flex-1">
                   {[
                     { title: "Flash Sale", icon: <Zap size={14} /> },
                     { title: "Voucher", icon: <Ticket size={14} /> },
                     { title: "Chiến dịch", icon: <Activity size={14} /> },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-pointer group/item">
                       <div className="flex items-center gap-3">
                          <div className="text-indigo-200 group-hover/item:text-white transition-colors">{item.icon}</div>
                          <span className="text-[12px] font-bold uppercase tracking-wider">{item.title}</span>
                       </div>
                       <ChevronRight size={14} className="text-indigo-300 group-hover/item:translate-x-1 transition-all" />
                     </div>
                   ))}
                </div>

                <Button className="w-full h-14 bg-white text-indigo-600 font-bold text-[12px] uppercase tracking-wider rounded-xl hover:bg-indigo-50 transition-all mt-auto shadow-lg">
                  Mở trung tâm
                </Button>
              </div>
           </MotionWrapper>
        </div>

      </div>
    </PageContainer>
  )
}
