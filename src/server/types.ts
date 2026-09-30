export type Role = 'USER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'MOCK_EWALLET';

export interface User {
  id: string;
  email: string;
  password: string; // bcrypt hash
  fullName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount: number; // percentage
  stock: number;
  soldCount: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEndsAt?: string;

  categoryId: string;
  categorySlug: string;
  brandId: string;
  brandName: string;

  // PC Builder & Hardware compatibility specs
  socket?: string; // AM5, LGA1700, LGA1851, AM4
  ramType?: string; // DDR5, DDR4
  formFactor?: string; // ATX, Micro-ATX, Mini-ITX
  wattage?: number; // TDP (e.g. 65W, 250W) or PSU rating (e.g. 750, 850)
  vram?: string; // 8GB, 12GB, 16GB, 24GB GDDR6X
  storageType?: string; // NVMe M.2 Gen4, SATA 3
  specifications: Record<string, string>;

  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderCode: string;
  userId?: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}
