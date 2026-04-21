import express from 'express';
import { getDashboardStats, getSalesReport, getProductSalesReport, exportSalesReportCSV } from '../controllers/reportController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/sales', protect, admin, getSalesReport);
router.get('/product-sales', protect, admin, getProductSalesReport);
router.get('/export', protect, admin, exportSalesReportCSV);

export default router;
