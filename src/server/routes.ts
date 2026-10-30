import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.ts';
import {
  authenticate,
  requireAuth,
  requireAdmin,
  generateToken,
  AuthenticatedRequest
} from './auth.ts';
import { Product, OrderStatus, PaymentMethod } from './types.ts';

const api = Router();

// Helper to determine customer identity (either authenticated user or guest session)
function getUserId(req: AuthenticatedRequest): string {
  if (req.user && req.user.userId) {
    return req.user.userId;
  }
  const guestHeader = req.headers['x-guest-id'] as string;
  return guestHeader || 'guest-session-default';
}

// ================= AUTH ROUTES =================
api.post('/auth/register', async (req, res: Response) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký trong hệ thống' });
    }

    // Chỉ cho phép đăng ký công khai 2 vai trò: Khách hàng (USER) hoặc Shipper (SHIPPER)
    const validRegistrationRoles = ['USER', 'SHIPPER'];
    const assignedRole = role && validRegistrationRoles.includes(role) ? role : 'USER';

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = db.createUser({
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      fullName,
      phone: phone || '',
      role: assignedRole,
      avatar: assignedRole === 'SHIPPER'
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
        : assignedRole === 'SELLER'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : assignedRole === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const { password: _, ...userData } = newUser;
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký tài khoản' });
  }
});

api.post('/auth/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const { password: _, ...userData } = user;
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập' });
  }
});

api.get('/auth/me', authenticate, requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }
  const { password: _, ...userData } = user;
  res.json({ success: true, user: userData });
});

api.put('/auth/profile', authenticate, requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { fullName, phone, avatar } = req.body;
  const updated = db.updateUser(req.user!.userId, { fullName, phone, avatar });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }
  const { password: _, ...userData } = updated;
  res.json({ success: true, message: 'Cập nhật thông tin thành công', user: userData });
});

api.put('/auth/password', authenticate, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu cũ và mới' });
  }
  const user = db.findUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  db.updateUser(user.id, { password: hashed });
  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
});

// ================= CATEGORIES & BRANDS =================
api.get('/categories', (_req, res) => {
  res.json({ success: true, data: db.getCategories() });
});

api.get('/brands', (_req, res) => {
  res.json({ success: true, data: db.getBrands() });
});

// ================= PRODUCTS =================
api.get('/products', (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    socket,
    ramType,
    inStock,
    isFeatured,
    isFlashSale,
    sort,
    page,
    limit
  } = req.query;

  const result = db.getProducts({
    search: search ? String(search) : undefined,
    category: category ? String(category) : undefined,
    brand: brand ? String(brand) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    socket: socket ? String(socket) : undefined,
    ramType: ramType ? String(ramType) : undefined,
    inStock: inStock === 'true',
    isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
    isFlashSale: isFlashSale !== undefined ? isFlashSale === 'true' : undefined,
    sort: sort as any,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 12
  });

  res.json({ success: true, ...result });
});

api.get('/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
  }
  res.json({ success: true, data: product });
});

// Admin Product CRUD
api.post('/products', authenticate, requireAdmin, (req, res) => {
  const body = req.body;
  if (!body.name || !body.price || !body.categorySlug) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc của sản phẩm' });
  }

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const sku = body.sku || `SKU-${Date.now()}`;

  const newProduct: Product = {
    ...body,
    id: `prod-${Date.now()}`,
    slug,
    sku,
    images: body.images && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'],
    rating: 5.0,
    reviewCount: 0,
    soldCount: 0,
    stock: body.stock !== undefined ? Number(body.stock) : 10,
    specifications: body.specifications || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const created = db.createProduct(newProduct);
  res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: created });
});

api.put('/products/:id', authenticate, requireAdmin, (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm cần cập nhật' });
  }
  res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: updated });
});

api.delete('/products/:id', authenticate, requireAdmin, (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để xóa' });
  }
  res.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
});

