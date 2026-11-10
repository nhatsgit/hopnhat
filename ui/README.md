# Bộ giao diện CRCK (xuất từ hệ thống Lưu trữ / Văn thư)

Giao diện theo mẫu "Thẻ nhóm CRCK" của CRCK ERP. Thuần HTML/CSS/JS, không cần framework hay bước build.

## Gồm những gì

| File | Vai trò |
|---|---|
| `crck.css` | Màu (sáng/tối), thanh trên, menu trái, đầu trang, dải số liệu, tab, nút, giao diện điện thoại |
| `crck-thanh-phan.css` | Thành phần trong nội dung: thẻ, lưới thẻ, nhãn trạng thái, nút lọc, bảng (thành danh sách thẻ trên điện thoại) |
| `crck.js` | Vẽ thanh trên + menu trái, ngăn menu trượt trên điện thoại, nút sáng/tối, đường dẫn, ô tìm kiếm. Cấu hình qua `window.CRCK_CAU_HINH` |
| `mau.html` | Trang mẫu hoàn chỉnh (hệ Nhân sự, dữ liệu giả): copy làm trang đầu tiên rồi sửa |
| `img/` | Logo VRG, icon ứng dụng |

## Cách dùng một trang

```html
<body class="ck">
<header class="ck-top" id="ckTop"></header>
<div class="ck-khung">
  <aside class="ck-ben" id="ckBen"></aside>
  <div class="ck-noi"> ...nội dung trang... </div>
</div>
<script> window.CRCK_CAU_HINH = { ten, logo, menu, ... } </script>
<script src="crck.js"></script>
<script> CRCK.chon('mã-phân-hệ','mã-mục'); CRCK.vet(['Nhân sự','Tổng quan']); </script>
```

Thêm vào `<head>`: font Inter (Google Fonts), `crck.css`, `crck-thanh-phan.css`, và đoạn script chống nháy sáng/tối (xem `mau.html`).

`CRCK_CAU_HINH`: `ten` (chữ cạnh logo), `logo`, `trangChu`, `timGoiY` (chữ gợi ý ô tìm), `chanMenu` (chữ chân menu), `linkTim(q)`, `hinh` (thêm icon riêng), `menu` (danh sách mục).
Mục menu: `{ id, ten, hinh, link: function(){...} }` là mục bấm một lần; có `muc:[...]` là nhóm xổ xuống. `nhan` là nhãn nhỏ cạnh tên (ví dụ "mới").
API của `CRCK`: `chon(phânHệ, mục)`, `vet([...])` (đường dẫn, phần tử là chuỗi hoặc `[tên, link]`), `hinh(tênIcon)` (trả SVG), `khiBam(ph, mục)` (tuỳ chọn, trả true để tự xử lý không tải lại trang).

## Quy tắc giao diện (giữ nguyên để các hệ thống nhìn giống nhau)

**Màu và kiểu**
- Màu thương hiệu xanh lá `--brand #2f7a3d`, điểm nhấn vàng `--gold` (vạch 2px dưới thanh trên). Đổi màu của hệ thống riêng bằng cách ghi đè các biến `--brand*` ở `:root`, không sửa từng class.
- Màu trạng thái luôn theo cặp nền/chữ: `ok` xanh, `canh-bao` vàng cam, `loi` đỏ, `tin` xanh dương nhạt, `xam` xám. Không dùng màu tự chế.
- Font Inter 15px; số liệu dùng `font-variant-numeric: tabular-nums`. Bo góc: thẻ 16px, nút/ô 10px, ô nhỏ 9px. Đổ bóng nhẹ `--sh-1`.
- Có sẵn giao diện tối (`data-theme="dark"`); mọi màu mới phải dùng biến để chế độ tối tự đúng.

**Bố cục màn hình**
1. Thanh trên trắng, vạch vàng dưới: logo + tên hệ thống, đường dẫn, ô tìm kiếm bên phải.
2. Menu trái 244px, cố định khi cuộn. Mục đang mở nền trắng, vạch xanh bên trái. Dưới cùng là nút đổi sáng/tối.
3. Đầu trang: ô biểu tượng xanh bo 15px, tên trang cỡ 25px, một dòng mô tả, nút chính ở bên phải.
4. Dải số liệu (KPI) ngay dưới đầu trang: các ô cùng một khung bo góc, mỗi ô gồm icon, nhãn, số lớn, ghi chú; bấm được. Ô cảnh báo/lỗi đổi màu icon và số.
5. Hàng tab (gạch chân xanh khi chọn), tiếp theo hàng lọc nhóm nút (đơn vị, loại...) căn phải, rồi nội dung.
6. Tab Tổng quan là lưới thẻ nhiều cột (mỗi thẻ có tiêu đề, dòng phụ, vài dòng tin, nút "Xem tất cả N").

**Điện thoại (≤ 900px menu thành ngăn trượt, ≤ 720px bố cục gọn)**
- Không cuộn ngang trừ hàng tab/hàng lọc. Dải số liệu 2 cột, ẩn icon cho gọn.
- Đầu trang gọn (icon nhỏ cạnh tên), nút chính rộng hết hàng, cao ≥ 44px.
- Bảng dài thành danh sách thẻ: thêm class `the-dt` cho `.ck-bang` và `data-nhan="Tên cột"` cho từng `<td>`.
- Hành vi cuộn (nút đang chọn tự trượt vào giữa hàng, trang tự cuộn tới hàng tab) nằm trong `vanthu.html` của hệ Lưu trữ (hàm `cuonChon`, `veDauTab`), chưa đưa vào bộ này; cần thì xin riêng.

**Cách đặt tên**: class của khung có tiền tố `ck-`; class riêng của từng trang không dùng tiền tố này để khỏi đụng.

## Cài như ứng dụng (tuỳ chọn)
`crck.js` tự đăng ký `sw.js` nếu có (offline + cài lên màn hình chính). Không dùng thì bỏ qua, lỗi tải sw.js trong console là bình thường. Muốn dùng: tạo `manifest.webmanifest` + `sw.js` như hệ Lưu trữ, dùng icon trong `img/`.
