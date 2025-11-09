import React from 'react';
import { Star, Quote } from 'lucide-react';

const Reviews = () => {
  const reviews = [
    {
      id: 1,
      name: 'Hardik Awasthi',
      title: 'Rich, Golden Color and Wonderfully Aromatic',
      review: 'I recently purchased the "Pride of Cows" ghee, and I am thoroughly impressed with the quality. This ghee has a rich, golden color and a wonderfully aromatic scent. It adds a depth of flavor to my dishes that is unparalleled. The texture is smooth and creamy, making it perfect for cooking or as a finishing touch on various recipes. I appreciate that it\'s made from high-quality, grass-fed cows, which is evident in both taste and texture. It\'s a bit pricier than some other brands, but the superior quality justifies the cost. Highly recommended for anyone who values authentic, premium ghee.',
      rating: 5,
      date: '11/09/2025',
      product: 'Premium Pure Ghee'
    },
    {
      id: 2,
      name: 'Ram Niwas',
      title: 'I order A2 Bilona ghee for my mother and father they like it',
      review: 'I order A2 Bilona ghee for my mother and father they like it, pure and clean',
      rating: 5,
      date: '10/14/2025',
      product: 'A2 Desi Cow Bilona Ghee'
    },
    {
      id: 3,
      name: 'Anonymous',
      title: 'Pure and perfect organic Cow',
      review: 'Pure and perfect organic Cow Ghee',
      rating: 5,
      date: '10/14/2025',
      product: 'A2 Desi Cow Bilona Ghee'
    },
    {
      id: 4,
      name: 'Anonymous',
      title: 'It is real ghee made by curd',
      review: 'It is real ghee made by curd. It has no sour taste. I am loving it.',
      rating: 5,
      date: '8/13/2025',
      product: 'A2 Desi Cow Bilona Ghee'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-orange-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
            <Star size={16} className="fill-current" />
            Customer Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            PROOF IN EVERY WORD
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
            Don't just take our word for it - hear what our happy customers have to say about our premium ghee
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-orange-200 relative group"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Quote size={20} className="text-white" strokeWidth={3} />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="text-yellow-500 fill-current"
                  />
                ))}
              </div>

              {/* Review Title */}
              <h4 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                {review.title}
              </h4>

              {/* Review Text */}
              <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-4">
                {review.review}
              </p>

              {/* "Read More" indicator for longer reviews */}
              {review.review.length > 150 && (
                <button className="text-orange-600 text-xs font-semibold hover:underline mb-2">
                  Read Full Review →
                </button>
              )}

              {/* Reviewer Info */}
              <div className="pt-4 border-t border-gray-200 mt-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-500">reviewed {review.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                ✓ Verified
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 px-6 py-3 rounded-full shadow-md">
            <Star size={18} className="text-orange-600 fill-current" />
            <span className="text-sm font-bold text-gray-800">
              Join 2,000+ Happy Customers Today!
            </span>
            <Star size={18} className="text-orange-600 fill-current" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
