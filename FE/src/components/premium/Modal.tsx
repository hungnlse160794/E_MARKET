import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  className?: string
  maxWidth?: string
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  maxWidth = "max-w-2xl"
}: ModalProps) => {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative bg-white w-full rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]",
              maxWidth,
              className
            )}
          >
            {/* Header */}
            <div className="shrink-0 flex justify-between items-center p-6 md:p-8 border-b border-slate-50 bg-slate-50/30">
              <div className="space-y-1">
                 <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">{title}</h2>
                 <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 w-fit px-2 py-0.5 rounded-full">Secure Entry Protocol</p>
              </div>
              <button 
                onClick={onClose}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-all shadow-sm bg-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
