import React, { useState, useEffect } from 'react';
import {
  Filter,
  SlidersHorizontal,
  Grid3X3,
  List,
  RotateCcw,
  Search,
  Check,
  ChevronDown,
  Star
} from 'lucide-react';
import { Product, Category, Brand } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/product/ProductCard.tsx';
import { ProductCardSkeleton } from '../components/product/ProductCardSkeleton.tsx';

interface ProductsPageProps {
  initialCategory?: string;
  initialBrand?: string;
  initialSearch?: string;
  initialFeatured?: boolean;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onQuickView: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  initialCategory,
  initialBrand,
  initialSearch,
  initialFeatured,
  onNavigate,
  onQuickView
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch || '');
  const [pricePreset, setPricePreset] = useState<string>('all');
  const [selectedSocket, setSelectedSocket] = useState<string>('all');
  const [selectedRamType, setSelectedRamType] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories & brands once
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, brandRes] = await Promise.all([api.getCategories(), api.getBrands()]);
        if (catRes.success) setCategories(catRes.data);
        if (brandRes.success) setBrands(brandRes.data);
      } catch (e) {
        console.error('Failed to load filter metadata:', e);
      }
    }
    loadMeta();
  }, []);

  // Sync initial props
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialBrand) setSelectedBrand(initialBrand);
    if (initialSearch !== undefined) setSearchTerm(initialSearch);
  }, [initialCategory, initialBrand, initialSearch]);

  // Main Products Fetching
  const fetchProducts = async () => {
    try {
      setLoading(true);

      let minPrice: number | undefined;
      let maxPrice: number | undefined;

      if (pricePreset === 'under_5m') {
        maxPrice = 5000000;
      } else if (pricePreset === '5m_15m') {
        minPrice = 5000000;
        maxPrice = 15000000;
      } else if (pricePreset === '15m_30m') {
        minPrice = 15000000;
        maxPrice = 30000000;
      } else if (pricePreset === 'above_30m') {
        minPrice = 30000000;
      }

      const res = await api.getProducts({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        brand: selectedBrand !== 'all' ? selectedBrand : undefined,
        minPrice,
        maxPrice,
        socket: selectedSocket !== 'all' ? selectedSocket : undefined,
        ramType: selectedRamType !== 'all' ? selectedRamType : undefined,
        inStock: inStockOnly || undefined,
        isFeatured: initialFeatured,
        sort: sortBy as any,
        page,
        limit: 12
      });

      if (res.success) {
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategory,
    selectedBrand,
    searchTerm,
    pricePreset,
    selectedSocket,
    selectedRamType,
    inStockOnly,
    sortBy,
    page
  ]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchTerm('');
    setPricePreset('all');
    setSelectedSocket('all');
    setSelectedRamType('all');
    setInStockOnly(false);
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <div className="text-xs text-gray-500 mb-1">
            <span
              onClick={() => onNavigate('home')}
              className="hover:text-[#00E5FF] cursor-pointer transition-colors"
            >
              Trang chủ
            </span>{' '}
            / <span className="text-gray-300">Danh sách sản phẩm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            LINH KIỆN & PHỤ KIỆN MÁY TÍNH
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Hiển thị <strong>{totalCount}</strong> sản phẩm phù hợp
          </p>
        </div>

        {/* Top Controls: Layout toggle & Sort */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 bg-[#111827] border border-[#1F2937] rounded-xl text-xs font-semibold text-white"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#00E5FF]" />
            Bộ lọc
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:inline">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-[#111827] text-white text-xs border border-[#1F2937] rounded-xl px-3 py-2 focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp → Cao</option>
              <option value="price_desc">Giá: Cao → Thấp</option>
              <option value="sold">Bán chạy nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>

          {/* View toggle (Grid / List) */}
          <div className="hidden sm:flex items-center bg-[#111827] border border-[#1F2937] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#1F2937] text-[#00E5FF]' : 'text-gray-400 hover:text-white'
              }`}
              title="Xem dạng lưới"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#1F2937] text-[#00E5FF]' : 'text-gray-400 hover:text-white'
              }`}
              title="Xem dạng danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* ================= SIDEBAR FILTER ================= */}
        <aside
          className={`md:col-span-3 space-y-6 md:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } bg-[#111827] p-5 rounded-2xl border border-[#1F2937] sticky top-24 max-h-[85vh] overflow-y-auto`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Filter className="w-4 h-4 text-[#00E5FF]" />
              <span>BỘ LỌC TÌM KIẾM</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-400 hover:text-[#00E5FF] flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại
            </button>
          </div>

          {/* Search by Keyword in Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Tìm kiếm từ khóa</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Nhập tên sản phẩm..."
                className="w-full bg-[#0B0F14] text-white pl-8 pr-3 py-1.5 rounded-lg border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Danh mục linh kiện</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPage(1);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] font-bold'
                    : 'text-gray-300 hover:bg-[#1F2937]'
                }`}
              >
                <span>Tất cả danh mục</span>
                {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    selectedCategory === c.slug
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] font-bold'
                      : 'text-gray-300 hover:bg-[#1F2937]'
                  }`}
                >
                  <span className="truncate">{c.name.split(' - ')[0]}</span>
                  {selectedCategory === c.slug && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="pt-3 border-t border-[#1F2937]">
            <label className="block text-xs font-semibold text-gray-300 mb-2">Thương hiệu</label>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedBrand('all');
                  setPage(1);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  selectedBrand === 'all'
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] font-bold'
                    : 'text-gray-300 hover:bg-[#1F2937]'
                }`}
              >
                <span>Tất cả hãng</span>
                {selectedBrand === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBrand(b.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    selectedBrand === b.slug
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] font-bold'
                      : 'text-gray-300 hover:bg-[#1F2937]'
                  }`}
                >
                  <span>{b.name}</span>
                  {selectedBrand === b.slug && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Presets */}
          <div className="pt-3 border-t border-[#1F2937]">
            <label className="block text-xs font-semibold text-gray-300 mb-2">Khoảng giá</label>
            <div className="space-y-1 text-xs">
              {[
                { id: 'all', label: 'Tất cả mức giá' },
                { id: 'under_5m', label: 'Dưới 5 triệu' },
                { id: '5m_15m', label: '5 triệu - 15 triệu' },
                { id: '15m_30m', label: '15 triệu - 30 triệu' },
                { id: 'above_30m', label: 'Trên 30 triệu' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPricePreset(p.id);
                    setPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    pricePreset === p.id
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] font-bold'
                      : 'text-gray-300 hover:bg-[#1F2937]'
                  }`}
                >
                  <span>{p.label}</span>
                  {pricePreset === p.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Socket CPU Filter */}
          <div className="pt-3 border-t border-[#1F2937]">
            <label className="block text-xs font-semibold text-gray-300 mb-2">Socket CPU hỗ trợ</label>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'AM5', 'LGA1700', 'AM4'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedSocket(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    selectedSocket === s
                      ? 'bg-[#00E5FF] text-black font-bold'
                      : 'bg-[#0B0F14] text-gray-300 hover:bg-[#1F2937]'
                  }`}
                >
                  {s === 'all' ? 'Tất cả' : s}
                </button>
              ))}
            </div>
          </div>

          {/* RAM Type Filter */}
          <div className="pt-3 border-t border-[#1F2937]">
            <label className="block text-xs font-semibold text-gray-300 mb-2">Chuẩn RAM</label>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'DDR5', 'DDR4'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setSelectedRamType(r);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    selectedRamType === r
                      ? 'bg-[#7C3AED] text-white font-bold'
                      : 'bg-[#0B0F14] text-gray-300 hover:bg-[#1F2937]'
                  }`}
                >
                  {r === 'all' ? 'Tất cả' : r}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-3 border-t border-[#1F2937]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-[#00E5FF] bg-[#0B0F14] border-[#1F2937] focus:ring-0"
              />
              <span>Chỉ hiện sản phẩm còn hàng</span>
            </label>
          </div>
        </aside>

        {/* ================= PRODUCT GRID / LIST ================= */}
        <main className="md:col-span-9 space-y-6">
          {/* Active filters pill list */}
          {(selectedCategory !== 'all' ||
            selectedBrand !== 'all' ||
            pricePreset !== 'all' ||
            selectedSocket !== 'all' ||
            selectedRamType !== 'all' ||
            inStockOnly ||
            searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-[#111827] rounded-xl border border-[#1F2937] text-xs">
              <span className="text-gray-400 font-semibold">Đang lọc:</span>
              {selectedCategory !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-[#1F2937] text-[#00E5FF] flex items-center gap-1">
                  Danh mục: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')}>×</button>
                </span>
              )}
              {selectedBrand !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-[#1F2937] text-[#00E5FF] flex items-center gap-1">
                  Hãng: {selectedBrand}
                  <button onClick={() => setSelectedBrand('all')}>×</button>
                </span>
              )}
              {pricePreset !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-[#1F2937] text-white flex items-center gap-1">
                  Giá đã chọn
                  <button onClick={() => setPricePreset('all')}>×</button>
                </span>
              )}
              {selectedSocket !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-[#1F2937] text-white flex items-center gap-1">
                  Socket: {selectedSocket}
                  <button onClick={() => setSelectedSocket('all')}>×</button>
                </span>
              )}
              {selectedRamType !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-[#1F2937] text-white flex items-center gap-1">
                  RAM: {selectedRamType}
                  <button onClick={() => setSelectedRamType('all')}>×</button>
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-0.5 rounded bg-[#1F2937] text-white flex items-center gap-1">
                  Từ khóa: &quot;{searchTerm}&quot;
                  <button onClick={() => setSearchTerm('')}>×</button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-red-400 hover:underline ml-auto"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Product Items */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onNavigate={onNavigate}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            ) : (
              /* List view */
              <div className="space-y-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onNavigate('product-detail', { id: p.slug })}
                    className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#00E5FF]/40 flex flex-col sm:flex-row gap-4 items-center justify-between cursor-pointer transition-all hover:shadow-lg"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-28 h-28 object-cover rounded-xl bg-[#0B0F14] shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#00E5FF] uppercase">{p.brandName}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{p.sku}</span>
                      </div>
                      <h3 className="font-bold text-white text-sm hover:text-[#00E5FF] transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="text-amber-400 flex items-center">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          {p.rating}
                        </span>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-400">Đã bán {p.soldCount}</span>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <div className="text-lg font-black text-[#00E5FF]">
                        {p.price.toLocaleString('vi-VN')} ₫
                      </div>
                      {p.oldPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          {p.oldPrice.toLocaleString('vi-VN')} ₫
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(p);
                        }}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-black font-bold text-xs transition-colors"
                      >
                        Xem nhanh
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Empty state */
            <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#1F2937] text-gray-500 flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-white">Không tìm thấy sản phẩm nào</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Không có linh kiện nào khớp với tiêu chí bộ lọc của bạn. Hãy thử thay đổi mức giá hoặc chọn danh mục khác.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-[#00E5FF] text-black font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Đặt lại toàn bộ lọc
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs text-gray-300 disabled:opacity-40"
              >
                Trang trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    page === i + 1
                      ? 'bg-[#00E5FF] text-black'
                      : 'bg-[#111827] border border-[#1F2937] text-gray-300 hover:bg-[#1F2937]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs text-gray-300 disabled:opacity-40"
              >
                Trang sau
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
