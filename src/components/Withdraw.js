import React, { useState } from 'react';
import axios from 'axios';

const Withdraw = ({ onWithdrawSuccess }) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [crypto, setCrypto] = useState('USDT');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount < 100) {
      setStatus('Minimum withdrawal amount is $100.');
      setLoading(false);
      return;
    }

    if (!address || address.trim() === '') {
      setStatus('Please enter a wallet address.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/withdraw', 
        { crypto, amount: parsedAmount, address: address.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus('Withdrawal request initiated. Please wait while it is being processed.');
      setAmount('');
      setAddress('');
      if (onWithdrawSuccess) onWithdrawSuccess(res.data.balance);
    } catch (error) {
      setStatus(error?.response?.data?.error || 'Withdrawal failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleWithdraw}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="crypto">Cryptocurrency</label>
          <select value={crypto} onChange={(e) => setCrypto(e.target.value)}>
            <option value="USDT">USDT (Tether)</option>
            <option value="USDC">USDC (USD Coin)</option>
            <option value="ETH">ETH (Ethereum)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input 
            id="amount"
            type="number" 
            placeholder="0.00" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            step="0.01"
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Withdrawal Address</label>
          <input 
            id="address"
            type="text" 
            placeholder="Enter your wallet address" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
          />
        </div>

        {status && <div className={status.includes('failed') || status.includes('invalid') ? 'error-message' : 'status-message'}>{status}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : `Withdraw ${crypto}`}
        </button>
      </div>
    </form>
  );
};

export default Withdraw;