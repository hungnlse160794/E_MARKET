import { useShopDashboard } from './hooks/useShopDashboard'
import { RevenueChart } from './components/RevenueChart'
import { MetricCard } from './components/MetricCard'
import { ActivityItem } from './components/ActivityItem'
import { ShopAdvisor, ProductSummary } from './components/SideCards'
import { 
    Calendar,
    ChevronDown,
    Filter,
    BarChart2,
    Activity,
    Cpu
} from 'lucide-react'
import { CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/premium/PageContainer'
import { MotionWrapper, StaggerContainer } from '@/components/premium/MotionWrapper'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { data: metrics, isLoading } = useShopDashboard();

  const renderDashboardSkeleton = () => (
    <div className="max-w-[1600px] mx-auto space-y-12">
       <div className="flex justify-between items-end gap-8 pb-10 border-b border-slate-100">
          <div className="space-y-4">
             <Skeleton className="h-4 w-32" />
             <Skeleton className="h-16 w-[400px]" />
          </div>
          <Skeleton className="h-12 w-64 rounded-xl" />
       </div>
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[180px] rounded-2xl" />)}
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
             <Skeleton className="h-[450px] w-full rounded-2xl" />
             <div className="grid grid-cols-2 gap-8">
                <Skeleton className="h-[200px] w-full rounded-2xl" />
                <Skeleton className="h-[200px] w-full rounded-2xl" />
             </div>
          </div>
          <div className="xl:col-span-4 h-full">
             <Skeleton className="h-[750px] w-full rounded-2xl" />
          </div>
       </div>
    </div>
  );

  return (
    <PageContainer className="p-4 md:p-10">
      {isLoading ? renderDashboardSkeleton() : (
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header Section: Vibrant & Modern */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-slate-100">
          <StaggerContainer staggerDelay={0.05}>
            <MotionWrapper variant="slideUp" className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-1.5 w-10 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Hệ thống vận hành : Đã tối ưu</p>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 leading-tight">
                Tổng quan <br />
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Cửa hàng.</span>
              </h1>
            </MotionWrapper>
          </StaggerContainer>
          
          <MotionWrapper variant="fadeIn" delay={0.1}>
            <div className="flex items-center gap-4 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
               <Button variant="ghost" className="h-11 px-5 rounded-xl font-bold text-[12px] text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                  <Calendar size={14} className="mr-3 text-slate-400" /> 12 - 19 Tháp 10
                  <ChevronDown size={14} className="ml-3 text-slate-300" />
               </Button>
               <div className="w-px h-6 bg-slate-100" />
               <Button variant="ghost" className="h-11 w-11 p-0 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                  <Filter size={18} /> 
               </Button>
               <Button className="h-11 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-[12px] uppercase tracking-wider hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-200 transition-all">
                  Tạo báo cáo <BarChart2 size={16} className="ml-3 opacity-70" />
               </Button>
            </div>
          </MotionWrapper>
        </div>

        {/* Metrics Grid */}
        <StaggerContainer staggerDelay={0.05} delayChildren={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MotionWrapper variant="staggerItem">
              <MetricCard 
                title="TỔNG DOANH THU" 
                value={`${metrics?.totalRevenue.toLocaleString()}đ`} 
                trendValue="+14.2%" 
                trendType="up" 
                label="Hiệu suất chu kỳ đỉnh" 
              />
            </MotionWrapper>
            <MotionWrapper variant="staggerItem">
              <MetricCard 
                title="PHIÊN HOẠT ĐỘNG" 
                value={metrics?.activeSessions || 0} 
                trendValue="+3.1%" 
                trendType="up" 
                label="Độ mạnh kết nối lưới" 
              />
            </MotionWrapper>
            <MotionWrapper variant="staggerItem">
              <MetricCard 
                title="LƯỢNG TRUY CẬP" 
                value={metrics?.packetVolume || 0} 
                trendValue="-2.4%" 
                trendType="down" 
                label="Tối ưu hóa độ trễ hoạt động" 
              />
            </MotionWrapper>
            <MotionWrapper variant="staggerItem">
              <MetricCard 
                title="ĐỘ ỔN ĐỊNH CỐT LÕI" 
                value={`${metrics?.coreStability}%`} 
                trendValue="+0.4%" 
                trendType="up" 
                label="Khả năng chịu tải tối đa" 
              />
            </MotionWrapper>
          </div>
        </StaggerContainer>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Primary View Area */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            <MotionWrapper variant="fadeIn" delay={0.2} className="flex-1 p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow min-h-[450px]">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-[16px] font-bold text-slate-800 uppercase tracking-tight">Biến động doanh thu</h3>
                   <div className="flex gap-4">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="h-2 w-2 bg-indigo-500 rounded-full" /> DỰ KIẾN
                     </span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="h-2 w-2 bg-slate-200 rounded-full" /> THỰC TẾ
                     </span>
                   </div>
                </div>
                {metrics && <RevenueChart data={metrics.revenueTrend} />}
            </MotionWrapper>
            
            <MotionWrapper variant="fadeIn" delay={0.25} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <ShopAdvisor />
               <ProductSummary />
            </MotionWrapper>
          </div>

          {/* Side Module: Live Intelligence Feed */}
          <div className="xl:col-span-4">
            <MotionWrapper variant="slideUp" delay={0.3} className="h-full">
              <div className="flex flex-col h-full min-h-[580px] bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <CardHeader className="p-8 pb-5 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <Activity size={18} strokeWidth={2.5} className="text-indigo-500" />
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Ma trận Trí tuệ</h4>
                       </div>
                       <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-all animate-pulse" />
                    </div>
                </CardHeader>
                <CardContent className="p-8 flex-1 flex flex-col justify-between space-y-12">
                   <div className="space-y-6">
                      {metrics?.recentActivities.map((act, i: number) => (
                        <ActivityItem 
                          key={i}
                          user={act.user}
                          action={act.action}
                          time={act.time}
                        />
                      ))}
                   </div>
                   
                   <div className="relative p-8 bg-slate-900 rounded-2xl text-center shadow-xl overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px]" />
                      <div className="relative z-10 space-y-5">
                         <div className="flex justify-center">
                            <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-indigo-300">
                               <Cpu size={24} />
                            </div>
                         </div>
                         <div className="space-y-1">
                           <h4 className="font-bold text-white text-xl uppercase tracking-tighter">Trung tâm Nexus</h4>
                           <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">Giao thức đồng bộ tự động tại 0.04ms.</p>
                         </div>
                         <Button className="w-full h-12 rounded-xl bg-white text-slate-900 font-bold uppercase text-[11px] tracking-wider hover:bg-slate-100 transition-all">
                            ĐỒNG BỘ HỆ THỐNG
                         </Button>
                      </div>
                   </div>
                </CardContent>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </div>
      )}
    </PageContainer>
  )
}
