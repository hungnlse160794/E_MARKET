import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Truck, 
  CreditCard,
  Zap,
  TrendingUp,
  Heart,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 45, secs: 32 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, mins, secs } = prev
        if (secs > 0) secs--
        else {
          secs = 59
          if (mins > 0) mins--
          else {
            if (hours > 0) {
              mins = 59
              hours--
            } else {
              return { hours: 0, mins: 0, secs: 0 }
            }
          }
        }
        return { hours, mins, secs }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-primary-extralight min-h-screen pb-20 overflow-x-hidden">
      
      {/* 1. HERO SLIDER AREA */}
      <section className="relative h-[500px] md:h-[600px] bg-white overflow-hidden">
         <div className="absolute inset-0 bg-[#F2F0EB]">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600" alt="Hero" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
         </div>
         
         <div className="relative z-10 h-full max-w-[1400px] mx-auto px-8 md:px-16 flex items-center">
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/20 rounded-full border border-accent-gold/30">
                  <Zap size={14} className="text-accent-terra fill-accent-terra" />
                  <span className="text-[11px] font-bold text-accent-terra uppercase tracking-widest">SƯU TẬP MÙA XUÂN 2024</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-serif font-bold text-text-deep leading-[0.9] tracking-tight">
                  Nâng tầm <br />
                  <span className="text-accent-terra italic">Phong cách.</span>
               </h1>
               <p className="text-lg text-text-soft font-medium max-w-md leading-relaxed">
                  Khám phá những sản phẩm cao cấp được tuyển chọn kỹ lưỡng, mang đến vẻ đẹp vĩnh cửu và tinh tế cho không gian sống của bạn.
               </p>
               <div className="flex items-center gap-6 pt-4">
                  <Button className="h-14 px-10 bg-text-deep text-white hover:bg-black rounded-2xl shadow-xl shadow-text-deep/10 text-[13px] font-bold tracking-widest uppercase transition-all flex gap-3 group">
                     MUA NGAY 
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Link to="/products" className="text-[13px] font-bold text-text-deep hover:text-accent-terra transition-colors uppercase tracking-widest flex items-center gap-2">
                     Khám phá bộ sưu tập
                  </Link>
               </div>
            </div>
         </div>

         {/* Hero Navigation */}
         <div className="absolute bottom-10 right-16 flex gap-4">
            <button className="w-12 h-12 rounded-full border border-text-deep/10 flex items-center justify-center hover:bg-white hover:shadow-md transition-all text-text-deep">
               <ChevronLeft size={20} />
            </button>
            <button className="w-12 h-12 rounded-full border border-text-deep/10 flex items-center justify-center hover:bg-white hover:shadow-md transition-all text-text-deep">
               <ChevronRight size={20} />
            </button>
         </div>
      </section>

      {/* 2. CATEGORY QUICK-NAV */}
      <section className="max-w-[1400px] mx-auto px-8 py-16">
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
               { name: "Nội thất", icon: "🛋️", color: "bg-[#EAE3DB]" },
               { name: "Thời trang", icon: "👗", color: "bg-[#E5D5C6]" },
               { name: "Đồ gia dụng", icon: "🍳", color: "bg-[#DDE2E2]" },
               { name: "Làm đẹp", icon: "🧴", color: "bg-[#F2E5D5]" },
               { name: "Công nghệ", icon: "🎧", color: "bg-[#E0E2E5]" },
               { name: "Trang sức", icon: "💍", color: "bg-[#EAE7D6]" },
            ].map((cat, i) => (
               <div key={i} className="group cursor-pointer flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-24 h-24 rounded-full ${cat.color} flex items-center justify-center text-3xl shadow-sm border-2 border-white group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                     {cat.icon}
                  </div>
                  <span className="text-[13px] font-bold text-text-soft group-hover:text-text-deep transition-colors tracking-wide">{cat.name}</span>
               </div>
            ))}
         </div>
      </section>

      {/* 3. FLASH SALES & DEALS (The "A Lot of Things" part) */}
      <section className="max-w-[1400px] mx-auto px-8 py-8">
         <div className="bg-white rounded-[2.5rem] border border-border/60 shadow-sm overflow-hidden p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[11px] font-bold text-accent-terra uppercase tracking-[0.2em] mb-1">Cơ hội cuối cùng</span>
                     <h2 className="text-4xl font-serif font-bold text-text-deep">Ưu đãi chớp nhoáng</h2>
                  </div>
                  <div className="h-12 w-px bg-border/60 hidden md:block" />
                  <div className="flex gap-3">
                     {[
                        { val: timeLeft.hours, label: "GIỜ" },
                        { val: timeLeft.mins, label: "PHÚT" },
                        { val: timeLeft.secs, label: "GIÂY" }
                     ].map((t, idx) => (
                        <div key={idx} className="flex flex-col items-center min-w-[60px] p-2 bg-primary-extralight rounded-xl border border-border/40">
                           <span className="text-xl font-bold text-text-deep">{String(t.val).padStart(2, '0')}</span>
                           <span className="text-[8px] font-bold text-text-muted mt-1 uppercase tracking-widest">{t.label}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <Link to="/flash-sale" className="text-[13px] font-bold text-primary-main hover:text-primary-dark transition-all flex items-center gap-2 border-b-2 border-primary-main/20 hover:border-primary-main pb-1">
                  XEM TẤT CẢ <ChevronRight size={16} />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                  { name: "Ghế bành Velvet Ochre", price: 450, old: 620, discount: 25, img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=400", sold: 85 },
                  { name: "Đèn bàn Brass Floor", price: 180, old: 250, discount: 15, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400", sold: 42 },
                  { name: "Vỏ gối Satin Midnight", price: 45, old: 75, discount: 40, img: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&q=80&w=400", sold: 12 },
                  { name: "Loa Bluetooth Modern", price: 320, old: 410, discount: 20, img: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&q=80&w=400", sold: 68 },
               ].map((item, i) => (
                  <div key={i} className="group relative bg-[#FAF9F6]/50 rounded-3xl p-4 border border-transparent hover:border-accent-gold/20 hover:bg-white hover:shadow-xl transition-all duration-500">
                     <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-accent-terra text-white text-[10px] font-bold rounded-lg shadow-lg shadow-accent-terra/20">
                        -{item.discount}%
                     </div>
                     <button className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-text-muted hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-border/40">
                        <Heart size={18} />
                     </button>
                     <div className="aspect-square relative mb-6 overflow-hidden rounded-2xl bg-white flex items-center justify-center">
                        <img src={item.img} alt={item.name} className="w-[85%] h-[85%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                     </div>
                     <div className="space-y-4">
                        <div>
                           <h3 className="text-sm font-bold text-text-deep line-clamp-1">{item.name}</h3>
                           <div className="flex items-center gap-3 mt-2">
                              <span className="text-[16px] font-bold text-accent-terra">${item.price}</span>
                              <span className="text-[13px] text-text-muted line-through font-medium">${item.old}</span>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                              <span className="text-text-soft">Đã bán {item.sold}%</span>
                              <span className="text-accent-gold">Chỉ còn 5 sản phẩm</span>
                           </div>
                           <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                              <div className="h-full bg-accent-gold rounded-full" style={{ width: `${item.sold}%` }} />
                           </div>
                        </div>
                        <Button className="w-full h-11 bg-white border border-border text-[12px] font-bold text-text-deep rounded-2xl group-hover:bg-text-deep group-hover:text-white transition-all shadow-sm">
                           THÊM VÀO GIỎ
                        </Button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. DISCOVER MORE - MULTI-SECTION (The High Density part) */}
      <section className="max-w-[1400px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
         
         {/* Left Column: Editor's Choice */}
         <div className="lg:col-span-8 space-y-12">
            <div className="flex justify-between items-end">
               <h3 className="text-3xl font-serif font-bold text-text-deep">Sản phẩm tiêu biểu</h3>
               <div className="flex gap-4 mb-2">
                  {['Tất cả', 'Phòng khách', 'Phòng ngủ', 'Bếp'].map(tab => (
                     <button key={tab} className="text-[13px] font-bold text-text-soft hover:text-text-deep transition-colors pb-1 border-b-2 border-transparent hover:border-primary-main">
                        {tab}
                     </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3,4,5,6].map(n => (
                  <div key={n} className="premium-card p-4 flex flex-col group cursor-pointer">
                     <div className="aspect-[3/4] rounded-xl bg-primary-light/50 overflow-hidden relative mb-6">
                        <img src={`https://images.unsplash.com/photo-${1500000000000 + (n * 1234567)}?auto=format&fit=crop&q=80&w=400`} alt="Prd" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <div className="flex-1 flex flex-col justify-between">
                        <div>
                           <div className="flex gap-1 mb-2">
                              {[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-accent-gold text-accent-gold" />)}
                           </div>
                           <h4 className="text-sm font-bold text-text-deep line-clamp-2 leading-snug">Sản phẩm Decor cao cấp phong cách Modernist #{n}</h4>
                           <p className="text-[11px] font-bold text-text-muted mt-2 uppercase tracking-widest">THƯƠNG HIỆU CAO CẤP</p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                           <span className="text-[15px] font-bold text-text-deep">$249.00</span>
                           <button className="w-9 h-9 rounded-full bg-text-deep text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <ShoppingBag size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="flex justify-center pt-8">
               <Button variant="outline" className="h-14 px-12 rounded-full border-border text-[13px] font-bold tracking-widest text-text-soft hover:text-text-deep flex gap-3 uppercase">
                  XEM THÊM SẢN PHẨM <TrendingUp size={18} />
               </Button>
            </div>
         </div>

         {/* Right Column: Mini Lists / Trending */}
         <div className="lg:col-span-4 space-y-12">
            <div>
               <h3 className="text-2xl font-serif font-bold text-text-deep mb-8">Bán chạy nhất</h3>
               <div className="space-y-6">
                  {[1,2,3,4].map(n => (
                     <div key={n} className="flex gap-6 group cursor-pointer border-b border-border/40 pb-6 last:border-0">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-border/60 shrink-0 overflow-hidden">
                           <img src={`https://images.unsplash.com/photo-${1515000000000 + (n * 987654)}?auto=format&fit=crop&q=80&w=150`} alt="Mini" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                        </div>
                        <div className="flex flex-col justify-center">
                           <h4 className="text-[13px] font-bold text-text-deep group-hover:text-primary-main transition-colors mb-1 line-clamp-1">Thiết kế giới hạn Edition #{n}</h4>
                           <span className="text-[12px] font-medium text-text-soft italic">Nội thất phòng ngủ</span>
                           <div className="flex items-center gap-3 mt-2">
                              <span className="text-[14px] font-bold text-accent-terra">$850.00</span>
                              <span className="text-[11px] font-medium text-text-muted">Đã bán 1.2k</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-gold rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-accent-gold/20">
               <h3 className="text-3xl font-serif font-bold leading-tight">Gói quà tặng <br /> đặc biệt</h3>
               <p className="text-sm text-white/80 leading-relaxed font-medium">
                  Chúng tôi nhận thiết kế và gói quà cho những dịp quan trọng của bạn hoàn toàn miễn phí.
               </p>
               <Button className="w-full h-12 bg-white text-accent-terra hover:bg-white/90 rounded-2xl text-[12px] font-bold uppercase tracking-widest shadow-lg">
                  TÌM HIỂU THÊM
               </Button>
            </div>

            <div>
               <h3 className="text-2xl font-serif font-bold text-text-deep mb-8">Tạp chí E-Market</h3>
               <div className="space-y-8">
                  {[1,2].map(n => (
                     <div key={n} className="space-y-4 cursor-pointer group">
                        <div className="aspect-video rounded-3xl overflow-hidden">
                           <img src={`https://images.unsplash.com/photo-${152000000000+n}?auto=format&fit=crop&q=80&w=600`} alt="Blog" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <h4 className="text-lg font-serif font-bold text-text-deep group-hover:text-accent-terra transition-colors px-2">Nghệ thuật sắp đặt không gian cho căn hộ nhỏ hiện đại</h4>
                        <div className="flex items-center gap-4 px-2 text-[11px] font-bold text-text-muted uppercase tracking-widest">
                           <span>12 THỨ 03, 2024</span>
                           <span>•</span>
                           <span>XU HƯỚNG</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 5. TRUST BADGES */}
      <section className="bg-white border-y border-border/60 py-16 mt-16">
         <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
               { icon: Truck, title: "Vận chuyển hỏa tốc", desc: "Miễn phí cho đơn hàng trên 2.000.000đ" },
               { icon: ShieldCheck, title: "Bảo hành 24 tháng", desc: "Cam kết sản phẩm chính hãng 100%" },
               { icon: CreditCard, title: "Thanh toán an toàn", desc: "Hỗ trợ trả góp 0% lãi suất toàn quốc" },
               { icon: Star, title: "Đặc quyền VIP", desc: "Ưu đãi riêng biệt cho cộng đồng E-Market" },
            ].map((item, i) => (
               <div key={i} className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary-main shadow-inner">
                     <item.icon size={28} />
                  </div>
                  <h4 className="text-[15px] font-bold text-text-deep">{item.title}</h4>
                  <p className="text-[13px] text-text-soft font-medium leading-relaxed max-w-[200px]">{item.desc}</p>
               </div>
            ))}
         </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-[1400px] mx-auto px-8 py-24">
         <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 pb-16 border-b border-border/60">
            <div className="md:col-span-4 space-y-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-sage rounded-xl" />
                  <span className="font-serif font-bold text-2xl text-text-deep">E-Market</span>
               </div>
               <p className="text-[14px] text-text-soft leading-relaxed max-w-sm font-medium">
                  Website cung cấp những sản phẩm gia dụng và nội thất hàng đầu Việt Nam. Tận hưởng không gian sống lý tưởng cùng chúng tôi.
               </p>
               <div className="flex gap-4">
                  {[1,2,3,4].map(n => <div key={n} className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-text-soft hover:bg-text-deep hover:text-white transition-all cursor-pointer shadow-sm">f</div>)}
               </div>
            </div>

            <div className="md:col-span-2 space-y-6">
               <h4 className="text-[12px] font-bold text-text-deep uppercase tracking-widest">Sản phẩm</h4>
               <ul className="space-y-3 text-[13px] text-text-soft font-bold">
                  {['Nội thất', 'Đồ gia dụng', 'Phòng tắm', 'Phòng ngủ', 'Decor'].map(link => <li key={link}><a className="hover:text-text-deep transition-colors cursor-pointer">{link}</a></li>)}
               </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
               <h4 className="text-[12px] font-bold text-text-deep uppercase tracking-widest">Hỗ trợ</h4>
               <ul className="space-y-3 text-[13px] text-text-soft font-bold">
                  {['Giao hàng', 'Đổi trả', 'Bảo hành', 'Liên hệ', 'Quy định'].map(link => <li key={link}><a className="hover:text-text-deep transition-colors cursor-pointer">{link}</a></li>)}
               </ul>
            </div>

            <div className="md:col-span-4 space-y-8">
               <div className="p-8 bg-white rounded-3xl border border-border/60 shadow-sm space-y-6">
                  <h4 className="text-[15px] font-serif font-bold text-text-deep">Nhận tin thông báo</h4>
                  <p className="text-[12px] text-text-soft font-medium leading-relaxed">
                     Đăng ký để nhận sớm nhất thông tin về các chương trình ưu đãi hàng tuần.
                  </p>
                  <div className="flex items-center bg-primary-extralight rounded-2xl p-2 pl-4 border border-border/40">
                     <input type="text" placeholder="Email của bạn..." className="bg-transparent border-none outline-none flex-1 text-[13px] font-medium" />
                     <button className="h-10 px-4 bg-text-deep text-white rounded-xl text-[11px] font-bold uppercase tracking-widest">GỬI</button>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-center py-10 gap-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">© 2024 E-MARKET VIETNAM. TẤT CẢ QUYỀN ĐƯỢC BẢO LƯU.</p>
            <div className="flex gap-8 text-[11px] font-bold text-text-muted uppercase tracking-widest underline decoration-2 decoration-transparent hover:decoration-primary-main underline-offset-4 transition-all">
               <a href="#">CHÍNH SÁCH</a>
               <a href="#">ĐIỀU KHOẢN</a>
               <a href="#">COOKIE</a>
            </div>
         </div>
      </footer>
    </div>
  )
}
