import { query as executeQuery } from '../config/db.js';

export const getPartners = async (req, res) => {
  const query = `
    SELECT p.*, 
      COALESCE(SUM(CASE WHEN t.type = 'INVEST' THEN t.amount ELSE 0 END), 0) as total_invested,
      COALESCE(SUM(CASE WHEN t.type = 'WITHDRAW' THEN t.amount ELSE 0 END), 0) as total_withdrawn,
      COALESCE(SUM(CASE WHEN t.type = 'PROFIT' THEN t.amount ELSE 0 END), 0) as total_profit
    FROM partners p
    LEFT JOIN partner_transactions t ON p.id = t.partner_id
    GROUP BY p.id
  `;
  
  try {
    const result = await executeQuery(query);
    const rows = result.rows;
    
    const totalInvestment = rows.reduce((sum, p) => sum + parseFloat(p.initial_investment), 0);
    const partners = rows.map(p => ({
      ...p,
      ownership_percentage: totalInvestment > 0 ? ((parseFloat(p.initial_investment) / totalInvestment) * 100).toFixed(2) : 0,
      net_investment: parseFloat(p.initial_investment) + parseFloat(p.total_invested) - parseFloat(p.total_withdrawn)
    }));
    
    res.json({ success: true, data: partners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPartner = async (req, res) => {
  const { name, initial_investment } = req.body;
  
  if (!name) return res.status(400).json({ success: false, message: 'Partner name is required' });
  
  try {
    const result = await executeQuery(
      'INSERT INTO partners (name, initial_investment) VALUES ($1, $2) RETURNING id',
      [name, initial_investment || 0]
    );
    res.status(201).json({ success: true, data: { id: result.rows[0].id, name, initial_investment: initial_investment || 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePartner = async (req, res) => {
  const { id } = req.params;
  const { name, initial_investment } = req.body;
  
  try {
    await executeQuery(
      'UPDATE partners SET name = COALESCE($1, name), initial_investment = COALESCE($2, initial_investment) WHERE id = $3',
      [name, initial_investment, id]
    );
    res.json({ success: true, message: 'Partner updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePartner = async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery('DELETE FROM partners WHERE id = $1', [id]);
    res.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPartnerLedger = async (req, res) => {
  const { id } = req.params;
  
  try {
    const partnerResult = await executeQuery('SELECT * FROM partners WHERE id = $1', [id]);
    const partner = partnerResult.rows[0];
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    
    const txResult = await executeQuery('SELECT * FROM partner_transactions WHERE partner_id = $1 ORDER BY date DESC, created_at DESC', [id]);
    const transactions = txResult.rows;
      
    const totalInvested = transactions.filter(t => t.type === 'INVEST').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalWithdrawn = transactions.filter(t => t.type === 'WITHDRAW').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalProfit = transactions.filter(t => t.type === 'PROFIT').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    res.json({
      success: true,
      data: {
        partner,
        transactions,
        summary: {
          initial_investment: parseFloat(partner.initial_investment),
          total_invested: totalInvested,
          total_withdrawn: totalWithdrawn,
          total_profit: totalProfit,
          net_investment: parseFloat(partner.initial_investment) + totalInvested - totalWithdrawn,
          current_balance: parseFloat(partner.initial_investment) + totalInvested - totalWithdrawn + totalProfit
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTransaction = async (req, res) => {
  const { partner_id, type, amount, date, notes } = req.body;
  
  if (!partner_id || !type || !amount || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  if (!['INVEST', 'WITHDRAW', 'PROFIT'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid transaction type' });
  }
  
  try {
    await executeQuery(
      'INSERT INTO partner_transactions (partner_id, type, amount, date, notes) VALUES ($1, $2, $3, $4, $5)',
      [partner_id, type, amount, date, notes || '']
    );
    res.status(201).json({ success: true, message: 'Transaction added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery('DELETE FROM partner_transactions WHERE id = $1', [id]);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFinancialSummary = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const salesResult = await executeQuery('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders');
    const expensesResult = await executeQuery('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
    const investmentResult = await executeQuery('SELECT COALESCE(SUM(initial_investment), 0) as total FROM partners');
    const withdrawResult = await executeQuery("SELECT COALESCE(SUM(amount), 0) as total FROM partner_transactions WHERE type = 'WITHDRAW'");
    
    const totalSales = parseFloat(salesResult.rows[0].total);
    const totalExpenses = parseFloat(expensesResult.rows[0].total);
    const netProfit = totalSales - totalExpenses;
    
    const partnersQuery = `
      SELECT p.*, 
        COALESCE(SUM(CASE WHEN t.type = 'INVEST' THEN t.amount ELSE 0 END), 0) as total_invested,
        COALESCE(SUM(CASE WHEN t.type = 'PROFIT' THEN t.amount ELSE 0 END), 0) as total_profit
      FROM partners p
      LEFT JOIN partner_transactions t ON p.id = t.partner_id
      GROUP BY p.id
    `;
    
    const partnersResult = await executeQuery(partnersQuery);
    const partners = partnersResult.rows;
    
    const totalInvestment = parseFloat(investmentResult.rows[0].total);
    
    const partnerSummaries = partners.map(p => {
      const ownershipPct = totalInvestment > 0 ? (parseFloat(p.initial_investment) / totalInvestment) * 100 : 0;
      const calculatedProfit = netProfit > 0 ? (ownershipPct / 100) * netProfit : 0;
      return {
        id: p.id,
        name: p.name,
        initial_investment: parseFloat(p.initial_investment),
        ownership_percentage: ownershipPct.toFixed(2),
        total_profit_earned: parseFloat(p.total_profit),
        pending_profit: calculatedProfit - parseFloat(p.total_profit)
      };
    });
    
    res.json({
      success: true,
      data: {
        total_sales: totalSales,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        is_profit: netProfit >= 0,
        total_investment: totalInvestment,
        total_withdrawn: parseFloat(withdrawResult.rows[0].total),
        partners: partnerSummaries,
        date_generated: today
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
