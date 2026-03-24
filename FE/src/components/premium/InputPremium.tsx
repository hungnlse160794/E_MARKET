import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface InputPremiumProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const InputPremium = ({ 
  label, 
  icon: Icon, 
  error, 
  className, 
  ...props 
}: InputPremiumProps) => {
  return (
    <div className="space-y-3 group w-full">
      {label && (
        <label className="text-[12px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1 group-focus-within:text-black transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors" size={20} />
        )}
        <Input 
          className={cn(
            "h-16 rounded-2xl bg-zinc-50 border-2 border-zinc-100 focus:bg-white focus:border-black focus:ring-0 text-black font-black uppercase tracking-widest text-[11px] transition-all placeholder:text-zinc-200",
            Icon && "pl-14",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] font-black text-red-500 ml-1 uppercase tracking-widest leading-none mt-2">{error}</p>}
    </div>
  );
};
