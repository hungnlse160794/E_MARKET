import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-primary-extralight flex flex-col md:flex-row overflow-hidden">
      {/* Visual side for desktop */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex md:w-1/2 bg-accent-sage items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-[10%] left-[10%] w-64 h-64 border-2 border-white rounded-full" 
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[20%] right-[5%] w-96 h-96 border-4 border-white rounded-full" 
          />
          <div className="absolute top-[40%] right-[10%] w-32 h-32 bg-white rounded-xl rotate-12" />
        </div>
        
        <div className="relative z-10 text-white space-y-8 max-w-md text-center md:text-left">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-sm" />
               </div>
               <span className="font-serif font-bold text-3xl tracking-tight">E-Market</span>
            </Link>
          </motion.div>
          
          <div className="space-y-4">
             <motion.h1 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.7 }}
               className="text-5xl font-serif font-bold leading-tight"
             >
               Khám phá phong cách sống mới.
             </motion.h1>
             <motion.p 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.9 }}
               className="text-white/80 text-lg font-medium leading-relaxed"
             >
               Nền tảng mua sắm trực tuyến hàng đầu với những sản phẩm cao cấp và trải nghiệm tuyệt vời nhất.
             </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="pt-10 flex items-center gap-8"
          >
             <div className="space-y-1">
                <span className="block text-3xl font-bold">10k+</span>
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Sản phẩm</span>
             </div>
             <div className="w-px h-10 bg-white/20" />
             <div className="space-y-1">
                <span className="block text-3xl font-bold">5k+</span>
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Khách hàng</span>
             </div>
             <div className="w-px h-10 bg-white/20" />
             <div className="space-y-1">
                <span className="block text-3xl font-bold">4.9</span>
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Đánh giá</span>
             </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Form side */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-primary-extralight"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-12">
            <Link to="/" className="flex items-center gap-3">
               <div className="w-10 h-10 bg-accent-sage rounded-xl flex items-center justify-center shadow-md">
                  <div className="w-4 h-4 bg-white rounded-sm" />
               </div>
               <span className="font-serif font-bold text-2xl text-text-deep tracking-tight">E-Market</span>
            </Link>
          </div>
          
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};
