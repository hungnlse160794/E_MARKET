---
name: frontend-saas-standard
description: "Bộ quy tắc chuẩn cho Frontend dự án SaaS: Strict Typing (No Any), React Query Patterns, UI/UX Guidelines, và cấu trúc thư mục."
---

# SaaS Frontend Development Standards (v1.0)

Bộ quy tắc này bắt buộc Antigravity tuân thủ khi phát triển các tính năng Frontend.

## 1. Strict Typing Policy (Zero Any)

**NGHIÊM CẦM** sử dụng kiểu `: any` hoặc ép kiểu `as any` trong toàn bộ codebase.

- **Data Fetching**: Luôn định nghĩa Interface cho dữ liệu trả về từ API.
- **React Query**: Luôn truyền Generics vào `useQuery` và `useMutation`.
  - Mẫu: `useMutation<TData, TError, TVariables>()`
- **Axios**: Tránh sử dụng kiểu `any` trong các hàm call API.
- **Error Handling**: Sử dụng `AxiosError` hoặc kiểu `Error` cụ thể thay vì `any`.

## 2. React Query & Data Management

- Tuân thủ cấu trúc: `hooks` chứa logic fetch/mutate, `stores` (Zustand) chứa global state.
- **Mutation Logic**: Xử lý `onSuccess` và `onError` tập trung để đảm bảo tính nhất quán của UI.
- **Auto-Refresh**: Tận dụng `queryClient.invalidateQueries()` để làm mới dữ liệu sau khi mutate thành công.

## 3. UI/UX & Design System

- **Aesthetics**: Luôn sử dụng thiết kế Premium, hiện đại (Gradients, Glassmorphism, Micro-animations).
- **UI Components**: **BẮT BUỘC** sử dụng components của **ShadcnUI** (`@/components/ui/`). Nếu chưa có, hãy cài đặt theo chuẩn Shadcn.
- **Animations**: Phải sử dụng **Framer Motion** cho các hiệu ứng chuyển cảnh, hover, và tương tác người dùng để tạo cảm giác mượt mà (premium feel).
- **Interactivity**: Tất cả các element có thể click được (button, link, card, menu item...) **PHẢI** có `cursor: pointser`.
- **Icons**: Sử dụng `lucide-react`. Phải type là `LucideIcon` (dùng `import type`).
- **Responsive**: Mọi component phải hoạt động tốt trên Mobile và Desktop.
- **Loading & Error states**: Luôn có UI Feedback (Skeleton, Spinner, Toast) cho các tác vụ bất đồng bộ.

## 4. Import & Module Management

- Sử dụng `@/` alias cho tất cả đường dẫn bên trong `src/`.
- **Verbatim Module Syntax**: Bắt buộc dùng `import type` khi chỉ import kiểu dữ liệu.

## 5. Cấu trúc và Quản lý Type (Type Organization)

**BẮT BUỘC** phân tách và đặt Type ở vị trí hợp lý theo chức năng:

- **API Types (Request/Response)**: Đặt trong thư mục `src/types/api/`.
  - Mỗi module API (auth, product, order...) nên có 1 file riêng (ví dụ: `auth.api.ts`).
- **Domain/Entity Types**: Các interface cốt lõi dùng chung toàn hệ thống (`IUser`, `IProduct`) đặt tại `src/types/entities/` hoặc `src/types/index.ts`.
- **UI/Feature Types**: Các type phục vụ riêng cho UI/Logic của một Feature nhất định đặt tại thư mục `types/` bên trong Feature đó.
  - Ví dụ: `src/features/auth/types/index.ts`.
- **Global Types**: Các type dùng chung cho toàn bộ ứng dụng (Common, Utils) đặt tại `src/types/common.ts`.

## 6. Premium Loading States (BẮT BUỘC)

