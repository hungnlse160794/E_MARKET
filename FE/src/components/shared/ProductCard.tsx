import { Plus, Minus, Heart, Zap, Leaf, Cpu, Sparkles, Droplets, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { IProduct } from "@/types"
import { formatCurrency } from "@/utils/format"
import { MotionWrapper } from "@/components/premium/MotionWrapper"
import { useState } from "react"

interface ProductCardProps {
  product: IProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  const getChromaticDetails = (id: string) => {
    switch(id) {
       case '1': return { color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-100', shadow: 'shadow-violet-200/20', icon: Cpu, label: 'SYNTH_NODE' }
       case '2': return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', shadow: 'shadow-emerald-200/20', icon: Leaf, label: 'BIO_UNIT' }
       case '3': return { color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', shadow: 'shadow-rose-200/20', icon: Sparkles, label: 'VITAL_SPEC' }
       case '4': return { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', shadow: 'shadow-amber-200/20', icon: Flame, label: 'THERMAL_CELL' }
       case '5': return { color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', shadow: 'shadow-blue-200/20', icon: Droplets, label: 'LIQUID_ASSET' }
       default: return { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', shadow: 'shadow-slate-200/20', icon: Zap, label: 'CORE_NODE' }
    }
  }

  const chrome = getChromaticDetails(product.categoryId)

  return (
    <MotionWrapper 
      variant="slideUp"
      className="group relative rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:border-slate-300 transition-all duration-700 hover:-translate-y-2"
    >
      {/* Background Accent Gradient */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 ${chrome.bg}`} />
      
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        <div className="absolute top-6 left-6">
          <div className={`px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl border-2 text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 ${chrome.border} ${chrome.color}`}>
            <chrome.icon size={12} fill="currentColor" />
            <span className="opacity-60">{chrome.label}</span>
          </div>
        </div>
        
        <button 
          onClick={(e) => {
            e.preventDefault()
            setIsLiked(!isLiked)
          }}
          className={`absolute top-6 right-6 h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
            isLiked ? `bg-slate-900 text-white` : 'bg-white/80 backdrop-blur-xl text-slate-200 hover:text-slate-900'
          }`}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} strokeWidth={3} />
        </button>
      </div>

      <div className="p-10 space-y-10 relative z-10">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">
               {product.name}
             </h3>
             <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${chrome.bg} ${chrome.color} ${chrome.border} border`}>
               {product.uom}
             </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest line-clamp-2 leading-relaxed opacity-60">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{formatCurrency(product.price)}</span>
            <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">MARKET VALUE</span>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100">
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-slate-300 hover:text-slate-900 hover:bg-white transition-all">
              <Minus size={16} strokeWidth={3} />
            </Button>
            <span className="text-sm font-black min-w-8 text-center tabular-nums text-slate-900">01</span>
            <Button className="h-10 w-10 p-0 rounded-xl bg-slate-900 text-white hover:bg-black shadow-xl transition-all">
              <Plus size={16} strokeWidth={3} />
            </Button>
          </div>
        </div>
      </div>
    </MotionWrapper>
  )
}
