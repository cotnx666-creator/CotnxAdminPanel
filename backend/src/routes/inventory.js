import express from 'express';
import { getInventoryLogs, updateStock } from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/logs', protect, getInventoryLogs);
router.post('/update', protect, updateStock);

export default router;
