"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAppStore } from "@/store";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const { user } = useAppStore();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: "error", text: "Please log in to leave a review." });
      return;
    }
    if (rating === 0) {
      setMessage({ type: "error", text: "Please select a star rating." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      user_id: user.id,
      user_name: user.name || "Customer",
      rating,
      comment,
    });

    if (error) {
      console.error("Error submitting review:", error);
      setMessage({ type: "error", text: `Failed to submit review: ${error.message}` });
    } else {
      setMessage({ type: "success", text: "Thank you for your review!" });
      setRating(0);
      setComment("");
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
        <p className="text-gray-600 mb-4">You need to be logged in to leave a review.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-50">
      <h3 className="text-xl font-bold text-gray-900 border-b pb-4">Write a Review</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              title={`${star} Stars`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={cn(
                  "transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 font-semibold">
          Your Feedback
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
          placeholder="What did you like or dislike? Your feedback helps other shoppers!"
        ></textarea>
      </div>

      {message.text && (
        <div
          className={cn(
            "p-4 rounded-xl text-sm font-medium",
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 shadow-md hover:shadow-xl active:scale-95"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
