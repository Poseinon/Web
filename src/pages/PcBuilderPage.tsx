import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Grid,
  HardDrive,
  Database,
  Zap,
  Box,
  Fan,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  RotateCcw,
  Sparkles,
  Search,
  X,
  ExternalLink
} from 'lucide-react';
import { Product, PCBuildState } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface PcBuilderPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

type SlotKey = keyof PCBuildState;

interface SlotConfig {
  key: SlotKey;
  label: string;
  categorySlug: string;
  icon: any;
  required: boolean;
}

const SLOTS: SlotConfig[] = [
  { key: 'cpu', label: 'Bộ Vi Xử Lý (CPU)', categorySlug: 'cpu', icon: Cpu, required: true },
  { key: 'mainboard', label: 'Bo Mạch Chủ (Mainboard)', categorySlug: 'mainboard', icon: Grid, required: true },
  { key: 'ram', label: 'Bộ Nhớ Trong (RAM)', categorySlug: 'ram', icon: HardDrive, required: true },
  { key: 'gpu', label: 'Card Màn Hình (VGA / GPU)', categorySlug: 'gpu', icon: Layers, required: false },
  { key: 'ssd', label: 'Ổ Cứng Thể Rắn (SSD)', categorySlug: 'ssd', icon: Database, required: true },
  { key: 'psu', label: 'Nguồn Máy Tính (PSU)', categorySlug: 'psu', icon: Zap, required: true },
  { key: 'case', label: 'Vỏ Case Máy Tính', categorySlug: 'case', icon: Box, required: true },
  { key: 'cooler', label: 'Tản Nhiệt CPU', categorySlug: 'cooler', icon: Fan, required: false }
];

