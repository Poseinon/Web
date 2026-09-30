import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  HardDrive,
  Database,
  Monitor,
  Flame,
  Award,
  ChevronLeft
} from 'lucide-react';
import { Product, Category, Brand } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/product/ProductCard.tsx';
import { ProductCardSkeleton } from '../components/product/ProductCardSkeleton.tsx';
import { useCart } from '../context/CartContext.tsx';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onQuickView }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Active JavaScript Flash Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 35,
    seconds: 20
  });

  const { addToCart } = useCart();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [featRes, flashRes, catRes, brandRes] = await Promise.all([
          api.getProducts({ isFeatured: true, limit: 8 }),
          api.getProducts({ isFlashSale: true, limit: 6 }),
          api.getCategories(),
          api.getBrands()
        ]);

        if (featRes.success) setFeaturedProducts(featRes.products);
        if (flashRes.success) setFlashSaleProducts(flashRes.products);
        if (catRes.success) setCategories(catRes.data);
        if (brandRes.success) setBrands(brandRes.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* ================= SECTION 1 — HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B0F14] via-[#0E1520] to-[#0B0F14] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#1F2937]/50">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#7C3AED]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>THẾ HỆ PHẦN CỨNG 2026 ĐÃ CẬP BẾN TECHZONE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none uppercase">
                BUILD YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#7C3AED] to-[#00E5FF] animate-gradient">
                  ULTIMATE PC
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Hiệu năng mạnh mẽ. 100% linh kiện chính hãng. Mức giá cạnh tranh số 1 thị trường cùng công cụ thông minh kiểm tra độ tương thích socket phần cứng chuẩn xác.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('products')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00b4d8] text-black font-extrabold text-sm shadow-xl shadow-[#00E5FF]/20 hover:scale-102 hover:shadow-[#00E5FF]/30 active:scale-98 transition-all flex items-center gap-2"
                >
                  <span>Khám phá sản phẩm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('pc-builder')}
                  className="px-6 py-3.5 rounded-xl bg-[#111827] border border-[#00E5FF]/40 hover:border-[#00E5FF] text-white font-bold text-sm shadow-lg hover:bg-[#00E5FF]/10 transition-all flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4 text-[#00E5FF]" />
                  <span>Build PC Ngay</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#7C3AED] text-white uppercase font-black">
                    Tương Thích 100%
                  </span>
                </button>
              </div>

              {/* Quick stats banner */}
              <div className="grid grid-cols-3 gap-4 pt-6 max-w-lg mx-auto lg:mx-0 border-t border-[#1F2937]/70 text-left">
                <div>
                  <div className="text-2xl font-black text-white">500+</div>
                  <div className="text-xs text-gray-400">Linh kiện sẵn kho</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#00E5FF]">36T</div>
                  <div className="text-xs text-gray-400">Bảo hành chính hãng</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">15K+</div>
                  <div className="text-xs text-gray-400">Khách hàng tin tưởng</div>
                </div>
              </div>
            </div>

            {/* Right Visual (Interactive Graphic) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl p-1 bg-gradient-to-tr from-[#00E5FF]/30 via-[#7C3AED]/40 to-transparent shadow-2xl">
                <div className="w-full h-full rounded-[22px] bg-[#111827] border border-[#1F2937] p-6 flex flex-col justify-between relative overflow-hidden group">
                  {/* Glowing graphic overlay */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#00E5FF]/10 rounded-full blur-2xl" />

                  {/* Top card banner */}
                  <div className="flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-bold border border-[#00E5FF]/30">
                      FLAGSHIP HARDWARE
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Sẵn hàng hỏa tốc
                    </span>
                  </div>

                  {/* Main graphic hardware image */}
                  <div className="relative py-4 my-auto z-10 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80"
                      alt="NVIDIA GeForce RTX 4090"
                      className="w-full max-h-56 object-contain drop-shadow-[0_20px_25px_rgba(0,229,255,0.25)] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Bottom showcase info */}
                  <div className="z-10 bg-[#0B0F14]/80 backdrop-blur-md p-3.5 rounded-xl border border-[#1F2937]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400 font-semibold">Cấu hình khuyến nghị</div>
                        <div className="text-sm font-bold text-white">ASUS ROG Strix RTX 4090 24GB</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 line-through">59.990.000 ₫</div>
                        <div className="text-sm font-black text-[#00E5FF]">54.990.000 ₫</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2 — DANH MỤC ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 bg-[#00E5FF] rounded-full" />
              DANH MỤC LINH KIỆN NỔI BẬT
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Khám phá đầy đủ các linh kiện cấu thành nên bộ PC Gaming & Đồ họa đỉnh cao
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-[#00E5FF] hover:underline flex items-center gap-1"
          >
            Xem tất cả linh kiện <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug })}
              className="group p-4 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#00E5FF]/60 hover:bg-[#111827]/80 hover:shadow-xl hover:shadow-[#00E5FF]/5 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-[#0B0F14] border border-[#1F2937] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-[#00E5FF]/40 transition-all duration-300 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <h3 className="text-xs font-bold text-gray-200 group-hover:text-[#00E5FF] transition-colors leading-tight line-clamp-1">
                {cat.name.split(' - ')[0]}
              </h3>
              <span className="text-[11px] text-gray-500 mt-1 font-medium">Khám phá →</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 3 — FLASH SALE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-red-950/40 via-[#111827] to-red-950/20 border border-red-500/30 relative overflow-hidden shadow-2xl">
          {/* Header Flash Sale with Live Countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1F2937]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">FLASH SALE GIÁ SỐC</h2>
                  <span className="px-2 py-0.5 rounded bg-red-500 text-black font-extrabold text-[10px] uppercase">
                    CHỈ HÔM NAY
                  </span>
                </div>
                <p className="text-xs text-gray-400">Linh kiện hàng hiệu giảm giá sâu đến 30%</p>
              </div>
            </div>

            {/* Countdown Blocks */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold mr-1">Kết thúc sau:</span>
              <div className="flex items-center gap-1.5 font-mono text-sm font-black">
                <span className="px-2.5 py-1.5 rounded-lg bg-[#0B0F14] border border-[#1F2937] text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-red-500 font-bold">:</span>
                <span className="px-2.5 py-1.5 rounded-lg bg-[#0B0F14] border border-[#1F2937] text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-red-500 font-bold">:</span>
                <span className="px-2.5 py-1.5 rounded-lg bg-[#0B0F14] border border-red-500/40 text-red-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Flash Sale Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-6">
            {loading
              ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
              : flashSaleProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="relative flex flex-col">
                    <ProductCard
                      product={p}
                      onNavigate={onNavigate}
                      onQuickView={onQuickView}
                    />
                    {/* Sold progress bar */}
                    <div className="mt-2 px-1">
                      <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                        <span>Đã bán: <strong className="text-white">{p.soldCount}</strong></span>
                        <span className="text-red-400 font-semibold">Cháy hàng 75%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1F2937] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                          style={{ width: `${Math.min(95, Math.max(30, (p.soldCount / (p.soldCount + p.stock)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4 — SẢN PHẨM NỔI BẬT ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 bg-[#7C3AED] rounded-full" />
              SẢN PHẨM NỔI BẬT ĐƯỢC ƯU CHUỘNG
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Top các dòng linh kiện thế hệ mới được game thủ đánh giá cao nhất
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('products', { isFeatured: true })}
              className="px-4 py-2 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-[#00E5FF] text-xs font-semibold text-gray-300 hover:text-white transition-all"
            >
              Xem tất cả ({featuredProducts.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onNavigate={onNavigate}
                  onQuickView={onQuickView}
                />
              ))}
        </div>
      </section>

      {/* ================= SECTION 5 — PC BUILD BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 lg:p-12 bg-gradient-to-r from-[#111827] via-[#1a1c32] to-[#111827] border border-[#7C3AED]/40 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <span className="px-3 py-1 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/50 text-[#c084fc] text-xs font-bold uppercase tracking-wider">
                CÔNG CỤ ĐỘC QUYỀN
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                XÂY DỰNG CẤU HÌNH PC MƠ ƯỚC CỦA BẠN
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Tự tay lựa chọn CPU, Mainboard, RAM, VGA, Nguồn theo ngân sách. Hệ thống tự động kiểm tra độ tương thích socket (AM5, LGA1700), chuẩn RAM và công suất nguồn PSU chuẩn xác!
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onNavigate('pc-builder')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-black font-extrabold text-sm shadow-xl shadow-[#00E5FF]/20 hover:scale-102 transition-all flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4 text-black" />
                  <span>Trải Nghiệm PC Builder Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-4 rounded-2xl bg-[#0B0F14]/80 border border-[#1F2937] space-y-2.5 w-full max-w-xs text-xs">
                <div className="font-bold text-white border-b border-[#1F2937] pb-2 flex items-center justify-between">
                  <span>Kiểm tra tự động</span>
                  <span className="text-emerald-400">✓ Hoàn hảo</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Socket CPU ↔ Mainboard:</span>
                  <span className="text-[#00E5FF] font-bold">Khớp AM5</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>RAM Type:</span>
                  <span className="text-[#00E5FF] font-bold">DDR5 Tối ưu</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Ước tính công suất:</span>
                  <span className="text-emerald-400 font-bold">PSU 850W Đủ tải</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6 — THƯƠNG HIỆU HÀNG ĐẦU ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight">THƯƠNG HIỆU ĐỒNG HÀNH</h2>
          <p className="text-xs text-gray-400 mt-1">
            Đối tác phân phối chính hãng từ các tập đoàn công nghệ lớn nhất toàn cầu
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {brands.map((b) => (
            <div
              key={b.id}
              onClick={() => onNavigate('products', { brand: b.slug })}
              className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-[#00E5FF]/40 hover:bg-[#1F2937]/50 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
            >
              <span className="font-extrabold text-sm text-gray-200 group-hover:text-[#00E5FF] transition-colors">
                {b.name}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">{b.description?.slice(0, 26)}...</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 7 — TẠI SAO CHỌN TECHZONE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-8 bg-[#111827]/60 border border-[#1F2937]">
          <div className="text-center max-w-lg mx-auto mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">TẠI SAO CHỌN TECHZONE?</h2>
            <p className="text-xs text-gray-400 mt-1">Tiêu chuẩn dịch vụ và cam kết chất lượng số 1 cho người tiêu dùng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#1F2937] text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Giao Hàng Siêu Tốc</h4>
              <p className="text-xs text-gray-400">Nội thành giao nhanh trong 2 giờ. Toàn quốc đóng bọc túi khí chống sốc 5 lớp an toàn.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#1F2937] text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">100% Chính Hãng</h4>
              <p className="text-xs text-gray-400">Cam kết đền bù gấp 10 lần nếu phát hiện hàng giả, hàng nhái hoặc hàng trôi nổi kém chất lượng.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#1F2937] text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Bảo Hành 1 Đổi 1</h4>
              <p className="text-xs text-gray-400">Chính sách đổi mới linh kiện trong 30 ngày đầu tiên nếu phát sinh lỗi từ nhà sản xuất.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#1F2937] text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Tư Vấn Chuyên Sâu</h4>
              <p className="text-xs text-gray-400">Kỹ sư máy tính giàu kinh nghiệm hỗ trợ tối ưu cấu hình đúng nhu cầu và ngân sách của bạn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 8 — TIN TỨC & BÀI VIẾT ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-6 bg-[#00E5FF] rounded-full" />
              TIN CÔNG NGHỆ & REVIEW LINH KIỆN
            </h2>
            <p className="text-xs text-gray-400 mt-1">Cập nhật xu hướng phần cứng máy tính và hướng dẫn nâng cấp PC</p>
          </div>
          <button
            onClick={() => onNavigate('blog')}
            className="text-xs font-semibold text-[#00E5FF] hover:underline flex items-center gap-1"
          >
            Xem tất cả tin tức <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Đánh giá chi tiết Ryzen 7 7800X3D: Vua gaming phân khúc cao cấp',
              excerpt: 'Sức mạnh của 3D V-Cache giúp 7800X3D thống trị các bảng xếp hạng FPS game AAA với mức tiêu thụ điện năng cực thấp.',
              date: '28/09/2026',
              category: 'Đánh Giá Phần Cứng',
              image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
              slug: 'danh-gia-ryzen-7-7800x3d'
            },
            {
              title: 'Hướng dẫn chọn nguồn máy tính (PSU) chuẩn ATX 3.0 cho RTX 40 & 50 series',
              excerpt: 'Tại sao chuẩn cáp 12VHPWR và chứng nhận 80 Plus Gold lại tối quan trọng với sự an toàn của các dàn PC gaming hiện đại.',
              date: '25/09/2026',
              category: 'Hướng Dẫn Build PC',
              image: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=600&auto=format&fit=crop&q=80',
              slug: 'huong-dan-chon-nguon-psu'
            },
            {
              title: 'So sánh RAM DDR4 vs DDR5: Có đáng để nâng cấp trong năm 2026?',
              excerpt: 'Mức giá RAM DDR5 hiện đã rất tốt, sự chênh lệch băng thông và hiệu năng thực tế trong tác vụ đồ họa và game ra sao.',
              date: '20/09/2026',
              category: 'Tư Vấn Nâng Cấp',
              image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80',
              slug: 'so-sanh-ram-ddr4-ddr5'
            }
          ].map((blog, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('blog', { slug: blog.slug })}
              className="rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#00E5FF]/40 overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative pt-[52%] overflow-hidden bg-[#0B0F14]">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#0B0F14]/80 backdrop-blur-md text-[10px] font-bold text-[#00E5FF]">
                  {blog.category}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-gray-500 mb-1.5">{blog.date}</div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-snug line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center text-xs font-semibold text-[#00E5FF]">
                  <span>Đọc tiếp</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
