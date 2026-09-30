import React, { useState, useEffect } from 'react';
import {
  User,
  PackageCheck,
  Heart,
  MapPin,
  Lock,
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  ShoppingCart,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Order } from '../types/index.ts';

interface ProfilePageProps {
  initialTab?: 'profile' | 'orders' | 'wishlist' | 'addresses' | 'security';
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  initialTab = 'profile',
  onNavigate,
  onOpenAuth
}) => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses' | 'security'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile edit fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Load orders
  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      try {
        setLoadingOrders(true);
        const res = await api.getOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#111827] text-[#00E5FF] flex items-center justify-center mx-auto border border-[#1F2937]">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Bạn chưa đăng nhập</h2>
        <p className="text-xs text-gray-400">
          Vui lòng đăng nhập để xem thông tin tài khoản, lịch sử đơn hàng và sản phẩm yêu thích.
        </p>
        <button
          onClick={() => onOpenAuth('login')}
          className="px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-bold text-xs"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ fullName, phone, avatar });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      error('Mật khẩu mới phải từ 6 ký tự trở lên');
      return;
    }

    try {
      setChangingPass(true);
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        success('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      error(err.message || 'Không thể đổi mật khẩu, vui lòng kiểm tra lại mật khẩu cũ');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00E5FF]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{user?.fullName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E5FF]/20 text-[#00E5FF]">
                {user?.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Nav Tabs (3 cols) */}
        <aside className="md:col-span-3 rounded-2xl bg-[#111827] border border-[#1F2937] p-2 space-y-1">
          {[
            { id: 'profile', label: 'Thông tin cá nhân', icon: User },
            { id: 'orders', label: `Lịch sử đơn hàng (${orders.length})`, icon: PackageCheck },
            { id: 'wishlist', label: `Sản phẩm yêu thích (${wishlist.length})`, icon: Heart },
            { id: 'addresses', label: 'Sổ địa chỉ giao hàng', icon: MapPin },
            { id: 'security', label: 'Bảo mật & Mật khẩu', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/20'
                    : 'text-gray-300 hover:bg-[#1F2937]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Content Panels (9 cols) */}
        <main className="md:col-span-9 rounded-2xl bg-[#111827] border border-[#1F2937] p-6">
          {/* TAB 1: Profile Info */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-base font-bold text-white border-b border-[#1F2937] pb-3">
                Cập Nhật Thông Tin Cá Nhân
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email}
                    className="w-full bg-[#0B0F14]/50 text-gray-500 px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs cursor-not-allowed"
                  />
                  <span className="text-[10px] text-gray-500">Email không thể thay đổi</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">URL Avatar đại diện</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-bold text-xs"
                >
                  Lưu thay đổi
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-white border-b border-[#1F2937] pb-3">
                Lịch Sử Đơn Hàng Của Bạn
              </h3>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-gray-400">Đang tải lịch sử đơn hàng...</div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-5 rounded-2xl bg-[#0B0F14] border border-[#1F2937] space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1F2937] text-xs">
                        <div>
                          <span className="font-mono font-bold text-white text-sm">#{o.orderCode}</span>
                          <span className="text-gray-500 ml-3">
                            {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Trạng thái:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              o.status === 'DELIVERED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : o.status === 'SHIPPING'
                                ? 'bg-blue-500/20 text-blue-400'
                                : o.status === 'CANCELLED'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {o.status === 'PENDING' && 'Chờ xử lý'}
                            {o.status === 'CONFIRMED' && 'Đã xác nhận'}
                            {o.status === 'SHIPPING' && 'Đang giao hàng'}
                            {o.status === 'DELIVERED' && 'Đã giao thành công'}
                            {o.status === 'CANCELLED' && 'Đã hủy'}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {o.items.map((i, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-3">
                              <img src={i.image} alt="" className="w-10 h-10 object-contain rounded bg-[#111827] p-1" />
                              <span className="text-gray-200">{i.name} <strong className="text-gray-400">x{i.quantity}</strong></span>
                            </div>
                            <span className="font-bold text-[#00E5FF]">
                              {(i.price * i.quantity).toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="text-gray-400">
                          Giao đến: {o.address}, {o.city}
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 mr-2">Tổng thanh toán:</span>
                          <span className="text-base font-extrabold text-[#00E5FF]">
                            {o.total.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-500">
                  Bạn chưa có đơn hàng nào tại TECHZONE.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-white border-b border-[#1F2937] pb-3">
                Danh Sách Sản Phẩm Yêu Thích ({wishlist.length})
              </h3>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-4 rounded-xl bg-[#0B0F14] border border-[#1F2937] flex gap-3 items-center justify-between"
                    >
                      <img
                        src={prod.images[0]}
                        alt=""
                        className="w-16 h-16 object-contain rounded-lg bg-[#111827] p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-[#00E5FF] font-bold uppercase">{prod.brandName}</div>
                        <h4
                          onClick={() => onNavigate('product-detail', { id: prod.slug })}
                          className="text-xs font-bold text-white truncate cursor-pointer hover:underline"
                        >
                          {prod.name}
                        </h4>
                        <div className="text-xs font-bold text-[#00E5FF] mt-1">
                          {prod.price.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => addToCart(prod, 1)}
                          className="p-2 rounded-lg bg-[#00E5FF] text-black font-bold"
                          title="Thêm vào giỏ"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromWishlist(prod.id)}
                          className="p-2 rounded-lg bg-[#1F2937] text-gray-400 hover:text-red-400"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-500">
                  Danh sách yêu thích của bạn đang trống.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-base font-bold text-white border-b border-[#1F2937] pb-3">
                Địa Chỉ Giao Hàng Mặc Định
              </h3>

              <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#00E5FF]/40 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{user?.fullName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF]">
                    Mặc định
                  </span>
                </div>
                <div className="text-gray-300">Điện thoại: {user?.phone || 'Chưa cập nhật'}</div>
                <div className="text-gray-400">Địa chỉ: 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</div>
              </div>
            </div>
          )}

          {/* TAB 5: Security */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-base font-bold text-white border-b border-[#1F2937] pb-3">
                Đổi Mật Khẩu Đăng Nhập
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Mật khẩu hiện tại *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0B0F14] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPass}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:opacity-95 text-black font-bold text-xs disabled:opacity-50"
                >
                  {changingPass ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
