import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingCart,
  Heart,
  Scale,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Share2,
  Cpu,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCompare } from '../context/CompareContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ProductCard } from '../components/product/ProductCard.tsx';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
  onQuickView
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'warranty'>('desc');
  const [loading, setLoading] = useState(true);

  // Review submission form state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();
  const { success, error } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function loadProductDetail() {
      try {
        setLoading(true);
        const res = await api.getProduct(productId);
        if (res.success && res.data) {
          setProduct(res.data);
          setSelectedImage(0);

          // Fetch reviews
          const revRes = await api.getReviews(res.data.id);
          if (revRes.success) setReviews(revRes.data);

          // Fetch related products in the same category
          const relRes = await api.getProducts({ category: res.data.categorySlug, limit: 4 });
          if (relRes.success) {
            setRelatedProducts(relRes.products.filter((p) => p.id !== res.data.id));
          }
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProductDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-gray-400 text-sm">Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Không tìm thấy linh kiện này</h2>
        <p className="text-gray-400 text-xs">Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black font-bold text-xs"
        >
          Quay lại danh mục sản phẩm
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onNavigate('cart');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      success('Đã sao chép liên kết sản phẩm vào bộ nhớ tạm!', 'Chia sẻ');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.submitReview(product.id, {
        rating: ratingInput,
        comment: commentInput.trim(),
        userName: reviewerName.trim() || user?.fullName
      });

      if (res.success && res.data) {
        setReviews([res.data, ...reviews]);
        setCommentInput('');
        success('Cảm ơn bạn đã gửi đánh giá sản phẩm!', 'Đánh giá thành công');
      }
    } catch (err: any) {
      error(err.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500">
        <span onClick={() => onNavigate('home')} className="hover:text-[#00E5FF] cursor-pointer">
          Trang chủ
        </span>{' '}
        /{' '}
        <span
          onClick={() => onNavigate('products', { category: product.categorySlug })}
          className="hover:text-[#00E5FF] cursor-pointer"
        >
          {product.categorySlug.toUpperCase()}
        </span>{' '}
        /{' '}
        <span className="text-gray-300 truncate max-w-xs inline-block align-bottom">{product.name}</span>
      </div>

      {/* Top Main Section: Gallery & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square rounded-2xl bg-[#0B0F14] border border-[#1F2937] p-8 flex items-center justify-center overflow-hidden group">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-black uppercase">
                GIẢM {product.discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-[#0B0F14] shrink-0 transition-all ${
                    selectedImage === idx ? 'border-[#00E5FF] scale-102' : 'border-[#1F2937] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover p-1" />
                </button>
              ))}
            </div>
          )}

          {/* Value props under gallery */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#111827] border border-[#1F2937] text-center text-xs">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-[#00E5FF] mb-1" />
              <span className="font-bold text-white">Chính Hãng 100%</span>
              <span className="text-[10px] text-gray-400">Bảo hành 36 tháng</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="font-bold text-white">Giao Toàn Quốc</span>
              <span className="text-[10px] text-gray-400">Đóng gói chuẩn khí</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-amber-400 mb-1" />
              <span className="font-bold text-white">Đổi Mới 30 Ngày</span>
              <span className="text-[10px] text-gray-400">Nếu lỗi phần cứng</span>
            </div>
          </div>
        </div>

        {/* Right: Info & Purchase Action (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#00E5FF]/10 text-[#00E5FF] font-bold uppercase tracking-wider">
                  {product.brandName}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">Mã SKU: {product.sku}</span>
              </div>
              <button
                onClick={handleShare}
                className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating & Stock banner */}
          <div className="flex flex-wrap items-center gap-4 text-xs pb-4 border-b border-[#1F2937]">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-600'}`}
                />
              ))}
              <span className="ml-1.5 font-bold text-white text-sm">{product.rating}</span>
            </div>
            <span className="text-gray-400">({product.reviewCount} đánh giá khách hàng)</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">Đã bán {product.soldCount} chiếc</span>
            <span className="text-gray-600">•</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                product.stock > 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Tạm hết hàng'}
            </span>
          </div>

          {/* Price Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-[#1F2937] flex items-baseline gap-4">
            <span className="text-3xl sm:text-4xl font-black text-[#00E5FF] tracking-tight">
              {product.price.toLocaleString('vi-VN')} ₫
            </span>
            {product.oldPrice && (
              <span className="text-base text-gray-500 line-through">
                {product.oldPrice.toLocaleString('vi-VN')} ₫
              </span>
            )}
            {product.discount > 0 && (
              <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold">
                Tiết kiệm {((product.oldPrice! - product.price)).toLocaleString('vi-VN')} ₫
              </span>
            )}
          </div>

          {/* Key Compatibility Specs Quick Badge */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {product.socket && (
              <div className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
                <div className="text-gray-500 text-[10px]">Socket CPU</div>
                <div className="font-mono font-bold text-white">{product.socket}</div>
              </div>
            )}
            {product.ramType && (
              <div className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
                <div className="text-gray-500 text-[10px]">Chuẩn RAM</div>
                <div className="font-mono font-bold text-white">{product.ramType}</div>
              </div>
            )}
            {product.wattage && (
              <div className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
                <div className="text-gray-500 text-[10px]">Công suất (TDP/Nguồn)</div>
                <div className="font-mono font-bold text-[#00E5FF]">{product.wattage}W</div>
              </div>
            )}
            {product.vram && (
              <div className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
                <div className="text-gray-500 text-[10px]">VRAM</div>
                <div className="font-mono font-bold text-purple-400">{product.vram}</div>
              </div>
            )}
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-300 font-semibold">Số lượng:</span>
              <div className="flex items-center border border-[#1F2937] rounded-xl overflow-hidden bg-[#0B0F14]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-gray-300 hover:bg-[#1F2937] transition-colors"
                >
                  -
                </button>
                <span className="px-5 py-2 text-sm font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-2 text-gray-300 hover:bg-[#1F2937] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-3.5 rounded-xl bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#00E5FF]/20 transition-all disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333ea] hover:opacity-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#7C3AED]/20 transition-all disabled:opacity-50"
              >
                Mua ngay lập tức
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isFavorited
                      ? 'bg-pink-600 border-pink-500 text-white'
                      : 'bg-[#111827] border-[#1F2937] text-gray-400 hover:text-pink-400'
                  }`}
                  title={isFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => addToCompare(product)}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCompared
                      ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                      : 'bg-[#111827] border-[#1F2937] text-gray-400 hover:text-[#00E5FF]'
                  }`}
                  title="So sánh cấu hình"
                >
                  <Scale className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description | Specs | Reviews | Warranty */}
      <div className="rounded-2xl bg-[#111827] border border-[#1F2937] overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-[#1F2937] bg-[#0B0F14]/50 overflow-x-auto">
          {[
            { id: 'desc', label: 'Mô Tả Sản Phẩm' },
            { id: 'specs', label: 'Thông Số Kỹ Thuật' },
            { id: 'reviews', label: `Đánh Giá (${reviews.length})` },
            { id: 'warranty', label: 'Chính Sách & Bảo Hành' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3.5 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#00E5FF] text-[#00E5FF] bg-[#111827]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {activeTab === 'desc' && (
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed max-w-4xl">
              <p>{product.description}</p>
              <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#1F2937]">
                <h4 className="font-bold text-white mb-2">Đặc điểm nổi bật của {product.name}:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-300">
                  <li>Thiết kế tối ưu hiệu năng và khả năng tản nhiệt bền bỉ</li>
                  <li>Hỗ trợ công nghệ mới nhất từ các nhà sản xuất hàng đầu thế giới</li>
                  <li>Tương thích tuyệt đối với các linh kiện chuẩn công nghiệp hiện đại</li>
                  <li>Bao bì nguyên seal, đầy đủ phiếu bảo hành và linh kiện đi kèm từ nhà phân phối</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-3xl">
              <table className="w-full text-xs text-left">
                <tbody>
                  {Object.entries(product.specifications || {}).map(([key, value], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-[#0B0F14]/40' : 'bg-transparent'}
                    >
                      <td className="py-2.5 px-4 font-semibold text-gray-400 w-1/3 border-b border-[#1F2937]/50">
                        {key}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-white border-b border-[#1F2937]/50">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Write Review Form */}
              <form onSubmit={handleSubmitReview} className="p-5 rounded-xl bg-[#0B0F14] border border-[#1F2937] space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#00E5FF]" />
                  Gửi nhận xét của bạn về sản phẩm này
                </h4>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-400">Chọn số sao:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRatingInput(s)}
                        className={`p-1 text-base ${
                          s <= ratingInput ? 'text-amber-400' : 'text-gray-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {!user && (
                  <div>
                    <input
                      type="text"
                      placeholder="Họ và tên của bạn..."
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full bg-[#111827] text-white px-3 py-2 rounded-lg border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                    />
                  </div>
                )}

                <div>
                  <textarea
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm sử dụng, hiệu năng nhiệt độ thực tế của linh kiện..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full bg-[#111827] text-white p-3 rounded-lg border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </form>

              {/* Review List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-[#0B0F14]/50 border border-[#1F2937] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1F2937] text-[#00E5FF] flex items-center justify-center font-bold text-xs">
                            {rev.userName.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{rev.userName}</div>
                            <div className="flex text-amber-400 text-xs">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-gray-500">
                    Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên để lại nhận xét!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="space-y-4 text-xs text-gray-300 max-w-3xl leading-relaxed">
              <h4 className="font-bold text-sm text-white">Chính Sách Bảo Hành Linh Kiện Tại TECHZONE</h4>
              <p>
                Tất cả sản phẩm bán ra đều được phân phối chính hãng từ các nhà nhập khẩu độc quyền tại Việt Nam (Viễn Sơn, Thùy Minh, Vĩnh Xuân, Elite, Mai Hoàng, Synnex FPT...).
              </p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Bảo hành 36 tháng cho CPU, Mainboard, VGA, RAM, SSD, Nguồn máy tính</li>
                <li>Đổi mới trong 30 ngày đầu tiên nếu sản phẩm bị lỗi phần cứng từ nhà sản xuất</li>
                <li>Hỗ trợ mượn linh kiện thay thế tạm thời trong thời gian trung tâm bảo hành xử lý</li>
                <li>Không áp dụng bảo hành đối với các trường hợp rơi vỡ, cháy nổ do sét đánh hoặc tự ý mod BIOS gây lỗi</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-[#1F2937]">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#00E5FF] rounded-full" />
            SẢN PHẨM CÙNG DANH MỤC LIÊN QUAN
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
