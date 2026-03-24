import { env } from '#configs/environment.js';

export const shippingService = {
    /**
     * Tính toán phí vận chuyển sử dụng Giao Hàng Nhanh (GHN)
     * Thường gọi khi User vào giỏ hàng và chọn địa chỉ giao.
     */
    calculateShippingFee: async (fromDistrictId, fromWardCode, toDistrictId, toWardCode, weightGram = 1000) => {
        try {
            if (!env.GHN_API_TOKEN) {
                // Fallback nếu không có cấu hình GHN
                return 30000;
            }

            const response = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': env.GHN_API_TOKEN,
                    'ShopId': env.GHN_SHOP_ID
                },
                body: JSON.stringify({
                    from_district_id: fromDistrictId,
                    from_ward_code: fromWardCode,
                    to_district_id: toDistrictId,
                    to_ward_code: toWardCode,
                    weight: weightGram,
                    service_type_id: 2 // Chuẩn giao đường bộ
                })
            });

            const data = await response.json();
            if (data.code === 200) {
                return data.data.total;
            } else {
                console.error("GHN API ERROR:", data.message);
                return 30000;
            }
        } catch (error) {
            console.error('Lỗi khi tính phí ship GHN:', error.message);
            return 30000; // Flat fee fallback
        }
    }
};
