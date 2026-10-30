import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'USER' | 'SHIPPER'>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Vui lòng nhập họ và tên');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không khớp');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Mật khẩu phải từ 6 ký tự trở lên');
        return;
      }
      setSubmitting(true);
      const ok = await register(fullName, email, password, phone, selectedRole);
      setSubmitting(false);
      if (ok) onClose();
    } else {
      setSubmitting(true);
      const ok = await login(email, password);
      setSubmitting(false);
      if (ok) onClose();
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1F2937] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#7C3AED] p-0.5 mb-3 shadow-lg shadow-[#00E5FF]/20">
            <div className="w-full h-full bg-[#0B0F14] rounded-[14px] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#00E5FF]" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Đăng Nhập TECHZONE' : 'Tạo Tài Khoản Mới'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'login'
              ? 'Đăng nhập để theo dõi đơn hàng, quản lý PC build & nhận ưu đãi'
              : 'Gia nhập cộng đồng công nghệ TechZone với hàng ngàn ưu đãi'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-[#0B0F14] p-1 mb-5 border border-[#1F2937]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#111827] text-[#00E5FF] shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#111827] text-[#00E5FF] shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Họ và tên *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[#0B0F14] text-white pl-9 pr-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@techzone.vn"
                className="w-full bg-[#0B0F14] text-white pl-9 pr-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Số điện thoại</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full bg-[#0B0F14] text-white pl-9 pr-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Mật khẩu *</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0F14] text-white pl-9 pr-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Xác nhận mật khẩu *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0F14] text-white pl-9 pr-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Chọn vai trò tài khoản đăng ký *
                </label>
                <span className="text-[10px] text-cyan-400 font-medium">2 vai trò đăng ký</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRole('USER')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRole === 'USER'
                      ? 'border-[#00E5FF] bg-[#00E5FF]/15 text-[#00E5FF] ring-2 ring-[#00E5FF]/40 shadow-sm'
                      : 'border-[#1F2937] bg-[#0B0F14] text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">👤</span>
                    <span className="text-xs font-bold">Khách Hàng</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-normal leading-tight">
                    Mua linh kiện, build PC & theo dõi đơn hàng
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('SHIPPER')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRole === 'SHIPPER'
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300 ring-2 ring-emerald-400/40 shadow-sm'
                      : 'border-[#1F2937] bg-[#0B0F14] text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🚚</span>
                    <span className="text-xs font-bold">Nhân Viên Shipper</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-normal leading-tight">
                    Nhận đơn vận chuyển & cập nhật giao hàng
                  </div>
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                🛡️ Tài khoản <strong className="text-gray-300">Quản trị viên (Admin)</strong> được phân quyền nội bộ trong Bảng điều khiển quản trị.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:opacity-95 text-black font-extrabold text-xs shadow-lg shadow-[#00E5FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng Nhập Ngay' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

      </div>
    </div>
  );
};
