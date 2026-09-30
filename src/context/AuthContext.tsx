import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { fullName: string; phone?: string; avatar?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('techzone_token'));
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem('techzone_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to authenticate token:', err);
        localStorage.removeItem('techzone_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('techzone_token', res.token);
        setToken(res.token);
        setUser(res.user);
        success(`Chào mừng trở lại, ${res.user.fullName}!`, 'Đăng nhập thành công');
        return true;
      }
      return false;
    } catch (err: any) {
      error(err.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại thông tin', 'Lỗi đăng nhập');
      return false;
    }
  };

  const register = async (fullName: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const res = await api.register({ fullName, email, password, phone });
      if (res.success && res.token) {
        localStorage.setItem('techzone_token', res.token);
        setToken(res.token);
        setUser(res.user);
        success(`Tài khoản của bạn đã được tạo thành công!`, 'Đăng ký thành công');
        return true;
      }
      return false;
    } catch (err: any) {
      error(err.message || 'Đăng ký thất bại, vui lòng thử lại', 'Lỗi đăng ký');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('techzone_token');
    setToken(null);
    setUser(null);
    success('Bạn đã đăng xuất khỏi tài khoản an toàn.', 'Đăng xuất thành công');
  };

  const updateProfile = async (data: { fullName: string; phone?: string; avatar?: string }): Promise<boolean> => {
    try {
      const res = await api.updateProfile(data);
      if (res.success && res.user) {
        setUser(res.user);
        success('Thông tin tài khoản đã được cập nhật!', 'Thành công');
        return true;
      }
      return false;
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật thông tin', 'Lỗi');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
