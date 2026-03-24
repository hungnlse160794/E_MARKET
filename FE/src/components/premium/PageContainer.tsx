import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  withGrid?: boolean;
  withGlows?: boolean;
}

export const PageContainer = ({ 
  children, 
  className, 
  withGrid = true,
  withGlows = true
}: PageContainerProps) => {
  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-[#F8F9FC]", className)}>
      {withGrid && <div className="absolute inset-0 tech-grid opacity-[0.15] pointer-events-none" />}
      
      {withGlows && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-30 pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-violet-100 rounded-full blur-[100px] opacity-25 pointer-events-none" />
          <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-teal-50 rounded-full blur-[80px] opacity-20 pointer-events-none" />
        </>
      )}

      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10 w-full h-full"
      >
        {children}
      </motion.main>
    </div>
  );
};