export const PcBuilderPage: React.FC<PcBuilderPageProps> = ({ onNavigate }) => {
  const [build, setBuild] = useState<PCBuildState>(() => {
    try {
      const saved = localStorage.getItem('techzone_pc_build');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal selector states
  const [activeSlot, setActiveSlot] = useState<SlotConfig | null>(null);
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);

  const { addToCart } = useCart();
  const { success, error } = useToast();

  // Save build to local storage
  useEffect(() => {
    localStorage.setItem('techzone_pc_build', JSON.stringify(build));
  }, [build]);

  // Open component picker modal
  const handleOpenPicker = async (slot: SlotConfig) => {
    setActiveSlot(slot);
    setModalSearch('');
    setLoadingModal(true);
    try {
      const res = await api.getProducts({ category: slot.categorySlug, limit: 30 });
      if (res.success) {
        setModalProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load components for picker:', err);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    if (activeSlot) {
      setBuild((prev) => ({ ...prev, [activeSlot.key]: product }));
      success(`Đã chọn "${product.name.slice(0, 30)}..." cho cấu hình`);
      setActiveSlot(null);
    }
  };

  const handleRemoveSlot = (key: SlotKey) => {
    setBuild((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleResetBuild = () => {
    setBuild({});
    localStorage.removeItem('techzone_pc_build');
    success('Đã làm trống cấu hình PC');
  };

  // Add all selected components to Cart
  const handleAddAllToCart = async () => {
    const selectedProds = Object.values(build).filter(Boolean) as Product[];
    if (selectedProds.length === 0) {
      error('Vui lòng chọn ít nhất một linh kiện trước khi thêm vào giỏ hàng');
      return;
    }

    for (const p of selectedProds) {
      await addToCart(p, 1);
    }
    success(`Đã thêm toàn bộ ${selectedProds.length} linh kiện cấu hình vào giỏ hàng!`, 'Build PC');
    onNavigate('cart');
  };

  // ================= COMPATIBILITY ANALYSIS =================
  const cpuSocket = build.cpu?.socket;
  const mbSocket = build.mainboard?.socket;
  const mbRamType = build.mainboard?.ramType;
  const ramType = build.ram?.ramType;

  const compatibilityIssues: string[] = [];
  const compatibilityOk: string[] = [];

  // Check 1: Socket match
  if (build.cpu && build.mainboard) {
    if (cpuSocket && mbSocket && cpuSocket.toLowerCase() === mbSocket.toLowerCase()) {
      compatibilityOk.push(`Socket tương thích hoàn hảo: ${cpuSocket}`);
    } else if (cpuSocket && mbSocket) {
      compatibilityIssues.push(
        `Không tương thích Socket: CPU dùng ${cpuSocket} nhưng Mainboard là ${mbSocket}`
      );
    }
  }

  // Check 2: RAM type match
  if (build.mainboard && build.ram) {
    if (mbRamType && ramType && mbRamType.toLowerCase() === ramType.toLowerCase()) {
      compatibilityOk.push(`Chuẩn RAM đồng bộ: ${ramType}`);
    } else if (mbRamType && ramType) {
      compatibilityIssues.push(
        `Không tương thích RAM: Mainboard yêu cầu ${mbRamType} nhưng RAM được chọn là ${ramType}`
      );
    }
  }

  // Check 3: PSU Wattage vs System Estimated Power
  const cpuWatts = build.cpu?.wattage || 65;
  const gpuWatts = build.gpu?.wattage || 0;
  const otherWatts = 120; // Motherboard + RAM + Fans + NVMe baseline
  const estimatedTotalWatts = (build.cpu ? cpuWatts : 0) + (build.gpu ? gpuWatts : 0) + otherWatts;
  const recommendedPsuWatts = Math.round((estimatedTotalWatts * 1.35) / 50) * 50;

  if (build.psu) {
    const psuWatts = build.psu.wattage || 500;
    if (psuWatts >= recommendedPsuWatts) {
      compatibilityOk.push(`Nguồn PSU (${psuWatts}W) đủ tải công suất dàn máy (${estimatedTotalWatts}W)`);
    } else {
      compatibilityIssues.push(
        `Công suất PSU (${psuWatts}W) có thể không đủ tải. Khuyến nghị tối thiểu: ${recommendedPsuWatts}W`
      );
    }
  }

  // Total Price
  const selectedItems = Object.values(build).filter(Boolean) as Product[];
  const totalPrice = selectedItems.reduce((sum, p) => sum + p.price, 0);

  // Filtered picker items
  const filteredPickerItems = modalProducts.filter((p) => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-[#00E5FF]" />
            CÔNG CỤ XÂY DỰNG CẤU HÌNH PC CHUYÊN NGHIỆP
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Tự chọn linh kiện và kiểm tra độ tương thích socket, chuẩn RAM, công suất nguồn theo thời gian thực
          </p>
        </div>

        <button
          onClick={handleResetBuild}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors self-start sm:self-center"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Làm lại từ đầu</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Component Slots (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {SLOTS.map((slot) => {
            const selected = build[slot.key];
            const Icon = slot.icon;

            return (
              <div
                key={slot.key}
                className={`p-4 rounded-2xl border transition-all ${
                  selected
                    ? 'bg-[#111827] border-[#00E5FF]/40 shadow-md'
                    : 'bg-[#111827]/60 border-[#1F2937] hover:border-gray-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Slot Title & Icon */}
                  <div className="flex items-center gap-3 sm:w-1/3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selected
                          ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                          : 'bg-[#0B0F14] text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        {slot.label}
                        {slot.required && <span className="text-red-400">*</span>}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {selected ? selected.brandName : 'Chưa chọn'}
                      </div>
                    </div>
                  </div>

                  {/* Component Details or Placeholder */}
                  <div className="flex-1 sm:px-4">
                    {selected ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={selected.images[0]}
                          alt={selected.name}
                          className="w-12 h-12 object-contain rounded-lg bg-[#0B0F14] border border-[#1F2937] p-1 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4
                            onClick={() => onNavigate('product-detail', { id: selected.slug })}
                            className="text-xs font-bold text-white hover:text-[#00E5FF] truncate cursor-pointer"
                          >
                            {selected.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                            <span className="font-extrabold text-[#00E5FF]">
                              {selected.price.toLocaleString('vi-VN')} ₫
                            </span>
                            {selected.socket && (
                              <span className="px-1.5 py-0.2 rounded bg-[#0B0F14] text-gray-300 font-mono text-[10px]">
                                {selected.socket}
                              </span>
                            )}
                            {selected.ramType && (
                              <span className="px-1.5 py-0.2 rounded bg-[#0B0F14] text-gray-300 font-mono text-[10px]">
                                {selected.ramType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Vui lòng chọn linh kiện này</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {selected ? (
                      <>
                        <button
                          onClick={() => handleOpenPicker(slot)}
                          className="px-3 py-1.5 bg-[#1F2937] hover:bg-[#374151] text-xs font-semibold text-gray-200 rounded-lg transition-colors"
                        >
                          Thay đổi
                        </button>
                        <button
                          onClick={() => handleRemoveSlot(slot.key)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Gỡ bỏ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenPicker(slot)}
                        className="px-4 py-2 bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-[#00E5FF]/20 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Chọn linh kiện
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Build Summary & Live Compatibility Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Compatibility Checker Box */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between pb-2 border-b border-[#1F2937]">
              <span>Kiểm Tra Tương Thích</span>
              {compatibilityIssues.length === 0 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Hợp lệ 100%
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Cảnh báo ({compatibilityIssues.length})
                </span>
              )}
            </h3>

            {/* Incompatibilities */}
            {compatibilityIssues.length > 0 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1.5 text-xs text-red-300">
                {compatibilityIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Compatibilities OK */}
            {compatibilityOk.length > 0 && (
              <div className="space-y-1 text-xs text-gray-300">
                {compatibilityOk.map((ok, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{ok}</span>
                  </div>
                ))}
              </div>
            )}

            {compatibilityIssues.length === 0 && compatibilityOk.length === 0 && (
              <p className="text-xs text-gray-500 italic">
                Hãy chọn CPU và Mainboard để hệ thống bắt đầu kiểm tra độ tương thích socket phần cứng.
              </p>
            )}

            {/* Estimated Power Gauge */}
            <div className="pt-3 border-t border-[#1F2937] space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Ước tính tiêu thụ:</span>
                <span className="font-bold text-white">~{estimatedTotalWatts} W</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>PSU khuyến nghị tối thiểu:</span>
                <span className="font-bold text-[#00E5FF]">≥ {recommendedPsuWatts} W</span>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#1F2937]">
              Tổng Chi Phí Cấu Hình ({selectedItems.length} linh kiện)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Giá linh kiện:</span>
                <span className="font-bold text-white">{totalPrice.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Công lắp ráp & Cài Windows:</span>
                <span className="font-bold text-emerald-400">Miễn phí 100%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Gói test Furmark & Cinebench:</span>
                <span className="font-bold text-emerald-400">Miễn phí 100%</span>
              </div>
              <div className="pt-3 border-t border-[#1F2937] flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Tổng cộng:</span>
                <span className="text-2xl font-black text-[#00E5FF]">
                  {totalPrice.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleAddAllToCart}
                disabled={selectedItems.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] hover:opacity-95 text-black font-extrabold text-xs shadow-xl shadow-[#00E5FF]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4" />
                Thêm Toàn Bộ Vào Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Component Selector Modal */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1F2937]">
              <div>
                <h3 className="text-base font-bold text-white">
                  Chọn {activeSlot.label}
                </h3>
                <p className="text-xs text-gray-400">
                  Lựa chọn sản phẩm phù hợp cho cấu hình máy tính của bạn
                </p>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1F2937]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="py-3">
              <div className="relative">
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder={`Tìm kiếm trong danh mục ${activeSlot.label}...`}
                  className="w-full bg-[#0B0F14] text-white pl-9 pr-4 py-2 rounded-xl border border-[#1F2937] text-xs focus:outline-none focus:border-[#00E5FF]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Component List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1F2937] pr-1">
              {loadingModal ? (
                <div className="py-12 text-center text-xs text-gray-400">Đang tải danh sách linh kiện...</div>
              ) : filteredPickerItems.length > 0 ? (
                filteredPickerItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-[#0B0F14]/50 rounded-xl transition-colors"
                  >
                    <img
                      src={prod.images[0]}
                      alt=""
                      className="w-14 h-14 object-contain rounded-lg bg-[#0B0F14] border border-[#1F2937] p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#00E5FF] uppercase">{prod.brandName}</div>
                      <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                        {prod.socket && <span>Socket: {prod.socket}</span>}
                        {prod.ramType && <span>RAM: {prod.ramType}</span>}
                        {prod.wattage && <span>Công suất: {prod.wattage}W</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-[#00E5FF]">
                        {prod.price.toLocaleString('vi-VN')} ₫
                      </div>
                      <button
                        onClick={() => handleSelectProduct(prod)}
                        className="mt-1 px-3 py-1 bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-bold text-xs rounded-lg transition-colors"
                      >
                        Chọn sản phẩm
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-gray-400">
                  Không tìm thấy linh kiện nào khớp với từ khóa tìm kiếm.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
