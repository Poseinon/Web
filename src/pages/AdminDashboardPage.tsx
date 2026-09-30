import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Search,
  Check,
  X,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Product, Order, User, OrderStatus } from '../types/index.ts';

interface AdminDashboardPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Product CRUD Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    brandName: 'ASUS ROG',
    categorySlug: 'gpu',
    price: 0,
    oldPrice: 0,
    stock: 10,
    sku: '',
    description: '',
    socket: '',
    ramType: '',
    vram: '',
    wattage: 0,
    imageUrl: ''
  });

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');

  // Load Dashboard Data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, prodRes, ordRes, userRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getProducts({ limit: 100 }),
        api.getOrders(),
        api.getAdminUsers()
      ]);

      if (dashRes.success) setStats(dashRes.data);
      if (prodRes.success) setProducts(prodRes.products);
      if (ordRes.success) setOrders(ordRes.data);
      if (userRes.success) setUsers(userRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Yêu Cầu Quyền Quản Trị Viên</h2>
        <p className="text-xs text-gray-400">
          Khu vực này chỉ dành cho tài khoản Quản trị viên (ADMIN). Vui lòng đăng nhập với tài khoản admin mẫu{' '}
          <strong className="text-[#00E5FF]">admin@techzone.vn</strong> (Mật khẩu: Admin@123).
        </p>
        <button
          onClick={() => onOpenAuth('login')}
          className="px-6 py-2.5 rounded-xl bg-[#00E5FF] text-black font-bold text-xs"
        >
          Đăng nhập tài khoản Admin
        </button>
      </div>
    );
  }

  // Handle open create modal
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      brandName: 'Intel',
      categorySlug: 'cpu',
      price: 5000000,
      oldPrice: 5500000,
      stock: 20,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      description: 'Linh kiện máy tính chính hãng thế hệ mới.',
      socket: 'LGA1700',
      ramType: 'DDR5',
      vram: '',
      wattage: 65,
      imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'
    });
    setShowProductModal(true);
  };

  // Handle open edit modal
  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      brandName: p.brandName,
      categorySlug: p.categorySlug,
      price: p.price,
      oldPrice: p.oldPrice || 0,
      stock: p.stock,
      sku: p.sku,
      description: p.description,
      socket: p.socket || '',
      ramType: p.ramType || '',
      vram: p.vram || '',
      wattage: p.wattage || 0,
      imageUrl: p.images[0] || ''
    });
    setShowProductModal(true);
  };

  // Handle save product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim() || prodForm.price <= 0) {
      error('Vui lòng điền tên sản phẩm và mức giá hợp lệ');
      return;
    }

    const payload: Partial<Product> = {
      name: prodForm.name.trim(),
      brandName: prodForm.brandName,
      brandId: `brand-${prodForm.brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      categorySlug: prodForm.categorySlug,
      categoryId: `cat-${prodForm.categorySlug}`,
      price: Number(prodForm.price),
      oldPrice: Number(prodForm.oldPrice) || undefined,
      stock: Number(prodForm.stock),
      sku: prodForm.sku.trim(),
      description: prodForm.description.trim(),
      images: [prodForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'],
      socket: prodForm.socket.trim() || undefined,
      ramType: prodForm.ramType.trim() || undefined,
      vram: prodForm.vram.trim() || undefined,
      wattage: Number(prodForm.wattage) || undefined,
      discount: prodForm.oldPrice > prodForm.price ? Math.round(((prodForm.oldPrice - prodForm.price) / prodForm.oldPrice) * 100) : 0
    };

    try {
      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, payload);
        if (res.success) {
          success(`Cập nhật sản phẩm "${payload.name}" thành công!`);
          setShowProductModal(false);
          loadAdminData();
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          success(`Thêm sản phẩm "${payload.name}" thành công!`);
          setShowProductModal(false);
          loadAdminData();
        }
      }
    } catch (err: any) {
      error(err.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi cơ sở dữ liệu?`)) {
      try {
        const res = await api.deleteProduct(id);
        if (res.success) {
          success('Đã xóa sản phẩm thành công');
          loadAdminData();
        }
      } catch (err: any) {
        error(err.message || 'Không thể xóa sản phẩm');
      }
    }
  };

  // Handle update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, status);
      if (res.success) {
        success(`Đã cập nhật đơn hàng thành: ${status}`);
        loadAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q);
  });

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus === 'all') return true;
    return o.status === orderFilterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-[#00E5FF]" />
            BẢNG ĐIỀU KHIỂN QUẢN TRỊ (ADMIN DASHBOARD)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Quản trị toàn diện đơn hàng, sản phẩm kho, doanh số và người dùng hệ thống TECHZONE
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
            { id: 'products', label: `Sản Phẩm (${products.length})`, icon: Package },
            { id: 'orders', label: `Đơn Hàng (${orders.length})`, icon: ShoppingCart },
            { id: 'users', label: `Người Dùng (${users.length})`, icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20'
                    : 'bg-[#111827] text-gray-300 hover:bg-[#1F2937] border border-[#1F2937]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW DASHBOARD ================= */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Tổng Doanh Thu</span>
                <div className="p-2 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF]">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">
                {stats.totalRevenue.toLocaleString('vi-VN')} ₫
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% so với tháng trước
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Tổng Đơn Hàng</span>
                <div className="p-2 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED]">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{stats.totalOrders} đơn</div>
              <div className="text-[11px] text-emerald-400 font-semibold">Tỉ lệ hoàn thành 92%</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Linh Kiện Trong Kho</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{stats.totalProducts} mã</div>
              <div className="text-[11px] text-gray-400 font-semibold">Đa dạng 12 danh mục</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Khách Hàng Đăng Ký</span>
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{stats.totalCustomers} thành viên</div>
              <div className="text-[11px] text-cyan-400 font-semibold">Tăng trưởng ổn định</div>
            </div>
          </div>

          {/* Interactive SVG Chart: Revenue Timeline & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Revenue Bar Chart (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Biểu Đồ Doanh Thu 6 Tháng Gần Nhất
                </h3>
                <span className="text-xs text-[#00E5FF] font-mono">Đơn vị: Triệu VNĐ</span>
              </div>

              {/* Custom SVG Bar Chart */}
              <div className="pt-4 flex items-end justify-between gap-4 h-56 px-2">
                {stats.revenueByMonth.map((item: any, idx: number) => {
                  const maxRev = 150000000;
                  const barHeight = Math.min(100, Math.max(15, (item.revenue / maxRev) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {Math.round(item.revenue / 1000000)}M
                      </div>
                      <div className="w-full bg-[#1F2937] rounded-xl h-44 flex items-end overflow-hidden p-1">
                        <div
                          style={{ height: `${barHeight}%` }}
                          className="w-full rounded-lg bg-gradient-to-t from-[#7C3AED] to-[#00E5FF] group-hover:brightness-125 transition-all duration-500"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-400">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1F2937] pb-3">
                Cơ Cấu Sản Phẩm Theo Danh Mục
              </h3>
              <div className="space-y-3">
                {stats.salesByCategory.slice(0, 6).map((c: any, idx: number) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>{c.name}</span>
                      <span className="font-bold text-white">{c.count} sản phẩm</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#1F2937] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] rounded-full"
                        style={{ width: `${Math.min(100, (c.count / 8) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Selling Products List */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Top 5 Sản Phẩm Bán Chạy Nhất
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#1F2937] text-gray-400">
                    <th className="pb-3">Sản phẩm</th>
                    <th className="pb-3 text-right">Đơn giá</th>
                    <th className="pb-3 text-right">Đã bán</th>
                    <th className="pb-3 text-right">Kho còn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]">
                  {stats.topProducts.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-3 flex items-center gap-3">
                        <img src={p.image} alt="" className="w-10 h-10 object-contain rounded bg-[#0B0F14] p-1" />
                        <span className="font-bold text-white truncate max-w-md">{p.name}</span>
                      </td>
                      <td className="py-3 text-right font-extrabold text-[#00E5FF]">
                        {p.price.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-400">{p.soldCount}</td>
                      <td className="py-3 text-right text-gray-300">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PRODUCT MANAGEMENT CRUD ================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên, SKU hoặc hãng..."
                className="w-full bg-[#111827] text-white pl-9 pr-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={handleOpenCreateProduct}
              className="px-4 py-2 bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-[#00E5FF]/20"
            >
              <Plus className="w-4 h-4" />
              Thêm Linh Kiện Mới
            </button>
          </div>

          <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#0B0F14] text-gray-400">
                  <th className="p-3.5">Linh kiện</th>
                  <th className="p-3.5">SKU / Hãng</th>
                  <th className="p-3.5">Danh mục</th>
                  <th className="p-3.5 text-right">Giá bán</th>
                  <th className="p-3.5 text-right">Kho</th>
                  <th className="p-3.5 text-right">Đã bán</th>
                  <th className="p-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#0B0F14]/40 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 object-contain rounded bg-[#0B0F14] p-1 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate max-w-xs">{p.name}</div>
                        <div className="text-[10px] text-gray-400">★ {p.rating} ({p.reviewCount} đánh giá)</div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-gray-300">{p.sku}</div>
                      <div className="text-[10px] text-[#00E5FF] font-semibold">{p.brandName}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-[#1F2937] text-gray-300 font-mono text-[10px]">
                        {p.categorySlug}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-[#00E5FF]">
                      {p.price.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="p-3.5 text-right font-bold text-white">{p.stock}</td>
                    <td className="p-3.5 text-right text-gray-400">{p.soldCount}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 text-gray-400 hover:text-[#00E5FF] rounded hover:bg-[#1F2937]"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-red-500/10"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ORDER MANAGEMENT ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-300 font-semibold">Lọc theo trạng thái:</span>
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="bg-[#111827] text-white text-xs border border-[#1F2937] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý (PENDING)</option>
                <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
                <option value="SHIPPING">Đang giao hàng (SHIPPING)</option>
                <option value="DELIVERED">Đã giao thành công (DELIVERED)</option>
                <option value="CANCELLED">Đã hủy (CANCELLED)</option>
              </select>
            </div>
            <span className="text-xs text-gray-400">Hiển thị {filteredOrders.length} đơn</span>
          </div>

          <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#0B0F14] text-gray-400">
                  <th className="p-3.5">Mã đơn</th>
                  <th className="p-3.5">Ngày tạo</th>
                  <th className="p-3.5">Khách hàng</th>
                  <th className="p-3.5">Số SP</th>
                  <th className="p-3.5 text-right">Tổng tiền</th>
                  <th className="p-3.5">Thanh toán</th>
                  <th className="p-3.5">Trạng thái xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#0B0F14]/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white">#{o.orderCode}</td>
                    <td className="p-3.5 text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{o.fullName}</div>
                      <div className="text-[10px] text-gray-400">{o.phone}</div>
                    </td>
                    <td className="p-3.5 text-gray-300">{o.items.length} món</td>
                    <td className="p-3.5 text-right font-extrabold text-[#00E5FF]">
                      {o.total.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="p-3.5 text-gray-300 font-medium">
                      {o.paymentMethod}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : o.status === 'SHIPPING'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                            : o.status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        <option value="PENDING">PENDING (Chờ xử lý)</option>
                        <option value="CONFIRMED">CONFIRMED (Đã xác nhận)</option>
                        <option value="SHIPPING">SHIPPING (Đang giao)</option>
                        <option value="DELIVERED">DELIVERED (Đã giao)</option>
                        <option value="CANCELLED">CANCELLED (Hủy đơn)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: USERS MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0B0F14] text-gray-400">
                <th className="p-3.5">Người dùng</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Số điện thoại</th>
                <th className="p-3.5">Vai trò</th>
                <th className="p-3.5">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#0B0F14]/40 transition-colors">
                  <td className="p-3.5 flex items-center gap-3">
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[#1F2937]" />
                    <span className="font-bold text-white">{u.fullName}</span>
                  </td>
                  <td className="p-3.5 font-mono text-gray-300">{u.email}</td>
                  <td className="p-3.5 text-gray-400">{u.phone || 'Chưa cập nhật'}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30'
                          : 'bg-[#1F2937] text-gray-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create / Edit Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Cập Nhật Linh Kiện' : 'Thêm Linh Kiện Máy Tính Mới'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1F2937]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="Ví dụ: CPU AMD Ryzen 7 7800X3D..."
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Thương hiệu</label>
                  <select
                    value={prodForm.brandName}
                    onChange={(e) => setProdForm({ ...prodForm, brandName: e.target.value })}
                    className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                  >
                    {['Intel', 'AMD', 'NVIDIA', 'ASUS ROG', 'MSI', 'Gigabyte AORUS', 'Corsair', 'Kingston', 'Samsung', 'Logitech G', 'Razer', 'DeepCool'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Danh mục linh kiện</label>
                  <select
                    value={prodForm.categorySlug}
                    onChange={(e) => setProdForm({ ...prodForm, categorySlug: e.target.value })}
                    className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="cpu">CPU - Vi xử lý</option>
                    <option value="gpu">VGA - Card màn hình</option>
                    <option value="mainboard">Mainboard - Bo mạch</option>
                    <option value="ram">RAM - Bộ nhớ</option>
                    <option value="ssd">SSD - Ổ cứng</option>
                    <option value="psu">PSU - Nguồn</option>
                    <option value="case">Case - Vỏ máy</option>
                    <option value="cooler">Cooler - Tản nhiệt</option>
                    <option value="monitor">Monitor - Màn hình</option>
                    <option value="gear">Gear - Bàn phím & Chuột</option>
                    <option value="accessories">Phụ kiện & Cáp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Giá cũ (nếu có)</label>
                  <input
                    type="number"
                    value={prodForm.oldPrice}
                    onChange={(e) => setProdForm({ ...prodForm, oldPrice: Number(e.target.value) })}
                    className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Số lượng kho *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Socket (CPU/Main)</label>
                  <input
                    type="text"
                    value={prodForm.socket}
                    onChange={(e) => setProdForm({ ...prodForm, socket: e.target.value })}
                    placeholder="AM5, LGA1700..."
                    className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Chuẩn RAM</label>
                  <input
                    type="text"
                    value={prodForm.ramType}
                    onChange={(e) => setProdForm({ ...prodForm, ramType: e.target.value })}
                    placeholder="DDR5, DDR4..."
                    className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Công suất (Watt)</label>
                  <input
                    type="number"
                    value={prodForm.wattage}
                    onChange={(e) => setProdForm({ ...prodForm, wattage: Number(e.target.value) })}
                    placeholder="TDP hoặc Nguồn..."
                    className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">URL hình ảnh sản phẩm</label>
                <input
                  type="url"
                  value={prodForm.imageUrl}
                  onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-[#1F2937] text-white rounded-xl hover:bg-[#374151]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-bold rounded-xl"
                >
                  {editingProduct ? 'Lưu cập nhật' : 'Thêm vào kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
