/* =====================================================================
   Dựng file "HỒ SƠ LƯƠNG" đầy đủ — đúng biểu mẫu thật của đội (nhiều tab, công thức sống).
   Cấu trúc/kiểu chữ/khung lấy từ mau_ho_so_luong.json (trích từ file thật bằng
   tools_ho_so/trich_mau_ho_so_luong.py, KHÔNG chứa dữ liệu người); số liệu lấy từ
   backend action hoSoLuong (chỉ đội trưởng, số đã duyệt). Chạy được cả trên trình duyệt
   lẫn Node (để kiểm thử).
   ===================================================================== */
(function (goc) {
  'use strict';

  var KHMER_FONT = 'Khmer OS Battambang';
  var KHMER_RE = /[ក-៿᧠-᧿]/;
  var BIEN_KY_HIEU = { '+': '+', '++': '++', 'CN': 'CN', 'L': 'L', 'NL': 'NL', 'P': 'NL', 'L+': 'L', 'CS': 'CS', 'HT': 'HT' };

  function tachDoanKhmer(text) {
    var doan = [], hienTai = '', dangKhmer = null;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i], laKhmer;
      if (KHMER_RE.test(ch)) laKhmer = true;
      else if (/[\s()\[\]{}.,:;\/%+*'"\-–—]/.test(ch)) laKhmer = dangKhmer === null ? false : dangKhmer;
      else laKhmer = false;
      if (hienTai && laKhmer !== dangKhmer) { doan.push({ khmer: dangKhmer, text: hienTai }); hienTai = ''; }
      hienTai += ch; dangKhmer = laKhmer;
    }
    if (hienTai) doan.push({ khmer: dangKhmer, text: hienTai });
    return doan;
  }

  /** Chữ Khmer dùng font Khmer OS Battambang (rich text), phần còn lại giữ font của ô. */
  function oKhmer(cell, text, fontChung) {
    if (!KHMER_RE.test(text)) { cell.value = text; return; }
    cell.value = {
      richText: tachDoanKhmer(text).map(function (d) {
        var f = Object.assign({}, fontChung || {});
        f.name = d.khmer ? KHMER_FONT : (fontChung && fontChung.name) || 'Times New Roman';
        return { font: f, text: d.text };
      })
    };
  }

  function chuCot(n) { var s = ''; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  function hai(n) { return (n < 10 ? '0' : '') + n; }
  function nhan(x) { return JSON.parse(JSON.stringify(x)); }

  function apKieu(cell, k) {
    if (!k) return;
    if (k.font) cell.font = nhan(k.font);
    if (k.alignment) cell.alignment = nhan(k.alignment);
    if (k.border) cell.border = nhan(k.border);
    if (k.fill) cell.fill = nhan(k.fill);
    if (k.numFmt) cell.numFmt = k.numFmt;
  }

  // cột ngày của sheet TH SẢN LƯỢNG: D..O = ngày 1-12, P = mủ dây, Q..Y = 13-21, Z = mủ dây, AA..AJ = 22-31
  var SL_COT_NGAY = {};
  (function () {
    var c, d = 1;
    for (c = 4; c <= 15; c++) SL_COT_NGAY[c] = d++;
    for (c = 17; c <= 25; c++) SL_COT_NGAY[c] = d++;
    for (c = 27; c <= 36; c++) SL_COT_NGAY[c] = d++;
  })();

  function tong(o, tu, den) { var t = 0; for (var d = tu; d <= den; d++) t += Number(o[d]) || 0; return t; }

  function giaTri(p, src, ctx) {
    var m;
    if (src === 'cccd') return /^\d+$/.test(p.cccd || '') ? Number(p.cccd) : (p.cccd || p.maCn);
    if (src === 'ten') return p.ten || null;
    if (src === 'cay') return p.cay || null;
    if (src === 'giaoChenNL') return p.giaoChenNL || null;
    if (src === 'giaoDayNL') return p.giaoDayNL || null;
    if (src === 'xepLoai') return p.xepLoai || null;
    if (src === 'kmc') return p.kmc || null;
    if (src === 'p.chen') return ctx.gia.chen;
    if (src === 'p.day') return ctx.gia.day;
    if (src === 'p.vuot') return ctx.gia.vuot;
    if (src === 'p.cc') return ctx.gia.cc;
    if (src === 'sinh') {
      var s = /^(\d{4})-(\d{2})-(\d{2})/.exec(p.sinh || '');
      return s ? new Date(Date.UTC(+s[1], +s[2] - 1, +s[3])) : null;
    }
    if ((m = /^cc(\d+)$/.exec(src))) return BIEN_KY_HIEU[p.cc && p.cc[+m[1]]] || null;
    if ((m = /^sl(\d+)$/.exec(src))) { var v = p.chen && p.chen[SL_COT_NGAY[+m[1]]]; return v ? Number(v) : null; }
    if (src === 'md1') { var a = tong(p.day || {}, 1, 12); return a || null; }
    if (src === 'md2') { var b = tong(p.day || {}, 13, 31); return b || null; }
    return null;
  }

  function xayDung(ExcelJS, mau, du) {
    var wb = new ExcelJS.Workbook();
    wb.calcProperties = { fullCalcOnLoad: true };
    var N = du.nguoi.length;
    var m = /^(\d{4})-(\d{2})$/.exec(du.ky);
    var nam = +m[1], thang = +m[2];
    var ngayCuoi = new Date(Date.UTC(nam, thang, 0)).getUTCDate();
    var ctx = { gia: du.gia, sheet: {} };
    var dauDc = function (n) { n = Math.round(Number(n) || 0); return n > 0 ? '+' + n : (n < 0 ? String(n) : ''); };
    var dt = function (s) {
      return String(s)
        .replace(/\b32000\b/g, du.gia.le).replace(/\b16000\b/g, du.gia.th).replace(/\b4000\b/g, du.gia.km)
        .replace(/\{T2\}/g, hai(thang)).replace(/\{T\}/g, String(thang)).replace(/\{N\}/g, String(nam))
        .replace(/\{D\}/g, String(ngayCuoi)).replace(/\{DOI2\}/g, hai(+du.soDoi || 0));
    };
    mau.sheets.forEach(function (sh) {
      if (sh.dsOrig) ctx.sheet[sh.ten] = { S: sh.dsOrig, E: sh.dsOrig + N - 1 };
    });
    var cong = function (f, row, sh, nguoi) {
      var own = ctx.sheet[sh.ten] || { S: 0, E: 0 };
      return f.replace(/^=/, '')
        .replace(/\{r([+-]\d+)?\}/g, function (x, k) { return String(row + (k ? parseInt(k, 10) : 0)); })
        .replace(/\{([SE]):([^}]+)\}/g, function (x, t, ten) { var o = ctx.sheet[ten]; return String(o ? o[t] : 1); })
        .replace(/\{S\}/g, String(own.S)).replace(/\{E\}/g, String(own.E))
        .replace(/\{P:(\w+)\}/g, function (x, k) { return String(du.gia[k]); })
        .replace(/\{DCC\}/g, dauDc(nguoi && nguoi.dcChen)).replace(/\{DCD\}/g, dauDc(nguoi && nguoi.dcDay));
    };

    mau.sheets.forEach(function (sh) {
      var ws = wb.addWorksheet(sh.ten, { state: sh.state === 'hidden' ? 'hidden' : 'visible' });
      // Cỡ mặc định của cả sheet (file thật của đội không đặt riêng ExcelJS mới lấy đúng mặc định
      // của mình, hẹp hơn hẳn — ví dụ TH SẢN LƯỢNG 15.25 so với ~8.43): áp trước, cột/dòng có
      // độ rộng/cao riêng ở dưới sẽ ghi đè lên.
      if (sh.dcw) ws.properties.defaultColWidth = sh.dcw;
      if (sh.drh) ws.properties.defaultRowHeight = sh.drh;
      Object.keys(sh.cot || {}).forEach(function (k) {
        var c = ws.getColumn(+k), e = sh.cot[k];
        if (e.w) c.width = e.w;
        if (e.h) c.hidden = true;
      });

      var dat = function (r, c, spec, value) {
        var cell = ws.getCell(r, c);
        var k = spec && spec.s != null ? mau.styles[spec.s] : null;
        apKieu(cell, k);
        if (value === undefined || value === null) return cell;
        if (value && value.formula !== undefined) cell.value = value;
        else if (typeof value === 'string' && KHMER_RE.test(value)) oKhmer(cell, value, k && k.font);
        else cell.value = value;
        return cell;
      };
      var duLieuDong = function (obj, row, chanTrang) {
        Object.keys(obj.c).forEach(function (ck) {
          var spec = obj.c[ck], v;
          if (spec.f) v = { formula: cong(spec.f, row, sh) };
          else if (spec.d === 'ngay1') v = new Date(Date.UTC(nam, thang - 1, 1));
          else if (typeof spec.v === 'string') v = dt(spec.v);
          else if (typeof spec.v === 'number') v = spec.v;
          var cell = dat(row, +ck, spec, v);
          if (spec.d === 'ngay1' && !(cell.numFmt)) cell.numFmt = 'd/m/yyyy';
        });
      };

      // ---- phần trên ----
      Object.keys(sh.top.rows).forEach(function (rk) {
        var row = sh.top.rows[rk], r = +rk;
        if (row.h) ws.getRow(r).height = row.h;
        duLieuDong(row, r);
      });
      sh.top.merges.forEach(function (a) { ws.mergeCells(a); });

      var lastRow = 0;
      Object.keys(sh.top.rows).forEach(function (rk) { lastRow = Math.max(lastRow, +rk); });

      // Chấm công: hàng thứ trong tuần theo đúng tháng (ô ngày > số ngày của tháng để trống)
      if (sh.ten === 'CHẤM CÔNG ') {
        var kh = {}, vn = {};
        for (var c0 = 4; c0 <= 10; c0++) {          // mẫu tháng 8/2026 bắt đầu thứ Bảy
          var wd = (6 + (c0 - 4)) % 7;
          var s12 = sh.top.rows['12'].c[String(c0)], s13 = sh.top.rows['13'].c[String(c0)];
          kh[wd] = s12 && s12.v; vn[wd] = s13 && s13.v;
        }
        for (var d = 1; d <= 31; d++) {
          var col = 3 + d, w = new Date(Date.UTC(nam, thang - 1, d)).getUTCDay();
          var sp12 = sh.top.rows['12'].c[String(col)], sp13 = sh.top.rows['13'].c[String(col)];
          dat(12, col, sp12, d <= ngayCuoi ? kh[w] : null);
          dat(13, col, sp13, d <= ngayCuoi ? vn[w] : null);
          if (d > ngayCuoi) { ws.getCell(12, col).value = null; ws.getCell(13, col).value = null; }
        }
      }

      if (sh.kieu === 'bang') {
        var r0 = sh.dsOrig, proto = sh.proto;
        for (var i = 0; i < N; i++) {
          var r = r0 + i, p = du.nguoi[i];
          if (proto.h) ws.getRow(r).height = proto.h;
          Object.keys(proto.c).forEach(function (ck) {
            var spec = proto.c[ck], v;
            if (spec.src === 'stt') v = i + 1;
            else if (spec.src) v = giaTri(p, spec.src, ctx);
            else if (spec.f) v = { formula: cong(spec.f, r, sh, p) };
            else if (typeof spec.v === 'string') v = dt(spec.v);
            // GIAO SL: quy khô = ROUND(nguyên liệu × DRC); lệch với số hệ thống thì ghi số hệ thống
            if (sh.ten === 'GIAO SL' && spec.f) {
              if (+ck === 6 && Math.round((p.giaoChenNL || 0) * 0.49) !== (p.giaoChenQK || 0)) v = p.giaoChenQK || 0;
              if (+ck === 8 && Math.round((p.giaoDayNL || 0) * 0.6) !== (p.giaoDayQK || 0)) v = p.giaoDayQK || 0;
            }
            var cell = dat(r, +ck, spec, v);
            if (spec.src === 'cccd') cell.numFmt = '000000000';
          });
        }
        lastRow = r0 + N - 1;
        var E = lastRow;
        Object.keys(sh.foot.rows).forEach(function (fk) {
          var row = sh.foot.rows[fk], r = E + (+fk);
          if (row.h) ws.getRow(r).height = row.h;
          duLieuDong(row, r);
          lastRow = Math.max(lastRow, r);
        });
        sh.foot.merges.forEach(function (a) { ws.mergeCells(E + a[0], a[1], E + a[2], a[3]); });
      }

      // ---- in ấn ----
      var pi = sh.in || {};
      ws.pageSetup = {
        orientation: pi.orientation || 'portrait', paperSize: pi.paperSize || 9,
        fitToPage: !!pi.fitToPage, fitToWidth: pi.fitToWidth == null ? 1 : pi.fitToWidth, fitToHeight: pi.fitToHeight == null ? 0 : pi.fitToHeight,
        margins: pi.margins || undefined
      };
      // Sheet không dùng "vừa trang" (fitToPage=false, ví dụ XẾP LOẠI CN, KẾ HOẠCH CẠO BÙ) thì in
      // theo % thu nhỏ (scale) của file thật — thiếu dòng này Excel mặc định in ở 100%, lệch hẳn.
      if (pi.scale) ws.pageSetup.scale = pi.scale;
      if (pi.titles) ws.pageSetup.printTitlesRow = String(pi.titles).replace(/\$/g, '');
      var ma = /\$([A-Z]+)\$(\d+):\$([A-Z]+)\$(\d+)$/.exec(pi.area || '');
      if (ma && lastRow) ws.pageSetup.printArea = 'A1:' + ma[3] + lastRow;
    });
    return wb;
  }

  goc.HoSoLuong = { xayDung: xayDung, oKhmer: oKhmer, tachDoanKhmer: tachDoanKhmer, chuCot: chuCot };
  if (typeof module !== 'undefined' && module.exports) module.exports = goc.HoSoLuong;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
