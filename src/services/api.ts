import { Product, Category, Brand, CartItem, Order, Review, User, Coupon } from '../types/index.ts';

const API_BASE = '/api';

function getGuestId(): string {
  let guestId = localStorage.getItem('techzone_guest_id');
  if (!guestId) {
    guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('techzone_guest_id', guestId);
  }
  return guestId;
}

function getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
  const token = localStorage.getItem('techzone_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-guest-id': getGuestId(),
    ...customHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Lỗi yêu cầu: ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    return handleResponse<{ success: boolean; token: string; user: User; message: string }>(res);
  },

  async register(data: { fullName: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; token: string; user: User; message: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; user: User }>(res);
  },

  async updateProfile(data: { fullName: string; phone?: string; avatar?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; user: User; message: string }>(res);
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await fetch(`${API_BASE}/auth/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Categories & Brands
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<{ success: boolean; data: Category[] }>(res);
  },

  async getBrands() {
    const res = await fetch(`${API_BASE}/brands`);
    return handleResponse<{ success: boolean; data: Brand[] }>(res);
  },

  // Products
  async getProducts(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return handleResponse<{
      success: boolean;
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }>(res);
  },

  async getProduct(idOrSlug: string) {
    const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
    return handleResponse<{ success: boolean; data: Product }>(res);
  },

  async createProduct(product: Partial<Product>) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product)
    });
    return handleResponse<{ success: boolean; message: string; data: Product }>(res);
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse<{ success: boolean; message: string; data: Product }>(res);
  },

  async deleteProduct(id: string) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Cart
  async getCart() {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; data: CartItem[] }>(res);
  },

  async addToCart(productId: string, quantity: number = 1) {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
    return handleResponse<{ success: boolean; message: string; data: CartItem[] }>(res);
  },

  async updateCartItem(itemId: string, quantity: number) {
    const res = await fetch(`${API_BASE}/cart/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ quantity })
    });
    return handleResponse<{ success: boolean; data: CartItem[] }>(res);
  },

  async removeCartItem(itemId: string) {
    const res = await fetch(`${API_BASE}/cart/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; message: string; data: CartItem[] }>(res);
  },

  async clearCart() {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; message: string; data: CartItem[] }>(res);
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; data: Product[] }>(res);
  },

  async toggleWishlist(productId: string) {
    const res = await fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId })
    });
    return handleResponse<{ success: boolean; message: string; inWishlist: boolean; data: Product[] }>(res);
  },

  // Orders
  async createOrder(orderData: any) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse<{ success: boolean; message: string; order: Order }>(res);
  },

  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; data: Order[] }>(res);
  },

  async getOrder(id: string) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; data: Order }>(res);
  },

  async updateOrderStatus(orderId: string, status: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse<{ success: boolean; message: string; data: Order }>(res);
  },

  // Reviews
  async getReviews(productId: string) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`);
    return handleResponse<{ success: boolean; data: Review[] }>(res);
  },

  async submitReview(productId: string, data: { rating: number; comment: string; userName?: string }) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; message: string; data: Review }>(res);
  },

  // Coupons
  async validateCoupon(code: string, subtotal: number) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, subtotal })
    });
    return handleResponse<{ success: boolean; message: string; discountAmount: number; coupon: Coupon }>(res);
  },

  // Admin
  async getAdminDashboard() {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders()
    });
    return handleResponse<{ success: boolean; data: User[] }>(res);
  }
};
