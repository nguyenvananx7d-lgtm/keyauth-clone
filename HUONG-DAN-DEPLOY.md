# HƯỚNG DẪN DEPLOY LÊN RENDER.COM (MIỄN PHÍ)

## BƯỚC 1: CÀI ĐẶT GITHUB DESKTOP

1. Tải GitHub Desktop: https://desktop.github.com/download
2. Cài đặt và mở GitHub Desktop
3. Đăng nhập GitHub (nếu chưa có tài khoản thì đăng ký tại https://github.com)

## BƯỚC 2: PUSH CODE LÊN GITHUB

1. Mở GitHub Desktop
2. Click **File** → **Add Local Repository**
3. Click nút **"Choose..."**
4. Chọn folder: `C:\Users\Administrator\keyauth-clone`
5. Click **"Add Repository"**

**Nếu báo lỗi "This directory does not appear to be a Git repository":**
- Click nút **"create a repository"** trong thông báo lỗi
- Điền thông tin:
  - Name: `keyauth-clone`
  - Description: `KeyAuth Clone Website`
  - Tick vào "Initialize this repository with a README" (KHÔNG TICK)
  - Git Ignore: None
  - License: None
- Click **"Create Repository"**

6. Sau khi tạo xong, bạn sẽ thấy danh sách file thay đổi
7. Ở ô "Summary", gõ: `Initial commit`
8. Click nút **"Commit to main"** (nút xanh lớn)
9. Click nút **"Publish repository"** ở thanh trên
10. Trong popup:
    - Repository name: `keyauth-clone`
    - Description: `KeyAuth Clone Website`
    - **BỎ TICK** "Keep this code private" (để public)
    - Click **"Publish Repository"**

✅ **XONG!** Code đã lên GitHub!

## BƯỚC 3: DEPLOY TỪ RENDER.COM

1. Vào: https://render.com
2. Click **"Get Started for Free"**
3. Đăng nhập bằng GitHub (hoặc đăng ký mới)
4. Cho phép Render truy cập GitHub
5. Trong Dashboard, click **"New +"** → **"Web Service"**
6. Chọn repository **"keyauth-clone"** từ danh sách
   - Nếu không thấy, click **"Configure account"** → Cho phép truy cập repository
7. Điền thông tin:
   - **Name**: `keyauth-clone`
   - **Region**: Singapore (gần Việt Nam nhất)
   - **Branch**: `main`
   - **Root Directory**: để trống
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** (chọn gói miễn phí)
8. Click **"Advanced"** → **Environment Variables**:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your-super-secret-key-change-this-123456`
9. Click **"Create Web Service"**

Render sẽ tự động:
- Clone code từ GitHub
- Chạy `npm install`
- Chạy `npm run build`
- Chạy `npm start`
- Tạo domain miễn phí

## BƯỚC 4: LẤY DOMAIN

Sau khi deploy xong (khoảng 3-5 phút):
1. Render sẽ tự động tạo domain miễn phí dạng: `https://keyauth-clone.onrender.com`
2. Click vào link để xem website

✅ **HOÀN THÀNH!** Website đã online!

## LƯU Ý QUAN TRỌNG:

⚠️ **Gói miễn phí của Render:**
- Server sẽ "ngủ" sau 15 phút không có người truy cập
- Lần đầu truy cập sau khi ngủ sẽ mất ~30 giây để "thức dậy"
- Sau đó hoạt động bình thường

💡 **Cách giữ server luôn "thức":**
- Dùng dịch vụ ping như UptimeRobot (miễn phí)
- Hoặc nâng cấp lên gói trả phí ($7/tháng)

---

## NẾU CÓ LỖI

### Lỗi: Build failed
- Kiểm tra tab **"Logs"** trong Render Dashboard
- Thường là thiếu dependencies hoặc lỗi syntax

### Lỗi: Application failed to respond
- Kiểm tra biến môi trường đã đúng chưa
- Kiểm tra `NODE_ENV=production` đã có chưa
- Render dùng port 10000 mặc định

### Lỗi: Database not found
- Render tự động tạo SQLite database khi chạy lần đầu
- Database sẽ bị xóa mỗi khi deploy lại (gói miễn phí)
- Nếu muốn database vĩnh viễn, cần dùng PostgreSQL (miễn phí trên Render)

---

## DOMAIN RIÊNG (TÙY CHỌN)

Nếu muốn dùng domain riêng (như `tenban.com`):

1. Mua domain từ: Namecheap, GoDaddy, hoặc Tên Miền Việt
2. Trong Render Dashboard → Settings → Custom Domain
3. Click **"Add Custom Domain"**
4. Nhập domain của bạn (ví dụ: `tenban.com`)
5. Render sẽ cho bạn CNAME record
6. Vào trang quản lý DNS của domain
7. Thêm CNAME record như Render hướng dẫn:
   - Type: `CNAME`
   - Name: `@` hoặc `www`
   - Value: `keyauth-clone.onrender.com`
8. Đợi 5-30 phút để DNS cập nhật

✅ Domain riêng đã hoạt động!

---

## HỖ TRỢ

Nếu gặp vấn đề, chụp màn hình lỗi và hỏi lại!