- **Skeleton Grids/Tables**: **TUYỆT ĐỐI KHÔNG** chỉ sử dụng một Skeleton đơn lẻ cho cả trang. Đối với các trang danh sách (List, Table), **BẮT BUỘC** hiển thị Skeleton có cấu trúc tương đồng với giao diện thật (Header bảng, các hàng giả lập với Icon, Text, Button khung...).
- **Pattern Matching**: Skeleton phải khớp với số cột và tỷ lệ của dữ liệu thật để tránh hiện tượng "nhảy" giao diện khi dữ liệu được tải xong (CLS - Cumulative Layout Shift).
- **Trạng thái Kích hoạt (Trigger Rule)**: **BẮT BUỘC** sử dụng đồng thời `isLoading || isFetching` (hoặc `isPending` trong RQ v5) để hiển thị Skeleton ngay cả khi người dùng đang thực hiện lọc (Filtering) hoặc tìm kiếm (Searching), nhằm tạo cảm giác nội dung đang được cập nhật liên tục.
- **Mẫu thực thi (Skeleton Table Example)**:
```tsx
// Ví dụ Skeleton cho một Table có 5 cột
<div className="bg-white rounded-3xl border border-slate-100 p-4">
  <div className="flex gap-4 mb-6 border-b pb-4">
     {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 flex-1 rounded-lg" />)}
  </div>
  {[1, 2, 3, 4, 5].map(i => (
    <div key={i} className="flex items-center gap-6 py-4 border-b last:border-0 border-slate-50">
       <Skeleton className="h-12 w-12 rounded-full" /> {/* Avatar */}
       <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3 rounded-lg" /> {/* Tên */}
          <Skeleton className="h-3 w-1/4 rounded-lg opacity-50" /> {/* Email/Phone */}
       </div>
       <Skeleton className="h-8 w-24 rounded-xl" /> {/* Badge Trạng thái */}
       <Skeleton className="h-8 w-8 rounded-full" /> {/* Button Action */}
    </div>
  ))}
</div>
```

## 7. Marketplace UI/UX & Trust Patterns (Nano Banana Inspired)

Dự án đang chuyển hướng sang mô hình **Marketplace (Sàn thương mại điện tử)**. Tất cả các components liên quan đến Shop/Branch/Vendor phải tuân thủ các tiêu chuẩn sau:

- **Vendor Identification**: Shop/Branch không chỉ là text thông tin, mà phải là một "Thương hiệu" riêng biệt.
- **Reliability Metrics (Chỉ số tin cậy)**: Bắt buộc hiển thị các chỉ số sau để xây dựng lòng tin:
  - **Đánh giá (Ratings)**: Số sao và số lượng đánh giá.
  - **Phản hồi (Response Rate)**: % phản hồi tin nhắn và thời gian phản hồi (ví dụ: "trong vòng vài giờ").
  - **Sản phẩm (Products)**: Tổng số mặt hàng Shop đang kinh doanh.
  - **Thời gian tham gia (Joined)**: Thời gian Shop đã hoạt động trên sàn.
- **Trust Signals**: Sử dụng Badge "Verified", "Mall", hoặc "Yêu thích" để phân loại gian hàng chất lượng.
- **Call to Actions (CTAs)**:
  - Phải có nút "Xem Shop" (View Shop) để người dùng khám phá thêm sản phẩm.
  - Nút "Chat Ngay" (Chat Now) để hỗ trợ trực tiếp.
- **Aesthetics (Nano Banana Standard)**:
  - Sử dụng bo góc lớn (`rounded-3xl` hoặc `rounded-4xl`).
  - Đổ bóng nhẹ (`shadow-xl shadow-slate-200/50`) để tạo chiều sâu.
  - Hiệu ứng hover cho Card Profile (ví dụ: scale nhẹ, đổi màu border).

---

_Ghi chú: Mọi vi phạm quy tắc "Zero Any", "Loading Pattern", hoặc "Marketplace Standard" sẽ bị coi là code không đạt chuẩn._
