import express from 'express';
import { getCustomers, getCustomerOrders } from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getCustomers);
router.get('/:id/orders', protect, getCustomerOrders);

export default router;
