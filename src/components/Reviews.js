import React, { useState } from 'react';
import { Star, Quote, Languages, ChevronDown, ChevronUp } from 'lucide-react';

const Reviews = () => {
  const [language, setLanguage] = useState('en');
  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleReview = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const reviewsData = [
    {
      id: 1,
      name: 'Hardik Awasthi',
      nameHi: 'हार्दिक अवस्थी',
      title: {
        en: 'Rich, Golden Color and Wonderfully Aromatic',
        hi: 'समृद्ध, सुनहरा रंग और अद्भुत सुगंधित'
      },
      review: {
        en: 'I recently purchased the SB Premium Ghee, and I am thoroughly impressed with the quality. This ghee has a rich, golden color and a wonderfully aromatic scent. It adds a depth of flavor to my dishes that is unparalleled. The texture is smooth and creamy, making it perfect for cooking or as a finishing touch on various recipes. I appreciate that it\'s made from high-quality, grass-fed cows, which is evident in both taste and texture. It\'s a bit pricier than some other brands, but the superior quality justifies the cost. Highly recommended for anyone who values authentic, premium ghee.',
        hi: 'मैंने हाल ही में SB प्रीमियम घी खरीदा है, और मैं इसकी गुणवत्ता से बहुत प्रभावित हूं। इस घी का रंग समृद्ध, सुनहरा है और इसकी सुगंध अद्भुत है। यह मेरे व्यंजनों में अतुलनीय स्वाद जोड़ता है। बनावट चिकनी और मलाईदार है, जो खाना पकाने के लिए एकदम सही है। मुझे यह पसंद है कि यह उच्च गुणवत्ता वाली, घास खिलाई गई गायों से बनाया गया है। यह कुछ अन्य ब्रांडों की तुलना में थोड़ा महंगा है, लेकिन बेहतर गुणवत्ता कीमत को उचित ठहराती है।'
      },
      rating: 5,
      date: '11/09/2025',
      product: {
        en: 'SB Premium Pure Ghee 2kg',
        hi: 'SB प्रीमियम शुद्ध घी 2kg'
      }
    },
    {
      id: 2,
      name: 'Priya Sharma',
      nameHi: 'प्रिया शर्मा',
      title: {
        en: 'Best Ghee for Daily Cooking',
        hi: 'रोज़ाना खाना बनाने के लिए सर्वश्रेष्ठ घी'
      },
      review: {
        en: 'Been using SB Premium Ghee for the past 3 months and my entire family loves it! The aroma while cooking is divine. My rotis taste better, dal tastes richer. The packaging is also very good - no leakage issues. Worth every penny!',
        hi: 'पिछले 3 महीनों से SB प्रीमियम घी का उपयोग कर रहे हैं और मेरा पूरा परिवार इसे पसंद करता है! खाना पकाते समय खुशबू दिव्य है। मेरी रोटियां बेहतर स्वाद लेती हैं, दाल अधिक स्वादिष्ट होती है। पैकेजिंग भी बहुत अच्छी है।'
      },
      rating: 5,
      date: '11/05/2025',
      product: {
        en: 'SB Premium Ghee 1kg',
        hi: 'SB प्रीमियम घी 1kg'
      }
    },
    {
      id: 3,
      name: 'Rajesh Kumar',
      nameHi: 'राजेश कुमार',
      title: {
        en: 'Pure and Authentic A2 Ghee',
        hi: 'शुद्ध और प्रामाणिक A2 घी'
      },
      review: {
        en: 'I have been searching for pure A2 cow ghee for my mother\'s health. SB Premium Ghee is exactly what I was looking for. You can tell the difference from the first spoon itself. Highly digestible and no artificial smell. My mother\'s digestion has improved significantly.',
        hi: 'मैं अपनी माँ के स्वास्थ्य के लिए शुद्ध A2 गाय का घी खोज रहा था। SB प्रीमियम घी वही है जो मैं खोज रहा था। पहले चम्मच से ही अंतर महसूस होता है। मेरी माँ का पाचन काफी सुधर गया है।'
      },
      rating: 5,
      date: '10/28/2025',
      product: {
        en: 'SB Premium Cow Ghee 250g',
        hi: 'SB प्रीमियम गाय घी 250g'
      }
    },
    {
      id: 4,
      name: 'Anita Desai',
      nameHi: 'अनिता देसाई',
      title: {
        en: 'Traditional Bilona Method - Real Taste',
        hi: 'पारंपरिक बिलोना विधि - असली स्वाद'
      },
      review: {
        en: 'Finally found ghee that reminds me of my grandmother\'s homemade ghee! The bilona method really makes a difference. The granular texture and nutty flavor are perfect. I use it for my morning coffee and it gives amazing energy throughout the day.',
        hi: 'अंततः वह घी मिल गया जो मुझे मेरी दादी के घर के बने घी की याद दिलाता है! बिलोना विधि वास्तव में फर्क लाती है। दानेदार बनावट और मेवे जैसा स्वाद एकदम सही है।'
      },
      rating: 5,
      date: '10/22/2025',
      product: {
        en: 'SB Premium Ghee 500g',
        hi: 'SB प्रीमियम घी 500g'
      }
    },
    {
      id: 5,
      name: 'Vikram Singh',
      nameHi: 'विक्रम सिंह',
      title: {
        en: 'Excellent Quality for Health-Conscious People',
        hi: 'स्वास्थ्य के प्रति सचेत लोगों के लिए उत्कृष्ट गुणवत्ता'
      },
      review: {
        en: 'As a fitness enthusiast, I was looking for pure ghee without any adulteration. SB Premium Ghee has become my go-to choice. It has a clean taste, perfect for keto diet. The 5kg pack is very economical for regular users like me.',
        hi: 'एक फिटनेस उत्साही के रूप में, मैं बिना किसी मिलावट के शुद्ध घी की तलाश में था। SB प्रीमियम घी मेरी पसंदीदा पसंद बन गया है। 5kg पैक बहुत किफायती है।'
      },
      rating: 5,
      date: '10/18/2025',
      product: {
        en: 'SB Premium Ghee 5kg',
        hi: 'SB प्रीमियम घी 5kg'
      }
    },
    {
      id: 6,
      name: 'Meera Patel',
      nameHi: 'मीरा पटेल',
      title: {
        en: 'My Kids Love the Taste!',
        hi: 'मेरे बच्चों को स्वाद पसंद है!'
      },
      review: {
        en: 'I was struggling to make my kids eat healthy food. Started using SB Premium Ghee in their meals and now they actually ask for more! The sweet aroma and rich taste make everything delicious. Great product for families with children.',
        hi: 'मैं अपने बच्चों को स्वस्थ भोजन खिलाने के लिए संघर्ष कर रही थी। उनके भोजन में SB प्रीमियम घी का उपयोग करना शुरू किया और अब वे वास्तव में अधिक मांगते हैं!'
      },
      rating: 5,
      date: '10/15/2025',
      product: {
        en: 'SB Premium Pure Ghee 500g',
        hi: 'SB प्रीमियम शुद्ध घी 500g'
      }
    }
  ];

  const translations = {
    en: {
      customerReviews: 'Customer Reviews',
      proofInEveryWord: 'PROOF IN EVERY WORD',
      subtitle: "Don't just take our word for it - hear what our happy customers have to say about our premium ghee",
      readMore: 'Read More',
      readLess: 'Read Less',
      reviewed: 'reviewed',
      verified: '✓ Verified',
      joinCustomers: 'Join 2,000+ Happy Customers Today!'
    },
    hi: {
      customerReviews: 'ग्राहक समीक्षाएं',
      proofInEveryWord: 'हर शब्द में प्रमाण',
      subtitle: 'केवल हमारी बात न मानें - सुनें कि हमारे खुश ग्राहकों का हमारे प्रीमियम घी के बारे में क्या कहना है',
      readMore: 'और पढ़ें',
      readLess: 'कम पढ़ें',
      reviewed: 'ने समीक्षा की',
      verified: '✓ सत्यापित',
      joinCustomers: 'आज 2,000+ खुश ग्राहकों में शामिल हों!'
    }
  };

  const t = translations[language];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-orange-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-amber-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
            <Star size={16} className="fill-current" />
            {t.customerReviews}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t.proofInEveryWord}
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto mb-6">
            {t.subtitle}
          </p>

          <div className="inline-flex items-center gap-2 bg-white border-2 border-orange-300 rounded-full p-1 shadow-lg">
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Languages size={16} />
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                language === 'hi'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Languages size={16} />
              हिंदी
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewsData.map((review) => {
            const isExpanded = expandedReviews[review.id];
            const reviewText = review.review[language];
            const shouldShowButton = reviewText.length > 150;

            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-orange-200 relative group"
              >
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Quote size={20} className="text-white" strokeWidth={3} />
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-yellow-500 fill-current" />
                  ))}
                </div>

                <h4 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                  {review.title[language]}
                </h4>

                <p className={`text-sm text-gray-700 mb-4 leading-relaxed ${!isExpanded && shouldShowButton ? 'line-clamp-4' : ''}`}>
                  {reviewText}
                </p>

                {shouldShowButton && (
                  <button
                    onClick={() => toggleReview(review.id)}
                    className="flex items-center gap-1 text-orange-600 text-xs font-semibold hover:underline mb-2 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        {t.readLess}
                        <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        {t.readMore}
                        <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                )}

                <div className="pt-4 border-t border-gray-200 mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {language === 'hi' ? review.nameHi : review.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.reviewed} {review.product[language]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  {t.verified}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 px-6 py-3 rounded-full shadow-md">
            <Star size={18} className="text-orange-600 fill-current" />
            <span className="text-sm font-bold text-gray-800">
              {t.joinCustomers}
            </span>
            <Star size={18} className="text-orange-600 fill-current" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
