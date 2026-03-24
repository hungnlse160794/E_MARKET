import { 
  Sparkles, 
  TrendingUp, 
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function ShopAdvisor() {
  return (
    <div className="p-10 rounded-2xl bg-slate-900 text-white space-y-8 relative overflow-hidden group border border-white/5 shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] group-hover:bg-indigo-500/30 transition-all" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
           <Sparkles size={24} />
        </div>
        <div className="flex flex-col">
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Trợ lý cửa hàng</span>
           <span className="text-xl font-bold tracking-tight">Gợi ý từ AI</span>
        </div>
      </div>

      <p className="text-[14px] font-medium text-slate-400 leading-relaxed relative z-10">
        Kho hàng tại <span className="text-indigo-400 font-bold uppercase">Khu vực 05</span> đang sắp hết. Hãy nhập thêm hàng để tránh gián đoạn kinh doanh.
      </p>

      <div className="pt-4 relative z-10">
        <Button className="w-full h-12 rounded-xl bg-white text-slate-900 font-bold uppercase text-[11px] tracking-wider hover:bg-slate-100 shadow-lg transition-all">
           LẬP KẾ HOẠCH NHẬP KHO
        </Button>
      </div>
    </div>
  )
}

export function ProductSummary() {
  return (
    <div className="p-10 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 group">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HIỆU SUẤT SẢN PHẨM</h4>
           <h3 className="text-xl font-bold text-slate-800 tracking-tight">BÁN CHẠY NHẤT</h3>
        </div>
        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
           <TrendingUp size={20} />
        </div>
      </div>

      <div className="space-y-4">
         {[
           { name: 'Mật ong Carbon X7', units: '1,200', growth: '+12%', color: 'from-amber-400 to-orange-500' },
           { name: 'Cải bó xôi Titanium', units: '850', growth: '+5%', color: 'from-emerald-400 to-teal-500' }
         ].map((item, i) => (
           <div key={i} className="flex justify-between items-center p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all decoration-300 group/item">
              <div className="flex items-center gap-4">
                 <div className={`h-2 w-2 rounded-full bg-linear-to-br ${item.color} shadow-sm group-hover/item:scale-150 transition-transform`} />
                 <span className="text-[13px] font-bold text-slate-700">{item.name}</span>
              </div>
              <div className="text-right">
                 <div className="text-[12px] font-bold text-slate-800">{item.units}</div>
                 <div className="text-[10px] font-bold text-emerald-500 leading-none mt-1">{item.growth}</div>
              </div>
           </div>
         ))}
      </div>

      <Button variant="ghost" className="w-full h-11 mt-6 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
         XEM TOÀN BỘ DỮ LIỆU <ArrowRight size={14} className="ml-2" />
      </Button>
    </div>
  )
}
