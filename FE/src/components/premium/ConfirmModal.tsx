import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "XÁC NHẬN",
  cancelText = "HỦY BỎ",
  isLoading = false,
  variant = 'danger'
}: ConfirmModalProps) {
  const variantStyles = {
    danger: "bg-rose-50 text-rose-600 border-rose-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    info: "bg-indigo-50 text-indigo-600 border-indigo-100"
  };

  const buttonStyles = {
    danger: "bg-rose-600 hover:bg-rose-700 shadow-rose-100",
    warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-100",
    info: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-[2.5rem] p-10 border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300 max-w-[450px]">
        <AlertDialogHeader className="space-y-6 text-center">
          <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center border-4 ${variantStyles[variant].split(' ')[0]} ${variantStyles[variant].split(' ')[2]} border-white shadow-xl shadow-slate-100 mb-6 animate-bounce duration-1000`}>
             <AlertTriangle size={32} className={variantStyles[variant].split(' ')[1]} />
          </div>

          <div className="space-y-2">
            <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight text-center">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 font-bold leading-relaxed px-4 text-center italic">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-4 pt-6 sm:justify-center">
          <AlertDialogCancel 
            onClick={onClose}
            className="h-14 flex-1 rounded-2xl border-slate-100 font-extrabold text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all shadow-sm"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={`h-14 flex-1 rounded-2xl text-white font-extrabold text-[10px] uppercase tracking-widest shadow-xl transition-all ${buttonStyles[variant]} disabled:opacity-50`}
          >
            {isLoading ? "ĐANG XỬ LÝ..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
