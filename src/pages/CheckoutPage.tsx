import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Wallet
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import confetti from 'canvas-confetti';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, subtotal, shippingFee, discountAmount, total, appliedCoupon } = useCart();
  const { user } = useAuth();
  const { error } = useToast();

  // Form Fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hồ Chí Minh');
  const [district, setDistrict] = useState('Quận 1');
  const [ward, setWard] = useState('Phường Bến Nghé');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER' | 'MOCK_EWALLET'>('COD');
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-gray-400">Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black font-bold text-xs"
        >
          Khám phá sản phẩm
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      error('Vui lòng điền đầy đủ các thông tin giao hàng bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      const orderPayload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city,
        district,
        ward,
        note: note.trim() || undefined,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        shippingFee,
        items: items.map((i) => ({
          productId: i.product!.id,
          name: i.product!.name,
          image: i.product!.images[0],
          price: i.product!.price,
          quantity: i.quantity
        }))
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // confetti optional
        }

        onNavigate('order-success', { order: res.order });
      }
    } catch (err: any) {
      error(err.message || 'Không thể tạo đơn hàng, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#1F2937]">
        <button
          onClick={() => onNavigate('cart')}
          className="text-xs text-gray-400 hover:text-[#00E5FF] flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại giỏ hàng
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Lock className="w-6 h-6 text-[#00E5FF]" />
          TIẾN HÀNH ĐẶT HÀNG & THANH TOÁN
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Hệ thống bảo mật SSL 256-bit đảm bảo an toàn tuyệt đối cho thông tin của bạn
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Customer Information */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00E5FF] text-black text-xs font-black flex items-center justify-center">
                1
              </span>
              Thông Tin Người Nhận
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Minh"
                  className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Số điện thoại liên hệ *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987654321"
                  className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Email nhận hóa đơn & mã đơn *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00E5FF] text-black text-xs font-black flex items-center justify-center">
                2
              </span>
              Địa Chỉ Nhận Hàng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tỉnh / Thành phố *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#0B0F14] text-white px-3 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">TP. Hà Nội</option>
                  <option value="Đà Nẵng">TP. Đà Nẵng</option>
                  <option value="Cần Thơ">TP. Cần Thơ</option>
                  <option value="Hải Phòng">TP. Hải Phòng</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Đồng Nai">Đồng Nai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Quận / Huyện *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Quận 1, Cầu Giấy..."
                  className="w-full bg-[#0B0F14] text-white px-3 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Phường / Xã *</label>
                <input
                  type="text"
                  required
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Phường Bến Nghé..."
                  className="w-full bg-[#0B0F14] text-white px-3 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Địa chỉ số nhà, tên đường cụ thể *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: 123 Nguyễn Huệ, Chung cư CyberTower tầng 5"
                  className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Ghi chú cho nhân viên giao hàng (nếu có)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Giao giờ hành chính, gọi trước khi đến..."
                  className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00E5FF] text-black text-xs font-black flex items-center justify-center">
                3
              </span>
              Phương Thức Thanh Toán
            </h3>

            <div className="space-y-3">
              {/* COD */}
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white'
                    : 'bg-[#0B0F14] border-[#1F2937] text-gray-300 hover:bg-[#1F2937]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#111827] flex items-center justify-center text-[#00E5FF]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-[11px] text-gray-400">
                      Kiểm tra linh kiện, nguyên đai nguyên kiện trước khi thanh toán tiền mặt
                    </div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'COD' ? 'border-[#00E5FF]' : 'border-gray-600'
                  }`}
                >
                  {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />}
                </div>
              </label>

              {/* VietQR Bank Transfer */}
              <label
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white'
                    : 'bg-[#0B0F14] border-[#1F2937] text-gray-300 hover:bg-[#1F2937]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#111827] flex items-center justify-center text-purple-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Chuyển khoản VietQR Siêu Tốc 24/7</div>
                    <div className="text-[11px] text-gray-400">
                      Quét mã QR tự động điền số tiền và mã đơn, xác nhận tức thì không chờ đợi
                    </div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'BANK_TRANSFER' ? 'border-[#00E5FF]' : 'border-gray-600'
                  }`}
                >
                  {paymentMethod === 'BANK_TRANSFER' && <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />}
                </div>
              </label>

              {/* Mock E-Wallet */}
              <label
                onClick={() => setPaymentMethod('MOCK_EWALLET')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'MOCK_EWALLET'
                    ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white'
                    : 'bg-[#0B0F14] border-[#1F2937] text-gray-300 hover:bg-[#1F2937]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#111827] flex items-center justify-center text-pink-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Ví Điện Tử (MoMo / ZaloPay / VNPay)</div>
                    <div className="text-[11px] text-gray-400">
                      Thanh toán an toàn qua cổng ví điện tử phổ biến tại Việt Nam
                    </div>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'MOCK_EWALLET' ? 'border-[#00E5FF]' : 'border-gray-600'
                  }`}
                >
                  {paymentMethod === 'MOCK_EWALLET' && <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-[#1F2937]">
              Sản Phẩm Đặt Mua ({items.length})
            </h3>

            {/* Item Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={i.product?.images[0]}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg bg-[#0B0F14] border border-[#1F2937] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{i.product?.name}</div>
                    <div className="text-gray-400 text-[11px]">
                      {i.quantity} x {i.product?.price.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                  <div className="font-bold text-[#00E5FF]">
                    {((i.product?.price || 0) * i.quantity).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-[#1F2937] space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Phí giao hàng:</span>
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
                  <span>Voucher giảm giá ({appliedCoupon?.code}):</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#1F2937] flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Tổng đơn hàng:</span>
                <span className="text-2xl font-black text-[#00E5FF]">
                  {total.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:opacity-95 text-black font-black text-sm shadow-xl shadow-[#00E5FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {submitting ? 'Đang tạo đơn hàng...' : 'Xác Nhận Đặt Hàng'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Bảo hành chính hãng 1 đổi 1
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
