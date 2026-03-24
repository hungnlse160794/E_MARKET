import { useReviews } from "../hooks/useReviews"
import { Star, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ReviewSectionProps {
  productId: string
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { reviews, isLoading } = useReviews(productId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Đánh giá từ khách hàng</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Dựa trên {reviews.length} lượt mua hàng</p>
        </div>
        
        <div className="flex items-center gap-6 bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100">
           <div className="text-center">
              <p className="text-4xl font-black text-amber-600">4.8</p>
              <div className="flex gap-0.5">
                 {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
              </div>
           </div>
           <div className="h-10 w-px bg-amber-100" />
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px]">100%</Badge>
                 <span className="text-[10px] font-bold text-slate-500">Khuyên dùng sản phẩm này</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid gap-8">
        {reviews.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
             <MessageCircle className="mx-auto text-slate-200" size={48} />
             <p className="text-slate-400 font-bold uppercase tracking-widest">Chưa có đánh giá nào cho sản phẩm này</p>
          </div>
        ) : (
          reviews.map((review, idx) => (
            <motion.div 
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex items-center gap-4 shrink-0 h-fit">
                   <Avatar className="h-14 w-14 border-4 border-slate-50 shadow-sm">
                      <AvatarImage src={typeof review.userId === 'object' ? review.userId.avatar : ''} />
                      <AvatarFallback className="font-bold text-slate-400 bg-slate-50">U</AvatarFallback>
                   </Avatar>
                   <div>
                      <h4 className="font-black text-slate-900 uppercase text-[13px] tracking-tight">
                        {typeof review.userId === 'object' ? review.userId.fullName : 'Khách hàng ẩn danh'}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                         <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={10} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                            ))}
                         </div>
                         <span className="text-[10px] text-slate-300 font-bold">• {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: vi })}</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 space-y-6">
                   <p className="text-[15px] font-semibold text-slate-700 leading-relaxed italic">
                      "{review.comment}"
                   </p>

                   {review.images.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {review.images.map((img, i) => (
                           <div key={i} className="h-24 w-24 rounded-2xl overflow-hidden border border-slate-100 hover:border-indigo-400 transition-colors cursor-zoom-in relative group/img">
                              <img src={img} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-indigo-600/0 group-hover/img:bg-indigo-600/10 transition-colors" />
                           </div>
                        ))}
                      </div>
                   )}

                   <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                      <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                         Hữu ích (12)
                      </button>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors">
                         Báo cáo
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
