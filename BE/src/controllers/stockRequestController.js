import { stockRequestService } from '#services/stockRequestService.js';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '#utils/catchAsync.js';

export const stockRequestController = {
    createRequest: catchAsync(async (req, res) => {
        const result = await stockRequestService.createRequest(req.body, req.user);
        res.status(StatusCodes.CREATED).json({
            status: 'success',
            message: 'Yêu cầu nhập kho đã được tạo thành công.',
            data: result
        });
    }),

    updateStatus: catchAsync(async (req, res) => {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const result = await stockRequestService.updateStatus(id, status, req.user, rejectionReason);
        res.status(StatusCodes.OK).json({
            status: 'success',
            message: `Yêu cầu nhập kho đã được cập nhật trạng thái: ${status}`,
            data: result
        });
    }),

    getRequestsByBranch: catchAsync(async (req, res) => {
        const { branchId } = req.params;
        const result = await stockRequestService.getRequestsByBranch(branchId, req.query, req.user);
        res.status(StatusCodes.OK).json({
            status: 'success',
            data: result
        });
    }),

    getRequestsByShop: catchAsync(async (req, res) => {
        const { shopId } = req.params;
        const result = await stockRequestService.getRequestsByShop(shopId, req.query, req.user);
        res.status(StatusCodes.OK).json({
            status: 'success',
            data: result
        });
    })
};
