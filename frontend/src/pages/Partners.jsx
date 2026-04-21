import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Wallet, 
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X,
  User,
  DollarSign,
  ChevronRight,
  Trash2,
  Edit2
} from 'lucide-react';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    initial_investment: ''
  });
  const [txForm, setTxForm] = useState({
    type: 'INVEST',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchPartners = async () => {
    try {
      const { data } = await api.get('/finance/partners');
      setPartners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/finance/partners', formData);
      setIsModalOpen(false);
      setFormData({ name: '', initial_investment: '' });
      fetchPartners();
    } catch (err) {
      alert('Failed to add partner');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!selectedPartner) return;
    setLoading(true);
    try {
      await api.post('/finance/transactions', {
        partner_id: selectedPartner.id,
        ...txForm
      });
      setTxForm({ type: 'INVEST', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      fetchPartnerLedger(selectedPartner.id);
      fetchPartners();
    } catch (err) {
      alert('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerLedger = async (id) => {
    try {
      const { data } = await api.get(`/finance/partners/${id}/ledger`);
      setLedger(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewLedger = (partner) => {
    setSelectedPartner(partner);
    fetchPartnerLedger(partner.id);
    setIsLedgerOpen(true);
  };

  const totalInvestment = partners.reduce((sum, p) => sum + (p.initial_investment || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partner Management</h2>
          <p className="text-gray-500">Manage business partners and track investments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Partner
        </button>
      </div>

      {/* Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {partners.map((partner, index) => (
          <div key={partner.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{partner.name}</h3>
                  <span className="text-xs text-gray-500">Partner #{index + 1}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ownership</span>
                <span className="font-bold text-blue-600">{partner.ownership_percentage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Net Investment</span>
                <span className="font-bold">${(partner.net_investment || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Withdrawn</span>
                <span className="font-bold text-red-600">${(partner.total_withdrawn || 0).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => handleViewLedger(partner)}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              View Ledger
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
        
        {partners.length === 0 && (
          <div className="col-span-3 bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
            <User className="mx-auto mb-4 text-gray-300" size={48} />
            <p>No partners found. Add your first partner to get started.</p>
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Partner</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Investment ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.initial_investment}
                  onChange={(e) => setFormData({...formData, initial_investment: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  Add Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {isLedgerOpen && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold">{selectedPartner.name} - Partner Ledger</h3>
                <p className="text-sm text-gray-500">Detailed financial history</p>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {ledger && (
              <>
                {/* Summary Cards */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Initial Investment</div>
                      <div className="text-lg font-bold">${(ledger.summary.initial_investment || 0).toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Total Invested</div>
                      <div className="text-lg font-bold text-blue-600">${(ledger.summary.total_invested || 0).toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Total Withdrawn</div>
                      <div className="text-lg font-bold text-red-600">${(ledger.summary.total_withdrawn || 0).toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Current Balance</div>
                      <div className="text-lg font-bold text-green-600">${(ledger.summary.current_balance || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Add Transaction Form */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-bold mb-4">Add Transaction</h4>
                  <form onSubmit={handleAddTransaction} className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={txForm.type}
                        onChange={(e) => setTxForm({...txForm, type: e.target.value})}
                      >
                        <option value="INVEST">Invest</option>
                        <option value="WITHDRAW">Withdraw</option>
                        <option value="PROFIT">Profit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Amount</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-32"
                        value={txForm.amount}
                        onChange={(e) => setTxForm({...txForm, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={txForm.date}
                        onChange={(e) => setTxForm({...txForm, date: e.target.value})}
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs text-gray-500 mb-1">Notes</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        value={txForm.notes}
                        onChange={(e) => setTxForm({...txForm, notes: e.target.value})}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Transaction History */}
                <div className="flex-1 overflow-y-auto p-6">
                  <h4 className="font-bold mb-4">Transaction History</h4>
                  <div className="space-y-2">
                    {ledger.transactions.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No transactions yet.</p>
                    ) : ledger.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            tx.type === 'INVEST' ? 'bg-blue-100 text-blue-600' :
                            tx.type === 'WITHDRAW' ? 'bg-red-100 text-red-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {tx.type === 'INVEST' ? <ArrowUpRight size={16} /> :
                             tx.type === 'WITHDRAW' ? <ArrowDownRight size={16} /> :
                             <DollarSign size={16} />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{tx.type}</div>
                            <div className="text-xs text-gray-500">{tx.date} {tx.notes && `- ${tx.notes}`}</div>
                          </div>
                        </div>
                        <div className={`font-bold ${
                          tx.type === 'WITHDRAW' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {tx.type === 'WITHDRAW' ? '-' : '+'}${tx.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
