import React from 'react';
import { Heart, ShoppingCart, Eye, Star, Scale, Check } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCompare } from '../../context/CompareContext.tsx';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  return (
    <div className="group relative bg-[#111827] rounded-2xl border border-[#1F2937] hover:border-[#00E5FF]/50 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl hover:shadow-[#00E5FF]/5 hover:-translate-y-1">
      {/* Product Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
        {product.discount > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
            -{product.discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-md">
            HOT
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
            Chỉ còn {product.stock}
          </span>
        )}
        {product.stock === 0 && (
          <span className="px-2 py-0.5 rounded-md bg-gray-700 text-gray-300 text-[10px] font-bold">
            Hết hàng
          </span>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Yêu thích sản phẩm"
          className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
            isFavorited
              ? 'bg-pink-600 text-white'
              : 'bg-[#0B0F14]/80 text-gray-300 hover:text-pink-400 hover:bg-[#0B0F14]'
          }`}
          title={isFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCompare(product);
          }}
          aria-label="So sánh sản phẩm"
          className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
            isCompared
              ? 'bg-[#7C3AED] text-white'
              : 'bg-[#0B0F14]/80 text-gray-300 hover:text-[#00E5FF] hover:bg-[#0B0F14]'
          }`}
          title={isCompared ? 'Bỏ so sánh' : 'Thêm vào so sánh'}
        >
          {isCompared ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
        </button>

        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            aria-label="Xem nhanh sản phẩm"
            className="p-2 rounded-xl bg-[#0B0F14]/80 text-gray-300 hover:text-[#00E5FF] hover:bg-[#0B0F14] backdrop-blur-md transition-all shadow-md"
            title="Xem nhanh"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product Image */}
      <div
        onClick={() => onNavigate('product-detail', { id: product.slug })}
        className="relative w-full pt-[75%] bg-[#0B0F14] overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
        />
        {/* Subtle bottom gradient on image */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#111827] to-transparent" />
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
            <span className="font-semibold text-[#00E5FF] uppercase tracking-wider">
              {product.brandName}
            </span>
            <span className="text-gray-500">{product.sku}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onNavigate('product-detail', { id: product.slug })}
            title={product.name}
            className="text-sm font-semibold text-gray-100 hover:text-[#00E5FF] transition-colors line-clamp-2 cursor-pointer leading-snug mb-2"
          >
            {product.name}
          </h3>

          {/* Specs tags pills (Socket, RAM, Wattage) */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.socket && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1F2937] text-gray-300 font-mono">
                {product.socket}
              </span>
            )}
            {product.ramType && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1F2937] text-gray-300 font-mono">
                {product.ramType}
              </span>
            )}
            {product.vram && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#7C3AED]/20 text-[#a78bfa] font-mono">
                {product.vram}
              </span>
            )}
          </div>
        </div>

        <div>
          {/* Rating & Sold count */}
          <div className="flex items-center gap-2 mb-2.5 text-xs text-gray-400">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold ml-1 text-white">{product.rating}</span>
            </div>
            <span>({product.reviewCount})</span>
            <span className="text-gray-600">•</span>
            <span>Đã bán {product.soldCount}</span>
          </div>

          {/* Price & Action */}
          <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between gap-2">
            <div>
              <div className="text-base font-extrabold text-[#00E5FF] tracking-tight">
                {product.price.toLocaleString('vi-VN')} ₫
              </div>
              {product.oldPrice && (
                <div className="text-xs text-gray-500 line-through">
                  {product.oldPrice.toLocaleString('vi-VN')} ₫
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product.stock > 0) {
                  addToCart(product, 1);
                }
              }}
              disabled={product.stock === 0}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                product.stock > 0
                  ? 'bg-[#00E5FF] hover:bg-[#00b4d8] text-black shadow-md shadow-[#00E5FF]/20 active:scale-95'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              title={product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
