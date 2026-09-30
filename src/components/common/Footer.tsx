import React, { useState } from 'react';
import { Cpu, Mail, Phone, MapPin, ShieldCheck, Truck, Headphones, RotateCcw, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext.tsx';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const { success } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      success('Cảm ơn bạn đã đăng ký nhận bản tin khuyến mãi từ TECHZONE!', 'Đăng ký thành công');
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#070A0E] text-gray-400 border-t border-[#1F2937] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 4 Value Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-[#1F2937]">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#111827]/50 border border-[#1F2937]/60">
            <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Giao Hàng Siêu Tốc</div>
              <div className="text-xs text-gray-400">Hỏa tốc 2H nội thành, toàn quốc 2-3 ngày</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#111827]/50 border border-[#1F2937]/60">
            <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">100% Chính Hãng</div>
              <div className="text-xs text-gray-400">Đầy đủ VAT, bảo hành 36 tháng chính hãng</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#111827]/50 border border-[#1F2937]/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Đổi Mới 30 Ngày</div>
              <div className="text-xs text-gray-400">Lỗi do nhà sản xuất đổi mới ngay lập tức</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#111827]/50 border border-[#1F2937]/60">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Hỗ Trợ Kỹ Thuật 24/7</div>
              <div className="text-xs text-gray-400">Đội ngũ kỹ thuật viên tư vấn build PC tận tình</div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-[#1F2937]">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0B0F14] rounded-[10px] flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-[#00E5FF]" />
                </div>
              </div>
              <span className="font-extrabold text-2xl tracking-wider text-white">
                TECH<span className="text-[#00E5FF]">ZONE</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              TECHZONE là hệ thống bán lẻ linh kiện máy tính, PC Gaming và thiết bị công nghệ cao cấp hàng đầu Việt Nam. Tận tâm phục vụ game thủ, nhà sáng tạo nội dung và doanh nghiệp.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                <span>Showroom 1: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#00E5FF] shrink-0" />
                <span>Hotline: 1900 8899 - Kỹ thuật: 0901 234 567</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#00E5FF] shrink-0" />
                <span>Email: contact@techzone.vn</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Linh Kiện PC</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'cpu' })}
                  className="hover:text-[#00E5FF] transition-colors"
                >
                  Vi Xử Lý (CPU)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'gpu' })}
                  className="hover:text-[#00E5FF] transition-colors"
                >
                  Card Đồ Họa (VGA)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'mainboard' })}
                  className="hover:text-[#00E5FF] transition-colors"
                >
                  Bo Mạch Chủ (Mainboard)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'ram' })}
                  className="hover:text-[#00E5FF] transition-colors"
                >
                  Bộ Nhớ Trong (RAM)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'ssd' })}
                  className="hover:text-[#00E5FF] transition-colors"
                >
                  Ổ Cứng SSD NVMe
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'monitor' })}
                  className="hover:text-[#00E5FF] transition-colors"
                >
                  Màn Hình Gaming
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('pc-builder')} className="hover:text-[#00E5FF] transition-colors">
                  Công Cụ Build PC
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#00E5FF] transition-colors">
                  Chính Sách Bảo Hành
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#00E5FF] transition-colors">
                  Chính Sách Đổi Trả
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#00E5FF] transition-colors">
                  Phương Thức Vận Chuyển
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#00E5FF] transition-colors">
                  Hướng Dẫn Mua Hàng & Trả Góp
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-[#00E5FF] transition-colors">
                  Thủ Thuật Nâng Cấp PC
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Bản Tin Công Nghệ</h4>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Đăng ký để nhận voucher 500k và cập nhật các dòng linh kiện thế hệ mới nhất.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  required
                  className="w-full bg-[#111827] text-gray-100 placeholder-gray-500 pl-3 pr-10 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-[#00E5FF] text-black rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[11px] text-gray-500">
                Chúng tôi cam kết bảo mật thông tin và không gửi thư rác.
              </div>
            </form>
          </div>
        </div>

        {/* Bottom copyright & payment */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © 2026 TECHZONE. All rights reserved. Nền tảng thương mại điện tử linh kiện máy tính hàng đầu.
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-[#111827] border border-[#1F2937] text-gray-300">VietQR</span>
            <span className="px-2 py-1 rounded bg-[#111827] border border-[#1F2937] text-gray-300">COD</span>
            <span className="px-2 py-1 rounded bg-[#111827] border border-[#1F2937] text-gray-300">MoMo / ZaloPay</span>
            <span className="px-2 py-1 rounded bg-[#111827] border border-[#1F2937] text-gray-300">Visa / Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
