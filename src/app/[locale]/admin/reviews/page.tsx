'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Star, Trash2, Search, Filter, Loader2, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { format } from 'date-fns';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          products (
            id,
            name,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review.');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.products?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-luxury-black)]">Product Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and moderate customer feedback</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reviews, users, or products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            aria-label="Filter by Rating"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-[var(--color-luxury-black)] focus:border-[var(--color-luxury-black)] outline-none bg-white min-w-[140px]"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 text-left font-medium">Product</th>
                <th className="p-4 text-left font-medium">Customer & Rating</th>
                <th className="p-4 text-left font-medium">Review</th>
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Loading reviews...</p>
                  </td>
                </tr>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                          {review.products?.image_url ? (
                            <img src={review.products.image_url} alt={review.products.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Star className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 line-clamp-1">{review.products?.name}</span>
                          <Link 
                            href={`/shop/${review.product_id}`}
                            className="text-[10px] text-gray-400 hover:text-[var(--color-rose-gold)] flex items-center gap-1 transition-colors"
                          >
                            View Product <ExternalLink className="w-2 h-2" />
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-900">{review.user_name}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {review.comment || <em className="text-gray-400">No comment</em>}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-xs text-gray-500">
                        {format(new Date(review.created_at), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <p className="text-sm italic">No reviews found matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
