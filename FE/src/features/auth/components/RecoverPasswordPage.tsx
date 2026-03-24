import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Mail, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RecoverPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email')
  
  // States for form data
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setStep('otp')
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.join('').length === 6) setStep('password')
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Mật khẩu đã được cập nhật thành công')
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-advance
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) (nextInput as HTMLInputElement).focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) (prevInput as HTMLInputElement).focus()
    }
  }

  return (
    <div className="w-full text-text-deep space-y-10">
      
      {step === 'email' && (
        <form onSubmit={handleSendLink} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-3">
            <h2 className="text-4xl font-serif font-bold tracking-tight">Khôi phục mật khẩu</h2>
            <p className="text-[15px] text-text-soft font-medium leading-relaxed">
              Nhập email của bạn để nhận mã xác thực khôi phục tài khoản.
            </p>
          </div>
          
          <div className="space-y-2 pt-4">
            <label className="text-[12px] font-bold text-text-deep uppercase tracking-widest pl-1">Địa chỉ Email</label>
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors">
                  <Mail size={18} />
               </div>
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="name@example.com"
                 className="w-full h-13 pl-12 pr-4 rounded-2xl border border-border bg-primary-extralight/50 text-[14px] font-medium outline-none focus:bg-white focus:border-primary-main transition-all placeholder:text-text-muted/60"
                 required
               />
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <Button type="submit" className="w-full h-14 bg-primary-main hover:bg-primary-dark text-white font-bold tracking-widest uppercase shadow-md transition-all rounded-2xl text-[13px] flex justify-center items-center gap-3">
              GỬI MÃ XÁC THỰC <ArrowRight size={18} />
            </Button>

            <Link to="/auth/login" className="flex justify-center items-center gap-2 text-[14px] font-bold text-text-soft hover:text-text-deep transition-colors">
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Xác thực danh tính</h2>
            <p className="text-[15px] text-text-soft font-medium leading-relaxed">
              Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến <span className="font-bold text-text-deep">{email || 'email của bạn'}</span>
            </p>
          </div>
          
          <div className="flex justify-between gap-3 pt-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-full h-16 text-center text-xl font-bold bg-primary-extralight/50 border border-border rounded-2xl outline-none focus:bg-white focus:border-primary-main focus:ring-1 focus:ring-primary-main transition-all text-text-deep"
                maxLength={1}
              />
            ))}
          </div>

          <div className="space-y-6 pt-6">
            <Button type="submit" className="w-full h-14 bg-primary-main hover:bg-primary-dark text-white font-bold tracking-widest uppercase shadow-md transition-all rounded-2xl text-[13px]">
              XÁC NHẬN MÃ
            </Button>

            <button type="button" onClick={() => setStep('email')} className="w-full flex justify-center items-center gap-2 text-[14px] font-bold text-text-soft hover:text-text-deep transition-colors">
              <ArrowLeft size={16} /> Thay đổi email
            </button>
          </div>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handleResetPassword} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Mật khẩu mới</h2>
            <p className="text-[15px] text-text-soft font-medium leading-relaxed">Vui lòng thiết lập mật khẩu mới an toàn cho tài khoản của bạn.</p>
          </div>
          
          <div className="space-y-5 pt-4">
            <div className="space-y-2">
               <label className="text-[12px] font-bold text-text-deep uppercase tracking-widest pl-1">Mật khẩu mới</label>
               <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors">
                     <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-13 pl-12 pr-4 rounded-2xl border border-border bg-primary-extralight/50 text-[14px] font-medium outline-none focus:bg-white focus:border-primary-main transition-all placeholder:text-text-muted/60"
                    required
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[12px] font-bold text-text-deep uppercase tracking-widest pl-1">Xác nhận mật khẩu</label>
               <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors">
                     <ShieldCheck size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-13 pl-12 pr-4 rounded-2xl border border-border bg-primary-extralight/50 text-[14px] font-medium outline-none focus:bg-white focus:border-primary-main transition-all placeholder:text-text-muted/60"
                    required
                  />
               </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <Button type="submit" className="w-full h-14 bg-primary-main hover:bg-primary-dark text-white font-bold tracking-widest uppercase shadow-md transition-all rounded-2xl text-[13px]">
              ĐẶT LẠI MẬT KHẨU
            </Button>
          </div>
        </form>
      )}

    </div>
  )
}
