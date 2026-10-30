import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Navigation,
  ArrowRight,
  RefreshCw,
  ShieldAlert,
  Check,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Order, OrderStatus } from '../types/index.ts';

interface ShipperDashboardPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const ShipperDashboardPage: React.FC<ShipperDashboardPageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const { user, isShipper, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'delivering' | 'completed'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Note modal state for failed delivery
  const [noteModalOrder, setNoteModalOrder] = useState<Order | null>(null);
  const [deliveryNote, setDeliveryNote] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getShipperOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Không thể tải danh sách đơn giao');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isShipper || isAdmin) {
      loadOrders();
    }
  }, [isShipper, isAdmin]);

  if (!user || (!isShipper && !isAdmin)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Cổng Giao Hàng Dành Riêng Cho Shipper</h2>
        <p className="text-xs text-gray-400">
          Vui lòng đăng nhập với tài khoản Shipper để xem các đơn hàng cần giao và cập nhật tiến độ giao vận.
        </p>
        <button
          onClick={() => onOpenAuth('login')}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          Đăng Nhập Tài Khoản Shipper
        </button>
      </div>
    );
  }

  // Active order currently being shipped by this shipper (RULE: max 1 at a time)
  const myActiveDeliveringOrder = orders.find(
    (o) => o.status === 'SHIPPING' && o.shipperId === user?.id
  );
  const isBusy = Boolean(myActiveDeliveringOrder);

  // Filter calculations
  const myDeliveringOrders = orders.filter(
    (o) => o.status === 'SHIPPING' && o.shipperId === user?.id
  );
  const availableOrders = orders.filter(
    (o) => (o.status === 'CONFIRMED' || o.status === 'PENDING') && !o.shipperId
  );
  const completedOrders = orders.filter(
    (o) => o.status === 'DELIVERED' && (isAdmin || o.shipperId === user?.id)
  );

  const totalCodToCollect = myDeliveringOrders
    .filter((o) => o.paymentMethod === 'COD' && o.paymentStatus !== 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  // Handle claiming an order
  const handleClaimOrder = async (orderId: string) => {
    if (isBusy) {
      error(`Bạn đang có đơn #${myActiveDeliveringOrder?.orderCode} đang giao dở. Vui lòng giao xong trước khi nhận đơn tiếp theo!`);
      return;
    }

    try {
      setActionLoading(orderId);
      const res = await api.claimShipperOrder(orderId);
      if (res.success) {
        success(res.message || 'Đã nhận đơn giao thành công! Trạng thái đơn chuyển sang ĐANG GIAO.');
        await loadOrders();
      }
    } catch (err: any) {
      error(err.message || 'Không thể nhận đơn');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle updating delivery status
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      setActionLoading(orderId);
      const res = await api.updateShipperOrderStatus(orderId, status, note);
      if (res.success) {
        if (status === 'DELIVERED') {
          success('Tuyệt vời! Đã hoàn tất giao đơn hàng thành công. Bạn hiện đang rảnh và có thể nhận đơn tiếp theo.');
        } else if (status === 'CANCELLED') {
          success('Đã cập nhật trạng thái đơn giao không thành công.');
        }
        setNoteModalOrder(null);
        setDeliveryNote('');
        await loadOrders();
      }
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật trạng thái đơn');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'available') {
      return (o.status === 'CONFIRMED' || o.status === 'PENDING') && !o.shipperId;
    }
    if (filter === 'delivering') {
      return o.status === 'SHIPPING' && (isAdmin || o.shipperId === user?.id);
    }
    if (filter === 'completed') {
      return o.status === 'DELIVERED' && (isAdmin || o.shipperId === user?.id);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1F2937]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> SHIPPER PORTAL
            </span>

            {/* Status indicator: Busy vs Available */}
            {isBusy ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>🔴 ĐANG BẬN GIAO HÀNG (1/1 đơn tối đa)</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>🟢 RẢNH RỖI (Sẵn sàng nhận 1 đơn mới)</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Xin chào, {user.fullName} 👋
          </h1>
          <p className="text-xs text-gray-400">
            Số điện thoại trực ca: <strong className="text-white">{user.phone || '0901234567'}</strong> &bull; Email: <span className="text-gray-300">{user.email}</span>
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-emerald-500/40 text-xs font-semibold text-gray-200 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          Làm mới danh sách
        </button>
      </div>

      {/* SINGLE-ORDER CONSTRAINT BANNER */}
      {isBusy && myActiveDeliveringOrder ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-[#111827] to-amber-950/40 border-2 border-blue-500/60 shadow-xl shadow-blue-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Truck className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-blue-400">
                    ĐƠN HÀNG ĐANG TRONG CA GIAO CỦA BẠN
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-blue-500/30 text-white">
                    #{myActiveDeliveringOrder.orderCode}
                  </span>
                </div>
                <div className="text-xs text-gray-300 font-medium">
                  Quy định: Bạn cần <strong>giao xong đơn này</strong> trước khi nhận thêm đơn tiếp theo.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateStatus(myActiveDeliveringOrder.id, 'DELIVERED')}
                disabled={actionLoading === myActiveDeliveringOrder.id}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Hoàn Tất & Giao Thành Công
              </button>
              <button
                onClick={() => {
                  setNoteModalOrder(myActiveDeliveringOrder);
                  setDeliveryNote('');
                }}
                className="px-3 py-2 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                Báo Thất Bại
              </button>
            </div>
          </div>

          {/* Quick Info Grid for active delivery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1F2937] space-y-1">
              <div className="text-[11px] text-gray-400">Khách hàng nhận:</div>
              <div className="font-bold text-white text-sm">{myActiveDeliveringOrder.fullName}</div>
              <a
                href={`tel:${myActiveDeliveringOrder.phone}`}
                className="inline-flex items-center gap-1 text-emerald-400 font-mono font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" /> {myActiveDeliveringOrder.phone}
              </a>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1F2937] space-y-1">
              <div className="text-[11px] text-gray-400">Địa chỉ giao hàng:</div>
              <div className="text-gray-200 line-clamp-2">
                {myActiveDeliveringOrder.address}, {myActiveDeliveringOrder.ward}, {myActiveDeliveringOrder.district}, {myActiveDeliveringOrder.city}
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${myActiveDeliveringOrder.address}, ${myActiveDeliveringOrder.ward}, ${myActiveDeliveringOrder.district}, ${myActiveDeliveringOrder.city}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#00E5FF] hover:underline text-[11px]"
              >
                <Navigation className="w-3 h-3" /> Mở bản đồ dẫn đường
              </a>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1F2937] space-y-1">
              <div className="text-[11px] text-gray-400">Thu tiền mặt (COD):</div>
              <div className="text-base font-black text-amber-400">
                {myActiveDeliveringOrder.paymentMethod === 'COD' && myActiveDeliveringOrder.paymentStatus !== 'PAID'
                  ? `${myActiveDeliveringOrder.total.toLocaleString('vi-VN')} ₫`
                  : '0 ₫ (Đã thanh toán trước)'}
              </div>
              <div className="text-[11px] text-gray-400">
                {myActiveDeliveringOrder.items.length} món &bull; {myActiveDeliveringOrder.items.map((i) => i.name).join(', ').slice(0, 40)}...
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                Bạn hiện đang RẢNH RỖI và đủ điều kiện nhận 1 đơn giao mới ngay bây giờ!
              </div>
              <div className="text-[11px] text-gray-400">
                Hãy xem mục "Đơn chờ nhận" bên dưới và bấm nút "Nhận Giao Đơn Hàng Này".
              </div>
            </div>
          </div>
          <button
            onClick={() => setFilter('available')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-colors shrink-0 cursor-pointer"
          >
            Xem đơn chờ nhận ({availableOrders.length})
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Đang nhận giao</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {myDeliveringOrders.length} / 1 đơn
          </div>
          <p className="text-[11px] text-blue-400">
            {isBusy ? 'Đang bận giao 1 đơn' : 'Đang rảnh rỗi'}
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Đơn chờ nhận giao</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{availableOrders.length} đơn</div>
          <p className="text-[11px] text-amber-400">Sẵn sàng để tiếp nhận</p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Đã giao thành công</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{completedOrders.length} đơn</div>
          <p className="text-[11px] text-emerald-400">Hoàn tất xuất sắc</p>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Tiền COD cần thu</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#00E5FF]">
            {totalCodToCollect.toLocaleString('vi-VN')} ₫
          </div>
          <p className="text-[11px] text-purple-400">Tiền mặt thu hộ trong ca</p>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1F2937]">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            filter === 'all'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-[#111827] text-gray-300 hover:bg-[#1F2937]'
          }`}
        >
          Tất cả đơn ({orders.length})
        </button>
        <button
          onClick={() => setFilter('delivering')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            filter === 'delivering'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-[#111827] text-gray-300 hover:bg-[#1F2937]'
          }`}
        >
          🛵 Tôi đang giao ({myDeliveringOrders.length})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            filter === 'available'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-[#111827] text-gray-300 hover:bg-[#1F2937]'
          }`}
        >
          ⏳ Đơn chờ nhận ({availableOrders.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            filter === 'completed'
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
              : 'bg-[#111827] text-gray-300 hover:bg-[#1F2937]'
          }`}
        >
          ✅ Đã giao xong ({completedOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-16 text-center text-gray-400 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs">Đang nạp danh sách đơn hàng cho Shipper...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
          <Package className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">Hiện không có đơn hàng nào trong mục này</h3>
          <p className="text-xs text-gray-400">Bạn có thể chuyển sang tab khác để nhận đơn mới.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((o) => {
            const isAssignedToMe = o.shipperId === user?.id;
            const fullAddress = `${o.address}, ${o.ward}, ${o.district}, ${o.city}`;
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

            return (
              <div
                key={o.id}
                className={`p-6 rounded-2xl border transition-all space-y-4 ${
                  o.status === 'SHIPPING'
                    ? 'bg-[#111827] border-blue-500/60 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : o.status === 'DELIVERED'
                    ? 'bg-[#111827]/70 border-emerald-500/30 opacity-90'
                    : 'bg-[#111827] border-[#1F2937] hover:border-gray-600'
                }`}
              >
                {/* Order Top Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-white">#{o.orderCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : o.status === 'SHIPPING'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : o.status === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {o.status === 'SHIPPING'
                        ? '🛵 ĐANG GIAO HÀNG'
                        : o.status === 'DELIVERED'
                        ? '✅ ĐÃ GIAO THÀNH CÔNG'
                        : o.status === 'CANCELLED'
                        ? '❌ ĐÃ HỦY'
                        : '⏳ CHỜ GIAO'}
                    </span>

                    {isAssignedToMe && o.status === 'SHIPPING' && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white font-mono text-[9px] font-black uppercase">
                        Đang phụ trách
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString('vi-VN')} {new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Customer & Address Details */}
                <div className="space-y-2 text-xs">
                  {/* Customer row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] text-gray-400">Người nhận:</div>
                      <div className="font-bold text-white text-sm">{o.fullName}</div>
                    </div>
                    <a
                      href={`tel:${o.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {o.phone}
                    </a>
                  </div>

                  {/* Address row with map link */}
                  <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1F2937] space-y-1.5">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-gray-300 leading-relaxed">{fullAddress}</span>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#00E5FF] hover:underline flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        Chỉ đường Google Maps
                      </a>
                    </div>
                  </div>

                  {/* Delivery Note if any */}
                  {o.note && (
                    <div className="text-[11px] bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-amber-300">
                      <strong>Ghi chú của khách:</strong> {o.note}
                    </div>
                  )}

                  {o.deliveryNotes && (
                    <div className="text-[11px] bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-purple-300">
                      <strong>Ghi chú giao vận:</strong> {o.deliveryNotes}
                    </div>
                  )}
                </div>

                {/* Payment & COD Badge */}
                <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1F2937] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-gray-400">Hình thức thanh toán:</div>
                    <div className="font-semibold text-white">
                      {o.paymentMethod === 'COD' && 'Thanh toán tiền mặt khi nhận (COD)'}
                      {o.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản VietQR'}
                      {o.paymentMethod === 'MOCK_EWALLET' && 'Ví điện tử'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-gray-400">
                      {o.paymentMethod === 'COD' && o.paymentStatus !== 'PAID'
                        ? 'TIỀN MẶT CẦN THU:'
                        : 'TRẠNG THÁI TIỀN:'}
                    </div>
                    {o.paymentMethod === 'COD' && o.paymentStatus !== 'PAID' ? (
                      <span className="text-sm font-black text-amber-400">
                        {o.total.toLocaleString('vi-VN')} ₫
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                        ĐÃ THANH TOÁN
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Summary */}
                <div className="text-xs text-gray-400 flex items-center justify-between pt-1">
                  <span>Linh kiện ({o.items.length} món):</span>
                  <span className="text-white font-medium truncate max-w-[200px]">
                    {o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </span>
                </div>

                {/* Action Buttons for Shipper */}
                <div className="pt-2 border-t border-[#1F2937] flex items-center gap-2">
                  {/* If not assigned yet */}
                  {!o.shipperId && o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                    isBusy ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 rounded-xl bg-[#1F2937] border border-gray-700 text-gray-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
                        title="Bạn đang bận giao một đơn hàng khác. Cần hoàn tất đơn đang giao trước khi nhận tiếp."
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Đang bận giao đơn #{myActiveDeliveringOrder?.orderCode} (Giao xong mới được nhận tiếp)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClaimOrder(o.id)}
                        disabled={actionLoading === o.id}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Truck className="w-4 h-4" />
                        {actionLoading === o.id ? 'Đang nhận đơn...' : 'Nhận Giao Đơn Hàng Này'}
                      </button>
                    )
                  )}

                  {/* If assigned to someone else */}
                  {o.shipperId && o.shipperId !== user?.id && o.status === 'SHIPPING' && (
                    <div className="w-full py-2 text-center text-xs text-gray-400 bg-[#0B0F14] rounded-xl border border-[#1F2937]">
                      Shipper phụ trách: <strong className="text-white">{o.shipperName}</strong> ({o.shipperPhone})
                    </div>
                  )}

                  {/* If assigned to me and currently shipping */}
                  {o.status === 'SHIPPING' && isAssignedToMe && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                        disabled={actionLoading === o.id}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {actionLoading === o.id ? 'Đang lưu...' : 'Giao Thành Công'}
                      </button>

                      <button
                        onClick={() => {
                          setNoteModalOrder(o);
                          setDeliveryNote('');
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-gray-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-red-400" />
                        Báo Thất Bại
                      </button>
                    </>
                  )}

                  {/* Completed status */}
                  {o.status === 'DELIVERED' && (
                    <div className="w-full py-2 text-center text-xs text-emerald-400 font-bold bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Đơn hàng đã giao thành công và hoàn tất
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Delivery Failure Note */}
      {noteModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Báo Giao Đơn Thất Bại #{noteModalOrder.orderCode}
            </h3>

            <p className="text-xs text-gray-400">
              Vui lòng chọn hoặc ghi rõ lý do không thể giao hàng cho khách:
            </p>

            <div className="space-y-2 text-xs">
              {[
                'Khách không nghe máy (đã gọi 3 lần)',
                'Khách hẹn giao lại vào ngày mai',
                'Địa chỉ không tìm thấy / sai số nhà',
                'Khách từ chối nhận hàng'
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setDeliveryNote(reason)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[#0B0F14] hover:bg-[#1F2937] border border-[#1F2937] text-gray-300 transition-colors cursor-pointer"
                >
                  • {reason}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Ghi chú chi tiết thêm:
              </label>
              <textarea
                rows={3}
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Nhập lý do cụ thể..."
                className="w-full bg-[#0B0F14] text-white p-3 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setNoteModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#1F2937] text-xs text-gray-300 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleUpdateStatus(noteModalOrder.id, 'CANCELLED', deliveryNote)}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs cursor-pointer"
              >
                Xác nhận báo thất bại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
