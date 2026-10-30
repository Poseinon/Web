/**
 * CẤU HÌNH THÔNG TIN CỬA HÀNG TECHZONE
 * Bạn có thể dễ dàng thay đổi tên shop, địa chỉ, số điện thoại, email tại đây.
 * Mọi thay đổi ở file này sẽ tự động cập nhật trên toàn bộ website (Header, Footer, Trang Liên Hệ).
 */
export const SHOP_CONFIG = {
  // Tên thương hiệu & Slogan
  name: 'TECHZONE',
  slogan: 'Thế Giới Linh Kiện & PC Gaming Chuyên Nghiệp',

  // Hotline & Hỗ trợ
  hotline: '1900 8899',
  technicalPhone: '0901 234 567',
  workingHours: 'Thứ 2 - Chủ Nhật: 8:00 - 21:30 (Cả ngày lễ)',

  // Email liên hệ
  email: {
    contact: 'contact@techzone.vn',
    support: 'support@techzone.vn',
    sales: 'sales@techzone.vn'
  },

  // Địa chỉ các Showroom / Cửa hàng
  showrooms: [
    {
      id: 'showroom-hcm',
      name: 'Showroom Trụ Sở Chính (TP. HCM)',
      address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      phone: '0901 234 567',
      coordinates: '10.7769° N, 106.7009° E',
      googleMapUrl: 'https://maps.google.com'
    },
    {
      id: 'showroom-hn',
      name: 'Showroom Chi Nhánh Hà Nội',
      address: '456 Thái Hà, Phường Trung Liệt, Quận Đống Đa, TP. Hà Nội',
      phone: '0902 345 678',
      coordinates: '21.0125° N, 105.8172° E',
      googleMapUrl: 'https://maps.google.com'
    }
  ],

  // Cấu hình thanh toán Chuyển Khoản & Mã QR (VietQR)
  banking: {
    bankName: 'MB Bank (Quân Đội)',
    bankCode: 'MB', // Mã ngân hàng VietQR: MB, VCB, TCB, ACB, TPB, VPB, ICB, BIDV...
    accountNumber: '090123456789', // Số tài khoản ngân hàng của bạn
    accountHolder: 'NGUYEN VAN HAI', // Tên chủ tài khoản (viết hoa không dấu)
    // Tự động tạo link mã QR VietQR chuẩn ngân hàng:
    getQrUrl: (amount: number, orderCode: string) => {
      return `https://img.vietqr.io/image/MB-090123456789-compact2.png?amount=${amount}&addInfo=TECHZONE%20${orderCode}&accountName=NGUYEN%20VAN%20HAI`;
    }
  },

  // Chính sách bán hàng hiển thị ở Footer
  warrantyMonths: 36,
  returnDays: 30,
  freeShippingThreshold: 10000000 // Miễn phí ship cho đơn từ 10 triệu VNĐ
};
