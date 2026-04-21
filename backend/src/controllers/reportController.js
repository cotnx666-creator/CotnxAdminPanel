import { query } from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const isStaff = req.user.role === 'Staff';

  try {
    const stats = {
      totalOrdersToday: query("SELECT COUNT(*) as count FROM orders WHERE created_at::date = $1", [today]),
      pendingOrders: query("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'"),
      lowStock: query("SELECT COUNT(*) as count FROM products WHERE stock <= 5"),
      recentSales: query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5")
    };

    if (!isStaff) {
      stats.totalSalesToday = query("SELECT SUM(total_amount) as total FROM orders WHERE created_at::date = $1", [today]);
      stats.totalSalesMonth = query("SELECT SUM(total_amount) as total FROM orders WHERE created_at::date >= $1", [firstDayOfMonth]);
      stats.totalOrders = query("SELECT COUNT(*) as count FROM orders");
      stats.topProducts = query(`
        SELECT p.name, SUM(oi.quantity) as sold 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        GROUP BY p.id, p.name
        ORDER BY sold DESC 
        LIMIT 5
      `);
    }

    const keys = Object.keys(stats);
    const results = await Promise.all(Object.values(stats));
    
    const formattedData = {};
    keys.forEach((key, index) => {
      const result = results[index];
      if (key === 'topProducts' || key === 'recentSales') {
        formattedData[key] = result.rows;
      } else {
        const val = result.rows[0];
        formattedData[key] = parseFloat(val.total || val.count || 0);
      }
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalesReport = async (req, res) => {
  const { start_date, end_date } = req.query;
  
  let sql = `
    SELECT created_at::date as date, SUM(total_amount) as revenue, COUNT(*) as orders 
    FROM orders 
    WHERE 1=1
  `;
  const params = [];

  if (start_date) {
    params.push(start_date);
    sql += ` AND created_at::date >= $${params.length}`;
  }
  if (end_date) {
    params.push(end_date);
    sql += ` AND created_at::date <= $${params.length}`;
  }

  sql += " GROUP BY created_at::date ORDER BY date ASC";

  try {
    const result = await query(sql, params);
    const rows = result.rows.map(row => ({
      ...row,
      revenue: parseFloat(row.revenue),
      orders: parseInt(row.orders)
    }));
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductSalesReport = async (req, res) => {
  const { start_date, end_date } = req.query;
  
  let sql = `
    SELECT p.name, p.sku, SUM(oi.quantity) as total_quantity, SUM(oi.quantity * oi.price) as total_revenue,
           SUM(oi.quantity * (oi.price - p.buying_price)) as total_profit
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE 1=1
  `;
  const params = [];

  if (start_date) {
    params.push(start_date);
    sql += ` AND o.created_at::date >= $${params.length}`;
  }
  if (end_date) {
    params.push(end_date);
    sql += ` AND o.created_at::date <= $${params.length}`;
  }

  sql += " GROUP BY p.id, p.name, p.sku ORDER BY total_revenue DESC";

  try {
    const result = await query(sql, params);
    const rows = result.rows.map(row => ({
      ...row,
      total_quantity: parseInt(row.total_quantity),
      total_revenue: parseFloat(row.total_revenue),
      total_profit: parseFloat(row.total_profit)
    }));
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportSalesReportCSV = async (req, res) => {
  const { start_date, end_date } = req.query;
  
  let sql = `
    SELECT created_at::date as "Date", total_amount as "Amount", customer_name as "Customer", status as "Status", payment_status as "Payment"
    FROM orders 
    WHERE 1=1
  `;
  const params = [];

  if (start_date) {
    params.push(start_date);
    sql += ` AND created_at::date >= $${params.length}`;
  }
  if (end_date) {
    params.push(end_date);
    sql += ` AND created_at::date <= $${params.length}`;
  }

  try {
    const result = await query(sql, params);
    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data to export' });
    }

    const fields = Object.keys(rows[0]);
    const csv = [
      fields.join(','),
      ...rows.map(row => fields.map(field => `"${row[field]}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
