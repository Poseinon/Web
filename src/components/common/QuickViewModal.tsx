import React, { useState } from 'react';
import { X, Star, ShoppingCart, Heart, Shield, Truck, RotateCcw, ExternalLink } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onNavigate }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    onNavigate('cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-white bg-[#0B0F14]/70 hover:bg-[#0B0F14] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media (Left) */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between bg-[#0B0F14]/50 border-r border-[#1F2937]">
          <div className="relative pt-[80%] rounded-xl overflow-hidden bg-[#0B0F14] border border-[#1F2937]">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-contain p-4"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 bg-[#0B0F14] transition-all ${
                    selectedImage === idx ? 'border-[#00E5FF]' : 'border-[#1F2937] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Highlights */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#1F2937] text-[11px] text-gray-400 text-center">
            <div className="flex flex-col items-center">
              <Shield className="w-4 h-4 text-[#00E5FF] mb-1" />
              <span>Chính Hãng 100%</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-4 h-4 text-emerald-400 mb-1" />
              <span>Freeship từ 10tr</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-4 h-4 text-amber-400 mb-1" />
              <span>Đổi Mới 30 Ngày</span>
            </div>
          </div>
        </div>

        {/* Product Details (Right) */}
        <div className="md:w-1/2 p-6 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="font-bold text-[#00E5FF] uppercase tracking-wider">{product.brandName}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">SKU: {product.sku}</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{product.name}</h2>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-white font-bold">{product.rating}</span>
            <span className="text-gray-400">({product.reviewCount} đánh giá)</span>
            <span className="text-gray-500">•</span>
            <span className="text-emerald-400 font-medium">
              {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
            </span>
          </div>

          {/* Price */}
          <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1F2937] flex items-baseline gap-3">
            <span className="text-2xl font-black text-[#00E5FF]">
              {product.price.toLocaleString('vi-VN')} ₫
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.oldPrice.toLocaleString('vi-VN')} ₫
              </span>
            )}
            {product.discount > 0 && (
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold">
                Tiết kiệm {product.discount}%
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
            {product.description}
          </p>

          {/* Specs Mini Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="rounded-xl border border-[#1F2937] overflow-hidden text-xs">
              <div className="bg-[#1F2937]/50 px-3 py-1.5 font-semibold text-gray-200">
                Thông số nổi bật:
              </div>
              <div className="divide-y divide-[#1F2937]/50 bg-[#0B0F14]/30">
                {Object.entries(product.specifications).slice(0, 4).map(([k, v]) => (
                  <div key={k} className="px-3 py-1.5 flex justify-between">
                    <span className="text-gray-400">{k}:</span>
                    <span className="font-medium text-gray-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-gray-400 font-medium">Số lượng:</span>
            <div className="flex items-center border border-[#1F2937] rounded-lg overflow-hidden bg-[#0B0F14]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 text-gray-300 hover:bg-[#1F2937] transition-colors"
              >
                -
              </button>
              <span className="px-4 py-1 text-xs font-bold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-1 text-gray-300 hover:bg-[#1F2937] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/20 transition-all disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              Thêm vào giỏ
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333ea] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/20 transition-all disabled:opacity-50"
            >
              Mua ngay
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-xl border transition-all ${
                isFavorited
                  ? 'bg-pink-600 border-pink-500 text-white'
                  : 'bg-[#0B0F14] border-[#1F2937] text-gray-400 hover:text-pink-400'
              }`}
              title="Yêu thích"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => {
                onClose();
                onNavigate('product-detail', { id: product.slug });
              }}
              className="text-xs text-[#00E5FF] hover:underline inline-flex items-center gap-1"
            >
              Xem trang chi tiết sản phẩm đầy đủ <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
