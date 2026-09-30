import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';
import { useAuth } from './AuthContext.tsx';

interface WishlistContextType {
  wishlist: Product[];
  count: number;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const { user } = useAuth();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.getWishlist();
      if (res.success && res.data) {
        setWishlist(res.data);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    try {
      const res = await api.toggleWishlist(product.id);
      if (res.success && res.data) {
        setWishlist(res.data);
        if (res.inWishlist) {
          success(`Đã thêm "${product.name.slice(0, 30)}..." vào danh sách yêu thích`, 'Yêu thích');
        } else {
          success('Đã bỏ sản phẩm khỏi danh sách yêu thích');
        }
      }
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật danh sách yêu thích');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await api.toggleWishlist(productId);
      if (res.success && res.data) {
        setWishlist(res.data);
        success('Đã xóa khỏi danh sách yêu thích');
      }
    } catch (err: any) {
      error(err.message || 'Không thể xóa sản phẩm khỏi yêu thích');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        count: wishlist.length,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
