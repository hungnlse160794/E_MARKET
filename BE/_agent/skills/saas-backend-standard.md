---
name: backend-saas-standard
description: "Bộ quy tắc chuẩn TOÀN DIỆN cho Backend dự án SaaS Multi-Vendor: Layered Architecture, Security, Zero Hardcode, Ownership Check, API Consistency, và hướng dẫn triển khai module mới."
---

# SaaS Backend Development Standards (v2.0)

Skill này giúp Antigravity tuân thủ các quy tắc thiết kế hệ thống và bảo mật tuyệt đối cho dự án Backend hiện tại. Sử dụng tài liệu này làm **kim chỉ nam bắt buộc** cho mọi thay đổi code.

---

## 1. Cấu trúc Dự án (Layered Architecture)

Tuân thủ mô hình **Layered Architecture** chặt chẽ. Luồng xử lý BẮT BUỘC:

```
Route → Middleware Chain → Controller → Service → Repository → Model
```

| Layer | Trách nhiệm | Quy tắc |
|-------|-------------|---------|
| **Route** | Định nghĩa endpoint, gắn middleware, Swagger docs | **Không có logic nghiệp vụ**. Chỉ khai báo middleware chain |
| **Controller** | Điều phối request → service → response | **Bắt buộc** `catchAsync`. Chỉ `req`, `res`. Không query DB |
| **Service** | Logic nghiệp vụ, kiểm tra quyền sở hữu, tính toán | **Không** truy cập DB trực tiếp, phải qua Repository |
| **Repository** | Truy vấn Database duy nhất | Dùng `.lean()` cho query đọc. Tên method: `findBy*`, `create`, `update`, `deleteById` |
| **Model** | Schema Mongoose | Dùng alias `#models`. Enum dùng `COMMON_CONSTANTS` |

### Database Optimization
- **Indexing**: Luôn bổ sung Index cho các trường lọc (`shopId`, `status`, `createdAt`). Sử dụng Compound Index cho truy vấn SaaS đa tham số.
- **Pagination**: Model có dữ liệu lớn **bắt buộc** tích hợp `mongoose-paginate-v2`.
- **GeoJSON**: Branch model dùng `2dsphere` index. Luôn format `[longitude, latitude]`.

---

## 2. Middleware Chain Chuẩn cho Route

Khi tạo route mới, **BẮT BUỘC** tuân thủ thứ tự middleware sau:

```javascript
router.post(
    '/endpoint',
    authHandlingMiddleware,                              // 1. Xác thực JWT
    allowRoles(COMMON_CONSTANTS.USER_ROLE.SHOP_OWNER),   // 2. Kiểm tra Role
    validateScope(COMMON_CONSTANTS.SCOPE_TYPE.SHOP),     // 3. Kiểm tra Scope (shop/branch ownership)
    sanitizeRequest(                                     // 4. Lọc field
        GENERATE_UTILS.extractFieldsFromJoi(validation.body),
        GENERATE_UTILS.extractRequiredFieldsFromJoi(validation.body)
    ),
    validationHandlingMiddleware(validation),             // 5. Validate Joi
    controller.handler                                   // 6. Controller
);
```

**Lưu ý quan trọng**:
- Route **công khai** (GET product, GET shop): Bỏ `authHandlingMiddleware`, `allowRoles`, `validateScope`.
- Route **chỉ cần auth** (GET sessions): Chỉ cần `authHandlingMiddleware`.
- Route **thay đổi dữ liệu**: BẮT BUỘC đầy đủ 6 bước.

---

## 3. Quy tắc Bảo mật & Phân quyền

### 3.1 Xác thực (Authentication)
- AccessToken (JWT, ngắn hạn) lưu ở Header `Authorization: Bearer <token>`.
- RefreshToken (JWT, dài hạn) lưu trong `HttpOnly`, `Secure`, `SameSite: Strict` Cookie.
- **Refresh Token Rotation**: Mỗi lần refresh, token cũ **bị thay thế** bằng token mới. Token cũ bị dùng lại = dấu hiệu đánh cắp.

### 3.2 Phân quyền (Authorization) — 3 Lớp Bắt Buộc
Mọi route thay đổi dữ liệu phải qua **cả 3 lớp** phân quyền:

| Lớp | Middleware / Logic | Ví dụ |
|-----|-------------------|-------|
| **Lớp 1: Role** | `allowRoles(...)` | SHOP_OWNER mới được tạo Product |
| **Lớp 2: Scope** | `validateScope(SCOPE_TYPE)` | shopId trong request phải khớp user.shopId |
| **Lớp 3: Ownership** | Logic trong Service | `product.shopId === user.shopId \|\| user.managedShops.includes(product.shopId)` |

**PLATFORM_ADMIN bypass tất cả**. Kiểm tra bằng:
```javascript
if (requestUser.role !== COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) {
    // kiểm tra ownership
}
```

