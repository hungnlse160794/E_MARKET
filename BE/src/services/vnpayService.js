import crypto from 'crypto';
import querystring from 'querystring';
import { env } from '#configs/environment.js';

export const vnpayService = {
    /**
     * Tạo URL thanh toán VNPay
     */
    createPaymentUrl: (orderId, amount, ipAddr) => {
        let tmnCode = env.VNP_TMN_CODE || 'DEMO';
        let secretKey = env.VNP_HASH_SECRET || 'DEMO_SECRET';
        let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        let returnUrl = env.VNP_RETURN_URL || 'http://localhost:5173/wallet/callback';

        let date = new Date();
        // Định dạng YYYYMMDDHHmmss
        let createDate = date.toISOString().replace(/T/, '').replace(/\..+/, '').replace(/[-:]/g, ''); 

        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': orderId,
            'vnp_OrderInfo': 'Nap tien vao vi E-Market: ' + orderId,
            'vnp_OrderType': 'topup',
            'vnp_Amount': amount * 100, // Nhân 100 theo chuẩn VNPay
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate
        };

        // Sắp xếp param theo alphabet
        vnp_Params = Object.keys(vnp_Params)
            .sort()
            .reduce((obj, key) => {
                obj[key] = vnp_Params[key];
                return obj;
            }, {});

        let signData = querystring.stringify(vnp_Params);
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params);

        return vnpUrl;
    },

    /**
     * Xác thực thông tin VNPay Return
     */
    verifyIpnCall: (query) => {
        let vnp_Params = { ...query };
        let secureHash = vnp_Params['vnp_SecureHash'];
        
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = Object.keys(vnp_Params)
            .sort()
            .reduce((obj, key) => {
                obj[key] = vnp_Params[key];
                return obj;
            }, {});

        let secretKey = env.VNP_HASH_SECRET || 'DEMO_SECRET';
        let signData = querystring.stringify(vnp_Params);
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            return {
                isSuccess: vnp_Params['vnp_ResponseCode'] === '00',
                orderId: vnp_Params['vnp_TxnRef'],
                amount: parseInt(vnp_Params['vnp_Amount']) / 100
            };
        } else {
            return { isSuccess: false, message: 'Invalid Signature' };
        }
    }
};
