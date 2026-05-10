import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:5000/api/auth/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(res.data);
      } catch (err) {
        setError('Unable to load transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <div className="card">Loading transactions...</div>;
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="card">
      <h3>Transaction History</h3>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Crypto</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      background: tx.type === 'deposit' ? '#d1fae5' : '#fee2e2',
                      color: tx.type === 'deposit' ? '#065f46' : '#991b1b'
                    }}>
                      {tx.type === 'deposit' ? 'Deposit' : 'Withdraw'}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>{tx.crypto}</td>
                  <td style={{ padding: '8px' }}>${tx.amount.toFixed(2)}</td>
                  <td style={{ padding: '8px' }}>{new Date(tx.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;