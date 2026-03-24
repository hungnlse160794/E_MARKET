import express from 'express'

import authRoute from './authRoute.js'
import branchRoute from './branchRoute.js'
import categoryRoute from './categoryRoute.js'
import productRoute from './productRoute.js'
import shopRoute from './shopRoute.js'
import voucherRoute from './voucherRoute.js'
import cartRoute from './cartRoute.js'
import orderRoute from './orderRoute.js'
import walletRoute from './walletRoute.js'
import inventoryRoute from './inventoryRoute.js'
import notificationRoute from './notificationRoute.js'
import reviewRoute from './reviewRoute.js'
import blogRoute from './blogRoute.js'
import chatRoute from './chatRoute.js'
import stockRequestRoute from './stockRequestRoute.js'

const router = express.Router()

// Mount các sub-routes
router.use('/auth', authRoute)
router.use('/branches', branchRoute)
router.use('/categories', categoryRoute)
router.use('/products', productRoute)
router.use('/shops', shopRoute)
router.use('/vouchers', voucherRoute)
router.use('/cart', cartRoute)
router.use('/orders', orderRoute)
router.use('/wallets', walletRoute)
router.use('/inventory', inventoryRoute)
router.use('/notifications', notificationRoute)
router.use('/reviews', reviewRoute)
router.use('/blogs', blogRoute)
router.use('/chats', chatRoute)
router.use('/stock-requests', stockRequestRoute)

export default router