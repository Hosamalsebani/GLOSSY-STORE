"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { StarRating } from "./StarRating";
import { format } from "date-fns";
import { User, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews(data || []);
      }
      setLoading(false);
    }

    fetchReviews();

    // Set up real-time listener
    const channel = supabase
      .channel(`product_reviews_${productId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_reviews",
          filter: `product_id=eq.${productId}`,
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, supabase]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
        <p className="text-gray-500 mt-2">Be the first to share your thoughts on this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div 
          key={review.id} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{review.user_name}</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(review.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} />
          </div>
          {review.comment && (
            <p className="text-gray-600 leading-relaxed italic">
              &ldquo;{review.comment}&rdquo;
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
