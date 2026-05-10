import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBars, FaTimes, FaCheckCircle, FaHourglassHalf, FaHome, FaWallet, FaMoneyBillWave, FaFileAlt, FaShieldAlt, FaBell, FaHistory, FaArrowUp } from 'react-icons/fa';
import KycUpload from './KycUpload';
import ChangePassword from './ChangePassword';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import TransactionHistory from './TransactionHistory';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      setError('Unable to load profile. Please login again.');
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleBalanceUpdate = (newBalance) => {
    setUser(prev => ({ ...prev, balance: newBalance }));
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/auth/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({
        ...prev,
        notifications: prev.notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      }));
    } catch (err) {
      console.error('Unable to mark notification read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({
        ...prev,
        notifications: prev.notifications.map((notification) => ({ ...notification, read: true }))
      }));
    } catch (err) {
      console.error('Unable to mark all notifications read', err);
    }
  };

  const notifications = user?.notifications || [];

  if (loading) return (
    <div className="page-content">
      <div className="page-loader">
        <img src="/logo.png" alt="Alphatrade logo" className="loader-logo" />
        <div className="spinner"></div>
        <p>Loading your account dashboard...</p>
      </div>
    </div>
  );
  if (error) return <div className="page-content"><div className="card error">{error}</div></div>;

  return (
    <div className="dashboard-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <h4>{user?.username}</h4>
              <p>{user?.email}</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabSelect('overview')}
          >
            <FaHome className="tab-icon" /> Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => handleTabSelect('deposit')}
          >
            <FaWallet className="tab-icon" /> Deposit
          </button>
          <button 
            className={`nav-item ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => handleTabSelect('withdraw')}
          >
            <FaMoneyBillWave className="tab-icon" /> Withdraw
          </button>
          <button 
            className={`nav-item ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => handleTabSelect('kyc')}
          >
            <FaFileAlt className="tab-icon" /> KYC
          </button>
          <button 
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabSelect('security')}
          >
            <FaShieldAlt className="tab-icon" /> Security
          </button>
          <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleTabSelect('notifications')}
          >
            <FaBell className="tab-icon" /> Notifications
            {notifications.some((item) => !item.read) && <span className="nav-badge">{notifications.filter((item) => !item.read).length}</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => handleTabSelect('transactions')}
          >
            <FaHistory className="tab-icon" /> Transactions
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header-mobile">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <div>
            <h1>{activeTab === 'overview' ? 'Overview' : activeTab === 'deposit' ? 'Deposit' : activeTab === 'withdraw' ? 'Withdraw' : activeTab === 'kyc' ? 'KYC' : activeTab === 'security' ? 'Security' : activeTab === 'notifications' ? 'Notifications' : 'Transactions'}</h1>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="content-section">
            <h2>Account Overview</h2>
            <div className="balance-display">
              <div className="balance-card-large">
                <div className="balance-label">Total Balance</div>
                <div className="balance-amount">${user.balance.toFixed(2)}</div>
                <div className="balance-meta">Includes funds and profit earned</div>
                <div className="balance-info">
                  <div className="info-item">
                    <span className="label">Total Profit:</span>
                    <span>${(user.profitTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">KYC Status:</span>
                    {user?.kycDetails?.submittedAt ? (
                      <span className={`status ${user.isKycVerified ? 'verified' : 'pending'}`}>
                        {user.isKycVerified ? <><FaCheckCircle /> Verified</> : <><FaHourglassHalf /> Pending</>}
                      </span>
                    ) : (
                      <span className="status pending">Not Submitted</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="label">Documents:</span>
                    <span>{user.kycDocuments?.length || 0} uploaded</span>
                  </div>
                </div>
              </div>
            </div>
            {user.mustChangePassword && (
              <div className="status-message warning">
                Please change your password immediately from Security. Your password reset request is active.
              </div>
            )}
          </div>
        )}

        {activeTab === 'deposit' && (
          <div className="content-section">
            <h2>Add Funds</h2>
            <Deposit onDepositSuccess={handleBalanceUpdate} />
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="content-section">
            <h2>Withdraw Funds</h2>
            <Withdraw onWithdrawSuccess={handleBalanceUpdate} />
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="content-section">
            <h2>KYC Documents</h2>
            <KycUpload onSuccess={loadProfile} user={user} />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="content-section">
            <h2>Security Settings</h2>
            <ChangePassword />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="content-section">
            <div className="section-header">
              <div>
                <h2>Notifications</h2>
                <p>Official updates from Alphatrade support and account notifications appear here.</p>
              </div>
              <button className="btn-send" onClick={handleMarkAllRead} disabled={notifications.length === 0}>
                Mark all read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="card">
                <p>No notifications yet. You will receive updates here when there is news or a transaction event.</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div key={notification._id} className={`notification-item ${notification.read ? '' : 'unread'}`}>
                    <div className="notification-company-header">
                      <div className="notification-company">
                        <div className="company-avatar">A</div>
                        <div>
                          <div className="company-name">
                            Alphatrade Official <span className="verified-badge">✓</span>
                          </div>
                          <div className="company-subtitle">Alphatrade Customer Support</div>
                        </div>
                      </div>
                      <div className={`notification-tag notification-type-${notification.type}`}>
                        {notification.type}
                      </div>
                    </div>
                    <div className="notification-meta">
                      <div>
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-time">{new Date(notification.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="notification-body">{notification.message}</div>
                    {!notification.read && (
                      <div className="notification-actions">
                        <button type="button" onClick={() => handleMarkNotificationRead(notification._id)}>
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="content-section">
            <h2>Transaction History</h2>
            <TransactionHistory />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;