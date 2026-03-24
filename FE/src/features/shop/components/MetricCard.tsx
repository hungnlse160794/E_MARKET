import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { MotionWrapper } from "@/components/premium/MotionWrapper"

interface MetricCardProps {
  title: string
  value: string | number
  trendValue: string
  trendType: 'up' | 'down'
  label: string
}

export function MetricCard({ title, value, trendValue, trendType, label }: MetricCardProps) {
  return (
    <MotionWrapper 
      variant="slideUp"
      className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
          <div className="flex items-center gap-3">
             <div className="text-3xl font-extrabold text-slate-800 tracking-tight tabular-nums">{value}</div>
             <div className={`flex items-center text-[10px] font-bold uppercase tracking-wider ${trendType === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
               {trendType === 'up' ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
               {trendValue}
             </div>
          </div>
        </div>
        <div className="h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
           <Activity size={18} strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-[2px] w-full bg-slate-50 rounded-full overflow-hidden">
           <div 
             className={`h-full transition-all duration-1000 ${trendType === 'up' ? 'bg-indigo-500' : 'bg-rose-500'}`} 
             style={{ width: trendType === 'up' ? '75%' : '40%' }}
           />
        </div>
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{label}</p>
      </div>
    </MotionWrapper>
  )
}
