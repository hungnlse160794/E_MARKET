import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/config/axios";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { IReviewInput } from "@/schemas/reviewSchema";

export interface IReview {
  _id: string;
  userId: string | { _id: string; fullName: string; avatar: string };
  productId: string;
  shopId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export const useReviews = (productId?: string) => {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      const response = await axios.get(`/reviews/product/${productId}`);
      return response.data.data.docs as IReview[];
    },
    enabled: !!productId,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: IReviewInput) => {
      const response = await axios.post("/reviews", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Không thể gửi đánh giá.");
    },
  });

  return {
    reviews: reviewsQuery.data || [],
    isLoading: reviewsQuery.isLoading,
    createReview: createReviewMutation.mutateAsync,
    isCreating: createReviewMutation.isPending,
  };
};
