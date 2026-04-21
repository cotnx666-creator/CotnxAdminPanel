import { query } from '../config/db.js';

export const getCategories = async (req, res) => {
  const sql = `
    SELECT c.*, string_agg(s.name, ',') as subcategories 
    FROM categories c 
    LEFT JOIN subcategories s ON c.id = s.category_id 
    GROUP BY c.id
    ORDER BY c.name ASC
  `;
  try {
    const result = await query(sql);
    const categories = result.rows.map(row => ({
      ...row,
      subcategories: row.subcategories ? row.subcategories.split(',') : []
    }));
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation in Postgres
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubcategory = async (req, res) => {
  const { category_id, name } = req.body;
  try {
    const result = await query(
      'INSERT INTO subcategories (category_id, name) VALUES ($1, $2) RETURNING *',
      [category_id, name]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Subcategory already exists for this category' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM subcategories WHERE id = $1', [id]);
    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
