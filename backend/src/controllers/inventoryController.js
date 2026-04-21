import pool, { query } from '../config/db.js';
import { logActivity } from '../utils/logger.js';

export const getInventoryLogs = async (req, res) => {
  const sql = `
    SELECT l.*, p.name as product_name, p.sku 
    FROM inventory_logs l 
    JOIN products p ON l.product_id = p.id 
    ORDER BY l.created_at DESC
  `;
  try {
    const result = await query(sql);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStock = async (req, res) => {
  const { product_id, type, quantity, reason } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updateQuery = type === 'in' 
      ? 'UPDATE products SET stock = stock + $1 WHERE id = $2' 
      : 'UPDATE products SET stock = stock - $1 WHERE id = $2';

    await client.query(updateQuery, [quantity, product_id]);

    await client.query(
      'INSERT INTO inventory_logs (product_id, type, quantity, reason) VALUES ($1, $2, $3, $4)',
      [product_id, type, quantity, reason]
    );

    await client.query('COMMIT');
    
    // Non-blocking activity log
    logActivity(req.user.id, 'UPDATE_STOCK', { product_id, type, quantity, reason });
    
    res.json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
