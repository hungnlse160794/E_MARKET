import { catchAsync } from '#utils/catchAsync.js';
import { voucherService } from '#services/voucherService.js';

export const voucherController = {
    createVoucher: catchAsync(async (req, res) => {
        const result = await voucherService.createVoucher(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Tạo voucher thành công',
            data: result
        });
    }),

    getVoucherByCode: catchAsync(async (req, res) => {
        const result = await voucherService.getVoucherByCode(req.params.code);
        res.status(200).json({
            success: true,
            message: 'Lấy thông tin voucher thành công',
            data: result
        });
    }),

    getShopVouchers: catchAsync(async (req, res) => {
        const result = await voucherService.getShopVouchers(req.params.shopId);
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách voucher gian hàng thành công',
            data: result
        });
    }),

    getPlatformVouchers: catchAsync(async (req, res) => {
        const result = await voucherService.getPlatformVouchers();
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách voucher sàn thành công',
            data: result
        });
    }),

    updateVoucher: catchAsync(async (req, res) => {
        const result = await voucherService.updateVoucher(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'Cập nhật voucher thành công',
            data: result
        });
    }),

    deleteVoucher: catchAsync(async (req, res) => {
        await voucherService.deleteVoucher(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'Xóa voucher thành công'
        });
    })
};
