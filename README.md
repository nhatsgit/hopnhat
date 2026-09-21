# CRCK2 — Trang theo dõi sản lượng & phiếu nội trạm

Trang web một file cho Công ty CP Cao su Chư Sê – Kampong Thom, dùng để theo dõi sản lượng khai thác mủ, phiếu nội trạm và chấm công.

Dữ liệu nằm trong Google Sheet, backend là một Google Apps Script Web App trả JSON.

## Dùng thế nào

Tải `index.html` về rồi mở bằng trình duyệt. Không cần cài gì, không cần máy chủ.

Đăng nhập bằng vai trò và mã đơn vị:

| Vai trò | Nhập mã | Xem được |
|---|---|---|
| Tổ trưởng | mã tổ, vd `Đ1-KV1` | Chỉ tổ mình |
| Đội trưởng | mã đội: `Đ1` `Đ2` `Đ3` `Đ6` | Mọi tổ thuộc đội, so sánh theo tổ |
| Ban lãnh đạo | `CRCK` | Toàn công ty, tổng hợp theo đội |

## Chức năng

- **Tổng quan** — chỉ số tổng hợp, biểu đồ sản lượng theo ngày, cơ cấu loại mủ, so sánh giữa các đơn vị
- **Sản lượng chi tiết** — bảng đầy đủ, sắp xếp theo cột, phân trang, xuất CSV
- **Phiếu nội trạm** — danh sách phiếu kèm chi tiết theo loại mủ, tự đối chiếu tổng chi tiết với tổng phiếu, in phiếu
- **Chấm công** — tổng số công, cơ cấu theo ký hiệu công, so sánh giữa các tổ, bảng chi tiết; tổ trưởng chấm công và sửa dòng chưa duyệt ngay trên trang
- **Đối chiếu** — công so với sản lượng cùng ngày cùng tổ, và phần cạo kế hoạch so thực hiện
- **Xếp hạng công nhân** — theo sản lượng, quy khô, năng suất kg/nhát
- **Nhập và sửa sản lượng** — tổ trưởng nhập dòng mới hoặc sửa dòng chưa duyệt; phiếu nội trạm và chi tiết tự tính lại theo số mới

Bộ lọc dùng chung cho mọi tab: khoảng ngày, đội, tổ, công nhân, loại mủ, phiên cạo, chất lượng, ký hiệu công, trạng thái. Các ô lọc tự co theo nhau (chọn đội thì ô tổ chỉ còn tổ của đội đó) và tự ẩn ở tab không dùng tới.

Trang nhớ phiên làm việc, nên tải lại là vào thẳng chỗ đang xem.

## Liên kết sâu

Mở sẵn đúng phiếu cần xem bằng tham số trên URL:

```
index.html?vaiTro=DOI_TRUONG&maDonVi=Đ2&to=Đ2-KV3&ngay=2026-09-18&tab=phieu
```

Tham số hỗ trợ: `vaiTro`, `maDonVi`, `doi`, `to`, `maCn`, `ngay`, `tuNgay`, `denNgay`, `loaiMu`, `trangThai`, `tab`.

## Trỏ sang backend khác

Địa chỉ Web App mặc định nằm ở hằng `API_MAC_DINH` gần đầu khối `<script>`. Sửa trực tiếp trong file, hoặc bấm **Đổi địa chỉ backend** ở màn hình đăng nhập — địa chỉ mới được nhớ trong trình duyệt.

Trang gọi backend bằng JSONP nên mở file trực tiếp từ ổ đĩa vẫn chạy, không vướng CORS.

## Kỹ thuật

Một file HTML duy nhất, không phụ thuộc thư viện ngoài. Biểu đồ vẽ bằng SVG thuần. Giao diện chạy được trên điện thoại, có sẵn chế độ tối theo cài đặt hệ thống.
