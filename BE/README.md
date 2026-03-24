# SaaS E-Commerce Backend (Food Delivery / Multitenant)

## 📖 Giới Thiệu Dự Án
Dự án là nền tảng Backend cung cấp giải pháp **SaaS E-commerce (Thương mại điện tử đa chi nhánh)**. Hệ thống được thiết kế theo mô hình Marketplace/Food Delivery (giống ShopeeFood, GrabFood) hỗ trợ nhiều Cửa hàng (Shop), mỗi cửa hàng có thể có nhiều Chi nhánh (Branch) với vị trí địa lý khác nhau.

### 🛠 Công Nghệ Sử Dụng
- **Core:** Node.js, Express.js (ES Modules)
- **Database:** MongoDB (Mongoose)
- **Caching & Pub/Sub:** Redis
- **Real-time:** Socket.io
- **Authentication:** JWT, Bcrypt
- **Storage:** Cloudinary / Multer
- **Validation:** Joi
- **Documentation:** Swagger UI

---

## 🏗 Kiến Trúc Hệ Thống & Tiêu Chuẩn (Dựa trên SAAS Backend Standard)

Hệ thống được thiết kế dưới mô hình **Layered Architecture** chặt chẽ:
1. **Routes**: Tiếp nhận Request, xử lý qua Middleware (Sanitize, Rate Limit, Phân quyền).
2. **Controllers**: Điều hướng dữ liệu (Được bọc bởi `catchAsync` xử lý lỗi tập trung).
3. **Services**: Business Logic cốt lõi. Không query trực tiếp DB.
4. **Repositories**: Tầng giao tiếp duy nhất tới Mongoose Models (thường dùng `.lean()` cho read query).

**Security Standards**: 
- **Zero Hardcode**: Toàn bộ Enum, Status Code, hằng số lấy từ `#constants`.
- **Sanitization**: Chặn Injection, tự động filter payload độc hại qua Validator.
- **Refresh Flow & Remote Logout**: Cấp phát RefreshToken (`HttpOnly` Cookie) có kiểm soát DB (bảng `RefreshToken`), cho phép thu hồi token và đăng xuất từ xa từng thiết bị.
- **Audit Logging**: Ghi log chi tiết mọi route làm thay đổi dữ liệu (POST/PUT/PATCH/DELETE) để dễ dàng truy vết (Traceability).

---

## 🗄 Mô Hình Cơ Sở Dữ Liệu (Database Models & Relationships)

Kiến trúc Database được chuẩn hóa cho mô hình đa khách thuê (Multi-tenant SaaS). Các Document (Bảng) được thiết kế tối ưu với Index cho Pagination và Spatial Search.

### 1. Phân Hệ Người Dùng & Truy Vết (Auth & Audit)
*Cốt lõi cho việc định danh người dùng và lịch sử hệ thống.*

- **UserModel (`users`)**:
  - Giao tiếp trực tiếp với: Khách Hàng (`CUSTOMER`), Chủ Shop (`SHOP_OWNER`), và Quản Lý/Nhân Viên (`BRANCH_MANAGER`, `STAFF`).
  - Liên kết (Ref): Trỏ tới `Shop` (1-N) (nếu là chủ Shop quản lý nhiều Shop), và `Branch` (nếu là nhân viên chi nhánh).
- **RefreshTokenModel (`refreshtokens`)**:
  - Lưu phiên đăng nhập của người dùng. Mỗi khi người dùng login ở 1 thiết bị mới, 1 Record được tạo ra.
  - Chứa `userId`, `ipAddress`, `userAgent` (để Remote Logout).
- **AuditLogModel (`auditlogs`)**:
  - Lưu lại dấu chân hành động (Traceability). Ref tới `User`. Lưu thông tin `Method`, `Path`, `Status Code` và Input/Output data.

### 2. Phân Hệ Cửa Hàng & Vị Trí Địa Lý (Tenants)
*Hệ thống Tenant quản lý cửa hàng và chuỗi chi nhánh.*

- **ShopModel (`shops`)**:
  - Đại diện cho một Thương Hiệu. Thuộc sở hữu bởi 1 `User` (SHOP_OWNER).
  - Tồn tại thông tin cấu hình kinh doanh: `commissionRate` (Cấu hình % phí sàn lấy theo từng Brand).
- **BranchModel (`branches`)**:
  - Chi nhánh vật lý, trực thuộc 1 `Shop` (1 Shop - N Branches).
  - Sử dụng hệ tọa độ đặc biệt Mongoose: `location` dạng **GeoJSON 2dsphere**. Dùng cho chức năng lấy khoảng cách Shop gần nhất từ điểm đứng (GPS) của Khách hàng. Liên kết tới nhiều `Staff` (User Model).

### 3. Phân Hệ Sản Phẩm (Catalog)
*Hệ thống Menu, Danh mục chung cho Platform.*

