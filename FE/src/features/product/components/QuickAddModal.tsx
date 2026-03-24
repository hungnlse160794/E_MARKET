import { useState } from "react"
import { ShoppingBag, Plus, Minus, Info } from "lucide-react"
import { Modal } from "@/components/premium/Modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/utils/format"
import type { IProduct } from "../types"

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  product: IProduct | null
  onAdd: (unitName: string, quantity: number, price: number) => void
  isAdding?: boolean
}

export function QuickAddModal({ isOpen, onClose, product, onAdd, isAdding }: QuickAddModalProps) {
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const selectedUnit = product.units[selectedUnitIndex];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="THÊM NHANH VÀO GIỎ"
      maxWidth="max-w-[500px]"
    >
      <div className="space-y-8 py-2">
        {/* Product Brief */}
        <div className="flex gap-6 items-start p-4 bg-slate-50/50 rounded-3xl border border-slate-100">
          <div className="h-24 w-24 rounded-2xl overflow-hidden bg-white border border-slate-100 shrink-0">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-1 py-1">
             <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md mb-1">
                {typeof product.categoryId === 'object' ? product.categoryId.name : 'SẢN PHẨM'}
             </Badge>
             <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-2 uppercase">{product.name}</h3>
             <p className="text-[12px] font-bold text-slate-400 italic">Sẵn có tại chi nhánh hiện tại</p>
          </div>
        </div>

        {/* Unit Selection */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Chọn đơn vị tính</span>
           </div>
           <div className="flex flex-wrap gap-2">
              {product.units.map((unit, idx) => (
                <button
                  key={unit.unitName}
                  onClick={() => setSelectedUnitIndex(idx)}
                  className={`px-6 h-12 rounded-xl text-[12px] font-black tracking-widest transition-all border ${selectedUnitIndex === idx ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
                >
                  {unit.unitName.toUpperCase()}
                </button>
              ))}
           </div>
        </div>

        {/* Pricing & Quantity */}
        <div className="flex items-end justify-between gap-6 p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-100/50">
           <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Thành tiền</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-slate-900 tabular-nums">{formatPrice(selectedUnit.price * quantity)}</span>
              </div>
           </div>

           <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-indigo-100">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl"
              >
                <Minus size={16} strokeWidth={3} />
              </Button>
              <span className="text-lg font-black w-8 text-center text-slate-700 tabular-nums">{quantity}</span>
              <Button 
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 bg-slate-900 text-white hover:bg-black rounded-xl shadow-md p-0"
              >
                <Plus size={16} strokeWidth={3} />
              </Button>
           </div>
        </div>

        {/* Action button */}
        <Button 
          onClick={() => onAdd(selectedUnit.unitName, quantity, selectedUnit.price)}
          disabled={isAdding || product.status === 'OUT_OF_STOCK'}
          className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[14px] tracking-[0.3em] shadow-2xl shadow-indigo-200 transition-all gap-4 group"
        >
          <ShoppingBag size={20} className="group-hover:scale-110 group-hover:rotate-12 transition-transform" />
          {isAdding ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN THÊM'}
        </Button>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
           <Info size={12} /> Giá đã bao gồm thuế & phí phục vụ
        </p>
      </div>
    </Modal>
  )
}
