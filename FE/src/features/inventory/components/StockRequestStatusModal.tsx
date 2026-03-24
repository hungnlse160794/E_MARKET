import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/premium/Modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { stockRequestStatusSchema, type StockRequestStatusInput } from "@/schemas/inventorySchema";
import { useEffect } from "react";
import { COMMON_CONSTANTS } from "@/constants/common";

interface StockRequestStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
  onSubmit: (data: StockRequestStatusInput) => void;
  isLoading?: boolean;
}

export function StockRequestStatusModal({ 
  isOpen, 
  onClose, 
  status, 
  onSubmit, 
  isLoading 
}: StockRequestStatusModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<StockRequestStatusInput>({
    resolver: zodResolver(stockRequestStatusSchema),
    defaultValues: {
      status: status,
      rejectionReason: ""
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        status: status,
        rejectionReason: ""
      });
    }
  }, [isOpen, status, reset]);

  const onFormSubmit = (data: StockRequestStatusInput) => {
    onSubmit(data);
  };

  const isRejecting = status === COMMON_CONSTANTS.STOCK_REQUEST_STATUS.REJECTED;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isRejecting ? "TỪ CHỐI YÊU CẦU" : "XÁC NHẬN THAY ĐỔI"}
      maxWidth="max-w-[450px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-600">
            Bạn có chắc chắn muốn chuyển trạng thái yêu cầu sang 
            <span className="text-indigo-600 uppercase ml-1">{status}</span>?
          </p>

          {isRejecting && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Lý do từ chối (Bắt buộc)</Label>
              <Textarea 
                placeholder="Vui lòng nhập lý do từ chối..." 
                {...register("rejectionReason")}
                className="h-32 bg-slate-50 border-slate-100 rounded-2xl p-4 font-bold text-sm focus:ring-4 focus:ring-rose-500/10 transition-all shadow-inner"
              />
              {errors.rejectionReason && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.rejectionReason.message}</p>}
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-50">
          <Button 
            type="button"
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50"
          >
            HỦY BỎ
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className={`flex-1 h-12 rounded-xl text-white font-black text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] ${isRejecting ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
          >
            {isLoading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
