import fs from 'fs';
import path from 'path';
import {
  User,
  Product,
  Category,
  Brand,
  CartItem,
  Order,
  Review,
  Coupon,
  OrderStatus
} from './types.ts';
import {
  initialUsers,
  initialCategories,
  initialBrands,
  initialProducts,
  initialCoupons,
  initialOrders,
  initialReviews
} from './seedData.ts';

interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Category[];
  brands: Brand[];
  carts: Record<string, CartItem[]>; // userId -> CartItem[]
  wishlists: Record<string, string[]>; // userId -> productId[]
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class DatabaseEngine {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load db.json, initializing fresh seed:', e);
    }

    const defaultDb: DatabaseSchema = {
      users: initialUsers,
      products: initialProducts,
      categories: initialCategories,
      brands: initialBrands,
      carts: {
        'user-customer-1': []
      },
      wishlists: {
        'user-customer-1': ['prod-gpu-1', 'prod-mon-1']
      },
      orders: initialOrders,
      reviews: initialReviews,
      coupons: initialCoupons
    };

    this.saveData(defaultDb);
    return defaultDb;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database to file:', e);
    }
  }

  // ================= USERS =================
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveData();
    return this.data.users[idx];
  }

  getAllUsers(): Omit<User, 'password'>[] {
    return this.data.users.map(({ password, ...u }) => u);
  }

  // ================= CATEGORIES & BRANDS =================
  getCategories(): Category[] {
    return this.data.categories;
  }

  getBrands(): Brand[] {
    return this.data.brands;
  }

  // ================= PRODUCTS =================
  getProducts(params?: {
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    socket?: string;
    ramType?: string;
    inStock?: boolean;
    isFeatured?: boolean;
    isFlashSale?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'rating' | 'sold' | 'newest';
    page?: number;
    limit?: number;
  }) {
    let result = [...this.data.products];

    if (params) {
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
        page = 1,
        limit = 12
      } = params;

      if (search) {
        const q = search.toLowerCase().trim();
        result = result.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }

      if (category && category !== 'all') {
        result = result.filter(p => p.categorySlug === category || p.categoryId === category);
      }

      if (brand && brand !== 'all') {
        result = result.filter(p => p.brandId === brand || p.brandName.toLowerCase() === brand.toLowerCase());
      }

      if (minPrice !== undefined && !isNaN(minPrice)) {
        result = result.filter(p => p.price >= minPrice);
      }

      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        result = result.filter(p => p.price <= maxPrice);
      }

      if (socket) {
        result = result.filter(p => p.socket && p.socket.toLowerCase() === socket.toLowerCase());
      }

      if (ramType) {
        result = result.filter(p => p.ramType && p.ramType.toLowerCase() === ramType.toLowerCase());
      }

      if (inStock) {
        result = result.filter(p => p.stock > 0);
      }

      if (isFeatured !== undefined) {
        result = result.filter(p => p.isFeatured === isFeatured);
      }

      if (isFlashSale !== undefined) {
        result = result.filter(p => p.isFlashSale === isFlashSale);
      }

      // Sorting
      if (sort === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'sold') {
        result.sort((a, b) => b.soldCount - a.soldCount);
      } else {
        // newest
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const total = result.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedItems = result.slice(startIndex, startIndex + limit);

      return {
        products: paginatedItems,
        total,
        page,
        totalPages,
        limit
      };
    }

    return {
      products: result,
      total: result.length,
      page: 1,
      totalPages: 1,
      limit: result.length
    };
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.slug === id);
  }

  createProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.saveData();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length < initLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // ================= CART =================
  getCart(userId: string): CartItem[] {
    const items = this.data.carts[userId] || [];
    // Populate product details
    return items.map(item => {
      const prod = this.getProductById(item.productId);
      return {
        ...item,
        product: prod
      };
    }).filter(item => item.product !== undefined);
  }

  addToCart(userId: string, productId: string, quantity: number = 1): CartItem[] {
    if (!this.data.carts[userId]) {
      this.data.carts[userId] = [];
    }
    const cart = this.data.carts[userId];
    const existing = cart.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId,
        quantity
      });
    }
    this.saveData();
    return this.getCart(userId);
  }

  updateCartItem(userId: string, itemId: string, quantity: number): CartItem[] {
    const cart = this.data.carts[userId] || [];
    const item = cart.find(i => i.id === itemId || i.productId === itemId);
    if (item) {
      if (quantity <= 0) {
        this.data.carts[userId] = cart.filter(i => i !== item);
      } else {
        item.quantity = quantity;
      }
      this.saveData();
    }
    return this.getCart(userId);
  }

  removeFromCart(userId: string, itemId: string): CartItem[] {
    const cart = this.data.carts[userId] || [];
    this.data.carts[userId] = cart.filter(i => i.id !== itemId && i.productId !== itemId);
    this.saveData();
    return this.getCart(userId);
  }

  clearCart(userId: string): void {
    this.data.carts[userId] = [];
    this.saveData();
  }

  // ================= WISHLIST =================
  getWishlist(userId: string): Product[] {
    const ids = this.data.wishlists[userId] || [];
    return ids.map(id => this.getProductById(id)).filter(Boolean) as Product[];
  }

  toggleWishlist(userId: string, productId: string): { inWishlist: boolean; wishlist: Product[] } {
    if (!this.data.wishlists[userId]) {
      this.data.wishlists[userId] = [];
    }
    const list = this.data.wishlists[userId];
    const idx = list.indexOf(productId);
    let inWishlist = false;
    if (idx > -1) {
      list.splice(idx, 1);
      inWishlist = false;
    } else {
      list.push(productId);
      inWishlist = true;
    }
    this.saveData();
    return { inWishlist, wishlist: this.getWishlist(userId) };
  }

  // ================= ORDERS =================
  createOrder(orderData: Omit<Order, 'id' | 'orderCode' | 'createdAt' | 'updatedAt'>): Order {
    const orderCode = `TZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update stock and sold counts
    for (const item of newOrder.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.soldCount += item.quantity;
      }
    }

    this.data.orders.unshift(newOrder);
    this.saveData();
    return newOrder;
  }

  getOrdersByUser(userId: string): Order[] {
    return this.data.orders.filter(o => o.userId === userId);
  }

  getAllOrders(): Order[] {
    return this.data.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderCode === id);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
    const order = this.data.orders.find(o => o.id === orderId || o.orderCode === orderId);
    if (!order) return undefined;
    order.status = status;
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }
    order.updatedAt = new Date().toISOString();
    this.saveData();
    return order;
  }

  // ================= REVIEWS =================
  getReviewsByProductId(productId: string): Review[] {
    return this.data.reviews.filter(r => r.productId === productId);
  }

  addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.unshift(newReview);

    // recalculate product rating
    const prodReviews = this.data.reviews.filter(r => r.productId === reviewData.productId);
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prod = this.data.products.find(p => p.id === reviewData.productId);
    if (prod) {
      prod.rating = parseFloat(avg.toFixed(1));
      prod.reviewCount = prodReviews.length;
    }

    this.saveData();
    return newReview;
  }

  // ================= COUPONS =================
  validateCoupon(code: string, cartTotal: number): { valid: boolean; message?: string; coupon?: Coupon; discountAmount: number } {
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
    if (!coupon) {
      return { valid: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn', discountAmount: 0 };
    }

    if (cartTotal < coupon.minOrderValue) {
      return {
        valid: false,
        message: `Mã áp dụng cho đơn hàng từ ${coupon.minOrderValue.toLocaleString('vi-VN')}₫ trở lên`,
        discountAmount: 0
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return { valid: true, coupon, discountAmount };
  }

  // ================= ADMIN ANALYTICS =================
  getAdminDashboard() {
    const totalRevenue = this.data.orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = this.data.orders.length;
    const totalProducts = this.data.products.length;
    const totalCustomers = this.data.users.filter(u => u.role === 'USER').length;

    // Revenue timeline (last 7 days or months)
    const revenueByMonth = [
      { name: 'Tháng 1', revenue: 45000000, orders: 12 },
      { name: 'Tháng 2', revenue: 58000000, orders: 18 },
      { name: 'Tháng 3', revenue: 72000000, orders: 24 },
      { name: 'Tháng 4', revenue: 89000000, orders: 30 },
      { name: 'Tháng 5', revenue: 110000000, orders: 42 },
      { name: 'Tháng 6', revenue: totalRevenue > 0 ? totalRevenue : 125000000, orders: totalOrders }
    ];

    // Category distribution
    const categoryCount: Record<string, number> = {};
    for (const p of this.data.products) {
      categoryCount[p.categorySlug] = (categoryCount[p.categorySlug] || 0) + 1;
    }

    const salesByCategory = Object.entries(categoryCount).map(([slug, count]) => {
      const cat = this.data.categories.find(c => c.slug === slug);
      return {
        name: cat ? cat.name.split(' - ')[0] : slug,
        count
      };
    });

    const topProducts = [...this.data.products]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        soldCount: p.soldCount,
        stock: p.stock,
        image: p.images[0]
      }));

    const recentOrders = this.data.orders.slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      revenueByMonth,
      salesByCategory,
      topProducts,
      recentOrders
    };
  }
}

export const db = new DatabaseEngine();
