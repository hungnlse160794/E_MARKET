import { useState } from "react";
import { Ticket, Search, Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";
import type { IVoucher } from "@/types";

interface VoucherSelectorProps {
  vouchers: IVoucher[];
  selectedVoucherCode: string | null;
  onSelect: (code: string | null) => void;
  subtotal: number;
}

export const VoucherSelector = ({ vouchers, selectedVoucherCode, onSelect, subtotal }: VoucherSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVouchers = vouchers.filter(v => 
    v.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input 
          placeholder="Nhập mã giảm giá..." 
          className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredVouchers.map((voucher) => {
            const isSelected = selectedVoucherCode === voucher.code;
            const isApplicable = subtotal >= voucher.minOrderValue;

            return (
              <motion.div
                key={voucher._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => isApplicable && onSelect(isSelected ? null : voucher.code)}
                className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-50/30' 
                    : isApplicable 
                      ? 'border-slate-100 bg-white hover:border-indigo-200' 
                      : 'border-slate-50 bg-slate-50/50 opacity-60 grayscale cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Ticket size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <span className="font-black text-slate-900 uppercase tracking-tighter">{voucher.code}</span>
                       {voucher.shopId === null && (
                         <Badge className="bg-amber-100 text-amber-600 border-none text-[8px] h-4">PLATFORM</Badge>
                       )}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 tracking-tight">
                      Giảm {voucher.discountType === 'PERCENTAGE' ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)} • Đơn từ {formatCurrency(voucher.minOrderValue)}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                       <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {!isApplicable && (
                  <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase">
                    <AlertCircle size={10} /> Cần thêm {formatCurrency(voucher.minOrderValue - subtotal)} để mở khóa
                  </div>
                )}

                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-slate-50/10 to-transparent pointer-events-none" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
