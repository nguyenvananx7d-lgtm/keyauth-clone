# KeyAuth C# Integration

## 📦 Cài đặt

### 1. Thêm NuGet Package
```bash
Install-Package Newtonsoft.Json
```

### 2. Copy file `KeyAuthAPI.cs` vào project của bạn

---

## 🚀 Sử dụng

### Bước 1: Lấy thông tin từ Dashboard

1. Đăng nhập vào: `https://keyauth-website.onrender.com`
2. Tạo Application mới
3. Lấy:
   - **Application Name** (ví dụ: `AN`)
   - **Owner ID** (ví dụ: `1`)
   - **Application Secret** (để bảo mật nâng cao)

### Bước 2: Khởi tạo API

```csharp
using KeyAuth;

var KeyAuthApp = new API(
    appName: "AN",  // Tên app từ dashboard
    ownerID: "1",   // Owner ID từ dashboard
    apiUrl: "https://keyauth-website.onrender.com"
);

// Initialize
if (!await KeyAuthApp.Init())
{
    Console.WriteLine("Failed to initialize!");
    return;
}
```

---

## 📖 API Methods

### 1. **Login** - Đăng nhập user

```csharp
if (await KeyAuthApp.Login("username", "password"))
{
    Console.WriteLine($"Welcome {KeyAuthApp.Username}!");
    Console.WriteLine($"Subscription: {KeyAuthApp.Subscription}");
    Console.WriteLine($"Expiry: {KeyAuthApp.Expiry}");
}
else
{
    Console.WriteLine("Login failed!");
}
```

### 2. **Register** - Đăng ký user mới

```csharp
if (await KeyAuthApp.Register("username", "password", "LICENSE-KEY-HERE", "email@example.com"))
{
    Console.WriteLine($"Registered successfully!");
    Console.WriteLine($"Subscription: {KeyAuthApp.Subscription}");
}
else
{
    Console.WriteLine("Registration failed!");
}
```

### 3. **License** - Kiểm tra license key

```csharp
if (await KeyAuthApp.License("LICENSE-KEY-HERE"))
{
    Console.WriteLine("License is valid!");
}
else
{
    Console.WriteLine("Invalid license!");
}
```

### 4. **Upgrade** - Nâng cấp subscription

```csharp
if (await KeyAuthApp.Upgrade("username", "NEW-LICENSE-KEY"))
{
    Console.WriteLine($"Upgraded to: {KeyAuthApp.Subscription}");
    Console.WriteLine($"New expiry: {KeyAuthApp.Expiry}");
}
else
{
    Console.WriteLine("Upgrade failed!");
}
```

---

## 🔐 Bảo mật

### Ẩn thông tin nhạy cảm

Không hardcode `appName`, `ownerID` trong code! Dùng:

```csharp
// Obfuscate hoặc encrypt
string appName = Decrypt("encrypted_app_name");
string ownerID = Decrypt("encrypted_owner_id");
```

### Kiểm tra expiry

```csharp
if (await KeyAuthApp.Login(username, password))
{
    if (!string.IsNullOrEmpty(KeyAuthApp.Expiry))
    {
        DateTime expiry = DateTime.Parse(KeyAuthApp.Expiry);
        if (expiry < DateTime.Now)
        {
            Console.WriteLine("Subscription expired!");
            return;
        }
    }
    
    // Continue with app logic
}
```

---

## 📝 Ví dụ hoàn chỉnh

Xem file `C#-Example.cs` để có ví dụ đầy đủ!

---

## 🛠️ Troubleshooting

### Lỗi: "Application not found"
- Kiểm tra `appName` và `ownerID` có đúng không
- Đảm bảo đã tạo Application trong dashboard

### Lỗi: "Invalid credentials"
- Username hoặc password sai
- User chưa được tạo (cần register trước)

### Lỗi: "License already used"
- License key đã được sử dụng bởi user khác
- Tạo license key mới trong dashboard

### Lỗi: "Subscription expired"
- User đã hết hạn subscription
- Dùng `Upgrade()` để gia hạn

---

## 📞 Support

Nếu gặp vấn đề, liên hệ qua dashboard hoặc email support!
