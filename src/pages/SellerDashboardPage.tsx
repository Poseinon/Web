import React, { useState, useEffect } from 'react';
import {
  Store,
  Package,
  Plus,
  Edit,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  Clock,
  Truck,
  RefreshCw,
  Search,
  Filter,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Product, Order } from '../types/index.ts';

interface SellerDashboardPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const { user, isSeller, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inventory'>('products');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Modal create/edit product for seller
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
    imageUrl: ''
  });

  const loadSellerData = async () => {
    try {
      setLoading(true);
      const [dashRes, prodRes, ordRes] = await Promise.all([
        api.getSellerDashboard(),
        api.getProducts({ limit: 100 }),
        api.getOrders()
      ]);

      if (dashRes.success) setStats(dashRes.data);
      if (prodRes.success) setProducts(prodRes.products);
      if (ordRes.success) setOrders(ordRes.data);
    } catch (err: any) {
      console.error('Failed to load seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller || isAdmin) {
      loadSellerData();
    }
  }, [isSeller, isAdmin]);

  if (!user || (!isSeller && !isAdmin)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Kênh Quản Trị Dành Cho Người Bán Hàng (Seller)</h2>
        <p className="text-xs text-gray-400">
          Vui lòng đăng nhập với tài khoản Đối tác bán hàng để quản lý danh mục linh kiện, cập nhật kho hàng và theo dõi doanh thu.
        </p>
        <button
          onClick={() => onOpenAuth('login')}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20"
        >
          Đăng Nhập Kênh Người Bán
        </button>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      brandName: 'ASUS ROG',
      categorySlug: 'gpu',
      price: 15000000,
      oldPrice: 17000000,
      stock: 10,
      sku: `ROG-${Math.floor(1000 + Math.random() * 9000)}`,
      description: 'Linh kiện chính hãng bảo hành 36 tháng đầy đủ VAT',
      imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80'
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      brandName: p.brandName,
      categorySlug: p.categorySlug,
      price: p.price,
      oldPrice: p.oldPrice || p.price,
      stock: p.stock,
      sku: p.sku,
      description: p.description,
      imageUrl: p.images[0] || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          name: prodForm.name,
          price: Number(prodForm.price),
          oldPrice: Number(prodForm.oldPrice),
          stock: Number(prodForm.stock),
          description: prodForm.description,
          images: [prodForm.imageUrl]
        });
        success('Cập nhật thông tin linh kiện thành công!');
      } else {
        await api.createProduct({
          name: prodForm.name,
          brandName: prodForm.brandName,
          categorySlug: prodForm.categorySlug,
          price: Number(prodForm.price),
          oldPrice: Number(prodForm.oldPrice),
          stock: Number(prodForm.stock),
          sku: prodForm.sku,
          description: prodForm.description,
          images: [prodForm.imageUrl]
        });
        success('Thêm mới linh kiện vào gian hàng thành công!');
      }
      setShowProductModal(false);
      loadSellerData();
    } catch (err: any) {
      error(err.message || 'Không thể lưu sản phẩm');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1F2937]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> SELLER PORTAL
            </span>
            <span className="text-xs text-gray-400">Kênh Đối tác Phân phối Linh kiện</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gian hàng: {user.fullName}
          </h1>
          <p className="text-xs text-gray-400">
            Email kinh doanh: <strong className="text-white">{user.email}</strong> • Chiết khấu đại lý cấp 1
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSellerData}
            className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-gray-500 text-gray-300 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-95 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Đăng Bán Linh Kiện Mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Mã linh kiện đang bán</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{products.length} mã</div>
          <p className="text-[11px] text-amber-400">Phủ sóng 12 danh mục phần cứng</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Tổng đơn hàng phát sinh</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{orders.length} đơn</div>
          <p className="text-[11px] text-purple-400">Tỷ lệ khách quay lại 78%</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Đơn đang giao vận</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {orders.filter((o) => o.status === 'SHIPPING').length} đơn
          </div>
          <p className="text-[11px] text-blue-400">Shipper đang trên đường giao</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Doanh thu gian hàng</span>
            <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#00E5FF]">
            {orders
              .filter((o) => o.status !== 'CANCELLED')
              .reduce((sum, o) => sum + o.total, 0)
              .toLocaleString('vi-VN')}{' '}
            ₫
          </div>
          <p className="text-[11px] text-emerald-400">Tăng trưởng ổn định</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1F2937]">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          📦 Danh mục linh kiện ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          🛒 Đơn hàng gian hàng ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          ⚠️ Cảnh báo tồn kho ({products.filter((p) => p.stock <= 5).length})
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã SKU hoặc tên linh kiện..."
                className="w-full bg-[#111827] text-white pl-9 pr-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-amber-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xs text-gray-400">Hiển thị {filteredProducts.length} sản phẩm</span>
          </div>

          <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#0B0F14] text-gray-400">
                  <th className="p-3.5">Linh kiện</th>
                  <th className="p-3.5">Mã SKU</th>
                  <th className="p-3.5">Thương hiệu</th>
                  <th className="p-3.5 text-right">Giá bán</th>
                  <th className="p-3.5 text-center">Tồn kho</th>
                  <th className="p-3.5 text-center">Đã bán</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#0B0F14]/40 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-[#0B0F14] border border-[#1F2937]"
                      />
                      <div className="max-w-xs">
                        <div className="font-bold text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-gray-400">{p.categorySlug.toUpperCase()}</div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-gray-300">{p.sku}</td>
                    <td className="p-3.5 text-amber-300 font-semibold">{p.brandName}</td>
                    <td className="p-3.5 text-right font-extrabold text-[#00E5FF]">
                      {p.price.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          p.stock <= 5
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {p.stock} cái
                      </span>
                    </td>
                    <td className="p-3.5 text-center text-gray-400">{p.soldCount}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-amber-400 transition-colors cursor-pointer"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0B0F14] text-gray-400">
                <th className="p-3.5">Mã đơn</th>
                <th className="p-3.5">Khách hàng</th>
                <th className="p-3.5">Số lượng</th>
                <th className="p-3.5 text-right">Giá trị đơn</th>
                <th className="p-3.5">Trạng thái vận chuyển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#0B0F14]/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-white">#{o.orderCode}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{o.fullName}</div>
                    <div className="text-[10px] text-gray-400">{o.phone}</div>
                  </td>
                  <td className="p-3.5 text-gray-300">{o.items.length} linh kiện</td>
                  <td className="p-3.5 text-right font-extrabold text-[#00E5FF]">
                    {o.total.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : o.status === 'SHIPPING'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Inventory Low Stock */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Danh sách các linh kiện có số lượng tồn kho còn <strong>từ 5 sản phẩm trở xuống</strong>. Vui lòng nhập thêm hàng để tránh gián đoạn kinh doanh.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter((p) => p.stock <= 5)
              .map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-[#111827] border border-red-500/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#0B0F14]" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate text-xs">{p.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">SKU: {p.sku}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1F2937]">
                    <span className="text-red-400 font-bold">Chỉ còn lại: {p.stock} cái</span>
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 cursor-pointer"
                    >
                      Nhập thêm kho
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Cập Nhật Linh Kiện Gian Hàng' : 'Đăng Bán Linh Kiện Mới'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Tên linh kiện *</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="Ví dụ: Card Màn Hình ASUS ROG Strix RTX 4070 Ti 16GB"
                  className="w-full bg-[#0B0F14] text-white px-3 py-2 rounded-xl border border-[#1F2937]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Thương hiệu *</label>
                  <select
                    value={prodForm.brandName}
                    onChange={(e) => setProdForm({ ...prodForm, brandName: e.target.value })}
                    className="w-full bg-[#0B0F14] text-white px-3 py-2 rounded-xl border border-[#1F2937]"
                  >
                    <option value="ASUS ROG">ASUS ROG</option>
                    <option value="MSI">MSI</option>
                    <option value="Gigabyte AORUS">Gigabyte AORUS</option>
                    <option value="Intel">Intel</option>
                    <option value="AMD">AMD</option>
                    <option value="Corsair">Corsair</option>
                    <option value="Kingston">Kingston</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Mã SKU *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="w-full bg-[#0B0F14] text-white px-3 py-2 rounded-xl border border-[#1F2937]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Giá bán (₫) *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full bg-[#0B0F14] text-white px-3 py-2 rounded-xl border border-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Giá niêm yết (₫)</label>
                  <input
                    type="number"
                    value={prodForm.oldPrice}
                    onChange={(e) => setProdForm({ ...prodForm, oldPrice: Number(e.target.value) })}
                    className="w-full bg-[#0B0F14] text-white px-3 py-2 rounded-xl border border-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full bg-[#0B0F14] text-white px-3 py-2 rounded-xl border border-[#1F2937]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Link ảnh sản phẩm (URL)</label>
                <input
                  type="url"
                  value={prodForm.imageUrl}
                  onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                  className="w-full bg-[#0B0F14] text-white px-3 py-2 rounded-xl border border-[#1F2937]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full bg-[#0B0F14] text-white px-3 py-2 rounded-xl border border-[#1F2937]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1F2937] text-gray-300"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold cursor-pointer"
                >
                  Lưu Linh Kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
