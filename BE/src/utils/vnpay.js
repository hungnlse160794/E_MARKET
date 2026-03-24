import crypto from 'crypto';
import { format } from 'date-fns';

/**
 * VNPay Utility for SaaS Digital Curator
 * Chuẩn kết nối VNPay v2.1 (SHA512)
 */
export const VNPayUtil = {
    /**
     * Tạo URL thanh toán VNPay
     */
    createPaymentUrl: (orderId, amount, ipAddr, returnUrl) => {
        const tmnCode = process.env.VNPAY_TMN_CODE || 'ABC12345';
        const secretKey = process.env.VNPAY_HASH_SECRET || 'SECRET12345';
        let vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        
        const date = new Date();
        const createDate = format(date, 'yyyyMMddHHmmss');
        
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang #${orderId}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay counts in cents
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        // Sort parameters
        vnp_Params = Object.keys(vnp_Params)
            .sort()
            .reduce((obj, key) => {
                obj[key] = vnp_Params[key];
                return obj;
            }, {});

        // Build Query String
        const signData = new URLSearchParams(vnp_Params).toString();
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        const finalUrl = vnpUrl + '?' + new URLSearchParams(vnp_Params).toString();
        return finalUrl;
    },

    /**
     * Xác thực chữ ký từ VNPay (IPN/Return)
     */
    verifyReturnUrl: (vnp_Params) => {
        const secretKey = process.env.VNPAY_HASH_SECRET || 'SECRET12345';
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sort parameters
        const sortedParams = Object.keys(vnp_Params)
            .sort()
            .reduce((obj, key) => {
                obj[key] = vnp_Params[key];
                return obj;
            }, {});

        const signData = new URLSearchParams(sortedParams).toString();
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        return secureHash === signed;
    }
};