// Admin Stock / Inventory Adjustment Endpoint
api.patch('/products/:id/stock', authenticate, requireAdmin, (req, res) => {
  const { stock, delta } = req.body;
  const prod = db.getProductById(req.params.id);
  if (!prod) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
  }
  let newStock = prod.stock;
  if (stock !== undefined) {
    newStock = Math.max(0, Number(stock));
  } else if (delta !== undefined) {
    newStock = Math.max(0, prod.stock + Number(delta));
  }
  const updated = db.updateProduct(prod.id, { stock: newStock });
  res.json({
    success: true,
    message: `Đã cập nhật tồn kho cho "${prod.name}" thành ${newStock}`,
    data: updated
  });
});

// ================= CART =================
api.get('/cart', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const items = db.getCart(userId);
  res.json({ success: true, data: items });
});

api.post('/cart', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const { productId, quantity = 1 } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Thiếu productId' });
  }
  const items = db.addToCart(userId, productId, Number(quantity));
  res.json({ success: true, message: 'Đã thêm vào giỏ hàng', data: items });
});

api.put('/cart/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const { quantity } = req.body;
  const items = db.updateCartItem(userId, req.params.id, Number(quantity));
  res.json({ success: true, data: items });
});

api.delete('/cart/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const items = db.removeFromCart(userId, req.params.id);
  res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng', data: items });
});

api.delete('/cart', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  db.clearCart(userId);
  res.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng', data: [] });
});

// ================= WISHLIST =================
api.get('/wishlist', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const items = db.getWishlist(userId);
  res.json({ success: true, data: items });
});

api.post('/wishlist', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Thiếu productId' });
  }
  const result = db.toggleWishlist(userId, productId);
  res.json({
    success: true,
    message: result.inWishlist ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích',
    inWishlist: result.inWishlist,
    data: result.wishlist
  });
});

api.delete('/wishlist/:productId', authenticate, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const result = db.toggleWishlist(userId, req.params.productId);
  res.json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích', data: result.wishlist });
});

// ================= ORDERS =================
api.post('/orders', authenticate, (req: AuthenticatedRequest, res) => {
  const {
    fullName,
    phone,
    email,
    address,
    city,
    district,
    ward,
    note,
    paymentMethod = 'COD',
    couponCode,
    items,
    shippingFee = 30000
  } = req.body;

  if (!fullName || !phone || !email || !address || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng và sản phẩm' });
  }

  // Calculate totals
  const subtotal = items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
  let discountAmount = 0;

  if (couponCode) {
    const couponRes = db.validateCoupon(couponCode, subtotal);
    if (couponRes.valid) {
      discountAmount = couponRes.discountAmount;
    }
  }

  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const newOrder = db.createOrder({
    userId: req.user ? req.user.userId : null,
    status: 'PENDING' as OrderStatus,
    paymentMethod: paymentMethod as PaymentMethod,
    paymentStatus: paymentMethod === 'BANK_TRANSFER' ? 'UNPAID' : 'UNPAID',
    fullName,
    phone,
    email,
    address,
    city: city || 'Hồ Chí Minh',
    district: district || '',
    ward: ward || '',
    note,
    items,
    subtotal,
    shippingFee,
    discountAmount,
    couponCode: couponCode || undefined,
    total: finalTotal
  });

  // If user is authenticated or guest, clear their cart
  const userId = getUserId(req);
  db.clearCart(userId);

  res.status(201).json({
    success: true,
    message: 'Đặt hàng thành công!',
    order: newOrder
  });
});

api.get('/orders', authenticate, (req: AuthenticatedRequest, res) => {
  if (req.user && req.user.role === 'ADMIN') {
    return res.json({ success: true, data: db.getAllOrders() });
  }
  const userId = getUserId(req);
  const orders = db.getOrdersByUser(userId);
  res.json({ success: true, data: orders });
});

api.get('/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  }
  res.json({ success: true, data: order });
});

api.put('/orders/:id/status', authenticate, requireAdmin, (req, res) => {
  const { status } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  }
  res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công', data: updated });
});

// ================= REVIEWS =================
api.get('/products/:id/reviews', (req, res) => {
  const reviews = db.getReviewsByProductId(req.params.id);
  res.json({ success: true, data: reviews });
});

