"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/utils/cn";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
  showText?: boolean;
  count?: number;
}

export function StarRating({
  rating,
  max = 5,
  size = 18,
  className,
  showText = false,
  count,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={size}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <StarHalf
            size={size}
            className="fill-yellow-400 text-yellow-400"
          />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={size}
            className="text-gray-300 fill-gray-100"
          />
        ))}
      </div>
      {showText && (
        <span className="text-sm text-gray-500 ml-1">
          {rating.toFixed(1)} {count !== undefined && `(${count})`}
        </span>
      )}
    </div>
  );
}
