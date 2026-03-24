import { 
  Flashlight, Ticket, LayoutGrid, ChevronLeft, ChevronRight, MoreVertical 
} from 'lucide-react'

export default function MarketingCenter() {
  return (
    <div className="max-w-[1400px] mx-auto w-full p-8 pb-20 text-slate-700 font-sans">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-10 mt-2">
         <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="h-1.5 w-10 bg-linear-to-r from-violet-500 to-fuchsia-500 rounded-full" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Chiến dịch & khuyến mãi</p>
           </div>
           <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight leading-tight">
              Trung tâm <span className="bg-linear-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Marketing</span>
           </h1>
           <p className="text-slate-400 text-[14px] font-medium">Tạo và quản lý các chương trình khuyến mãi của cửa hàng.</p>
         </div>
         
         <button className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 h-11 px-6 rounded-xl text-[13px] font-bold transition-all">
            Xuất báo cáo
         </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-10">
         <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">TỔNG TIẾP CẬN</div>
            <div className="flex items-baseline gap-3 mb-6">
               <span className="text-[32px] font-extrabold text-slate-800 tracking-tight">842.5k</span>
               <span className="text-[11px] font-bold text-emerald-500">+12%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-linear-to-r from-indigo-400 to-violet-500 w-3/4 rounded-full" />
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">TỶ LỆ CHUYỂN ĐỔI</div>
            <div className="flex items-baseline gap-3 mb-6">
               <span className="text-[32px] font-extrabold text-slate-800 tracking-tight">12.4%</span>
               <span className="text-[11px] font-semibold text-slate-400">Mục tiêu 15%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-linear-to-r from-teal-400 to-cyan-500 w-[80%] rounded-full" />
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">VOUCHER ĐANG HOẠT ĐỘNG</div>
            <div className="flex items-baseline gap-3 mb-6">
               <span className="text-[32px] font-extrabold text-slate-800 tracking-tight">18</span>
               <span className="text-[11px] font-semibold text-amber-500">6 sắp hết hạn</span>
            </div>
            <div className="flex -space-x-2">
               <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-white" />
               <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white" />
               <div className="w-6 h-6 rounded-full bg-amber-300 border-2 border-white" />
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">TỔNG GIÁ TRỊ GIẢM</div>
            <div className="flex items-baseline gap-3 mb-4">
               <span className="text-[32px] font-extrabold text-slate-800 tracking-tight">4.2tr</span>
               <span className="text-[11px] font-semibold text-slate-400">Tháng này</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
               <span>ĐÃ SỬ DỤNG</span>
               <span>CÒN LẠI</span>
            </div>
            <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="absolute left-0 top-0 h-full bg-linear-to-r from-rose-400 to-pink-500 w-[45%] rounded-full" />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-10">
         
         <div className="col-span-2 space-y-10">
            {/* Active Campaigns */}
            <section>
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-700">Chiến dịch đang chạy</h2>
                  <button className="text-[12px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                     Xem lịch sử
                  </button>
               </div>
               
               <div className="space-y-4">
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-linear-to-br from-amber-100 to-orange-200 rounded-xl flex items-center justify-center shrink-0">
                           <Flashlight size={20} className="text-amber-600" />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <span className="bg-linear-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-widest uppercase">ĐANG CHẠY</span>
                              <span className="text-[16px] font-bold text-slate-700">Flash Sale Mùa Đông</span>
                           </div>
                           <div className="text-[12px] text-slate-400 font-medium">Còn 4 ngày • 12/12 - 28/12</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <div className="text-[18px] font-bold text-slate-700">1.2k</div>
                           <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">ĐÃ ĐỔI</div>
                        </div>
                        <MoreVertical size={20} className="text-slate-300 hover:text-slate-500 transition-colors" />
                     </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-linear-to-br from-rose-100 to-pink-200 rounded-xl flex items-center justify-center shrink-0">
                           <Ticket size={20} className="text-rose-600" />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <span className="bg-linear-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-widest uppercase">ĐANG CHẠY</span>
                              <span className="text-[16px] font-bold text-slate-700">Voucher chào mừng khách mới</span>
                           </div>
                           <div className="text-[12px] text-slate-400 font-medium">Luôn hoạt động • Giảm 15% đơn đầu</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <div className="text-[18px] font-bold text-slate-700">482</div>
                           <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">ĐÃ ĐỔI</div>
                        </div>
                        <MoreVertical size={20} className="text-slate-300 hover:text-slate-500 transition-colors" />
                     </div>
                  </div>
               </div>
            </section>

            {/* Promotion Calendar */}
            <section>
               <h2 className="text-xl font-bold text-slate-700 mb-6">Lịch khuyến mãi</h2>
               <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-[16px] font-bold text-slate-700">Tháng 12 / 2023</h3>
                     <div className="flex gap-4">
                        <ChevronLeft size={18} className="text-slate-300 cursor-pointer hover:text-indigo-500 transition-colors" />
                        <ChevronRight size={18} className="text-slate-600 cursor-pointer hover:text-indigo-500 transition-colors" />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-y-6 text-center text-[13px] mb-8">
                     {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                        <div key={d} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{d}</div>
                     ))}
                     
                     <div className="text-slate-300 font-bold py-3">26</div>
                     <div className="text-slate-300 font-bold py-3">27</div>
                     <div className="text-slate-300 font-bold py-3">28</div>
                     <div className="text-slate-300 font-bold py-3">29</div>
                     <div className="text-slate-300 font-bold py-3">30</div>
                     <div className="text-slate-700 font-bold py-3">1</div>
                     <div className="text-slate-700 font-bold py-3">2</div>
                     
                     <div className="text-slate-700 font-bold py-3">3</div>
                     <div className="text-slate-700 font-bold py-3">4</div>
                     <div className="text-slate-700 font-bold py-3">5</div>
                     <div className="text-slate-700 font-bold py-3">6</div>
                     <div className="text-slate-700 font-bold py-3">7</div>
                     <div className="text-slate-700 font-bold py-3">8</div>
                     <div className="text-slate-700 font-bold py-3">9</div>
                     
                     <div className="text-slate-700 font-bold py-3 relative">10 <span className="absolute bottom-1 left-1/2 -ml-1 w-2 h-2 rounded-full bg-indigo-400" /></div>
                     <div className="text-slate-700 font-bold py-3 relative">11 <span className="absolute bottom-1 left-1/2 -ml-1 w-2 h-2 rounded-full bg-indigo-400" /></div>
                     <div className="bg-indigo-50 text-indigo-600 font-bold py-3 rounded-l-lg">12</div>
                     <div className="bg-indigo-50 text-indigo-600 font-bold py-3">13</div>
                     <div className="bg-indigo-50 text-indigo-600 font-bold py-3">14</div>
                     <div className="bg-indigo-50 text-indigo-600 font-bold py-3">15</div>
                     <div className="bg-indigo-50 text-indigo-600 font-bold py-3 rounded-r-lg">16</div>

                     <div className="text-slate-700 font-bold py-3">17</div>
                     <div className="text-slate-700 font-bold py-3">18</div>
                     <div className="text-slate-700 font-bold py-3">19</div>
                     <div className="text-slate-700 font-bold py-3">20</div>
                     <div className="text-slate-700 font-bold py-3">21</div>
                     <div className="text-slate-700 font-bold py-3">22</div>
                     <div className="text-slate-700 font-bold py-3">23</div>
                     
                     <div className="text-slate-700 font-bold py-3">24</div>
                     <div className="text-slate-700 font-bold py-3">25</div>
                     <div className="text-slate-700 font-bold py-3">26</div>
                     <div className="text-slate-700 font-bold py-3">27</div>
                     <div className="text-slate-700 font-bold py-3">28</div>
                     <div className="text-slate-700 font-bold py-3">29</div>
                     <div className="text-slate-700 font-bold py-3">30</div>
                  </div>
                  
                  <div className="flex items-center gap-8 mt-4">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-indigo-50 border border-indigo-200 rounded" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang khuyến mãi</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lên lịch</span>
                     </div>
                  </div>
               </div>
            </section>
         </div>

         {/* Tools Column */}
         <div className="col-span-1">
            <h2 className="text-xl font-bold text-slate-700 mb-6">Công cụ Marketing</h2>
            
            <div className="space-y-5">
               <div className="bg-white border border-slate-100 p-7 rounded-2xl shadow-sm text-center flex flex-col items-center group hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-5 group-hover:bg-linear-to-br group-hover:from-amber-400 group-hover:to-orange-400 group-hover:text-white transition-all duration-300">
                     <Flashlight strokeWidth={2.5} size={20} />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-700 mb-2">Flash Sale</h3>
                  <p className="text-[13px] text-slate-400 mb-6 px-2 leading-relaxed">
                     Tăng doanh thu nhanh chóng với deal giới hạn thời gian.
                  </p>
                  <button className="w-full h-10 border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                     MỞ CÔNG CỤ
                  </button>
               </div>

               <div className="bg-white border border-slate-100 p-7 rounded-2xl shadow-sm text-center flex flex-col items-center group hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 mb-5 group-hover:bg-linear-to-br group-hover:from-violet-400 group-hover:to-purple-500 group-hover:text-white transition-all duration-300">
                     <Ticket strokeWidth={2.5} size={20} />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-700 mb-2">Voucher</h3>
                  <p className="text-[13px] text-slate-400 mb-6 px-2 leading-relaxed">
                     Tạo mã giảm giá cho khách hàng thân thiết hoặc khách mới.
                  </p>
                  <button className="w-full h-10 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-100 transition-all">
                     QUẢN LÝ
                  </button>
               </div>

               <div className="bg-white border border-slate-100 p-7 rounded-2xl shadow-sm text-center flex flex-col items-center group hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 mb-5 group-hover:bg-linear-to-br group-hover:from-teal-400 group-hover:to-cyan-500 group-hover:text-white transition-all duration-300">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-700 mb-2">Giảm giá toàn shop</h3>
                  <p className="text-[13px] text-slate-400 mb-6 px-2 leading-relaxed">
                     Áp dụng giảm giá theo mùa cho toàn bộ bộ sưu tập hoặc danh mục.
                  </p>
                  <button className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                     QUẢN LÝ
                  </button>
               </div>

               <div className="bg-white border border-slate-100 p-7 rounded-2xl shadow-sm text-center flex flex-col items-center group hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 mb-5 group-hover:bg-linear-to-br group-hover:from-rose-400 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                     <LayoutGrid strokeWidth={2.5} size={20} />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-700 mb-2">Banner nổi bật</h3>
                  <p className="text-[13px] text-slate-400 mb-6 px-2 leading-relaxed">
                     Thiết kế giao diện cửa hàng nổi bật với banner quảng cáo.
                  </p>
                  <button className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                     QUẢN LÝ
                  </button>
               </div>
            </div>
         </div>

      </div>
    </div>
  )
}
