import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export const Drawer = ({ isOpen, onClose, title, children, className }: DrawerProps) => {
  // Prevent scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed right-0 top-0 h-full w-full max-w-[600px] bg-white z-101 shadow-2xl flex flex-col",
              className
            )}
          >
            <div className="flex justify-between items-center p-10 border-b border-zinc-100 bg-zinc-50/50">
              <div className="space-y-1">
                 <h2 className="text-2xl font-black text-black uppercase tracking-tighter">{title}</h2>
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Protocol Entry Point</p>
              </div>
              <button 
                onClick={onClose}
                className="h-12 w-12 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-black hover:text-white transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
