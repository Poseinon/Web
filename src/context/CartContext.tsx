import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  appliedCoupon: Coupon | null;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const { success, error } = useToast();
  const { user } = useAuth();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const res = await api.addToCart(product.id, quantity);
      if (res.success && res.data) {
        setItems(res.data);
        success(`Đã thêm "${product.name.slice(0, 32)}..." vào giỏ hàng`, 'Giỏ hàng');
      }
    } catch (err: any) {
      error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng', 'Lỗi');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await api.updateCartItem(itemId, quantity);
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật số lượng', 'Lỗi');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await api.removeCartItem(itemId);
      if (res.success && res.data) {
        setItems(res.data);
        success('Đã xóa sản phẩm khỏi giỏ hàng', 'Giỏ hàng');
      }
    } catch (err: any) {
      error(err.message || 'Không thể xóa sản phẩm', 'Lỗi');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setItems([]);
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  // Subtotal calculation
  const subtotal = items.reduce((sum, item) => {
    const price = item.product ? item.product.price : 0;
    return sum + price * item.quantity;
  }, 0);

  // Free shipping on orders over 10.000.000 VND or if coupon is FREESHIP
  const shippingFee = subtotal === 0 || subtotal >= 10000000 || appliedCoupon?.code === 'FREESHIP' ? 0 : 30000;

  // Re-verify coupon discount if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < appliedCoupon.minOrderValue) {
        setAppliedCoupon(null);
        setDiscountAmount(0);
      } else {
        if (appliedCoupon.discountType === 'PERCENTAGE') {
          let disc = (subtotal * appliedCoupon.discountValue) / 100;
          if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) {
            disc = appliedCoupon.maxDiscount;
          }
          setDiscountAmount(disc);
        } else {
          setDiscountAmount(appliedCoupon.discountValue);
        }
      }
    }
  }, [subtotal, appliedCoupon]);

  const total = Math.max(0, subtotal + shippingFee - discountAmount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discountAmount);
        success(`Áp dụng mã ${res.coupon.code} thành công! Giảm ${res.discountAmount.toLocaleString('vi-VN')}₫`, 'Ưu đãi');
        return true;
      }
      return false;
    } catch (err: any) {
      error(err.message || 'Mã giảm giá không hợp lệ', 'Lỗi mã giảm giá');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    success('Đã hủy áp dụng mã giảm giá');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingFee,
        discountAmount,
        total,
        appliedCoupon,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
