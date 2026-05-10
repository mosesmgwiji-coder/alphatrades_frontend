import React, { useState } from 'react';
import axios from 'axios';
import { FaRegCopy, FaQrcode, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';

const Deposit = () => {
  const [crypto, setCrypto] = useState('USDT-TRC20');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const cryptoAddresses = {
    'USDT-TRC20': 'TCe2pnTCySb63LDVpcBXe7Mz6wCaBadTHe',
    'Ethereum-ERC20': '0x62aa197f1361e126c001a63bcb3c8e4833e2f609',
    'USDC-ERC20': '0x62aa197f1361e126c001a63bcb3c8e4833e2f609'
  };

  const cryptoQRFiles = {
    'USDT-TRC20': 'USDT.jpeg',
    'Ethereum-ERC20': 'Ethereum.jpeg',
    'USDC-ERC20': 'USDC.jpeg'
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!amount || Number(amount) <= 0) {
      setStatus('Please enter a valid amount.');
      return;
    }
    if (!transactionId.trim()) {
      setStatus('Please enter your transaction ID.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/deposit/deposit', { crypto, amount, transactionId: transactionId.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('Deposit request submitted. Please wait while your payment is processed by Alphatrade support.');
      setAmount('');
      setTransactionId('');
    } catch (error) {
      setStatus(error?.response?.data?.error || 'Deposit request failed.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentAddress || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentAddress = cryptoAddresses[crypto];
  const currentQRFile = cryptoQRFiles[crypto];

  return (
    <div className="card">
      <div className="form-grid">
        <div className="form-group">
          <label>Select Cryptocurrency</label>
          <select value={crypto} onChange={(e) => { setCrypto(e.target.value); setShowQRCode(false); }}>
            <option value="USDT-TRC20">USDT (TRC20)</option>
            <option value="Ethereum-ERC20">Ethereum (ERC20)</option>
            <option value="USDC-ERC20">USDC (ERC20)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Deposit Address</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="text" value={currentAddress} readOnly style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }} />
            <button type="button" onClick={copyToClipboard} style={{ padding: '8px 12px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setShowQRCode(false)}
            style={{
              flex: 1,
              padding: '10px',
              background: !showQRCode ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaRegCopy /> Use Address
          </button>
          <button
            type="button"
            onClick={() => setShowQRCode(true)}
            style={{
              flex: 1,
              padding: '10px',
              background: showQRCode ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaQrcode /> Scan QR Code
          </button>
        </div>

        {showQRCode && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img
              src={`/${currentQRFile}`}
              alt={`${crypto} QR Code`}
              style={{
                maxWidth: '200px',
                width: '100%',
                height: 'auto',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '8px',
                background: 'white'
              }}
            />
            <p style={{ margin: '12px 0 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              Scan this QR code with your wallet or exchange app
            </p>
          </div>
        )}

        <div className="form-group">
          <label>Deposit Amount</label>
          <input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Transaction ID</label>
          <input type="text" placeholder="Paste your transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
        </div>

        <div className="deposit-instructions">
          <h4 style={{ margin: '0 0 8px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FaInfoCircle /> Deposit Instructions:</h4>
          <div style={{ background: 'rgba(136,227,75,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 8px', fontSize: '0.95rem' }}>Option 1: Using the Address</h5>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <li>Click the "Copy" button to copy the deposit address</li>
              <li>Open your crypto wallet or exchange</li>
              <li>Paste the address in the recipient field</li>
              <li>Send {crypto.split('-')[0]} to this address</li>
              <li>Wait for the transaction to complete</li>
            </ol>
          </div>
          <div style={{ background: 'rgba(136,227,75,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
            <h5 style={{ margin: '0 0 8px', fontSize: '0.95rem' }}>Option 2: Scanning the QR Code</h5>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <li>Click the "Scan QR Code" button</li>
              <li>Use your wallet or exchange app to scan the QR code</li>
              <li>Confirm the address in your app</li>
              <li>Send the {crypto.split('-')[0]} amount</li>
              <li>Wait for the transaction to complete</li>
            </ol>
          </div>
          <div style={{ background: 'rgba(255,178,63,0.1)', padding: '12px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FaExclamationCircle /> Final Step</h5>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>
              After sending the crypto:
            </p>
            <ol style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <li>Enter the amount you deposited in the "Deposit Amount" field</li>
              <li>Paste the transaction ID (hash) from your wallet in the "Transaction ID" field</li>
              <li>Click "Confirm Payment" to submit your request</li>
              <li>Your balance will be updated after admin verification</li>
            </ol>
          </div>
        </div>

        {status && <div className="status-message">{status}</div>}
        
        <button type="submit" onClick={handleDeposit} disabled={!amount || Number(amount) <= 0 || !transactionId.trim()} style={{ marginTop: '12px' }}>
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default Deposit;