### 3.3 Ownership Check Pattern (Bắt buộc trong Service)
Khi update/delete bất kỳ tài nguyên nào thuộc Shop, **BẮT BUỘC** kiểm tra:
```javascript
const verifyOwnership = (resource, requestUser) => {
    if (requestUser.role === COMMON_CONSTANTS.USER_ROLE.PLATFORM_ADMIN) return;

    const resourceShopId = resource.shopId.toString();
    const userShopId = requestUser.shopId ? requestUser.shopId.toString() : null;
    const userManagedShops = (requestUser.managedShops || []).map(id => id.toString());

    if (resourceShopId !== userShopId && !userManagedShops.includes(resourceShopId)) {
        throw new ApiError(ERROR_CODES.FORBIDDEN, ['Bạn không có quyền thao tác trên tài nguyên này']);
    }
};
```

---

## 4. Quy tắc Zero Hardcode (Constants Management)

- **Hằng số Toàn cục**: Mọi giá trị "Magic" phải khai báo trong `src/constants/common.js`.
- **Mã Lỗi API**: Sử dụng `ERROR_CODES` từ `#constants/errorCode.js`. Tuyệt đối không hardcode chuỗi lỗi hoặc Status Code thô.
- **Enum Management**: Tất cả enum trong Mongoose **bắt buộc** dùng `Object.values(COMMON_CONSTANTS.*)`. Không viết string trực tiếp.
- **Scope Types**: Dùng `COMMON_CONSTANTS.SCOPE_TYPE.SHOP` / `.BRANCH`. Không hardcode `'SHOP'` / `'BRANCH'`.
- **Cookie**: Luôn dùng `COMMON_CONSTANTS.COOKIE_REFRESH_TOKEN`.
- **Khi cần thêm constant mới**: Thêm vào `common.js` trước, sau đó mới sử dụng.

---

## 5. Quy tắc Nhập liệu & Validation

- **Zero Raw Input**: Không dùng `req.body` / `req.params` trực tiếp. Phải qua `validationHandlingMiddleware`.
- **Sanitization**: Luôn qua `mongoSanitize` (toàn cục) + `sanitizeRequest` (tại từng route). Dùng `GENERATE_UTILS.extractFieldsFromJoi()` để bóc tách field tự động.
- **Strong Typing**: Regex cho Password, Phone, ObjectId lấy từ `#constants/regexp.js`.
- **Validation Messages**: Mọi Joi validation **BẮT BUỘC** gắn `.messages({})` tiếng Việt. Mẫu:
```javascript
name: Joi.string().required().min(3).max(50).trim().messages({
    'string.empty': 'Tên không được để trống',
    'string.min': 'Tên phải có ít nhất {#limit} ký tự',
    'string.max': 'Tên không được vượt quá {#limit} ký tự',
    'any.required': 'Tên là bắt buộc'
})
```
- **ObjectId Validation**: Mọi param `:id`, `:shopId`, `:branchId` phải validate:
```javascript
id: Joi.string().regex(REGEXP.OBJECT_ID).required().messages({
    'string.pattern.base': 'ID không hợp lệ'
})
```

---

## 6. Hướng dẫn Tạo Module Mới (Blueprint)

Khi tạo module mới (VD: Category, Branch, Cart, Order...), tuân theo **checklist** sau:

### Bước 1: Constants & Error Codes
- [ ] Thêm enum/status mới vào `src/constants/common.js` (nếu cần)
- [ ] Thêm error code mới vào `src/constants/errorCode.js` theo format:
```javascript
MODULE_ERROR_NAME: {
    statusCode: StatusCodes.XXX,
    code: 'MODULE_ERROR_NAME',
    message: 'Mô tả lỗi tiếng Việt.'
}
```

### Bước 2: Model (nếu chưa có)
- [ ] Tạo/cập nhật Schema trong `src/models/`
- [ ] Thêm `mongoose-paginate-v2` nếu dữ liệu lớn
- [ ] Thêm Index phù hợp
- [ ] Export trong `src/models/index.js`

### Bước 3: Repository
- [ ] Tạo `src/repositories/[module]Repository.js`
- [ ] Methods chuẩn: `create`, `findById`, `findBy[Field]`, `update`, `deleteById`
- [ ] Dùng `.lean()` cho query đọc
- [ ] Naming convention: `UPPER_CASE_REPOSITORY` cho export (VD: `CATEGORY_REPOSITORY`)

### Bước 4: Validation
- [ ] Tạo `src/validations/[module]Validation.js`
- [ ] Mỗi action là 1 key: `{ body: Joi.object(), params: Joi.object() }`
- [ ] Mọi field có `.messages({})` tiếng Việt
- [ ] ObjectId validate bằng `REGEXP.OBJECT_ID`
- [ ] Enum validate bằng `Joi.string().valid(...Object.values(COMMON_CONSTANTS.*))`

