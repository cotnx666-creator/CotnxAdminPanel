import express from 'express';
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerLedger,
  addTransaction,
  deleteTransaction,
  getFinancialSummary
} from '../controllers/financeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, admin, getFinancialSummary);
router.get('/partners', protect, admin, getPartners);
router.post('/partners', protect, admin, createPartner);
router.put('/partners/:id', protect, admin, updatePartner);
router.delete('/partners/:id', protect, admin, deletePartner);
router.get('/partners/:id/ledger', protect, admin, getPartnerLedger);
router.post('/transactions', protect, admin, addTransaction);
router.delete('/transactions/:id', protect, admin, deleteTransaction);

export default router;