- **ProductModel (`products`)**: 
  - Liên kết 1-1 với phân loại `Category` và 1-N với `Shop`. 
  - Hỗ trợ Array Data cực lỳ linh hoạt: 
    - `units`: Mảng đơn vị tính khác nhau (Trà Đào ly Lớn, Nhỏ). 
    - `options`: Mảng Add-on / Toppings bán kèm. 
- **CategoryModel / TagModel**: Phân cấp và gắn từ khóa cho phép tìm kiếm chéo (Global Search). Có Compound Index để tìm tốc độ cao.
- **InventoryModel (`inventories`)**: 
  - Số lượng tồn trữ thực tế của Product, gắn với cụ thể từng `Branch`. (1 Chi nhánh quản lý tồn riêng rẽ, không dính líu chi nhánh khác).

### 4. Phân Hệ Đơn Hàng (Order Split Logic)
*Logic Tách Đơn Hàng (Split Checkout) tương tự mô hình Shopee/Lazada đối với giỏ thức ăn đa Shop.*

- **ParentOrderModel (`parentorders`)**: 
  - Tạo ra 1 bản ghi duy nhất khi Client bấm "Thanh Toán". 
  - Ref tới `User` người mua hàng. Tổng cộng toàn bộ số tiền.
- **SubOrderModel (`suborders`)**:
  - **Mối Quan Hệ Cốt Lõi**: Mỗi `ParentOrder` được chia thành $N$ `SubOrder` với số tiền chia theo từng Cửa Hàng (`Shop` / `Branch`).
  - Chứa rõ ràng dòng tiền phân chia trong Record: `platformFee` (Sàn hưởng) và `netAmount` (Doanh thu dội ngược lại ví Shop nhận).
- **CartModel (`carts`)**: Lưu trạng thái giỏ trước khi thanh toán của `User`.

### 5. Phân Hệ Tài Chính, Vận Hành & Khuyến Mãi (Operation & Finance)
- **TransactionModel & WalletModel (`transactions`, `wallets`)**:
  - Hệ Ledger nội bộ. Mỗi User / Shop sở hữu 1 `Wallet`. Tiền của `SubOrder` chạy hoàn tất sẽ sinh 1 `Transaction` điều hướng tiền vào `Wallet` (Shop).
- **VoucherModel (`vouchers`)**:
  - Phát hành bởi Platform (Áp dụng Global) hoặc phát hành cục bộ bởi 1 `Shop`. (Platform Code vs Shop Code).
- **ReviewModel (`reviews`)**: Ref 1-1 tới `User` đánh giá, và Ref tới đối tượng đánh giá là 1 `Product` hoặc 1 `Shop`.
- **ChatModel & NotificationModel**: Ref nội bộ tới `User` chứa lịch sử in-app và tin nhắn qua lại. Sử dụng tích hợp real-time với Socket.IO.
- **MediaAssetModel / BlogModel**: Tệp đính kèm và Bài viết dạng Editorial được sinh ra phục vụ App.

### 6. Cấu Trúc Các Routes Hiện Tại (API Endpoints)
Dưới đây là tài liệu cấu trúc dữ liệu API mẫu hiện được triển khai theo chuẩn GEO (Generative Engine Optimization).

#### Phân Hệ Authentication (`/api/v1/auth`)

| Endpoint | HTTP Method | Cấp độ Bảo Mật (Security) | Mục Đích Kinh Doanh (Business Logic) |
|----------|-------------|---------------------------|--------------------------------------|
| `/register` | `POST` | Public, Rate-limited | Đăng ký tài khoản với Joi Validation & Mongo Sanitize. |
| `/login` | `POST` | Public, Rate-limited | Xác thực, cấp `AccessToken` và set `RefreshToken` vào HttpOnly Cookie. |
| `/refresh-token` | `POST` | Public | Tự động làm mới `AccessToken` từ Token còn hạn. |
| `/logout` | `POST` | Auth Required | Xóa Session hiện hành & clear Cookie. |
| `/sessions` | `GET` | Auth Required | Danh sách thiết bị đang đăng nhập của User. |
| `/logout-device/:id`| `POST` | Auth Required | Remote Logout ngắt kết nối một thiết bị từ xa. |
| `/logout-all` | `POST` | Auth Required | Thu hồi quyền truy cập mọi thiết bị. |

#### Phân Hệ Cửa Hàng (`/api/v1/shops`)

| Endpoint | HTTP Method | Cấp độ Bảo Mật (Security) | Mục Đích Kinh Doanh (Business Logic) |
|----------|-------------|---------------------------|--------------------------------------|
| `/` | `POST` | Auth Required (Chỉ Customer/Admin) | Đăng ký Brand mới. Tự kích hoạt `SHOP_OWNER`. |
| `/my-shops`| `GET` | Auth Required (Từ STAFF đổi lên) | Liệt kê các Shop mà User này đang sở hữu/làm việc. |
| `/:id` | `GET` | Public (với Route Validate) | Cung cấp UI chi tiết Cửa hàng để render phía Client. |
| `/:id/verify`| `PATCH`| Admin / Branch Manager | Cho phép QTV Duyệt gian hàng hoặc cấm kinh doanh. |

