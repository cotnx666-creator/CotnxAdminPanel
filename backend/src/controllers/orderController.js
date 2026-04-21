import { query } from '../config/db.js';
import { logActivity } from '../utils/logger.js';
import PDFDocument from 'pdfkit';

export const createOrder = async (req, res) => {
  const { customer_name, customer_phone, customer_address, items, payment_status } = req.body;
  const isStaff = req.user.role === 'Staff';

  try {
    const productIds = items.map(item => item.product_id);
    const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
    
    const dbProductsResult = await query(`SELECT id, selling_price, discount FROM products WHERE id IN (${placeholders})`, productIds);
    const dbProducts = dbProductsResult.rows;

    const finalItems = items.map(item => {
      const dbProd = dbProducts.find(p => p.id === parseInt(item.product_id));
      if (!dbProd) throw new Error(`Product ${item.product_id} not found`);
      
      const price = isStaff ? parseFloat(dbProd.selling_price) : (parseFloat(item.price) || parseFloat(dbProd.selling_price));
      const discount = isStaff ? parseFloat(dbProd.discount) : (parseFloat(item.discount) || parseFloat(dbProd.discount));
      const finalPrice = price * (1 - (discount / 100));

      return {
        ...item,
        price: finalPrice
      };
    });

    const total_amount = finalItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Use a single transaction for order creation
    await query('BEGIN');

    // Create or update customer
    const customerResult = await query(
      'INSERT INTO customers (name, phone, address) VALUES ($1, $2, $3) ON CONFLICT(phone) DO UPDATE SET name=excluded.name, address=excluded.address RETURNING id',
      [customer_name, customer_phone, customer_address]
    );
    const customerId = customerResult.rows[0].id;

    // Create order
    const orderResult = await query(
      `INSERT INTO orders (customer_id, customer_name, customer_phone, customer_address, total_amount, payment_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [customerId, customer_name, customer_phone, customer_address, total_amount, payment_status || 'Pending']
    );
    const orderId = orderResult.rows[0].id;

    // Insert items and update stock
    for (const item of finalItems) {
      await query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)', 
        [orderId, item.product_id, item.quantity, item.price]);
      await query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
      await query('INSERT INTO inventory_logs (product_id, type, quantity, reason) VALUES ($1, $2, $3, $4)', 
        [item.product_id, 'out', item.quantity, `Order #${orderId}`]);
    }

    await query('COMMIT');
    logActivity(req.user.id, 'CREATE_ORDER', { orderId });
    
    res.status(201).json({ success: true, data: { id: orderId, message: 'Order created successfully' } });
  } catch (error) {
    await query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, payment_status } = req.body;
  const isStaff = req.user.role === 'Staff';

  if (isStaff && payment_status !== undefined) {
    return res.status(403).json({ success: false, message: 'Staff cannot modify payment status' });
  }

  if (isStaff && status && !['Shipped', 'Delivered', 'Pending'].includes(status)) {
    return res.status(403).json({ success: false, message: 'Invalid status update for staff' });
  }
  
  try {
    const sql = isStaff 
      ? 'UPDATE orders SET status = COALESCE($1, status) WHERE id = $2'
      : 'UPDATE orders SET status = COALESCE($1, status), payment_status = COALESCE($2, payment_status) WHERE id = $3';
    
    const params = isStaff ? [status, id] : [status, payment_status, id];

    await query(sql, params);
    logActivity(req.user.id, 'UPDATE_ORDER_STATUS', { orderId: id, status, payment_status });
    res.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const itemsResult = await query('SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1', [id]);
    const items = itemsResult.rows;

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);

    doc.pipe(res);
    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: #${order.id}`);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Customer Name: ${order.customer_name}`);
    doc.text(`Phone: ${order.customer_phone}`);
    doc.text(`Address: ${order.customer_address}`);
    doc.moveDown();
    doc.fontSize(14).text('Items', { underline: true });
    doc.moveDown(0.5);
    
    items.forEach(item => {
      doc.fontSize(12).text(`${item.name} x ${item.quantity} - $${(parseFloat(item.price) * item.quantity).toFixed(2)}`);
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Amount: $${parseFloat(order.total_amount).toFixed(2)}`, { align: 'right' });
    doc.fontSize(12).text(`Payment Status: ${order.payment_status}`, { align: 'right' });
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
