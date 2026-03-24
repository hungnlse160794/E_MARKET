import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Star, Loader2 } from "lucide-react"
import { Modal } from "@/components/premium/Modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { reviewSchema, type IReviewInput } from "@/schemas/reviewSchema"
import { useReviews } from "../hooks/useReviews"
import { useState } from "react"
import { motion } from "framer-motion"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  subOrderId: string
  productName: string
}

export function ReviewModal({ isOpen, onClose, productId, subOrderId, productName }: ReviewModalProps) {
  const { createReview, isCreating } = useReviews();
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<IReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      productId,
      subOrderId,
      rating: 5,
      comment: "",
      images: []
    }
  });

  const currentRating = watch("rating");

  const onFormSubmit = async (data: IReviewInput) => {
    try {
      await createReview(data);
      reset();
      onClose();
    } catch {
      // handled in custom hook
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="ĐÁNH GIÁ SẢN PHẨM"
      maxWidth="max-w-[550px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10 py-2">
        <div className="text-center space-y-2">
           <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">Cảm ơn bạn đã tin dùng</span>
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight line-clamp-1">{productName}</h3>
        </div>

        {/* Start Rating */}
        <div className="space-y-4">
           <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setValue("rating", star)}
                  className="relative p-2"
                >
                  <Star 
                    size={42} 
                    className={`transition-all duration-300 ${
                      (hoverRating || currentRating) >= star 
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" 
                        : "text-slate-200"
                    }`}
                  />
                </motion.button>
              ))}
           </div>
           <p className="text-center text-[13px] font-black text-slate-400 uppercase tracking-widest">
              {(hoverRating || currentRating) === 5 ? "Rất hài lòng" : 
               (hoverRating || currentRating) === 4 ? "Hài lòng" :
               (hoverRating || currentRating) === 3 ? "Bình thường" :
               (hoverRating || currentRating) === 2 ? "Không hài lòng" : "Rất kém"}
           </p>
        </div>

        {/* Comment */}
        <div className="space-y-4">
           <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 pl-1">Nhận xét của bạn</Label>
           <Textarea 
              {...register("comment")}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này nhé..."
              className="min-h-[120px] rounded-3xl border-slate-100 bg-slate-50/50 p-6 font-semibold text-slate-700 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
           />
           {errors.comment && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-2">{errors.comment.message}</p>}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex gap-4">
           <Button 
             type="button" 
             variant="ghost" 
             onClick={onClose} 
             className="h-16 flex-1 rounded-2xl text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50"
           >
              HỦY BỎ
           </Button>
           <Button 
             type="submit" 
             disabled={isCreating}
             className="h-16 flex-1 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[12px] tracking-[0.2em] hover:bg-indigo-700 shadow-2xl shadow-indigo-200"
           >
              {isCreating ? <Loader2 className="animate-spin" /> : "GỬI ĐÁNH GIÁ"}
           </Button>
        </div>
      </form>
    </Modal>
  )
}
