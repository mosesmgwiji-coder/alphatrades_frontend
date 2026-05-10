import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="brand">
        <img src="/logo.png" alt="Alphatrade logo" className="brand-logo" />
        <span>Alphatrade</span>
      </div>
      <nav className="nav-links">
        {!token && <Link className={location.pathname === '/login' ? 'active' : ''} to="/login">Login</Link>}
        {!token && <Link className={location.pathname === '/register' ? 'active' : ''} to="/register">Register</Link>}
        {token && !isAdmin && <Link className={location.pathname === '/dashboard' ? 'active' : ''} to="/dashboard">Dashboard</Link>}
        {token && isAdmin && <Link className={location.pathname === '/admin' ? 'active' : ''} to="/admin">Admin</Link>}
        {token && <button type="button" className="logout-button" onClick={handleLogout}>Logout</button>}
      </nav>
    </header>
  );
};

export default Header;