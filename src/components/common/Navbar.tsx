import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Sun,
  Moon,
  Menu,
  X,
  Scale,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  PackageCheck,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCompare } from '../../context/CompareContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onNavigate, currentPage }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { compareList } = useCompare();
  const { theme, toggleTheme } = useTheme();

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('techzone_search_history');
      return saved ? JSON.parse(saved) : ['RTX 4070', 'Ryzen 7 7800X3D', 'SSD Samsung 990 Pro'];
    } catch {
      return [];
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debounced search autocomplete
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.getProducts({ search: searchTerm.trim(), limit: 5 });
        if (res.success && res.products) {
          setSuggestions(res.products);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent, customTerm?: string) => {
    if (e) e.preventDefault();
    const query = customTerm !== undefined ? customTerm : searchTerm;
    if (!query.trim()) return;

    // Save to history
    const updatedHistory = [query.trim(), ...searchHistory.filter((item) => item !== query.trim())].slice(0, 6);
    setSearchHistory(updatedHistory);
    localStorage.setItem('techzone_search_history', JSON.stringify(updatedHistory));

    setShowSearchDropdown(false);
    onNavigate('products', { search: query.trim() });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B0F14]/90 dark:bg-[#0B0F14]/90 light:bg-white/90 border-b border-[#1F2937] light:border-gray-200 transition-colors">
      {/* Top micro bar for announcements */}
      <div className="bg-gradient-to-r from-[#00E5FF]/10 via-[#7C3AED]/15 to-[#00E5FF]/10 border-b border-[#1F2937]/50 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#00E5FF] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Siêu Sale Tháng Này: Nhập mã TECHZONE10 giảm ngay 10%
            </span>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden md:inline text-gray-400">Cam kết 100% linh kiện chính hãng bảo hành 36 tháng</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Hotline kỹ thuật: <strong className="text-white">1900 8899</strong> (8:00 - 21:30)</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* LOGO */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] p-0.5 shadow-lg shadow-[#00E5FF]/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#0B0F14] rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#00E5FF] group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-2xl tracking-wider text-white flex items-center gap-1">
              <span>TECH</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#a78bfa]">
                ZONE
              </span>
            </div>
            <div className="text-[10px] tracking-widest text-[#00E5FF] uppercase font-semibold -mt-1 hidden sm:block">
              ULTIMATE HARDWARE
            </div>
          </div>
        </div>

        {/* SEARCH BAR (Center) */}
        <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Tìm kiếm CPU, RTX 4070, RAM DDR5, Mainboard, Phụ kiện..."
              className="w-full bg-[#111827] text-gray-100 placeholder-gray-500 pl-11 pr-24 py-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] text-sm transition-all duration-200"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-[#00E5FF] to-[#00b4d8] text-black font-semibold text-xs rounded-lg hover:opacity-90 transition-opacity"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Autocomplete / History Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* If user typed search query */}
              {searchTerm.trim().length > 0 ? (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 border-b border-[#1F2937] flex items-center justify-between">
                    <span>Gợi ý sản phẩm ({suggestions.length})</span>
                    {isSearching && <span className="text-[#00E5FF]">Đang tìm...</span>}
                  </div>
                  {suggestions.length > 0 ? (
                    <div className="divide-y divide-[#1F2937]/50 max-h-80 overflow-y-auto">
                      {suggestions.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            onNavigate('product-detail', { id: p.slug });
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-[#1F2937]/50 cursor-pointer transition-colors"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-11 h-11 object-cover rounded-lg bg-[#0B0F14] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-200 font-medium truncate">{p.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-[#00E5FF]">
                                {p.price.toLocaleString('vi-VN')} ₫
                              </span>
                              {p.oldPrice && (
                                <span className="text-[11px] text-gray-500 line-through">
                                  {p.oldPrice.toLocaleString('vi-VN')} ₫
                                </span>
                              )}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                                {p.brandName}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div
                        onClick={() => handleSearchSubmit()}
                        className="p-3 text-center text-xs font-semibold text-[#00E5FF] hover:bg-[#1F2937] cursor-pointer"
                      >
                        Xem tất cả kết quả cho &quot;{searchTerm}&quot; →
                      </div>
                    </div>
                  ) : (
                    !isSearching && (
                      <div className="p-4 text-center text-xs text-gray-400">
                        Không tìm thấy sản phẩm phù hợp. Thử từ khóa khác xem sao!
                      </div>
                    )
                  )}
                </div>
              ) : (
                /* Search History & Hot trends */
                <div className="p-3">
                  <div className="text-xs font-semibold text-gray-400 mb-2">Tìm kiếm gần đây:</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {searchHistory.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchTerm(item);
                          handleSearchSubmit(undefined, item);
                        }}
                        className="px-2.5 py-1 text-xs bg-[#1F2937] hover:bg-[#374151] text-gray-300 rounded-lg transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-gray-400 mb-1.5 pt-2 border-t border-[#1F2937]">
                    Xu hướng tìm kiếm hot:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['RTX 4090', 'Core i7-14700K', 'B650 TOMAHAWK', 'RAM Corsair 32GB', 'Logitech G Pro X'].map((trend) => (
                      <button
                        key={trend}
                        onClick={() => {
                          setSearchTerm(trend);
                          handleSearchSubmit(undefined, trend);
                        }}
                        className="text-xs text-[#00E5FF] hover:underline"
                      >
                        🔥 {trend}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* NAVIGATION ACTIONS (Right) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* PC Builder Button with Glow */}
          <button
            onClick={() => onNavigate('pc-builder')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              currentPage === 'pc-builder'
                ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-lg shadow-[#00E5FF]/20'
                : 'bg-[#111827] border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/10'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>BUILD PC</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#00E5FF] text-black font-extrabold uppercase">
              HOT
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Chuyển chế độ giao diện"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1F2937] transition-colors"
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Compare Button */}
          <button
            onClick={() => onNavigate('compare')}
            className={`relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#1F2937] transition-colors ${
              currentPage === 'compare' ? 'bg-[#1F2937] text-[#00E5FF]' : ''
            }`}
            title="So sánh sản phẩm"
          >
            <Scale className="w-5 h-5" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#7C3AED] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-[#0B0F14]">
                {compareList.length}
              </span>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => onNavigate('profile', { tab: 'wishlist' })}
            className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#1F2937] transition-colors"
            title="Danh sách yêu thích"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-[#0B0F14]">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => onNavigate('cart')}
            className={`relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-[#00E5FF]/50 text-gray-200 transition-all ${
              currentPage === 'cart' ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF]' : ''
            }`}
            title="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5 text-[#00E5FF]" />
            <span className="hidden sm:inline text-xs font-semibold">Giỏ hàng</span>
            {itemCount > 0 && (
              <span className="w-5 h-5 bg-[#00E5FF] text-black text-xs font-black rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account / Auth Dropdown */}
          <div ref={userMenuRef} className="relative">
            {isAuthenticated && user ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-gray-600 transition-all text-left"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-lg object-cover border border-[#00E5FF]/40"
                  />
                  <div className="hidden md:block max-w-[100px]">
                    <div className="text-xs font-semibold text-white truncate">{user.fullName}</div>
                    <div className="text-[10px] text-[#00E5FF] font-medium leading-none">
                      {user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#1F2937]">
                      <div className="text-xs text-gray-400">Đăng nhập bởi</div>
                      <div className="text-sm font-semibold text-white truncate">{user.email}</div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-[#00E5FF] hover:bg-[#1F2937] flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#00E5FF]" />
                        Trang Quản Trị (Admin)
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('profile', { tab: 'profile' });
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:bg-[#1F2937] flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      Hồ sơ cá nhân
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('profile', { tab: 'orders' });
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:bg-[#1F2937] flex items-center gap-2"
                    >
                      <PackageCheck className="w-4 h-4 text-gray-400" />
                      Lịch sử đơn hàng
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('profile', { tab: 'wishlist' });
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:bg-[#1F2937] flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-pink-400" />
                      Sản phẩm yêu thích ({wishlistCount})
                    </button>

                    <div className="border-t border-[#1F2937] my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-bold text-xs shadow-md shadow-[#00E5FF]/20 hover:opacity-95 transition-opacity"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1F2937]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar (Desktop Links) */}
      <nav className="hidden md:block border-t border-[#1F2937]/60 bg-[#0B0F14]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-6 py-2.5 overflow-x-auto">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-[#00E5FF] transition-colors whitespace-nowrap ${
                currentPage === 'home' ? 'text-[#00E5FF] font-bold' : 'text-gray-300'
              }`}
            >
              Trang Chủ
            </button>
            <button
              onClick={() => onNavigate('products')}
              className={`hover:text-[#00E5FF] transition-colors whitespace-nowrap ${
                currentPage === 'products' ? 'text-[#00E5FF] font-bold' : 'text-gray-300'
              }`}
            >
              Tất Cả Sản Phẩm
            </button>
            <button
              onClick={() => onNavigate('products', { category: 'cpu' })}
              className="text-gray-300 hover:text-[#00E5FF] transition-colors whitespace-nowrap"
            >
              CPU
            </button>
            <button
              onClick={() => onNavigate('products', { category: 'gpu' })}
              className="text-gray-300 hover:text-[#00E5FF] transition-colors whitespace-nowrap"
            >
              VGA / Card Đồ Họa
            </button>
            <button
              onClick={() => onNavigate('products', { category: 'mainboard' })}
              className="text-gray-300 hover:text-[#00E5FF] transition-colors whitespace-nowrap"
            >
              Mainboard
            </button>
            <button
              onClick={() => onNavigate('products', { category: 'ram' })}
              className="text-gray-300 hover:text-[#00E5FF] transition-colors whitespace-nowrap"
            >
              RAM
            </button>
            <button
              onClick={() => onNavigate('products', { category: 'ssd' })}
              className="text-gray-300 hover:text-[#00E5FF] transition-colors whitespace-nowrap"
            >
              SSD
            </button>
            <button
              onClick={() => onNavigate('products', { category: 'monitor' })}
              className="text-gray-300 hover:text-[#00E5FF] transition-colors whitespace-nowrap"
            >
              Màn Hình
            </button>
            <button
              onClick={() => onNavigate('pc-builder')}
              className={`hover:text-[#00E5FF] transition-colors whitespace-nowrap flex items-center gap-1 ${
                currentPage === 'pc-builder' ? 'text-[#00E5FF] font-bold' : 'text-gray-300'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />
              Xây Dựng Cấu Hình PC
            </button>
            <button
              onClick={() => onNavigate('blog')}
              className={`hover:text-[#00E5FF] transition-colors whitespace-nowrap ${
                currentPage === 'blog' ? 'text-[#00E5FF] font-bold' : 'text-gray-300'
              }`}
            >
              Tin Tức & Review
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`hover:text-[#00E5FF] transition-colors whitespace-nowrap ${
                currentPage === 'contact' ? 'text-[#00E5FF] font-bold' : 'text-gray-300'
              }`}
            >
              Liên Hệ
            </button>
          </div>

          <div className="flex items-center gap-3 text-gray-400 py-2.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Bảo hành 1 đổi 1 trong 30 ngày
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1F2937] bg-[#0B0F14] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm linh kiện..."
              className="w-full bg-[#111827] text-gray-100 pl-10 pr-4 py-2 rounded-xl border border-[#1F2937] text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('home');
              }}
              className="p-2.5 rounded-lg bg-[#111827] text-left text-gray-200"
            >
              🏠 Trang Chủ
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('pc-builder');
              }}
              className="p-2.5 rounded-lg bg-[#00E5FF]/10 text-left text-[#00E5FF] font-bold border border-[#00E5FF]/30"
            >
              ⚡ Build PC Tool
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('products');
              }}
              className="p-2.5 rounded-lg bg-[#111827] text-left text-gray-200"
            >
              📦 Tất Cả Sản Phẩm
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('compare');
              }}
              className="p-2.5 rounded-lg bg-[#111827] text-left text-gray-200"
            >
              ⚖️ So Sánh ({compareList.length})
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('blog');
              }}
              className="p-2.5 rounded-lg bg-[#111827] text-left text-gray-200"
            >
              📰 Tin Tức & Review
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('contact');
              }}
              className="p-2.5 rounded-lg bg-[#111827] text-left text-gray-200"
            >
              📞 Liên Hệ Hỗ Trợ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
