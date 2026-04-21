import express from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getMonthlyExpenses
} from '../controllers/expenseController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, admin, getExpenses);
router.post('/', protect, admin, createExpense);
router.put('/:id', protect, admin, updateExpense);
router.delete('/:id', protect, admin, deleteExpense);
router.get('/summary', protect, admin, getExpenseSummary);
router.get('/monthly', protect, admin, getMonthlyExpenses);

export default router;