### Bước 5: Service
- [ ] Tạo `src/services/[module]Service.js`
- [ ] Import repository, KHÔNG import Model trực tiếp
- [ ] **BẮT BUỘC** kiểm tra Ownership cho mọi hàm update/delete
- [ ] Throw `ApiError(ERROR_CODES.*)` khi có lỗi

### Bước 6: Controller
- [ ] Tạo `src/controllers/[module]Controller.js`
- [ ] Bọc mọi handler bằng `catchAsync`
- [ ] Truyền `req.user` vào service khi cần kiểm tra quyền
- [ ] Response format chuẩn:
```javascript
res.status(201).json({
    success: true,
    message: 'Mô tả hành động thành công',
    data: result
});
```

### Bước 7: Route
- [ ] Tạo `src/routes/v1/[module]Route.js`
- [ ] Gắn Swagger annotation `@swagger` trên mỗi endpoint
- [ ] Middleware chain đúng thứ tự (Mục 2)
- [ ] **Mount** route mới trong `src/routes/v1/index.js`:
```javascript
import moduleRoute from './[module]Route.js'
router.use('/[modules]', moduleRoute)
```

---

## 7. Audit Logs (Lịch sử hệ thống)

- **Middleware giám sát**: `auditLogMiddleware` cho toàn bộ API (trừ `/health`, `/api-docs`).
- **Selective Logging**: Chỉ log `POST`, `PUT`, `PATCH`, `DELETE`. Tránh log `GET`.
- **Data Truncation**: Truncate body nếu vượt `MAX_LOG_VALUE_LENGTH`. Ẩn password.
- **Retention Policy**: TTL Index tự động xóa log cũ.
- **Non-blocking**: Ghi log theo "Fire and forget".

---

## 8. Swagger API Documentation

- **Location**: Annotation `@swagger` đặt ngay phía trên Route tương ứng trong `src/routes/v1/`.
- **Reusable Schemas**: Dùng `components/schemas` cho đối tượng lặp lại.
- **Error Matching**: Response trong Swagger phải khớp 100% với `ERROR_CODES`.

---

## 9. Redis (Caching & Rate Limiting)

- **Centralized Client**: Dùng duy nhất `redisClient` từ `#configs/redis.js`.
- **Key Naming**: Format `namespace:key` (VD: `rl:auth:127.0.0.1`). Luôn có TTL.

---

## 10. Phong cách Lập trình (Coding Style)

- **ES Modules**: `import/export`, Arrow Functions.
- **Import Alias**: `#configs`, `#utils`, `#models`, `#constants`, `#services`, `#controllers`, `#repositories`, `#middlewares`, `#validations`.
- **Import Organization** (theo thứ tự):
  1. Thư viện bên ngoài (`express`, `mongoose`, `joi`)
  2. Configs/Environment
  3. Constants/Utils
  4. Models/Repositories/Services
  5. Middlewares
- **Sắp xếp ABC** trong cùng nhóm.
- **Controller**: Luôn bọc `catchAsync`.
- **Naming Convention File**: `[module]Model.js`, `[module]Service.js`, `[module]Controller.js`, `[module]Route.js`, `[module]Validation.js`, `[module]Repository.js`.
- **Naming Convention Export**: Repository dùng `UPPER_CASE` (VD: `SHOP_REPOSITORY`), Service/Controller dùng `camelCase` (VD: `shopService`).

---

## 11. Tài chính & Transaction Safety

Khi thao tác với dữ liệu tài chính (`Wallet`, `Inventory`, `Voucher.usedCount`):

- **Luật Ví Ký Quỹ (Escrow)**: Khi thanh toán bằng Wallet, tiền luôn nạp vào `frozenBalance` đầu tiên. **BẮT BUỘC** phải có luồng kế toán chuyển tiền từ `frozenBalance` sang `balance` khả dụng khi trạng thái đơn hàng (SubOrder) chuyển sang cập bến cuối (DELIVERED/COMPLETED).
- **BẮT BUỘC** dùng MongoDB Atomic Operation `$inc` để tăng/giảm số:
```javascript
// ĐÚNGawait Wallet.updateOne({ _id: walletId }, { $inc: { balance: amount } });
// SAI (Race Condition!)
const wallet = await Wallet.findById(walletId);
wallet.balance += amount;
await wallet.save();
```
- **Checkout Flow**: BẮT BUỘC dùng MongoDB `session` (Transaction) để đảm bảo tính toàn vẹn.
- Mọi thay đổi Wallet phải có `Transaction` record tương ứng (audit trail tài chính).

---

## 12. Session Management & Remote Logout

- **Session Record**: Mọi RefreshToken phải có record trong DB gồm: `userId`, `token`, `ipAddress`, `userAgent`, `expiresAt`.
- **Cookie Security**: `HttpOnly`, `Secure` (prod), `SameSite: Strict`.
- **Remote Logout**: Hỗ trợ xóa session theo thiết bị hoặc tất cả.
- **Cookie Cleanup**: `res.clearCookie()` khi logout.
