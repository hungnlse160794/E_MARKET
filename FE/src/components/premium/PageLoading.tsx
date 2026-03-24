import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "./PageContainer";

export function PageLoading() {
  return (
    <PageContainer withGrid={true} withGlows={true}>
      <div className="p-6 md:p-12 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <Skeleton className="h-[14px] w-2rounded-full animate-pulse-fast bg-indigo-400/20!" />
               <Skeleton className="h-[14px] w-32 rounded-full bg-slate-200/50!" />
             </div>
             <Skeleton className="h-12 w-[280px] md:w-[450px] rounded-2xl bg-slate-200/80!" />
          </div>
          <div className="flex gap-4 items-center">
            <Skeleton className="h-11 w-32 rounded-xl bg-slate-100/60!" />
            <Skeleton className="h-14 w-48 rounded-2xl bg-indigo-100/50! shadow-sm border border-indigo-200/30" />
          </div>
        </div>

        {/* Top Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[1, 2, 3].map((i) => (
             <div key={i} className="bg-white/60 backdrop-blur-md border border-white p-8 rounded-[32px] shadow-sm flex flex-col gap-5">
                <div className="flex justify-between items-start">
                   <Skeleton className="h-12 w-12 rounded-2xl bg-slate-100!" />
                   <Skeleton className="h-6 w-16 rounded-full bg-slate-50!" />
                </div>
                <div className="space-y-3">
                   <Skeleton className="h-4 w-24 rounded-full bg-slate-200/50!" />
                   <Skeleton className="h-8 w-40 rounded-xl bg-slate-200/80!" />
                </div>
             </div>
           ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(79,70,229,0.15)] space-y-8 min-h-[500px]">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50/50 pb-8">
              <div className="space-y-2">
                 <Skeleton className="h-7 w-56 rounded-xl bg-slate-800/5!" />
                 <Skeleton className="h-4 w-40 rounded-lg bg-slate-400/10!" />
              </div>
              <div className="flex gap-3">
                 <Skeleton className="h-10 w-32 rounded-xl bg-slate-100/80!" />
                 <Skeleton className="h-10 w-10 rounded-xl bg-slate-100/80!" />
              </div>
           </div>
           
           <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-6 items-center p-4 rounded-3xl hover:bg-slate-50/50 transition-all border border-transparent">
                    <Skeleton className="h-14 w-14 rounded-2xl bg-indigo-50!" />
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-[40%] rounded-full bg-slate-200/60!" />
                        <Skeleton className="h-4 w-16 rounded-full bg-slate-100!" />
                      </div>
                      <Skeleton className="h-3 w-[60%] rounded-full bg-slate-100/50!" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <Skeleton className="h-5 w-24 rounded-lg bg-slate-200/40!" />
                       <Skeleton className="h-3 w-16 rounded-full bg-slate-100!" />
                    </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </PageContainer>
  );
}