#### Phân Hệ Sản Phẩm Hệ Sinh Thái (`/api/v1/products`)

| Endpoint | HTTP Method | Cấp độ Bảo Mật (Security) | Mục Đích Kinh Doanh (Business Logic) |
|----------|-------------|---------------------------|--------------------------------------|
| `/` | `POST` | Auth Required (`SHOP_OWNER`) | Tạo Item, cung cấp biến thể `units` (size ly) & `options` (toppings). |
| `/:id` | `GET` | Public | Lấy chi tiết món ăn (Kèm ảnh Cloudinary, review stars). |
| `/shop/:id`| `GET` | Public (Phân Trang Tối Ưu) | Pagination Products gắn liền với Shop (Client gọi khi xem Store). |
| `/:id` | `PATCH` | Auth Required (`SHOP_OWNER`) | Cập nhật Menu, Đổi Status `AVAILABLE` thành `OUT_OF_STOCK`. |
| `/:id` | `DELETE`| Auth Required (`SHOP_OWNER`) | Remove hẳn mặt hàng ra khỏi Brand Catalog. |

---

## 🚀 Danh Sách Các Task (Roadmap Backend Cần Thực Hiện)

Để hoàn thiện toàn bộ hệ thống, dưới đây là breakdown chi tiết theo đúng cấu trúc SAAS Backend Standard:

### Phase 1: Authentication & Security Standard
- [ ] Xây dựng Layer Validation Handling tự động trả đúng cấu trúc mã code lỗi (`errorCode.js`).
- [ ] Xây dựng APIs Sign Up/Login, sinh Refresh Token cấp dưới dạng Cookie HttpOnly (với tính năng lưu phiên Session DB `RefreshToken` model).
- [ ] Viết API Logout/Logout All Devices xóa sạch Cookies & Session Cũ tại Server.
- [ ] Áp dụng Audit Log middleware cho toàn bộ Route thay đổi data, setup TTL Index xóa rác DB tự động 90 ngày.
- [ ] Authorization Middleware bóc tách User Role chặn/chấm quyền vào Route tương ứng.

### Phase 2: Onboarding Đối Tác (Shop & Branch logic)
- [ ] API Đăng ký Thương hiệu (Shop) kèm cơ chế duyệt trạng thái từ phía Admin.
- [ ] API (Shop_Owner) gán chi nhánh, tự động bind Location Long/Lat biến đổi thành GeoJSON Point cho mongoose.
- [ ] Viết API Global (Client-side) dùng Aggregation `$geoNear` query các branch xung quanh trong phạm vi bán kính `X` km.

### Phase 3: Quản Lý Sản Phẩm (Catalog Domain)
- [ ] API Build Inventory logic (Setup tồn riêng cho một `product` theo `branchId`), trừ kho bằng Session transaction.
- [ ] API Tạo sản phẩm gồm xử lý Variations nâng cao (`units`/`options`). 
- [ ] Uploading Handler: Bắt Base64 hay Multipart đẩy lên Cloudinary qua thư viện `multer/cloudinary`.

### Phase 4: Thanh Toán Phức Tạp (Double-layer Order Sync)
- [ ] Tích hợp API Giỏ hàng gom các món ăn ở đa số shop.
- [ ] Order Processing Service: Chia nhỏ giỏ hàng sinh ra 1 `ParentOrder` kèm nhiều `SubOrder` đổ về từng Endpoint chi nhánh khác nhau.
- [ ] Thanh Toán Qua Cổng Điện Tử (Momo/ZaloPay/VNPAY) bắt Hook Async trả trạng thái qua Transaction.

### Phase 5: Giao Dịch Tài Chính (Accounting & Wallet System)
- [ ] Split Payment Logic: Viết Hook sau khi `SubOrder` status trở thành `DELIVERED`, tự động tính `commissionRate` chuyển phí vào hệ thống, đẩy `netAmount` tới `Wallet` owner.
- [ ] Payout System: API yêu cầu rút tiền của Broker/Seller và cơ chế xét duyệt.
- [ ] Thống kê (Aggregation Reports) dùng Recharts tính Doanh Thu theo Tháng / Tỉ lệ mua hàng.

### Phase 6: Marketing & Events (Vouchers/Reviews)
- [ ] Khởi chạy cấu trúc tính chiết khấu linh hoạt Voucher: Fixed Amount vs Percentage Off theo Parent Amount hoặc SubOrder Amount.
- [ ] Gắn điểm Rate Star Update trung bình (`ratingsAverage`) cho Product bằng Mongoose Aggregation Pipeline.

### Phase 7: Optimize Cache, Sockets & DevOps
- [ ] Setup Socket.io `Rooms` (Theo `shopId` hoặc `userId`). Order Checkout xong Server `broadcast` notification thông qua Redis Pub/Sub trực tiếp vào Room.
- [ ] Implement Redis Caching cho route Query Menu theo Categories (Giảm thiểu traffic dội xuống Mongo).
- [ ] Viết toàn bộ `swagger.js` config (OpenAPI 3.0).