api.post('/products/:id/reviews', authenticate, (req: AuthenticatedRequest, res) => {
  const { rating, comment, userName } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số sao đánh giá và nội dung nhận xét' });
  }

  const userId = req.user ? req.user.userId : `guest-${Date.now()}`;
  const user = req.user ? db.findUserById(req.user.userId) : null;

  const newReview = db.addReview({
    productId: req.params.id,
    userId,
    userName: user ? user.fullName : (userName || 'Khách hàng ẩn danh'),
    userAvatar: user?.avatar,
    rating: Number(rating),
    comment
  });

  res.status(201).json({ success: true, message: 'Đánh giá đã được gửi thành công!', data: newReview });
});

// ================= COUPONS =================
api.post('/coupons/validate', (req, res) => {
  const { code, subtotal = 0 } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá' });
  }
  const result = db.validateCoupon(code, Number(subtotal));
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message });
  }
  res.json({
    success: true,
    message: 'Áp dụng mã giảm giá thành công!',
    discountAmount: result.discountAmount,
    coupon: result.coupon
  });
});

// ================= ADMIN DASHBOARD =================
api.get('/admin/dashboard', authenticate, requireAdmin, (_req, res) => {
  const stats = db.getAdminDashboard();
  res.json({ success: true, data: stats });
});

api.get('/admin/users', authenticate, requireAdmin, (_req, res) => {
  const users = db.getAllUsers();
  res.json({ success: true, data: users });
});

// Admin change user role
api.put('/admin/users/:id/role', authenticate, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!['USER', 'SELLER', 'SHIPPER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ' });
  }
  const updated = db.updateUser(req.params.id, { role });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }
  res.json({ success: true, message: `Đã đổi vai trò thành ${role}`, data: updated });
});

// Admin create user with any role
api.post('/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp họ tên, email và mật khẩu' });
    }
    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email này đã tồn tại trong hệ thống' });
    }
    const validRoles = ['USER', 'SHIPPER', 'SELLER', 'ADMIN'];
    const assignedRole = role && validRoles.includes(role) ? role : 'USER';
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = db.createUser({
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      fullName,
      phone: phone || '',
      role: assignedRole,
      avatar: assignedRole === 'SHIPPER'
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
        : assignedRole === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : assignedRole === 'SELLER'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const { password: _, ...userData } = newUser;
    res.status(201).json({ success: true, message: 'Tạo tài khoản thành công', data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo người dùng' });
  }
});

// Admin delete user
api.delete('/admin/users/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res) => {
  if (req.user && req.user.userId === req.params.id) {
    return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản của chính bạn đang đăng nhập' });
  }
  const deleted = db.deleteUser(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để xóa' });
  }
  res.json({ success: true, message: 'Đã xóa tài khoản thành công' });
});

api.get('/admin/orders', authenticate, requireAdmin, (_req, res) => {
  const orders = db.getAllOrders();
  res.json({ success: true, data: orders });
});

// Admin assign/change shipper for an order
api.put('/admin/orders/:id/assign-shipper', authenticate, requireAdmin, (req, res) => {
  const { shipperId } = req.body;
  const orderId = req.params.id;

  if (!shipperId || shipperId === 'unassign') {
    const unassigned = db.unassignShipper(orderId);
    if (!unassigned) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    return res.json({
      success: true,
      message: 'Đã hủy phân công shipper. Đơn hàng chuyển về trạng thái ĐÃ XÁC NHẬN (chờ điều phối mới).',
      data: unassigned
    });
  }

  const shipper = db.findUserById(shipperId);
  if (!shipper || !['SHIPPER', 'ADMIN'].includes(shipper.role)) {
    return res.status(400).json({ success: false, message: 'Tài khoản được chọn không phải là Shipper hợp lệ' });
  }

  // Check if shipper currently has another order in delivery
  const existingActive = db.getShipperActiveOrder(shipperId);
  const isCurrentlyOnThisOrder = existingActive && (existingActive.id === orderId || existingActive.orderCode === orderId);

  const updated = db.assignShipper(
    orderId,
    shipper.id,
    shipper.fullName,
    shipper.phone || '0901234567'
  );

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  }

  let note = `Đã phân công thành công Shipper "${shipper.fullName}" cho đơn hàng #${updated.orderCode}.`;
  if (existingActive && !isCurrentlyOnThisOrder) {
    note += ` (Lưu ý: Shipper này cũng đang có đơn #${existingActive.orderCode} đang giao).`;
  }

  res.json({
    success: true,
    message: note,
    data: updated
  });
});

