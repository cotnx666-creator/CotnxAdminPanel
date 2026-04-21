import express from 'express';
import { 
  getCategories, 
  createCategory, 
  deleteCategory, 
  createSubcategory, 
  deleteSubcategory 
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getCategories);
router.post('/', protect, admin, createCategory);
router.delete('/:id', protect, admin, deleteCategory);

router.post('/subcategory', protect, admin, createSubcategory);
router.delete('/subcategory/:id', protect, admin, deleteSubcategory);

export default router;
