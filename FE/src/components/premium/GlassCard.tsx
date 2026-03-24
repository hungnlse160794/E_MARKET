import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
  activeScale?: boolean;
  onClick?: () => void;
}

export const GlassCard = ({ 
  children, 
  className, 
  hoverGlow = true,
  activeScale = true,
  onClick
}: GlassCardProps) => {
  return (
    <motion.div
      whileHover={activeScale ? { scale: 1.01, y: -2 } : {}}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      onClick={onClick}
      className={cn(
        "glass-card relative overflow-hidden",
        hoverGlow && "hover:glow-primary",
        className
      )}
    >
      <div className="absolute inset-0 tech-grid opacity-[0.1] pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
