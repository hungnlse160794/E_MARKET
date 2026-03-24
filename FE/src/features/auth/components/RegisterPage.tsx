import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { User, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { registerSchema, type RegisterInput } from "@/schemas/authSchema"
import { useAuth } from "../hooks/useAuth"

export default function RegisterPage() {
  const { register: registerApi, isRegistering } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterInput) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data
    registerApi(registerData)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10 text-text-deep"
    >
      <div className="space-y-3">
        <h2 className="text-4xl font-serif font-bold tracking-tight">Tạo tài khoản mới</h2>
        <p className="text-[15px] text-text-soft font-medium leading-relaxed">
          Tham gia cộng đồng mua sắm hiện đại và nhận nhiều ưu đãi hấp dẫn.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-text-deep uppercase tracking-widest pl-1">Họ và tên</label>
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors">
                  <User size={18} />
               </div>
               <input
                 type="text"
                 placeholder="Nguyễn Văn A"
                 {...register("fullName")}
                 className="w-full h-13 pl-12 pr-4 rounded-2xl border border-border bg-primary-extralight/50 text-[14px] font-medium outline-none focus:bg-white focus:border-primary-main transition-all placeholder:text-text-muted/60"
               />
            </div>
            {errors.fullName && <p className="text-xs text-red-500 font-medium pl-1">{errors.fullName.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-text-deep uppercase tracking-widest pl-1">Email</label>
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors">
                  <Mail size={18} />
               </div>
               <input
                 type="email"
                 placeholder="name@example.com"
                 {...register("email")}
                 className="w-full h-13 pl-12 pr-4 rounded-2xl border border-border bg-primary-extralight/50 text-[14px] font-medium outline-none focus:bg-white focus:border-primary-main transition-all placeholder:text-text-muted/60"
               />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-2">
               <label className="text-[12px] font-bold text-text-deep uppercase tracking-widest pl-1">Mật khẩu</label>
               <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors">
                     <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full h-13 pl-12 pr-4 rounded-2xl border border-border bg-primary-extralight/50 text-[14px] font-medium outline-none focus:bg-white focus:border-primary-main transition-all placeholder:text-text-muted/60"
                  />
               </div>
               {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password.message}</p>}
             </div>
             <div className="space-y-2">
               <label className="text-[12px] font-bold text-text-deep uppercase tracking-widest pl-1">Xác nhận</label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors">
                      <ShieldCheck size={18} />
                   </div>
                   <input
                     type="password"
                     placeholder="••••••••"
                     {...register("confirmPassword")}
                     className="w-full h-13 pl-12 pr-4 rounded-2xl border border-border bg-primary-extralight/50 text-[14px] font-medium outline-none focus:bg-white focus:border-primary-main transition-all placeholder:text-text-muted/60"
                   />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 font-medium pl-1">{errors.confirmPassword.message}</p>}
             </div>
          </div>
        </div>

        <div className="flex items-start gap-3 px-1">
           <input type="checkbox" id="terms" className="w-4 h-4 mt-0.5 rounded border-border text-primary-main focus:ring-primary-main" />
           <label htmlFor="terms" className="text-[13px] text-text-soft font-medium leading-tight">
              Tôi đồng ý với các <a href="#" className="text-text-deep font-bold hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-text-deep font-bold hover:underline">Chính sách bảo mật</a> của E-Market.
           </label>
        </div>

        <Button 
          type="submit" 
          disabled={isRegistering}
          className="w-full h-14 bg-primary-main hover:bg-primary-dark text-white font-bold tracking-widest uppercase shadow-md transition-all rounded-2xl text-[13px] flex items-center justify-center gap-2"
        >
          {isRegistering ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              ĐANG XỬ LÝ...
            </>
          ) : (
            "TẠO TÀI KHOẢN"
          )}
        </Button>
      </form>

      <div className="text-center text-[14px] font-medium border-t border-border/40 pt-8">
         <span className="text-text-muted">Đã có tài khoản? </span>
         <Link to="/auth/login" className="text-accent-terra font-bold hover:underline">Đăng nhập</Link>
      </div>
    </motion.div>
  )
}
