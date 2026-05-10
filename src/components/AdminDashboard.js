import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUsers,
  FaFileAlt,
  FaArrowDown,
  FaArrowUp,
  FaDollarSign,
  FaPlusCircle,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCheck,
  FaTimes as FaTimesIcon,
  FaCommentAlt,
  FaBan,
  FaUnlock,
  FaKey,
  FaUserCheck,
  FaUserTimes,
  FaWallet,
  FaSpinner
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customType, setCustomType] = useState('info');
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [editingBalanceUserId, setEditingBalanceUserId] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  const [passwordResetUserId, setPasswordResetUserId] = useState('');
  const [passwordInput, setPasswordInput] = useState('TempPass123!');
  const [profitUserId, setProfitUserId] = useState('');
  const [profitInput, setProfitInput] = useState('');
  const [newPasswordInputs, setNewPasswordInputs] = useState({});
  const [profitDescription, setProfitDescription] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const loadProfile = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile', { headers });
      if (!res.data.isAdmin) {
        navigate('/dashboard');
        return;
      }
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      navigate('/login');
    }
  }, [headers, navigate, token]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', { headers });
      setUsers(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not load users');
    }
  }, [headers]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (user?.isAdmin) {
      loadUsers();
      setLoading(false);
    }
  }, [user, loadUsers]);

  const handleUserAction = async (userId, action, body = {}) => {
    setActionLoading(userId);
    setError('');
    setMessage('');

    try {
      let res;
      if (action === 'approve' || action === 'reject') {
        res = await axios.put(`http://localhost:5000/api/admin/kyc/${userId}/${action}`, {}, { headers });
      } else if (action === 'reset') {
        res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/reset-password`, body, { headers });
      } else if (action === 'profit') {
        res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/profit`, body, { headers });
      } else if (action === 'ban' || action === 'unban') {
        res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/${action}`, {}, { headers });
      } else if (action === 'delete') {
        res = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, { headers });
      } else if (action === 'balance') {
        res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/balance`, body, { headers });
      }
      setMessage(res.data.message);
      await loadUsers();
      return res;
    } catch (err) {
      setError(err?.response?.data?.error || 'Action failed');
      return null;
    } finally {
      setActionLoading('');
    }
  };

  const handleOpenBalanceEditor = (userId, currentBalance) => {
    setEditingBalanceUserId(userId);
    setBalanceInput(currentBalance.toFixed(2));
    setPasswordResetUserId('');
    setError('');
    setMessage('');
  };

  const handleOpenPasswordReset = (userId) => {
    setPasswordResetUserId(userId);
    setPasswordInput('TempPass123!');
    setEditingBalanceUserId('');
    setProfitUserId('');
    setProfitInput('');
    setProfitDescription('');
    setError('');
    setMessage('');
  };

  const handleOpenProfitEditor = (userId) => {
    setProfitUserId(userId);
    setProfitInput('');
    setProfitDescription('Profit added by admin');
    setEditingBalanceUserId('');
    setPasswordResetUserId('');
    setError('');
    setMessage('');
  };

  const submitProfitUpdate = async () => {
    const amount = parseFloat(profitInput.toString().replace(/,/g, ''));
    if (Number.isNaN(amount) || amount <= 0) {
      setError('Please enter a valid profit amount greater than zero.');
      return;
    }
    const res = await handleUserAction(profitUserId, 'profit', { amount, description: profitDescription });
    if (res) {
      setProfitUserId('');
      setProfitInput('');
      setProfitDescription('');
    }
  };

  const submitBalanceUpdate = async () => {
    const balance = parseFloat(balanceInput.toString().replace(/,/g, ''));
    if (Number.isNaN(balance) || balance < 0) {
      setError('Please enter a valid non-negative balance amount.');
      return;
    }
    const res = await handleUserAction(editingBalanceUserId, 'balance', { balance });
    if (res) {
      setEditingBalanceUserId('');
      setBalanceInput('');
    }
  };

  const submitPasswordReset = async () => {
    if (!passwordInput.trim() || passwordInput.trim().length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    const res = await handleUserAction(passwordResetUserId, 'reset', { password: passwordInput.trim() });
    if (res) {
      setPasswordResetUserId('');
      setPasswordInput('TempPass123!');
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    const normalized = filePath.replace(/\\/g, '/');
    return `http://localhost:5000/${normalized}`;
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setNotificationLoading(true);

    if (!selectedUserId) {
      setError('Please choose a user to notify.');
      setNotificationLoading(false);
      return;
    }
    if (!customTitle.trim() || !customMessage.trim()) {
      setError('Both title and message are required.');
      setNotificationLoading(false);
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/admin/users/${selectedUserId}/notify`, {
        title: customTitle,
        message: customMessage,
        type: customType
      }, { headers });
      setMessage(res.data.message);
      setCustomTitle('');
      setCustomMessage('');
      setCustomType('info');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not send notification');
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleDepositAction = async (userId, requestId, action) => {
    setActionLoading(`${userId}-${requestId}`);
    setError('');
    setMessage('');

    try {
      const res = await axios.put(`http://localhost:5000/api/deposit/${action}/${userId}/${requestId}`, {}, { headers });
      setMessage(res.data.message);
      loadUsers(); // Refresh users to update requests
    } catch (err) {
      setError(err?.response?.data?.error || `Could not ${action} deposit`);
    } finally {
      setActionLoading('');
    }
  };

  const handleWithdrawalAction = async (userId, requestId, action) => {
    setActionLoading(`${userId}-${requestId}`);
    setError('');
    setMessage('');

    try {
      const res = await axios.put(`http://localhost:5000/api/withdraw/${action}/${userId}/${requestId}`, {}, { headers });
      setMessage(res.data.message);
      loadUsers(); // Refresh users to update requests
    } catch (err) {
      setError(err?.response?.data?.error || `Could not ${action} withdrawal`);
    } finally {
      setActionLoading('');
    }
  };

  const selectMessageTarget = (userId) => {
    setSelectedUserId(userId);
    setActiveTab('notifications');
  };

  const handlePasswordResetRequest = async (userId, requestId, newPassword) => {
    setActionLoading(`${userId}-${requestId}`);
    setError('');
    setMessage('');

    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${userId}/reset-password-request/${requestId}/handle`, { newPassword }, { headers });
      setMessage(res.data.message);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not handle password reset request');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeletePasswordResetRequest = async (userId, requestId) => {
    setActionLoading(`${userId}-${requestId}`);
    setError('');
    setMessage('');

    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/users/${userId}/reset-password-request/${requestId}`, { headers });
      setMessage(res.data.message);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not delete password reset request');
    } finally {
      setActionLoading('');
    }
  };

  const totalProfitAcrossUsers = users.reduce((sum, userItem) => sum + (userItem.profitTotal || 0), 0);
  const reviewRequests = users.filter(userItem => (userItem.reviewRequests || []).length > 0);
  const passwordResetRequests = users.filter(userItem => (userItem.passwordResetRequests || []).length > 0);
  const pendingUsers = users.filter(userItem => userItem.kycDetails?.kycStatus === 'pending');

  const filteredUsers = users.filter((userItem) => {
    if (userFilter === 'pending' && userItem.kycDetails?.kycStatus !== 'pending') return false;
    if (userFilter === 'verified' && userItem.kycDetails?.kycStatus !== 'verified') return false;
    if (userFilter === 'rejected' && userItem.kycDetails?.kycStatus !== 'rejected') return false;
    if (!searchTerm.trim()) return true;
    const normalized = searchTerm.trim().toLowerCase();
    return [userItem.username, userItem.email, userItem._id]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalized));
  });

  if (loading) {
    return <div className="page-content"><div className="card">Loading admin dashboard...</div></div>;
  }

  return (
    <div className="admin-dashboard-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <h4>{user?.username || 'Admin'}</h4>
              <p>Administrator</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
          >
            <FaChartLine className="icon" /> Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
          >
            <FaUsers className="icon" /> User Management
          </button>
          <button
            className={`nav-item ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => { setActiveTab('kyc'); setSidebarOpen(false); }}
          >
            <FaFileAlt className="icon" /> KYC Review
          </button>
          <button
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reviews'); setSidebarOpen(false); }}
          >
            <FaCommentAlt className="icon" /> Review Requests
          </button>
          <button
            className={`nav-item ${activeTab === 'password-resets' ? 'active' : ''}`}
            onClick={() => { setActiveTab('password-resets'); setSidebarOpen(false); }}
          >
            <FaKey className="icon" /> Password Resets
          </button>
          <button
            className={`nav-item ${activeTab === 'deposits' ? 'active' : ''}`}
            onClick={() => { setActiveTab('deposits'); setSidebarOpen(false); }}
          >
            <FaArrowDown className="icon" /> Deposits
          </button>
          <button
            className={`nav-item ${activeTab === 'withdrawals' ? 'active' : ''}`}
            onClick={() => { setActiveTab('withdrawals'); setSidebarOpen(false); }}
          >
            <FaArrowUp className="icon" /> Withdrawals
          </button>
          <button
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActiveTab('notifications'); setSidebarOpen(false); }}
          >
            <FaBell className="icon" /> Notifications
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
          >
            <FaCog className="icon" /> Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            navigate('/login');
          }}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <p>Manage users, monitor activities, and oversee operations</p>
          </div>
        </header>

        <div className="admin-content">
          {error && <div className="status-message error">{error}</div>}
          {message && <div className="status-message success">{message}</div>}

          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>System Overview</h2>
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon"><FaClock /></div>
                  <div className="stat-content">
                    <div className="stat-value">{pendingUsers.length}</div>
                    <div className="stat-label">Pending KYC</div>
                    <div className="stat-desc">Users awaiting approval</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FaUsers /></div>
                  <div className="stat-content">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Users</div>
                    <div className="stat-desc">Registered accounts</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FaCheckCircle /></div>
                  <div className="stat-content">
                    <div className="stat-value">{users.filter(u => u.kycDetails?.kycStatus === 'verified').length}</div>
                    <div className="stat-label">Verified Users</div>
                    <div className="stat-desc">KYC approved</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FaDollarSign /></div>
                  <div className="stat-content">
                    <div className="stat-value">${totalProfitAcrossUsers.toFixed(2)}</div>
                    <div className="stat-label">Total Profits</div>
                    <div className="stat-desc">Added by admin</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FaBan /></div>
                  <div className="stat-content">
                    <div className="stat-value">{users.filter(u => u.isBanned).length}</div>
                    <div className="stat-label">Banned Users</div>
                    <div className="stat-desc">Suspended accounts</div>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon"><FaUsers /></div>
                    <div className="activity-content">
                      <div className="activity-title">New user registration</div>
                      <div className="activity-time">2 minutes ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon"><FaCheckCircle /></div>
                    <div className="activity-content">
                      <div className="activity-title">KYC approved for user123</div>
                      <div className="activity-time">15 minutes ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon"><FaWallet /></div>
                    <div className="activity-content">
                      <div className="activity-title">Deposit of $500 USDT</div>
                      <div className="activity-time">1 hour ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h2>User Management</h2>
                <div className="filters">
                  <div className="filter-group">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="filter-group">
                    <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                      <option value="all">All Users</option>
                      <option value="pending">Pending KYC</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Balance</th>
                      <th>Profit</th>
                      <th>KYC Status</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-state">No users found</td>
                      </tr>
                    ) : filteredUsers.map((app) => (
                      <tr key={app._id} className={app.isBanned ? 'banned' : ''}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">{app.username?.charAt(0).toUpperCase() || 'U'}</div>
                            <div className="user-details">
                              <div className="user-name">{app.username}</div>
                              <div className="user-id">ID: {app._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td>{app.email}</td>
                        <td>${app.balance.toFixed(2)}</td>
                        <td>${(app.profitTotal || 0).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${app.kycDetails?.kycStatus || 'pending'}`}>
                            {app.kycDetails?.kycStatus || 'pending'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${app.isBanned ? 'banned' : 'active'}`}>
                            {app.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {app.kycDetails?.kycStatus === 'pending' && (
                              <>
                                <button
                                  className="btn-approve"
                                  disabled={actionLoading === app._id}
                                  onClick={() => handleUserAction(app._id, 'approve')}
                                >
                                  <FaCheck /> Approve
                                </button>
                                <button
                                  className="btn-reject"
                                  disabled={actionLoading === app._id}
                                  onClick={() => handleUserAction(app._id, 'reject')}
                                >
                                  <FaTimesIcon /> Reject
                                </button>
                              </>
                            )}
                            <button
                              className="btn-message"
                              onClick={() => selectMessageTarget(app._id)}
                            >
                              <FaCommentAlt /> Message
                            </button>
                            <button
                              className="btn-profit"
                              disabled={actionLoading === app._id}
                              onClick={() => handleOpenProfitEditor(app._id)}
                            >
                              <FaPlusCircle /> Add Profit
                            </button>
                            <button
                              className="btn-balance"
                              disabled={actionLoading === app._id}
                              onClick={() => handleOpenBalanceEditor(app._id, app.balance)}
                            >
                              <FaDollarSign /> Update Balance
                            </button>
                            <button
                              className="btn-reset"
                              disabled={actionLoading === app._id}
                              onClick={() => handleOpenPasswordReset(app._id)}
                            >
                              <FaKey /> Reset Password
                            </button>
                            <button
                              className={`btn-${app.isBanned ? 'unban' : 'ban'}`}
                              disabled={actionLoading === app._id}
                              onClick={() => handleUserAction(app._id, app.isBanned ? 'unban' : 'ban')}
                            >
                              {app.isBanned ? <><FaUnlock /> Unban</> : <><FaBan /> Ban</>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(editingBalanceUserId || passwordResetUserId || profitUserId) && (
                  <div className="admin-action-panel">
                    {editingBalanceUserId && (
                      <div className="panel-card">
                        <h3>Update Balance</h3>
                        <div className="form-group">
                          <label>New Balance</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={balanceInput}
                            onChange={(e) => setBalanceInput(e.target.value)}
                          />
                        </div>
                        <div className="panel-actions">
                          <button className="btn-approve" onClick={submitBalanceUpdate} disabled={actionLoading === editingBalanceUserId}>
                            Save Balance
                          </button>
                          <button className="btn-reject" onClick={() => setEditingBalanceUserId('')}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {profitUserId && (
                      <div className="panel-card">
                        <h3>Add Profit</h3>
                        <div className="form-group">
                          <label>Profit Amount</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={profitInput}
                            onChange={(e) => setProfitInput(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <input
                            type="text"
                            value={profitDescription}
                            onChange={(e) => setProfitDescription(e.target.value)}
                          />
                        </div>
                        <div className="panel-actions">
                          <button className="btn-approve" onClick={submitProfitUpdate} disabled={actionLoading === profitUserId}>
                            Add Profit
                          </button>
                          <button className="btn-reject" onClick={() => setProfitUserId('')}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {passwordResetUserId && (
                      <div className="panel-card">
                        <h3>Reset Password</h3>
                        <div className="form-group">
                          <label>New Password</label>
                          <input
                            type="text"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                          />
                        </div>
                        <div className="panel-actions">
                          <button className="btn-approve" onClick={submitPasswordReset} disabled={actionLoading === passwordResetUserId}>
                            Reset Password
                          </button>
                          <button className="btn-reject" onClick={() => setPasswordResetUserId('')}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="kyc-section">
              <h2>KYC Document Review</h2>
              <div className="kyc-queue">
                {pendingUsers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><FaFileAlt /></div>
                    <h3>No pending KYC reviews</h3>
                    <p>All users are either verified or haven't submitted documents yet.</p>
                  </div>
                ) : (
                  pendingUsers.map(user => (
                    <div key={user._id} className="kyc-card">
                      <div className="kyc-header">
                        <div className="user-info">
                          <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
                          <div>
                            <h4>{user.username}</h4>
                            <p>{user.email}</p>
                          </div>
                        </div>
                        <div className="kyc-actions">
                          <button
                            className="btn-approve"
                            onClick={() => handleUserAction(user._id, 'approve')}
                            disabled={actionLoading === user._id}
                          >
                            <FaUserCheck /> Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleUserAction(user._id, 'reject')}
                            disabled={actionLoading === user._id}
                          >
                            <FaUserTimes /> Reject
                          </button>
                        </div>
                      </div>
                      <div className="kyc-documents">
                        {user.kycDocuments?.length > 0 ? (
                          user.kycDocuments.map((doc, index) => (
                            <div key={index} className="document-item">
                              <FaFileAlt className="doc-icon" />
                              <a
                                href={getFileUrl(doc)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="doc-link"
                              >
                                Document {index + 1}
                              </a>
                            </div>
                          ))
                        ) : (
                          <p className="no-docs">No documents uploaded yet</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <h2>Account Review Requests</h2>
              {reviewRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><FaCommentAlt /></div>
                  <h3>No review requests</h3>
                  <p>There are currently no account review requests from banned users.</p>
                </div>
              ) : (
                reviewRequests.map((userItem) => (
                  <div key={userItem._id} className="review-card">
                    <div className="review-header">
                      <div className="user-info">
                        <div className="user-avatar">{userItem.username?.charAt(0).toUpperCase() || 'U'}</div>
                        <div>
                          <h4>{userItem.username}</h4>
                          <p>{userItem.email}</p>
                        </div>
                      </div>
                      <div className="review-meta">
                        <span className="status-badge pending">{(userItem.reviewRequests || []).length} pending</span>
                        <div>{userItem.reviewRequests?.length ? new Date(userItem.reviewRequests[0].requestedAt).toLocaleString() : ''}</div>
                      </div>
                    </div>
                    <div className="review-list">
                      {(userItem.reviewRequests || []).map((request, index) => (
                        <div key={index} className="review-request-item">
                          <div className="review-request-message">{request.message || 'Review request submitted by user.'}</div>
                          <div className="review-request-date">Requested on {new Date(request.requestedAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'password-resets' && (
            <div className="password-resets-section">
              <h2>Password Reset Requests</h2>
              {passwordResetRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><FaKey /></div>
                  <h3>No password reset requests</h3>
                  <p>There are currently no password reset requests from users.</p>
                </div>
              ) : (
                passwordResetRequests.map((userItem) => (
                  <div key={userItem._id} className="review-card">
                    <div className="review-header">
                      <div className="user-info">
                        <div className="user-avatar">{userItem.username?.charAt(0).toUpperCase() || 'U'}</div>
                        <div>
                          <h4>{userItem.username}</h4>
                          <p>{userItem.email}</p>
                        </div>
                      </div>
                      <div className="review-meta">
                        <span className="status-badge pending">{(userItem.passwordResetRequests || []).length} pending</span>
                        <div>{userItem.passwordResetRequests?.length ? new Date(userItem.passwordResetRequests[0].requestedAt).toLocaleString() : ''}</div>
                      </div>
                    </div>
                    <div className="review-list">
                      {(userItem.passwordResetRequests || []).map((request) => (
                        <div key={request._id} className="review-request-item">
                          <div className="review-request-message">Password reset requested by user.</div>
                          <div className="review-request-date">Requested on {new Date(request.requestedAt).toLocaleString()}</div>
                          {request.status === 'pending' && (
                            <div className="action-buttons">
                              <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPasswordInputs[`${userItem._id}-${request._id}`] || ''}
                                onChange={(e) => setNewPasswordInputs(prev => ({ ...prev, [`${userItem._id}-${request._id}`]: e.target.value }))}
                                className="password-input"
                              />
                              <button
                                className="btn-approve"
                                onClick={() => handlePasswordResetRequest(userItem._id, request._id, newPasswordInputs[`${userItem._id}-${request._id}`])}
                                disabled={actionLoading === `${userItem._id}-${request._id}` || !newPasswordInputs[`${userItem._id}-${request._id}`]?.trim()}
                              >
                                {actionLoading === `${userItem._id}-${request._id}` ? <FaSpinner className="spinner" /> : <FaKey />} Reset Password
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleDeletePasswordResetRequest(userItem._id, request._id)}
                                disabled={actionLoading === `${userItem._id}-${request._id}`}
                              >
                                {actionLoading === `${userItem._id}-${request._id}` ? <FaSpinner className="spinner" /> : <FaTimes />} Delete Request
                              </button>
                            </div>
                          )}
                          {request.status === 'handled' && (
                            <div className="status-handled">
                              <FaCheck /> Password reset completed
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="transactions-section">
              <h2>Transaction Monitoring</h2>
              <div className="transaction-stats">
                <div className="stat-card">
                  <div className="stat-icon"><FaArrowDown /></div>
                  <div className="stat-content">
                    <div className="stat-value">
                      ${users.reduce((sum, u) => sum + (u.transactions?.reduce((tSum, t) => tSum + (t.type === 'deposit' ? t.amount : 0), 0) || 0), 0).toFixed(2)}
                    </div>
                    <div className="stat-label">Total Deposits</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FaArrowUp /></div>
                  <div className="stat-content">
                    <div className="stat-value">
                      ${users.reduce((sum, u) => sum + (u.transactions?.reduce((tSum, t) => tSum + (t.type === 'withdraw' ? t.amount : 0), 0) || 0), 0).toFixed(2)}
                    </div>
                    <div className="stat-label">Total Withdrawals</div>
                  </div>
                </div>
              </div>
              <div className="recent-transactions">
                <h3>Recent Transactions</h3>
                <div className="transaction-list">
                  {users.flatMap(u => u.transactions || []).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-icon">
                        {tx.type === 'deposit' ? <FaArrowDown /> : <FaArrowUp />}
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-amount">${tx.amount.toFixed(2)} {tx.crypto}</div>
                        <div className="transaction-user">{users.find(u => u._id === tx.userId)?.username || 'Unknown'}</div>
                        <div className="transaction-time">{new Date(tx.date).toLocaleString()}</div>
                      </div>
                      <div className={`transaction-type ${tx.type}`}>
                        {tx.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <h2>Send Notifications</h2>
              <div className="notification-form-container">
                <form className="notification-form" onSubmit={handleSendNotification}>
                  <div className="form-group">
                    <label>Select User</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                    >
                      <option value="">Choose a user...</option>
                      {users.filter(u => !u.isAdmin).map(user => (
                        <option key={user._id} value={user._id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Notification Title</label>
                    <input
                      type="text"
                      placeholder="Enter notification title"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      placeholder="Enter your message"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Notification Type</label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="danger">Alert</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn-send-notification"
                    disabled={notificationLoading}
                  >
                    {notificationLoading ? 'Sending...' : 'Send Notification'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'deposits' && (
            <div className="deposits-section">
              <h2>Pending Deposits</h2>
              <div className="requests-list">
                {users.flatMap(u => u.depositRequests?.filter(r => r.status === 'pending').map(r => ({ ...r, user: u })) || []).length === 0 ? (
                  <div className="card">
                    <p>No pending deposit requests.</p>
                  </div>
                ) : (
                  users.flatMap(u => u.depositRequests?.filter(r => r.status === 'pending').map(r => ({ ...r, user: u })) || []).map(request => (
                    <div key={request._id} className="request-card">
                      <div className="request-info">
                        <h4>Deposit Request</h4>
                        <p><strong>User:</strong> {request.user.username} ({request.user.email})</p>
                        <p><strong>Amount:</strong> ${request.amount.toFixed(2)} {request.crypto}</p>
                        <p><strong>Transaction ID:</strong> {request.transactionId}</p>
                        <p><strong>Date:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="request-actions">
                        <button
                          className="btn-approve"
                          onClick={() => handleDepositAction(request.user._id, request._id, 'approve')}
                          disabled={actionLoading === `${request.user._id}-${request._id}`}
                        >
                          {actionLoading === `${request.user._id}-${request._id}` ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleDepositAction(request.user._id, request._id, 'reject')}
                          disabled={actionLoading === `${request.user._id}-${request._id}`}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="withdrawals-section">
              <h2>Pending Withdrawals</h2>
              <div className="requests-list">
                {users.flatMap(u => u.withdrawalRequests?.filter(r => r.status === 'pending').map(r => ({ ...r, user: u })) || []).length === 0 ? (
                  <div className="card">
                    <p>No pending withdrawal requests.</p>
                  </div>
                ) : (
                  users.flatMap(u => u.withdrawalRequests?.filter(r => r.status === 'pending').map(r => ({ ...r, user: u })) || []).map(request => (
                    <div key={request._id} className="request-card">
                      <div className="request-info">
                        <h4>Withdrawal Request</h4>
                        <p><strong>User:</strong> {request.user.username} ({request.user.email})</p>
                        <p><strong>Amount:</strong> ${request.amount.toFixed(2)} {request.crypto}</p>
                        <p><strong>Address:</strong> {request.address}</p>
                        <p><strong>Date:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="request-actions">
                        <button
                          className="btn-approve"
                          onClick={() => handleWithdrawalAction(request.user._id, request._id, 'approve')}
                          disabled={actionLoading === `${request.user._id}-${request._id}`}
                        >
                          {actionLoading === `${request.user._id}-${request._id}` ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleWithdrawalAction(request.user._id, request._id, 'reject')}
                          disabled={actionLoading === `${request.user._id}-${request._id}`}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Admin Settings</h2>
              <div className="settings-grid">
                <div className="setting-card">
                  <h3>System Configuration</h3>
                  <p>Configure system-wide settings and preferences.</p>
                  <button className="btn-secondary">Configure</button>
                </div>
                <div className="setting-card">
                  <h3>Security Settings</h3>
                  <p>Manage security policies and access controls.</p>
                  <button className="btn-secondary">Manage</button>
                </div>
                <div className="setting-card">
                  <h3>Backup & Recovery</h3>
                  <p>Create backups and manage recovery options.</p>
                  <button className="btn-secondary">Backup</button>
                </div>
                <div className="setting-card">
                  <h3>System Logs</h3>
                  <p>View system logs and audit trails.</p>
                  <button className="btn-secondary">View Logs</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
