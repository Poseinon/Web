import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types/index.ts';
import { useToast } from './ToastContext.tsx';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const { success, error } = useToast();

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  const addToCompare = (product: Product) => {
    if (isInCompare(product.id)) {
      setCompareList((prev) => prev.filter((p) => p.id !== product.id));
      success(`Đã xóa "${product.name.slice(0, 24)}..." khỏi danh sách so sánh`);
      return;
    }

    if (compareList.length >= 4) {
      error('Bạn chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc', 'Giới hạn so sánh');
      return;
    }

    setCompareList((prev) => [...prev, product]);
    success(`Đã thêm "${product.name.slice(0, 24)}..." vào so sánh (${compareList.length + 1}/4)`);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within CompareProvider');
  return context;
};
