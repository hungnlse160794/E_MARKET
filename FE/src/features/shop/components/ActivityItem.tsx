import { MotionWrapper } from "@/components/premium/MotionWrapper"

interface ActivityItemProps {
  user: {
    name: string
    avatar: string
  }
  action: string
  time: string
}

export function ActivityItem({ user, action, time }: ActivityItemProps) {
  return (
    <MotionWrapper 
      variant="fadeIn"
      className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm flex-shrink-0">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-bold text-slate-700 tracking-tight">{user.name}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{action}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-200 group-hover:bg-indigo-500 transition-colors" />
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{time}</span>
      </div>
    </MotionWrapper>
  )
}
