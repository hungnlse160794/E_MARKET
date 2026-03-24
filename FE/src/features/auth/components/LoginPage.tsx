import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { loginSchema, type LoginInput } from "@/schemas/authSchema"
import { useAuth } from "@/features/auth/hooks/useAuth"

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    login(data)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10 text-text-deep"
    >
      <div className="space-y-3">
        <h2 className="text-4xl font-serif font-bold tracking-tight">Chào mừng trở lại</h2>
        <p className="text-[15px] text-text-soft font-medium leading-relaxed">
          Vui lòng đăng nhập để tiếp tục khám phá những sản phẩm mới nhất.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-text-deep uppercase tracking-widest pl-1">Email</label>
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors">
                  <Mail size={18} />
               </div>
               <input
                 type="email"
                 placeholder="yourname@gmail.com"
                 {...register("email")}
                 className="w-full h-13 pl-12 pr-4 rounded-2xl border border-border bg-primary-extralight/50 text-[14px] font-medium outline-none focus:bg-white focus:border-primary-main transition-all placeholder:text-text-muted/60"
               />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
               <label className="text-[12px] font-bold text-text-deep uppercase tracking-widest">Mật khẩu</label>
               <Link to="/auth/recover-password" virtual-link="true" className="text-[12px] font-bold text-accent-terra hover:underline">Quên mật khẩu?</Link>
            </div>
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors">
                  <Lock size={18} />
               </div>
               <input
                 type={showPassword ? "text" : "password"}
                 placeholder="••••••••"
                 {...register("password")}
                 className="w-full h-13 pl-12 pr-12 rounded-2xl border border-border bg-primary-extralight/50 text-[14px] font-medium outline-none focus:bg-white focus:border-primary-main transition-all placeholder:text-text-muted/60"
               />
               <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-deep transition-colors"
               >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password.message}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 px-1">
           <input type="checkbox" id="remember" className="w-4 h-4 rounded border-border text-primary-main focus:ring-primary-main" />
           <label htmlFor="remember" className="text-[13px] text-text-soft font-medium cursor-pointer">Ghi nhớ đăng nhập</label>
        </div>

        <Button 
          type="submit" 
          disabled={isLoggingIn}
          className="w-full h-14 bg-primary-main hover:bg-primary-dark text-white font-bold tracking-widest uppercase shadow-md transition-all rounded-2xl text-[13px]"
        >
          {isLoggingIn ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
        </Button>
      </form>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="h-px flex-1 bg-border/60" />
           <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">HOẶC TIẾP TỤC VỚI</span>
           <div className="h-px flex-1 bg-border/60" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           <button className="flex items-center justify-center gap-3 h-13 rounded-2xl border border-border bg-white text-[13px] font-bold text-text-deep hover:bg-primary-extralight transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M12 5.34c1.61 0 3.06.55 4.21 1.63l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.17l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="currentColor" d="M12 17.63c-.15 0-.3-.01-.45-.03V17.6c-4.26 0-7.7-3.44-7.7-7.7s3.44-7.7 7.7-7.7c1.61 0 3.06.55 4.21 1.63l3.15-3.15C17.45 2.09 14.97 1 12 1 5.84 1 0.84 12.16c0 3.1 1.24 5.92 3.25 8.01l3.66-2.84c-1.12-.87-1.84-2.23-1.99-3.74h6.16c.15 2.6 2.58 4.53 5.44 4.53.15 0 .29-.01.44-.03z"/></svg>
              Google
           </button>
           <button className="flex items-center justify-center gap-3 h-13 rounded-2xl border border-border bg-white text-[13px] font-bold text-text-deep hover:bg-primary-extralight transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
              Facebook
           </button>
        </div>
      </div>

      <div className="text-center text-[14px] pt-4 font-medium">
         <span className="text-text-muted">Chưa có tài khoản? </span>
         <Link to="/auth/register" className="text-primary-main font-bold hover:underline">Đăng ký ngay</Link>
      </div>

      <div className="bg-primary-extralight/50 p-6 rounded-2xl border border-border/40 text-center space-y-2">
          <p className="text-[12px] font-bold text-text-deep uppercase tracking-widest">Bạn là người bán?</p>
          <p className="text-[13px] text-text-soft font-medium">Bắt đầu kinh doanh cùng E-Market ngay hôm nay.</p>
          <a href="#" className="inline-block pt-2 text-[13px] font-bold text-accent-terra hover:underline">Truy cập Seller Center →</a>
      </div>
    </motion.div>
  )
}
