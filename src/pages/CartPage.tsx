import React, { useState } from 'react';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, Tag, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    discountAmount,
    total,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponSubmitting(true);
    await applyCoupon(couponInput.trim());
    setCouponSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-[#111827] border border-[#1F2937] text-gray-500 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Hãy lướt qua các sản phẩm linh kiện công nghệ hàng đầu tại TechZone và lựa chọn những món đồ ưng ý cho dàn PC của bạn!
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('products')}
            className="px-6 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-extrabold text-xs shadow-lg shadow-[#00E5FF]/20 inline-flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm linh kiện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-[#00E5FF]" />
            GIỎ HÀNG CỦA BẠN ({itemCount} món)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Kiểm tra danh sách linh kiện trước khi tiến hành thanh toán
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-[#111827] border border-[#1F2937] overflow-hidden divide-y divide-[#1F2937]">
            {items.map((item) => {
              const prod = item.product;
              if (!prod) return null;
              const lineTotal = prod.price * item.quantity;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 hover:bg-[#0B0F14]/40 transition-colors"
                >
                  {/* Thumbnail */}
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    onClick={() => onNavigate('product-detail', { id: prod.slug })}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl bg-[#0B0F14] border border-[#1F2937] p-2 shrink-0 cursor-pointer"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                    <div className="text-[11px] font-bold text-[#00E5FF] uppercase">
                      {prod.brandName}
                    </div>
                    <h3
                      onClick={() => onNavigate('product-detail', { id: prod.slug })}
                      className="text-sm font-bold text-white hover:text-[#00E5FF] transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {prod.name}
                    </h3>
                    <div className="text-xs text-gray-400 font-mono">SKU: {prod.sku}</div>
                    <div className="text-xs font-bold text-white sm:hidden pt-1">
                      {prod.price.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center border border-[#1F2937] rounded-lg overflow-hidden bg-[#0B0F14] shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-gray-400 hover:text-white hover:bg-[#1F2937] transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-white min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= prod.stock}
                      className="px-2.5 py-1 text-gray-400 hover:text-white hover:bg-[#1F2937] transition-colors disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0 min-w-[120px]">
                    <div className="text-sm font-extrabold text-[#00E5FF]">
                      {lineTotal.toLocaleString('vi-VN')} ₫
                    </div>
                    {prod.oldPrice && (
                      <div className="text-[11px] text-gray-500 line-through">
                        {(prod.oldPrice * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Xóa khỏi giỏ hàng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Tiếp tục mua thêm linh kiện khác
          </button>
        </div>

        {/* Right: Order Summary & Voucher (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Coupon Box */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Tag className="w-4 h-4 text-[#00E5FF]" />
              Mã Khuyến Mãi / Voucher
            </div>

            {appliedCoupon ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {appliedCoupon.code}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Đã giảm: {discountAmount.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-400 hover:underline font-semibold"
                >
                  Gỡ bỏ
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Nhập TECHZONE10..."
                  className="flex-1 bg-[#0B0F14] text-white uppercase px-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
                <button
                  type="submit"
                  disabled={couponSubmitting}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-[#00E5FF] font-bold text-xs rounded-xl border border-[#00E5FF]/40 transition-colors disabled:opacity-50"
                >
                  Áp dụng
                </button>
              </form>
            )}

            {/* Quick coupon suggestions */}
            <div className="text-[11px] text-gray-400 space-y-1">
              <div>Gợi ý mã có sẵn:</div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => applyCoupon('TECHZONE10')}
                  className="px-2 py-0.5 rounded bg-[#0B0F14] hover:bg-[#1F2937] border border-[#1F2937] text-[10px] text-cyan-400"
                >
                  TECHZONE10 (Giảm 10%)
                </button>
                <button
                  type="button"
                  onClick={() => applyCoupon('FREESHIP')}
                  className="px-2 py-0.5 rounded bg-[#0B0F14] hover:bg-[#1F2937] border border-[#1F2937] text-[10px] text-emerald-400"
                >
                  FREESHIP (Giảm 30k ship)
                </button>
                <button
                  type="button"
                  onClick={() => applyCoupon('GAMINGPC')}
                  className="px-2 py-0.5 rounded bg-[#0B0F14] hover:bg-[#1F2937] border border-[#1F2937] text-[10px] text-purple-400"
                >
                  GAMINGPC (Giảm 500k đơn 15tr)
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-[#1F2937]">
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Tạm tính hàng ({itemCount} món):</span>
                <span className="font-semibold text-white">
                  {subtotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Phí vận chuyển:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold">Miễn phí</span>
                  ) : (
                    `${shippingFee.toLocaleString('vi-VN')} ₫`
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Giảm giá voucher:</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#1F2937] flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Tổng thanh toán:</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#00E5FF]">
                    {total.toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="text-[10px] text-gray-400">(Đã bao gồm thuế VAT 10%)</div>
                </div>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:opacity-95 text-black font-black text-sm shadow-xl shadow-[#00E5FF]/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Giao dịch an toàn & Bảo mật 100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
