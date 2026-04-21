import { query } from '../config/db.js';

export const getCustomers = async (req, res) => {
  try {
    const result = await query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerOrders = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
