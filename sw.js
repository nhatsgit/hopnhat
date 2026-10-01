// =====================================================================
// SERVICE WORKER — cho trang mở được khi MẤT MẠNG (tổ trưởng ở vườn).
// ---------------------------------------------------------------------
// - Trang (index.html): mạng trước, mất mạng thì lấy bản đã lưu  -> có mạng luôn thấy bản mới nhất.
// - Ảnh, biểu tượng, thư viện CDN (ExcelJS, SheetJS, Leaflet, phông chữ): lấy bản lưu ngay, cập nhật ngầm.
// - Gọi dữ liệu (Apps Script, Cloud Run, Base): KHÔNG đụng tới — luôn đi thẳng mạng. Phiếu nhập lúc mất mạng
//   do trang tự giữ trong hàng chờ (localStorage) và gửi lại khi có sóng.
// Đổi PHIEN_BAN khi muốn xoá sạch bản lưu cũ trên máy người dùng.
// =====================================================================
const PHIEN_BAN = 'crck2-v1';
const VO_APP = ['./', './index.html', './manifest.webmanifest', './bg_dang_nhap.jpg', './xuat_ho_so_luong.js',
                './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-64.png'];
const MAY_CHU_DU_LIEU = /script\.google\.com|script\.googleusercontent\.com|\.run\.app|base\.vn/;
const CDN = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/;

self.addEventListener('install', (ev) => {
  // Từng tệp một: thiếu 1 tệp (vd chưa có ảnh nền) không làm hỏng cả lần cài
  ev.waitUntil(caches.open(PHIEN_BAN).then((c) => Promise.all(VO_APP.map((u) => c.add(u).catch(() => null))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys().then((ds) => Promise.all(ds.filter((k) => k !== PHIEN_BAN).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (MAY_CHU_DU_LIEU.test(url.hostname)) return;                    // dữ liệu: luôn mạng, không lưu

  const laTrang = req.mode === 'navigate' || (url.origin === self.location.origin && /\/(index\.html)?$/.test(url.pathname));
  if (laTrang) {
    // Mạng trước (bỏ qua query như ?tab=…), mất mạng thì bản đã lưu
    ev.respondWith(fetch(req).then((res) => {
      if (res.ok) { const sao = res.clone(); caches.open(PHIEN_BAN).then((c) => c.put('./index.html', sao)); }
      return res;
    }).catch(() => caches.match('./index.html').then((r) => r || caches.match('./'))));
    return;
  }

  if (url.origin === self.location.origin || CDN.test(url.hostname)) {
    // Bản lưu ngay, đồng thời cập nhật ngầm
    ev.respondWith(caches.open(PHIEN_BAN).then((c) => c.match(req).then((cu) => {
      const moi = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => cu);
      return cu || moi;
    })));
  }
});
