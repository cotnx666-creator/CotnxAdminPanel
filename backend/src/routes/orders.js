import express from 'express';
import { createOrder, getOrders, updateOrderStatus, generateInvoice } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getOrders);
router.post('/', protect, createOrder);
router.put('/:id', protect, updateOrderStatus);
router.get('/:id/invoice', protect, generateInvoice);

export default router;
