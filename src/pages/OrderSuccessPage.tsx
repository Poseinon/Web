import React from 'react';
import { CheckCircle, Package, ArrowRight, Home, QrCode, Copy, Check } from 'lucide-react';
import { Order } from '../types/index.ts';
import { useToast } from '../context/ToastContext.tsx';
import { SHOP_CONFIG } from '../config/shopConfig.ts';

interface OrderSuccessPageProps {
  order: Order | null;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order: propOrder, onNavigate }) => {
  const { success } = useToast();
  const [copied, setCopied] = React.useState(false);

  // Restore order from localStorage if refreshed or lost
  const [order] = React.useState<Order | null>(() => {
    if (propOrder) {
      try {
        localStorage.setItem('techzone_last_order', JSON.stringify(propOrder));
      } catch (e) {}
      return propOrder;
    }
    const saved = localStorage.getItem('techzone_last_order');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Không tìm thấy thông tin đơn hàng</h2>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black font-bold text-xs"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      success('Đã sao chép nội dung chuyển khoản!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const qrImageUrl = `https://img.vietqr.io/image/MB-090123456789-compact2.png?amount=${order.total}&addInfo=TECHZONE%20${order.orderCode}&accountName=VU%20VAN%20HAI`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Top Success Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">ĐẶT HÀNG THÀNH CÔNG!</h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Cảm ơn quý khách đã tin tưởng mua sắm tại TECHZONE. Đơn hàng của bạn đã được ghi nhận vào hệ thống và đang được xử lý đóng gói.
        </p>
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#111827] border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-sm font-bold">
          Mã đơn hàng: {order.orderCode}
        </div>
      </div>

      {/* QR Bank Transfer Section if chosen */}
      {order.paymentMethod === 'BANK_TRANSFER' && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-purple-500/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
              <QrCode className="w-5 h-5" />
              <span>Thanh Toán Chuyển Khoản Ngân Hàng (VietQR 24/7)</span>
            </div>
            <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-medium">
              Tự động quét số tiền & nội dung
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Real Scanable VietQR Card Visual */}
            <div className="p-4 rounded-xl bg-white text-black flex flex-col items-center justify-center shadow-lg border border-gray-200">
              <div className="text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Quét mã để thanh toán nhanh
              </div>
              
              <div className="relative group w-56 h-56 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-inner border border-gray-100">
                <img
                  src={SHOP_CONFIG.banking.getQrUrl(order.total, order.orderCode)}
                  alt={`VietQR ${order.orderCode}`}
                  className="w-full h-full object-contain rounded"
                  onError={(e) => {
                    // Fallback to placeholder if offline
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="text-[11px] font-bold mt-2 text-center text-gray-800">
                Số tiền: <span className="text-purple-600">{order.total.toLocaleString('vi-VN')} ₫</span>
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-0.5">
                Mở ứng dụng Ngân hàng hoặc Ví MoMo để quét
              </p>
            </div>

            {/* Bank Transfer Details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1F2937]">
                <span className="text-gray-400">Ngân hàng:</span>
                <span className="font-bold text-white">{SHOP_CONFIG.banking.bankName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2937]">
                <span className="text-gray-400">Số tài khoản:</span>
                <span className="font-mono font-bold text-[#00E5FF] text-sm">{SHOP_CONFIG.banking.accountNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2937]">
                <span className="text-gray-400">Chủ tài khoản:</span>
                <span className="font-bold text-white uppercase">{SHOP_CONFIG.banking.accountHolder}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2937]">
                <span className="text-gray-400">Nội dung chuyển tiền:</span>
                <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                  TECHZONE {order.orderCode}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2937]">
                <span className="text-gray-400">Số tiền chính xác:</span>
                <span className="font-bold text-xl text-[#00E5FF]">{order.total.toLocaleString('vi-VN')} ₫</span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(`TECHZONE ${order.orderCode}`)}
                className="w-full py-2 bg-[#1F2937] hover:bg-[#374151] text-xs font-semibold text-gray-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Đã sao chép nội dung!' : 'Sao chép nội dung chuyển khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Info Details */}
      <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-[#1F2937]">
          Chi Tiết Đơn Hàng #{order.orderCode}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5">Người nhận hàng:</span>
            <span className="text-white font-semibold">{order.fullName} - {order.phone}</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Địa chỉ giao:</span>
            <span className="text-white">{order.address}, {order.ward}, {order.district}, {order.city}</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Phương thức thanh toán:</span>
            <span className="text-white font-semibold">
              {order.paymentMethod === 'COD' && 'Thanh toán tiền mặt khi nhận hàng (COD)'}
              {order.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản ngân hàng VietQR'}
              {order.paymentMethod === 'MOCK_EWALLET' && 'Ví điện tử'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Trạng thái:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold inline-block">
              ĐANG CHỜ XÁC NHẬN
            </span>
          </div>
        </div>

        {/* Ordered items */}
        <div className="pt-4 border-t border-[#1F2937] space-y-3">
          <div className="text-xs font-semibold text-gray-400">Danh sách linh kiện:</div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-3">
                <img src={item.image} alt="" className="w-9 h-9 object-cover rounded bg-[#0B0F14]" />
                <span className="text-white">{item.name} <strong className="text-gray-400">x{item.quantity}</strong></span>
              </div>
              <span className="font-bold text-[#00E5FF]">
                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          ))}
          <div className="pt-3 border-t border-[#1F2937] flex justify-between text-sm font-bold text-white">
            <span>Tổng cộng:</span>
            <span className="text-[#00E5FF] text-lg font-black">{order.total.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={() => onNavigate('profile', { tab: 'orders' })}
          className="px-6 py-3 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-[#00E5FF] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Package className="w-4 h-4 text-[#00E5FF]" />
          Xem lịch sử đơn hàng
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-extrabold text-xs shadow-lg shadow-[#00E5FF]/20 flex items-center justify-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" />
          Tiếp tục về trang chủ
        </button>
      </div>
    </div>
  );
};
