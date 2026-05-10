import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/change-password', { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('Your password was updated successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      setStatus(error?.response?.data?.error || 'Password update failed.');
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        Current password
        <input type="password" placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
      </label>
      <label>
        New password
        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      </label>
      {status && <div className="status-message">{status}</div>}
      <button type="submit">Change password</button>
    </form>
  );
};

export default ChangePassword;