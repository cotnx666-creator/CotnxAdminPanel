import { query } from '../config/db.js';
import { supabase } from '../config/supabase.js';

export const getProducts = async (req, res) => {
  const { search, category, subcategory, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  let baseQuery = 'FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id';
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push('(p.name ILIKE $1 OR p.sku ILIKE $2)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    const paramIdx = params.length + 1;
    conditions.push(`p.category = $${paramIdx}`);
    params.push(category);
  }
  if (subcategory) {
    const paramIdx = params.length + 1;
    conditions.push(`p.subcategory = $${paramIdx}`);
    params.push(subcategory);
  }

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    const countQuery = `SELECT COUNT(DISTINCT p.id) as total ${baseQuery}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const dataQuery = `
      SELECT p.*, string_agg(pi.image_url, ',') as images 
      ${baseQuery} 
      GROUP BY p.id 
      ORDER BY p.created_at DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const dataResult = await query(dataQuery, [...params, limit, offset]);
    
    const products = dataResult.rows.map(row => ({
      ...row,
      images: row.images ? row.images.split(',') : [],
      sizes: row.sizes ? JSON.parse(row.sizes) : [],
      colors: row.colors ? JSON.parse(row.colors) : [],
      profit: parseFloat(row.selling_price) - parseFloat(row.buying_price)
    }));
    
    res.json({
      success: true,
      data: {
        products,
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  const {
    name, description, buying_price, selling_price,
    category, subcategory, stock, sku, discount, sizes, colors
  } = req.body;

  try {
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        images.push(publicUrl);
      }
    }

    const result = await query(
      `INSERT INTO products (
        name, description, buying_price, selling_price, 
        category, subcategory, stock, sku, discount, sizes, colors
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        name, description, buying_price, selling_price,
        category, subcategory, stock, sku, discount,
        JSON.stringify(sizes || []), JSON.stringify(colors || [])
      ]
    );
    
    const productId = result.rows[0].id;
    
    if (images.length > 0) {
      for (const imgUrl of images) {
        await query('INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)', [productId, imgUrl]);
      }
    }

    res.status(201).json({ success: true, data: { id: productId, message: 'Product created successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name, description, buying_price, selling_price,
    category, subcategory, stock, sku, discount, sizes, colors
  } = req.body;

  try {
    await query(
      `UPDATE products SET 
        name = $1, description = $2, buying_price = $3, selling_price = $4,
        category = $5, subcategory = $6, stock = $7, sku = $8, 
        discount = $9, sizes = $10, colors = $11
      WHERE id = $12`,
      [
        name, description, buying_price, selling_price,
        category, subcategory, stock, sku, discount,
        JSON.stringify(sizes || []), JSON.stringify(colors || []),
        id
      ]
    );
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
