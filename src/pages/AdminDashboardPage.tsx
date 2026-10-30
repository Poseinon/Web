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
  EyeOff,
  BarChart2,
  Sparkles,
  Filter,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Warehouse,
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  RotateCcw,
  Truck,
  Phone,
  MapPin,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Product, Order, User, OrderStatus, ShipperWithStats } from '../types/index.ts';

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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'products' | 'orders' | 'shippers' | 'users'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [shippersList, setShippersList] = useState<ShipperWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Shipper Assignment Modal states
  const [assignModalOrder, setAssignModalOrder] = useState<Order | null>(null);
  const [selectedShipperId, setSelectedShipperId] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Deletion Confirmation Modal states (avoid browser confirm which is blocked in iframe)
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteProductLoading, setDeleteProductLoading] = useState(false);

  // Toggle state to hide / show the revenue chart
  const [showRevenueChart, setShowRevenueChart] = useState<boolean>(() => {
    const saved = localStorage.getItem('techzone_admin_show_revenue_chart');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleShowRevenueChart = () => {
    setShowRevenueChart((prev) => {
      const next = !prev;
      localStorage.setItem('techzone_admin_show_revenue_chart', String(next));
      if (!next) {
        success('Đã ẩn khối biểu đồ doanh thu khỏi trang tổng quan');
      } else {
        success('Đã hiển thị lại khối biểu đồ doanh thu');
      }
      return next;
    });
  };

  // Helper to quickly create a test order if user wants to populate the chart with real data
  const handleCreateSampleOrder = async () => {
    if (products.length === 0) {
      error('Chưa có sản phẩm nào để tạo đơn mẫu');
      return;
    }
    const sampleProduct = products[0];
    try {
      const res = await api.createOrder({
        fullName: 'Khách hàng mẫu',
        phone: '0909123456',
        email: 'customer.test@gmail.com',
        address: '789 Đường Lê Duẩn',
        city: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        paymentMethod: 'BANK_TRANSFER',
        items: [
          {
            productId: sampleProduct.id,
            name: sampleProduct.name,
            image: sampleProduct.images[0],
            price: sampleProduct.price,
            quantity: 1
          }
        ]
      });
      if (res.success) {
        success('Đã tạo thành công 1 đơn hàng mới! Biểu đồ doanh thu đã được cập nhật.');
        loadAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Không thể tạo đơn hàng mẫu');
    }
  };

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

  // Inventory / Stock Management states
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('all');
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'all' | 'out_of_stock' | 'low_stock' | 'in_stock'>('all');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockSupplier, setRestockSupplier] = useState<string>('Synnex FPT Distribution');
  const [restockUnitCost, setRestockUnitCost] = useState<number>(0);
  const [restockNotes, setRestockNotes] = useState<string>('Nhập bổ sung đợt hàng chính hãng');

  // User Management states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER' as 'USER' | 'SHIPPER' | 'ADMIN' | 'SELLER'
  });

  // Load Dashboard Data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, prodRes, ordRes, userRes, shipperRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getProducts({ limit: 100 }),
        api.getOrders(),
        api.getAdminUsers(),
        api.getAdminShippers()
      ]);

      if (dashRes.success) setStats(dashRes.data);
      if (prodRes.success) setProducts(prodRes.products);
      if (ordRes.success) setOrders(ordRes.data);
      if (userRes.success) setUsers(userRes.data);
      if (shipperRes.success) setShippersList(shipperRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle assigning shipper to order
  const handleAssignShipper = async (orderId: string, shipperId: string) => {
    try {
      setAssignLoading(true);
      const res = await api.assignShipperToOrder(orderId, shipperId);
      if (res.success) {
        success(res.message);
        setAssignModalOrder(null);
        await loadAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Không thể phân công shipper');
    } finally {
      setAssignLoading(false);
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

  // Handle delete product (opens confirmation modal)
  const handleDeleteProduct = (p: Product) => {
    setProductToDelete(p);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setDeleteProductLoading(true);
      const res = await api.deleteProduct(productToDelete.id);
      if (res.success) {
        success(`Đã xóa sản phẩm "${productToDelete.name}" thành công!`);
        setProductToDelete(null);
        await loadAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Không thể xóa sản phẩm');
    } finally {
      setDeleteProductLoading(false);
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

  // Handle changing user role
  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await api.updateUserRole(userId, newRole);
      if (res.success) {
        success(`Đã phân quyền thành công: ${newRole}`);
        loadAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Không thể đổi vai trò');
    }
  };

  // Quick stock change handler
  const handleQuickStockChange = async (productId: string, delta: number) => {
    try {
      const res = await api.adjustProductStock(productId, { delta });
      if (res.success) {
        success(res.message);
        loadAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật số lượng tồn kho');
    }
  };

  // Open Restock Modal
  const handleOpenRestockModal = (product?: Product) => {
    if (product) {
      setRestockProduct(product);
      setRestockUnitCost(Math.round(product.price * 0.8));
    } else if (products.length > 0) {
      setRestockProduct(products[0]);
      setRestockUnitCost(Math.round(products[0].price * 0.8));
    }
    setRestockQty(10);
    setRestockSupplier('Synnex FPT Distribution');
    setRestockNotes('Nhập bổ sung nguồn hàng chính hãng');
    setShowRestockModal(true);
  };

  // Save Restock entry
  const handleSaveRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    if (restockQty <= 0) {
      error('Số lượng nhập phải lớn hơn 0');
      return;
    }
    try {
      const res = await api.adjustProductStock(restockProduct.id, { delta: restockQty });
      if (res.success) {
        success(`Đã nhập thêm +${restockQty} ${restockProduct.name} vào kho thành công!`);
        setShowRestockModal(false);
        loadAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Không thể lập phiếu nhập hàng');
    }
  };

  // Delete user by admin (opens confirmation modal)
  const handleAdminDeleteUser = (u: User) => {
    if (user && user.id === u.id) {
      error('Không thể xóa tài khoản của chính bạn đang đăng nhập');
      return;
    }
    setUserToDelete(u);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    if (user && user.id === userToDelete.id) {
      error('Không thể xóa tài khoản của chính bạn đang đăng nhập');
      setUserToDelete(null);
      return;
    }
    try {
      setDeleteUserLoading(true);
      const res = await api.adminDeleteUser(userToDelete.id);
      if (res.success) {
        success(`Đã xóa vĩnh viễn tài khoản "${userToDelete.fullName}" khỏi hệ thống thành công!`);
        setUserToDelete(null);
        await loadAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Không thể xóa tài khoản');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  // Create user by admin
  const handleAdminCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName.trim() || !newUserForm.email.trim() || !newUserForm.password) {
      error('Vui lòng điền họ tên, email và mật khẩu');
      return;
    }
    try {
      const res = await api.adminCreateUser(newUserForm);
      if (res.success) {
        success(`Đã tạo thành công tài khoản: ${newUserForm.fullName} (${newUserForm.role})`);
        setShowAddUserModal(false);
        setNewUserForm({
          fullName: '',
          email: '',
          password: '',
          phone: '',
          role: 'USER'
        });
        loadAdminData();
      }
    } catch (err: any) {
      error(err.message || 'Lỗi khi tạo tài khoản');
    }
  };

  // Inventory calculations
  const totalStockCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
  const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;
  const lowStockCount = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q);
  });

  // Filtered inventory list
  const filteredInventory = products.filter((p) => {
    if (inventoryCategory !== 'all' && p.categorySlug !== inventoryCategory) return false;
    if (inventoryStockFilter === 'out_of_stock' && p.stock > 0) return false;
    if (inventoryStockFilter === 'low_stock' && (p.stock === 0 || p.stock > 5)) return false;
    if (inventoryStockFilter === 'in_stock' && p.stock <= 5) return false;
    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus === 'all') return true;
    return o.status === orderFilterStatus;
  });

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q));
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-[#00E5FF]" />
            BẢNG ĐIỀU KHIỂN QUẢN TRỊ & BÁN HÀNG / KHO TỒN
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Quản trị tập trung toàn diện: Người dùng (Khách hàng & Shipper), Nguồn hàng tồn kho, Bán hàng và Đơn hàng
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
            { id: 'inventory', label: `Nguồn Hàng Tồn (${totalStockCount})`, icon: Boxes },
            { id: 'products', label: `Sản Phẩm (${products.length})`, icon: Package },
            { id: 'orders', label: `Đơn Hàng (${orders.length})`, icon: ShoppingCart },
            { id: 'shippers', label: `Điều Phối Shipper (${shippersList.length})`, icon: Truck },
            { id: 'users', label: `Người Dùng (${users.length})`, icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
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
            {/* Revenue Bar Chart (7 cols or hidden banner) */}
            {showRevenueChart ? (
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#00E5FF]" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Biểu Đồ Doanh Thu 6 Tháng Gần Nhất
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#00E5FF] font-mono mr-1 hidden sm:inline">Đơn vị: Triệu VNĐ</span>
                    <button
                      onClick={toggleShowRevenueChart}
                      className="px-2.5 py-1 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-gray-300 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                      title="Ẩn hoặc xóa khối biểu đồ này"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ẩn biểu đồ</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Content: Check if there is actual revenue */}
                {(() => {
                  const hasRevenue = stats.revenueByMonth && stats.revenueByMonth.some((item: any) => item.revenue > 0);
                  const maxRev = hasRevenue
                    ? Math.max(...stats.revenueByMonth.map((item: any) => item.revenue), 1000000)
                    : 1;

                  if (!hasRevenue) {
                    return (
                      <div className="py-10 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#1F2937] text-gray-500 flex items-center justify-center mx-auto">
                          <BarChart2 className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-bold text-white">Chưa phát sinh doanh thu trong 6 tháng gần nhất</div>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">
                          Khi có đơn hàng được thanh toán, các cột doanh thu sẽ tự động nhảy số theo thời gian thực.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            onClick={handleCreateSampleOrder}
                            className="px-3.5 py-1.5 rounded-xl bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00E5FF]/20"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            + Thêm 1 đơn hàng mẫu
                          </button>
                          <button
                            onClick={toggleShowRevenueChart}
                            className="px-3.5 py-1.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs transition-colors"
                          >
                            Xóa / Ẩn biểu đồ này
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="pt-4 flex items-end justify-between gap-4 h-56 px-2">
                      {stats.revenueByMonth.map((item: any, idx: number) => {
                        const barHeight = item.revenue > 0
                          ? Math.min(100, Math.max(15, (item.revenue / maxRev) * 100))
                          : 4;

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono font-bold">
                              {item.revenue > 0 ? `${(item.revenue / 1000000).toFixed(1)}M` : '0đ'}
                            </div>
                            <div className="w-full bg-[#1F2937] rounded-xl h-44 flex items-end overflow-hidden p-1">
                              <div
                                style={{ height: `${barHeight}%` }}
                                className={`w-full rounded-lg transition-all duration-500 ${
                                  item.revenue > 0
                                    ? 'bg-gradient-to-t from-[#7C3AED] to-[#00E5FF] group-hover:brightness-125'
                                    : 'bg-gray-700/30'
                                }`}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-gray-400">{item.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="lg:col-span-12 p-3.5 rounded-xl bg-[#111827] border border-[#1F2937] flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-gray-500" />
                  Khối &quot;Biểu đồ doanh thu 6 tháng&quot; đang được ẩn.
                </span>
                <button
                  onClick={toggleShowRevenueChart}
                  className="px-3 py-1 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Hiển thị lại biểu đồ
                </button>
              </div>
            )}

            {/* Category Breakdown (5 cols or 12 cols if chart is hidden) */}
            <div className={`${showRevenueChart ? 'lg:col-span-5' : 'lg:col-span-12'} p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4`}>
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

      {/* ================= TAB: INVENTORY / NGUỒN HÀNG TỒN ================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Tổng Giá Trị Tồn Kho</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#00E5FF]">
                {totalInventoryValue.toLocaleString('vi-VN')} ₫
              </div>
              <div className="text-[11px] text-gray-400">
                Định giá theo giá niêm yết hiện tại
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Tổng Số Linh Kiện Còn</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Warehouse className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-white">
                {totalStockCount.toLocaleString('vi-VN')} đơn vị
              </div>
              <div className="text-[11px] text-gray-400">
                Phân bổ trên {products.length} mã linh kiện
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-amber-500/30 bg-amber-500/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span>Cảnh Báo Sắp Hết (≤ 5)</span>
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-amber-400">
                {lowStockCount} sản phẩm
              </div>
              <div className="text-[11px] text-amber-300/80">
                Cần lên kế hoạch nhập bổ sung
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-red-500/30 bg-red-500/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-red-400 font-semibold">
                <span>Đã Hết Hàng (Stock = 0)</span>
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-red-400">
                {outOfStockCount} sản phẩm
              </div>
              <div className="text-[11px] text-red-300/80">
                Ngưng phục vụ đặt mua ngay
              </div>
            </div>
          </div>

          {/* Low Stock Warning Banner if any */}
          {(outOfStockCount > 0 || lowStockCount > 0) && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">
                    Hệ thống ghi nhận {outOfStockCount} sản phẩm đã hết sạch và {lowStockCount} sản phẩm sắp hết hàng!
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Bạn có thể bấm vào nút "Nhập Thêm Hàng" hoặc dùng nút tăng giảm nhanh (+1, +5) để cập nhật tồn kho tức thì.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setInventoryStockFilter('out_of_stock')}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Xem hàng hết ({outOfStockCount})
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryStockFilter('low_stock')}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Xem sắp hết ({lowStockCount})
                </button>
              </div>
            </div>
          )}

          {/* Filter & Action Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#111827] p-3 rounded-2xl border border-[#1F2937]">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Tìm linh kiện, mã SKU, hãng..."
                  className="w-full bg-[#0B0F14] text-white pl-9 pr-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <select
                value={inventoryStockFilter}
                onChange={(e) => setInventoryStockFilter(e.target.value as any)}
                className="bg-[#0B0F14] text-white text-xs border border-[#1F2937] rounded-xl px-3 py-2 focus:outline-none focus:border-[#00E5FF] cursor-pointer"
              >
                <option value="all">Tất cả tình trạng kho</option>
                <option value="in_stock">Còn nhiều hàng (&gt; 5)</option>
                <option value="low_stock">⚠️ Cảnh báo sắp hết (≤ 5)</option>
                <option value="out_of_stock">🚫 Đã hết sạch hàng (0)</option>
              </select>

              <select
                value={inventoryCategory}
                onChange={(e) => setInventoryCategory(e.target.value)}
                className="bg-[#0B0F14] text-white text-xs border border-[#1F2937] rounded-xl px-3 py-2 focus:outline-none focus:border-[#00E5FF] cursor-pointer"
              >
                <option value="all">Tất cả danh mục linh kiện</option>
                <option value="cpu">CPU - Vi xử lý</option>
                <option value="gpu">VGA - Card màn hình</option>
                <option value="mainboard">Mainboard - Bo mạch</option>
                <option value="ram">RAM - Bộ nhớ</option>
                <option value="ssd">SSD - Ổ cứng</option>
                <option value="psu">PSU - Nguồn</option>
                <option value="case">Case - Vỏ máy</option>
                <option value="cooler">Cooler - Tản nhiệt</option>
                <option value="monitor">Monitor - Màn hình</option>
                <option value="gear">Gear - Gaming gear</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenRestockModal()}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Lập Phiếu Nhập Hàng Tồn Kho
            </button>
          </div>

          {/* Inventory Table */}
          <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-x-auto shadow-xl">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#0B0F14] text-gray-400">
                  <th className="p-3.5">Linh kiện & Hãng</th>
                  <th className="p-3.5">Mã SKU</th>
                  <th className="p-3.5">Danh mục</th>
                  <th className="p-3.5 text-right">Đơn giá bán</th>
                  <th className="p-3.5 text-center">Tình trạng tồn kho</th>
                  <th className="p-3.5 text-right">Tổng giá trị tồn</th>
                  <th className="p-3.5 text-center">Điều chỉnh nhanh tồn kho</th>
                  <th className="p-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Không tìm thấy linh kiện nào phù hợp với bộ lọc tồn kho
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((p) => {
                    const isOutOfStock = (p.stock || 0) === 0;
                    const isLowStock = (p.stock || 0) > 0 && (p.stock || 0) <= 5;
                    const itemValue = (p.price || 0) * (p.stock || 0);

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-[#0B0F14]/40 transition-colors ${
                          isOutOfStock ? 'bg-red-500/5' : isLowStock ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-10 h-10 object-contain rounded-lg bg-[#0B0F14] p-1 border border-[#1F2937] shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white max-w-xs truncate">{p.name}</div>
                              <div className="text-[10px] text-cyan-400 font-semibold">{p.brandName}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-gray-400">{p.sku}</td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#1F2937] text-gray-300 text-[10px] uppercase font-bold">
                            {p.categorySlug}
                          </span>
                        </td>

                        <td className="p-3.5 text-right font-extrabold text-[#00E5FF]">
                          {p.price.toLocaleString('vi-VN')} ₫
                        </td>

                        <td className="p-3.5 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                              <AlertCircle className="w-3 h-3" /> Hết hàng (0)
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <AlertTriangle className="w-3 h-3" /> Sắp hết ({p.stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <Check className="w-3 h-3" /> Sẵn hàng ({p.stock})
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right font-bold text-gray-200">
                          {itemValue.toLocaleString('vi-VN')} ₫
                        </td>

                        {/* Quick stock adjustment buttons */}
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1 bg-[#0B0F14] p-1 rounded-xl border border-[#1F2937]">
                            <button
                              type="button"
                              disabled={p.stock <= 0}
                              onClick={() => handleQuickStockChange(p.id, -1)}
                              className="px-2 py-0.5 text-xs font-bold text-gray-300 hover:text-red-400 hover:bg-[#1F2937] rounded disabled:opacity-30 cursor-pointer"
                              title="Giảm 1 tồn kho"
                            >
                              -1
                            </button>
                            <span className="px-2 font-mono font-bold text-white min-w-[28px] text-center">
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, 1)}
                              className="px-2 py-0.5 text-xs font-bold text-gray-300 hover:text-emerald-400 hover:bg-[#1F2937] rounded cursor-pointer"
                              title="Tăng 1 tồn kho"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, 5)}
                              className="px-2 py-0.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20 rounded cursor-pointer border border-emerald-500/30"
                              title="Nhập nhanh +5"
                            >
                              +5
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenRestockModal(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#1F2937] hover:bg-emerald-500/20 text-emerald-300 hover:border-emerald-500/40 border border-[#1F2937] text-[11px] font-bold flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Nhập Hàng
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
                  <th className="p-3.5">Shipper phụ trách</th>
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
                    <td className="p-3.5">
                      {o.shipperName ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <span>🛵</span>
                            <div>
                              <div className="font-bold text-white">{o.shipperName}</div>
                              <div className="text-[10px] text-gray-400">{o.shipperPhone}</div>
                            </div>
                          </div>
                          {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setAssignModalOrder(o);
                                setSelectedShipperId(o.shipperId || '');
                              }}
                              className="px-2 py-1 rounded bg-[#1F2937] hover:bg-[#374151] text-[10px] text-[#00E5FF] font-bold transition-colors cursor-pointer"
                              title="Thay đổi shipper phụ trách"
                            >
                              Đổi
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-[11px] italic">Chưa xếp</span>
                          {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setAssignModalOrder(o);
                                setSelectedShipperId('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Truck className="w-3 h-3" />
                              + Gán Shipper
                            </button>
                          )}
                        </div>
                      )}
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
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
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

      {/* ================= TAB: QUẢN LÝ & ĐIỀU PHỐI SHIPPER ================= */}
      {activeTab === 'shippers' && (
        <div className="space-y-6">
          {/* Header Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Tổng Số Shipper</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-white">{shippersList.length} nhân sự</div>
              <div className="text-[11px] text-gray-400">Đội ngũ giao hàng TechZone</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-amber-500/30 bg-amber-500/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span>Đang Bận Giao Hàng</span>
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-amber-400">
                {shippersList.filter((s) => !s.isAvailable).length} shipper
              </div>
              <div className="text-[11px] text-amber-300/80">Đang trên đường giao khách</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                <span>Đang Rảnh Rỗi</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-emerald-400">
                {shippersList.filter((s) => s.isAvailable).length} shipper
              </div>
              <div className="text-[11px] text-emerald-300/80">Sẵn sàng nhận lệnh điều phối</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Đơn Chờ Gán Shipper</span>
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-[#00E5FF]">
                {orders.filter((o) => (o.status === 'CONFIRMED' || o.status === 'PENDING') && !o.shipperId).length} đơn
              </div>
              <div className="text-[11px] text-cyan-400/80">Cần admin xếp shipper</div>
            </div>
          </div>

          {/* Shippers List / Dispatch Board */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Danh Sách Đội Ngũ Shipper & Trạng Thái Hoạt Động
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Theo dõi shipper nào đang bận hoặc rảnh rỗi để điều phối đơn hàng nhanh chóng, công bằng
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewUserForm({
                    fullName: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'SHIPPER'
                  });
                  setShowAddUserModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Thêm Tài Khoản Shipper Mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shippersList.map((s) => {
                const active = s.activeOrder;
                return (
                  <div
                    key={s.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                      !s.isAvailable
                        ? 'bg-[#111827] border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : 'bg-[#111827] border-[#1F2937] hover:border-emerald-500/40'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover border border-[#1F2937]"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{s.fullName}</div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{s.phone || '0901234567'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status badge */}
                      {s.isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Rảnh rỗi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                          Đang bận
                        </span>
                      )}
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-1">
                      <div className="p-2 rounded-xl bg-[#0B0F14] border border-[#1F2937]">
                        <div className="text-[10px] text-gray-500">Đơn đã hoàn tất</div>
                        <div className="font-extrabold text-white text-sm">
                          {s.completedDeliveriesCount} đơn
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#0B0F14] border border-[#1F2937]">
                        <div className="text-[10px] text-gray-500">COD đã thu</div>
                        <div className="font-extrabold text-[#00E5FF] text-xs">
                          {s.totalCodCollected.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                    </div>

                    {/* Active Order box if busy */}
                    {active ? (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-amber-300">
                          <span>🛵 Đang giao đơn #{active.orderCode}</span>
                          <span className="font-mono text-[10px]">{active.total.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <div className="text-gray-300 text-[11px] truncate">
                          Khách: <strong className="text-white">{active.fullName}</strong> ({active.phone})
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          Đ/c: {active.address}, {active.district}
                        </div>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-amber-400 italic">
                            Shipper đang giao (tối đa 1 đơn)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAssignModalOrder(active);
                              setSelectedShipperId(s.id);
                            }}
                            className="text-[10px] text-[#00E5FF] hover:underline font-bold"
                          >
                            Đổi shipper khác
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400/90 flex items-center justify-between">
                        <span className="text-[11px]">Sẵn sàng tiếp nhận đơn hàng mới</span>
                        <span className="text-emerald-400 font-bold text-[10px]">🟢 Sẵn sàng</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Orders Waiting for Shipper Assignment */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#00E5FF]" />
                  Đơn Hàng Đang Chờ Điều Phối Shipper (
                  {orders.filter((o) => (o.status === 'CONFIRMED' || o.status === 'PENDING') && !o.shipperId).length} đơn)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chọn shipper phù hợp bên dưới để chỉ định giao hàng cho khách
                </p>
              </div>
            </div>

            {orders.filter((o) => (o.status === 'CONFIRMED' || o.status === 'PENDING') && !o.shipperId).length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-white">Tất cả đơn hàng hiện đã được điều phối shipper đầy đủ!</div>
                <p className="text-[11px] text-gray-500">Khi khách đặt đơn mới, đơn sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#1F2937] text-gray-400 bg-[#0B0F14]">
                      <th className="p-3">Mã đơn</th>
                      <th className="p-3">Khách hàng & SĐT</th>
                      <th className="p-3">Địa chỉ nhận</th>
                      <th className="p-3 text-right">Tổng tiền</th>
                      <th className="p-3">Thanh toán</th>
                      <th className="p-3 text-center">Thao tác điều phối</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {orders
                      .filter((o) => (o.status === 'CONFIRMED' || o.status === 'PENDING') && !o.shipperId)
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-[#0B0F14]/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-white">#{o.orderCode}</td>
                          <td className="p-3">
                            <div className="font-bold text-white">{o.fullName}</div>
                            <div className="text-[10px] text-emerald-400">{o.phone}</div>
                          </td>
                          <td className="p-3 max-w-xs text-gray-300">
                            {o.address}, {o.ward}, {o.district}, {o.city}
                          </td>
                          <td className="p-3 text-right font-extrabold text-[#00E5FF]">
                            {o.total.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="p-3 text-gray-300">{o.paymentMethod}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setAssignModalOrder(o);
                                setSelectedShipperId('');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Xếp Shipper Ngay
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: USERS MANAGEMENT (ALL ROLES) ================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Role Counts Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#111827] border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">👑 Quản Trị Viên</span>
                <div className="text-[10px] text-gray-500">Toàn quyền hệ thống</div>
              </div>
              <span className="text-base font-black text-cyan-400">
                {users.filter((u) => u.role === 'ADMIN').length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">🚚 Nhân Viên Shipper</span>
                <div className="text-[10px] text-gray-500">Giao nhận đơn hàng</div>
              </div>
              <span className="text-base font-black text-emerald-400">
                {users.filter((u) => u.role === 'SHIPPER').length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">👤 Khách Hàng</span>
                <div className="text-[10px] text-gray-500">Tài khoản mua sắm</div>
              </div>
              <span className="text-base font-black text-purple-400">
                {users.filter((u) => u.role === 'USER').length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">🏪 Người Bán Hàng</span>
                <div className="text-[10px] text-gray-500">Đối tác bán hàng</div>
              </div>
              <span className="text-base font-black text-amber-400">
                {users.filter((u) => u.role === 'SELLER').length}
              </span>
            </div>
          </div>

          {/* User Filter & Search Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] p-3 rounded-2xl border border-[#1F2937]">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm theo họ tên, email hoặc SĐT..."
                  className="w-full bg-[#0B0F14] text-white pl-9 pr-3 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-[#0B0F14] text-white text-xs border border-[#1F2937] rounded-xl px-3 py-2 focus:outline-none focus:border-[#00E5FF] cursor-pointer"
              >
                <option value="all">Tất cả vai trò ({users.length})</option>
                <option value="ADMIN">👑 Quản Trị & Kho Hàng (ADMIN)</option>
                <option value="SHIPPER">🚚 Nhân Viên Shipper (SHIPPER)</option>
                <option value="USER">👤 Khách Hàng (USER)</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Thêm Tài Khoản Mới
            </button>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-x-auto shadow-xl">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#0B0F14] text-gray-400">
                  <th className="p-3.5">Người dùng</th>
                  <th className="p-3.5">Email đăng nhập</th>
                  <th className="p-3.5">Số điện thoại</th>
                  <th className="p-3.5">Vai trò (Phân quyền)</th>
                  <th className="p-3.5 text-center">Trạng thái</th>
                  <th className="p-3.5">Ngày tham gia</th>
                  <th className="p-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Không tìm thấy tài khoản người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = user?.id === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-[#0B0F14]/40 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-[#1F2937] shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{u.fullName}</span>
                                {isSelf && (
                                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-normal">
                                    (Bạn)
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-gray-500">{u.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-gray-300">{u.email}</td>

                        <td className="p-3.5 text-gray-400">{u.phone || 'Chưa cập nhật'}</td>

                        <td className="p-3.5">
                          <select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                              u.role === 'ADMIN' || u.role === 'SELLER'
                                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/40'
                                : u.role === 'SHIPPER'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                            }`}
                          >
                            <option value="USER">👤 Khách Hàng (USER)</option>
                            <option value="SHIPPER">🚚 Nhân Viên Shipper (SHIPPER)</option>
                            <option value="ADMIN">👑 Quản Trị & Kho Hàng (ADMIN)</option>
                          </select>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Hoạt động
                          </span>
                        </td>

                        <td className="p-3.5 text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => handleAdminDeleteUser(u.id, u.fullName)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title={isSelf ? 'Không thể xóa tài khoản của bạn' : 'Xóa tài khoản'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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

      {/* ================= MODAL: RESTOCK / PHIẾU NHẬP HÀNG TỒN KHO ================= */}
      {showRestockModal && restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl p-6 overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Lập Phiếu Nhập Hàng Tồn Kho</h3>
                  <p className="text-[11px] text-gray-400">Bổ sung số lượng linh kiện trực tiếp vào nguồn hàng tồn</p>
                </div>
              </div>
              <button
                onClick={() => setShowRestockModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1F2937]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRestock} className="space-y-3.5 text-xs">
              {/* Product Info Card */}
              <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1F2937] flex items-center gap-3">
                <img
                  src={restockProduct.images[0]}
                  alt=""
                  className="w-12 h-12 object-contain rounded-lg bg-[#111827] p-1 border border-[#1F2937] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{restockProduct.name}</div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                    <span>SKU: <strong className="text-gray-200 font-mono">{restockProduct.sku}</strong></span>
                    <span>Tồn hiện tại: <strong className={restockProduct.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}>{restockProduct.stock} cái</strong></span>
                  </div>
                </div>
              </div>

              {/* Select other product if needed */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Chọn linh kiện cần nhập kho</label>
                <select
                  value={restockProduct.id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) {
                      setRestockProduct(found);
                      setRestockUnitCost(Math.round(found.price * 0.8));
                    }
                  }}
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF] cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.categorySlug.toUpperCase()}] {p.name} (Tồn: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Số lượng nhập thêm *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      value={restockQty}
                      onChange={(e) => setRestockQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF] font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">cái</span>
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {[5, 10, 20, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRestockQty(num)}
                        className="px-2 py-0.5 rounded bg-[#1F2937] hover:bg-[#374151] text-[10px] text-gray-300 font-semibold cursor-pointer"
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Đơn giá nhập vốn (VNĐ)</label>
                  <input
                    type="number"
                    value={restockUnitCost}
                    onChange={(e) => setRestockUnitCost(Number(e.target.value))}
                    className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF] font-mono"
                  />
                  <div className="text-[10px] text-gray-500 mt-1.5">
                    Giá bán: {restockProduct.price.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Nhà cung cấp / Nguồn nhập</label>
                <input
                  type="text"
                  value={restockSupplier}
                  onChange={(e) => setRestockSupplier(e.target.value)}
                  placeholder="Ví dụ: Synnex FPT, DGW, Viễn Sơn, ASUS VN..."
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Ghi chú phiếu nhập</label>
                <textarea
                  rows={2}
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder="Ghi chú đợt nhập hàng hoặc số hóa đơn VAT..."
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-gray-300">Tồn kho sau khi nhập:</span>
                <span className="font-extrabold text-emerald-400 text-sm font-mono">
                  {restockProduct.stock} + {restockQty} = {restockProduct.stock + restockQty} cái
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 bg-[#1F2937] text-white rounded-xl hover:bg-[#374151] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-black font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Xác Nhận Nhập Kho (+{restockQty})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD USER BY ADMIN ================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl p-6 overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Thêm Tài Khoản Người Dùng Mới</h3>
                  <p className="text-[11px] text-gray-400">Quản trị viên khởi tạo tài khoản và phân quyền trực tiếp</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1F2937]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn Shipper"
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="nguoidung@techzone.vn"
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Mật khẩu khởi tạo *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full bg-[#0B0F14] text-white p-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1.5">Phân quyền vai trò tài khoản *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'USER', label: '👤 Khách Hàng', desc: 'Mua hàng & build PC' },
                    { id: 'SHIPPER', label: '🚚 Shipper', desc: 'Giao hàng đơn' },
                    { id: 'ADMIN', label: '👑 Quản Trị & Kho', desc: 'Quản lý kho tồn & bán hàng' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, role: r.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        newUserForm.role === r.id
                          ? 'border-[#00E5FF] bg-[#00E5FF]/15 text-[#00E5FF] ring-1 ring-[#00E5FF]/40'
                          : 'border-[#1F2937] bg-[#0B0F14] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">{r.label}</div>
                      <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-[#1F2937] text-white rounded-xl hover:bg-[#374151] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-extrabold rounded-xl shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADMIN PHÂN CÔNG SHIPPER CHO ĐƠN HÀNG ================= */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Chỉ Định & Xếp Shipper Cho Đơn #{assignModalOrder.orderCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOrder(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1F2937] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Order Details */}
            <div className="p-3.5 rounded-xl bg-[#0B0F14] border border-[#1F2937] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Khách nhận:</span>
                <span className="font-bold text-white">{assignModalOrder.fullName} - {assignModalOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Địa chỉ giao:</span>
                <span className="text-gray-300 text-right max-w-xs truncate">
                  {assignModalOrder.address}, {assignModalOrder.district}, {assignModalOrder.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tổng tiền COD:</span>
                <span className="font-extrabold text-[#00E5FF]">
                  {assignModalOrder.total.toLocaleString('vi-VN')} ₫ ({assignModalOrder.paymentMethod})
                </span>
              </div>
            </div>

            {/* Shippers List to pick from */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300">
                Chọn Shipper phụ trách giao đơn hàng này:
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {shippersList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500 bg-[#0B0F14] rounded-xl">
                    Chưa có tài khoản Shipper nào. Bạn có thể tạo thêm ở tab Người Dùng hoặc Đội ngũ Shipper.
                  </div>
                ) : (
                  shippersList.map((s) => {
                    const isSelected = selectedShipperId === s.id;
                    const isBusyWithOther = !s.isAvailable && s.activeOrder?.id !== assignModalOrder.id;

                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedShipperId(s.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                            : 'border-[#1F2937] bg-[#0B0F14] hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="selectedShipper"
                            checked={isSelected}
                            onChange={() => setSelectedShipperId(s.id)}
                            className="accent-emerald-400 cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{s.fullName}</span>
                              {assignModalOrder.shipperId === s.id && (
                                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1 rounded font-normal">
                                  (Hiện tại)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              {s.phone || '0901234567'} &bull; Đã hoàn tất: {s.completedDeliveriesCount} đơn
                            </div>
                          </div>
                        </div>

                        <div>
                          {s.isAvailable ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              🟢 Rảnh rỗi
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              🟡 Bận #{s.activeOrder?.orderCode}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1F2937]">
              {assignModalOrder.shipperId ? (
                <button
                  type="button"
                  disabled={assignLoading}
                  onClick={() => handleAssignShipper(assignModalOrder.id, 'unassign')}
                  className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  Gỡ Shipper khỏi đơn
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOrder(null)}
                  className="px-4 py-2 bg-[#1F2937] text-gray-300 text-xs rounded-xl hover:bg-[#374151] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!selectedShipperId || assignLoading}
                  onClick={() => handleAssignShipper(assignModalOrder.id, selectedShipperId)}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {assignLoading ? 'Đang xếp...' : 'Xác Nhận Xếp Shipper'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
