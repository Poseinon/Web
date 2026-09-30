import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Tư vấn cấu hình PC');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { success, error } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      error('Vui lòng điền đầy đủ họ tên, email và lời nhắn của bạn');
      return;
    }

    setSubmitted(true);
    success('Tin nhắn của bạn đã được gửi đến ban hỗ trợ kỹ thuật TechZone!', 'Đã tiếp nhận');
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">LIÊN HỆ VỚI TECHZONE</h1>
        <p className="text-xs text-gray-400">
          Đội ngũ chuyên viên kỹ thuật phần cứng luôn sẵn sàng giải đáp thắc mắc và hỗ trợ bạn 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info & Showrooms (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Thông Tin Liên Hệ Trực Tiếp</h3>
            <div className="space-y-3.5 text-xs text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Showroom Trụ Sở:</div>
                  <div className="text-gray-400">123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Điện thoại / Hotline:</div>
                  <div className="text-gray-400">1900 8899 - Kỹ thuật: 0901 234 567</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Hộp thư điện tử:</div>
                  <div className="text-gray-400">support@techzone.vn - sales@techzone.vn</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Thời gian làm việc:</div>
                  <div className="text-gray-400">Thứ 2 - Chủ Nhật: 8:00 - 21:30 (Cả ngày lễ)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Store Map Place */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00E5FF]" />
              Bản Đồ Showroom TECHZONE
            </h4>
            <div className="relative aspect-video rounded-xl bg-[#0B0F14] border border-[#1F2937] overflow-hidden flex items-center justify-center p-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center mx-auto">
                  <MapPin className="w-5 h-5 animate-bounce" />
                </div>
                <div className="text-xs font-bold text-white">TECHZONE FLAGSHIP STORE</div>
                <div className="text-[11px] text-gray-400">123 Nguyễn Huệ, Quận 1, TP. HCM</div>
                <span className="inline-block px-2.5 py-1 rounded bg-[#1F2937] text-[10px] text-[#00E5FF] font-semibold">
                  Tọa độ: 10.7769° N, 106.7009° E
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="text-base font-bold text-white">Gửi Yêu Cầu Hỗ Trợ Kỹ Thuật Hoặc Báo Giá</h3>
          </div>

          {submitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Yêu cầu của bạn đã được ghi nhận!</h4>
              <p className="text-xs text-gray-300">
                Nhân viên tư vấn của TechZone sẽ liên hệ lại với bạn qua số điện thoại hoặc email trong vòng 15-30 phút.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-[#1F2937] text-xs font-semibold text-white rounded-lg hover:bg-[#374151]"
              >
                Gửi thêm tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Chủ đề hỗ trợ</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#0B0F14] text-white px-3 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Tư vấn cấu hình PC">Tư vấn cấu hình PC Gaming</option>
                    <option value="Báo giá doanh nghiệp">Báo giá dự án doanh nghiệp</option>
                    <option value="Hỗ trợ bảo hành">Hỗ trợ bảo hành kỹ thuật</option>
                    <option value="Khiếu nại dịch vụ">Ý kiến đóng góp & Khiếu nại</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nội dung chi tiết *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mô tả nhu cầu sử dụng, ngân sách dự kiến hoặc tình trạng linh kiện cần bảo hành..."
                  className="w-full bg-[#0B0F14] text-white p-3 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:opacity-95 text-black font-extrabold text-xs shadow-lg shadow-[#00E5FF]/20 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Gửi Tin Nhắn Ngay
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