// Admin get all shippers with live status
api.get('/admin/shippers', authenticate, requireAdmin, (_req, res) => {
  const shippers = db.getShippersWithStats();
  res.json({ success: true, data: shippers });
});

// ================= SHIPPER PORTAL ROUTES =================
api.get('/shipper/orders', authenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user || !['SHIPPER', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Quyền truy cập dành riêng cho Shipper' });
  }
  const orders = db.getShipperOrders();
  const activeOrder = db.getShipperActiveOrder(req.user.userId);
  res.json({
    success: true,
    data: orders,
    activeOrder: activeOrder || null,
    isAvailable: !activeOrder
  });
});

api.put('/shipper/orders/:id/claim', authenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user || !['SHIPPER', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Quyền truy cập dành riêng cho Shipper' });
  }

  // Rule 1: Shipper only allowed 1 active delivering order at a time!
  const activeOrder = db.getShipperActiveOrder(req.user.userId);
  if (activeOrder && activeOrder.id !== req.params.id && activeOrder.orderCode !== req.params.id) {
    return res.status(400).json({
      success: false,
      message: `Bạn đang có đơn hàng #${activeOrder.orderCode} đang trong tiến trình giao! Theo quy chế TechZone, bạn phải giao xong đơn này mới được nhận đơn tiếp theo.`
    });
  }

  // Check if order exists and is available
  const targetOrder = db.getOrderById(req.params.id);
  if (!targetOrder) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  }

  if (targetOrder.shipperId && targetOrder.shipperId !== req.user.userId) {
    return res.status(400).json({
      success: false,
      message: `Đơn hàng này đã được phân công/tiếp nhận bởi Shipper ${targetOrder.shipperName || 'khác'}!`
    });
  }

  if (targetOrder.status === 'DELIVERED') {
    return res.status(400).json({ success: false, message: 'Đơn hàng này đã giao hoàn tất trước đó' });
  }

  if (targetOrder.status === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'Đơn hàng này đã bị hủy, không thể nhận giao' });
  }

  const user = db.findUserById(req.user.userId);
  const updated = db.assignShipper(
    req.params.id,
    req.user.userId,
    user?.fullName || 'Shipper TechZone',
    user?.phone || '0901234567'
  );

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Không thể nhận đơn hàng' });
  }

  res.json({
    success: true,
    message: `Đã nhận đơn #${updated.orderCode} thành công! Đơn hàng đã chuyển sang trạng thái ĐANG GIAO. Hãy tiến hành giao cho khách.`,
    data: updated
  });
});

api.put('/shipper/orders/:id/status', authenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user || !['SHIPPER', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Quyền truy cập dành riêng cho Shipper' });
  }
  const { status, deliveryNotes } = req.body;
  if (!['SHIPPING', 'DELIVERED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Trạng thái giao hàng không hợp lệ' });
  }
  const updated = db.updateShipperOrderStatus(req.params.id, status, deliveryNotes);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  }
  res.json({
    success: true,
    message: status === 'DELIVERED'
      ? 'Chúc mừng bạn đã giao đơn thành công! Bạn hiện đang rảnh và sẵn sàng nhận đơn tiếp theo.'
      : 'Đã cập nhật trạng thái đơn hàng.',
    data: updated
  });
});

// ================= SELLER PORTAL ROUTES =================
api.get('/seller/dashboard', authenticate, (req: AuthenticatedRequest, res) => {
  if (!req.user || !['SELLER', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Quyền truy cập dành riêng cho Người bán hàng' });
  }
  const data = db.getSellerDashboard();
  res.json({ success: true, data });
});

export default api;
