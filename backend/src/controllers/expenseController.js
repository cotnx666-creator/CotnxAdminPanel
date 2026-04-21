import { query } from '../config/db.js';

export const getExpenses = async (req, res) => {
  const { category, start_date, end_date } = req.query;
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];

  if (category) {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }
  if (start_date) {
    params.push(start_date);
    sql += ` AND date >= $${params.length}`;
  }
  if (end_date) {
    params.push(end_date);
    sql += ` AND date <= $${params.length}`;
  }

  sql += ' ORDER BY date DESC, created_at DESC';

  try {
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  const { title, amount, category, date, notes } = req.body;

  if (!title || !amount || !category || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const validCategories = ['Product Purchase', 'Shipping', 'Packaging', 'Marketing', 'Miscellaneous'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: 'Invalid category' });
  }

  try {
    const result = await query(
      'INSERT INTO expenses (title, amount, category, date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [title, amount, category, date, notes || '']
    );
    res.status(201).json({ success: true, data: { id: result.rows[0].id, message: 'Expense added successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date, notes } = req.body;

  try {
    await query(
      `UPDATE expenses SET 
        title = COALESCE($1, title),
        amount = COALESCE($2, amount),
        category = COALESCE($3, category),
        date = COALESCE($4, date),
        notes = COALESCE($5, notes)
      WHERE id = $6`,
      [title, amount, category, date, notes, id]
    );
    res.json({ success: true, message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM expenses WHERE id = $1', [id]);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenseSummary = async (req, res) => {
  const sql = `
    SELECT 
      category,
      COUNT(*) as count,
      SUM(amount) as total
    FROM expenses
    GROUP BY category
  `;

  try {
    const result = await query(sql);
    const rows = result.rows;
    const total = rows.reduce((sum, row) => sum + parseFloat(row.total), 0);
    const breakdown = rows.map(row => ({
      ...row,
      total: parseFloat(row.total),
      percentage: total > 0 ? ((parseFloat(row.total) / total) * 100).toFixed(2) : 0
    }));

    res.json({
      success: true,
      data: {
        categories: breakdown,
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyExpenses = async (req, res) => {
  const { year } = req.query;
  const currentYear = year || new Date().getFullYear();

  // date is VARCHAR(50), assuming YYYY-MM-DD
  const sql = `
    SELECT 
      SUBSTRING(date, 1, 7) as month,
      category,
      SUM(amount) as total
    FROM expenses
    WHERE SUBSTRING(date, 1, 4) = $1
    GROUP BY SUBSTRING(date, 1, 7), category
    ORDER BY month ASC
  `;

  try {
    const result = await query(sql, [currentYear.toString()]);
    const rows = result.rows.map(row => ({
      ...row,
      total: parseFloat(row.total)
    }));
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
