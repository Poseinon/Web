export type Role = 'USER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'MOCK_EWALLET';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  createdAt: string;
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
  discount: number;
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

  socket?: string;
  ramType?: string;
  formFactor?: string;
  wattage?: number;
  vram?: string;
  storageType?: string;
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
  isActive: boolean;
}

export interface PCBuildState {
  cpu?: Product;
  mainboard?: Product;
  ram?: Product;
  gpu?: Product;
  ssd?: Product;
  psu?: Product;
  case?: Product;
  cooler?: Product;
}
