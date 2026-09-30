import React from 'react';
import { Scale, Trash2, ShoppingCart, ArrowLeft, Plus } from 'lucide-react';
import { useCompare } from '../context/CompareContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface ComparePageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigate }) => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareList.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#111827] text-[#7C3AED] flex items-center justify-center mx-auto border border-[#1F2937]">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Chưa có sản phẩm nào để so sánh</h2>
        <p className="text-xs text-gray-400">
          Hãy nhấn vào biểu tượng chiếc cân (⚖️) trên thẻ sản phẩm để đưa tối đa 4 linh kiện vào bảng so sánh thông số chi tiết.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-2.5 rounded-xl bg-[#00E5FF] text-black font-bold text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Khám phá danh sách sản phẩm
        </button>
      </div>
    );
  }

  const attributes = [
    { label: 'Thương hiệu', getter: (p: any) => p.brandName },
    { label: 'Mức giá bán', getter: (p: any) => `${p.price.toLocaleString('vi-VN')} ₫`, highlight: true },
    { label: 'Mã linh kiện (SKU)', getter: (p: any) => p.sku },
    { label: 'Socket hỗ trợ', getter: (p: any) => p.socket || 'N/A' },
    { label: 'Chuẩn bộ nhớ RAM', getter: (p: any) => p.ramType || 'N/A' },
    { label: 'Dung lượng VRAM', getter: (p: any) => p.vram || 'N/A' },
    { label: 'Công suất tiêu thụ / TDP', getter: (p: any) => p.wattage ? `${p.wattage}W` : 'N/A' },
    { label: 'Tình trạng kho', getter: (p: any) => p.stock > 0 ? `Còn hàng (${p.stock})` : 'Hết hàng' },
    { label: 'Đánh giá người dùng', getter: (p: any) => `★ ${p.rating} (${p.reviewCount} đánh giá)` }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-[#7C3AED]" />
            SO SÁNH THÔNG SỐ LINH KIỆN ({compareList.length}/4)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Đặt các linh kiện máy tính cạnh nhau để tìm ra sự lựa chọn tối ưu nhất cho dàn máy của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm sản phẩm khác
          </button>
          <button
            onClick={clearCompare}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#1F2937] bg-[#111827]">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1F2937] bg-[#0B0F14]">
              <th className="p-4 w-44 font-bold text-gray-400">Tiêu chí so sánh</th>
              {compareList.map((p) => (
                <th key={p.id} className="p-4 min-w-[220px] max-w-[280px] align-top">
                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-xl bg-[#111827] border border-[#1F2937] p-2 flex items-center justify-center">
                      <img src={p.images[0]} alt="" className="max-h-full max-w-full object-contain" />
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-gray-400 hover:text-red-400 hover:bg-black transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-2">{p.name}</div>
                    <div className="text-sm font-black text-[#00E5FF]">
                      {p.price.toLocaleString('vi-VN')} ₫
                    </div>
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="w-full py-2 bg-[#00E5FF] hover:bg-[#00b4d8] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Thêm vào giỏ
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {attributes.map((attr, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-[#0B0F14]/30' : 'bg-[#111827]'}>
                <td className="p-4 font-bold text-gray-400 whitespace-nowrap">{attr.label}</td>
                {compareList.map((p) => (
                  <td
                    key={p.id}
                    className={`p-4 font-medium ${
                      attr.highlight ? 'text-[#00E5FF] font-bold text-sm' : 'text-gray-200'
                    }`}
                  >
                    {attr.getter(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
