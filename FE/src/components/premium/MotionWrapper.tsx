import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: "fadeIn" | "slideUp" | "scaleIn" | "staggerItem" | "slideRight";
  delay?: number;
}

const variants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  },
  slideUp: {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
  }
};

export const MotionWrapper = ({ 
  children, 
  variant = "fadeIn", 
  delay = 0, 
  ...props 
}: MotionWrapperProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants[variant]}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1, 
  delayChildren = 0,
  className
}: { 
  children: ReactNode; 
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
