import React from 'react';
import { Calendar, User, ArrowRight, Tag, BookOpen } from 'lucide-react';

interface BlogPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  selectedSlug?: string;
}

const ARTICLES = [
  {
    slug: 'danh-gia-ryzen-7-7800x3d',
    title: 'Đánh giá chi tiết AMD Ryzen 7 7800X3D: Vua gaming phân khúc cao cấp',
    date: '28/09/2026',
    author: 'TechZone Lab',
    category: 'Đánh Giá Phần Cứng',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
    summary: 'Sức mạnh của 3D V-Cache giúp 7800X3D thống trị các bảng xếp hạng FPS game AAA với mức tiêu thụ điện năng cực thấp.',
    content: `
      Ryzen 7 7800X3D hiện đang là CPU chơi game được săn đón nhất nhờ vào bộ nhớ đệm 3D V-Cache xếp chồng 96MB độc quyền.
      
      1. Hiệu năng Gaming ấn tượng:
      Trong các tựa game Esports như CS2, Valorant, Dota 2, khung hình tối thiểu 1% Low FPS tăng hơn 30% so với thế hệ trước, mang lại độ mượt tuyệt đối cho màn hình 240Hz và 360Hz.

      2. Nhiệt độ và Điện năng tiêu thụ:
      Với mức TDP danh định 120W và công suất thực tế khi chơi game chỉ khoảng 60-75W, CPU này không yêu cầu tản nhiệt nước đắt đỏ mà vẫn hoạt động mát mẻ dưới 70 độ C.

      Kết luận: Lựa chọn tối thượng cho bất kỳ game thủ nào đang tìm kiếm hiệu năng thuần túy trên nền tảng Socket AM5 hỗ trợ lâu dài.
    `
  },
  {
    slug: 'huong-dan-chon-nguon-psu',
    title: 'Hướng dẫn chọn nguồn máy tính (PSU) chuẩn ATX 3.0 cho RTX 40 & 50 series',
    date: '25/09/2026',
    author: 'Chuyên Viên Phần Cứng',
    category: 'Hướng Dẫn Build PC',
    image: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800&auto=format&fit=crop&q=80',
    summary: 'Tại sao chuẩn cáp 12VHPWR và chứng nhận 80 Plus Gold lại tối quan trọng với sự an toàn của các dàn PC gaming hiện đại.',
    content: `
      Nguồn máy tính (PSU) được ví như trái tim của toàn bộ hệ thống. Với các dòng card đồ họa thế hệ mới có mức biến thiên công suất (Power Spike) lên đến 200%, việc đầu tư một bộ nguồn chuẩn ATX 3.0 là bắt buộc.
      
      - Chuẩn cáp 12V-2x6 (12VHPWR) thế hệ mới tiếp xúc chắc chắn hơn, ngăn ngừa hiện tượng sinh nhiệt tại chân cắm.
      - Nên chọn công suất dư thừa từ 20-30% so với tổng công suất tiêu thụ tối đa của dàn máy để quạt tản nhiệt của nguồn hoạt động êm ái ở chế độ Zero RPM.
    `
  },
  {
    slug: 'so-sanh-ram-ddr4-ddr5',
    title: 'So sánh RAM DDR4 vs DDR5: Có đáng để nâng cấp trong năm 2026?',
    date: '20/09/2026',
    author: 'Tech Reviewer',
    category: 'Tư Vấn Nâng Cấp',
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
    summary: 'Mức giá RAM DDR5 hiện đã rất tốt, sự chênh lệch băng thông và hiệu năng thực tế trong tác vụ đồ họa và game ra sao.',
    content: `
      Với giá thành DDR5 hiện tại chỉ còn chênh lệch khoảng 20-30% so với DDR4, các dàn máy mới sử dụng socket Intel LGA1700 hoặc AMD AM5 nên ưu tiên tuyệt đối chuẩn DDR5 từ 5600MHz đến 6000MHz.
      
      Băng thông gấp đôi của DDR5 giúp thời gian render video 4K trong Adobe Premiere giảm đáng kể, đồng thời giảm hiện tượng giật cục trong các tựa game thế giới mở như Cyberpunk 2077.
    `
  }
];

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate, selectedSlug }) => {
  const currentArticle = selectedSlug ? ARTICLES.find((a) => a.slug === selectedSlug) : null;

  if (currentArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <button
          onClick={() => onNavigate('blog')}
          className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1.5"
        >
          ← Quay lại danh sách bài viết
        </button>

        <div className="space-y-3">
          <span className="px-2.5 py-1 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold">
            {currentArticle.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {currentArticle.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" /> {currentArticle.date}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#7C3AED]" /> {currentArticle.author}
            </span>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden aspect-video bg-[#0B0F14] border border-[#1F2937]">
          <img src={currentArticle.image} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] text-sm text-gray-300 leading-relaxed space-y-4 whitespace-pre-line">
          {currentArticle.content}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827] border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>TECHZONE INSIGHTS</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">TIN CÔNG NGHỆ & REVIEW LINH KIỆN</h1>
        <p className="text-xs text-gray-400">
          Cập nhật những bài viết chuyên sâu về kiểm thử phần cứng, tư vấn cấu hình và tin tức công nghệ mới nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ARTICLES.map((article) => (
          <div
            key={article.slug}
            onClick={() => onNavigate('blog', { slug: article.slug })}
            className="rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#00E5FF]/50 overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative aspect-video overflow-hidden bg-[#0B0F14]">
              <img
                src={article.image}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#0B0F14]/80 text-[10px] font-bold text-[#00E5FF]">
                {article.category}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.author}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-3 mt-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1F2937] flex items-center text-xs font-bold text-[#00E5FF]">
                <span>Đọc bài viết chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
