// src/components/Header/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutOwner } from '../../firebase/auth';
import './Header.scss';

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutOwner();
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  return (
    <header className="header">
      <Link to="/" className="header__logo">
        <div className="header__logo-icon">🍩</div>
        <div className="header__logo-text">
          Du<span>ZZon</span>Map
        </div>
      </Link>

      <div className="header__actions">
        {user && (
          <div className="header__user-badge">
            <span className="dot" />
            사장님 모드
          </div>
        )}

        <button
          className="header__btn header__btn--register"
          onClick={() => navigate('/register')}
        >
          🏪 매장 등록
        </button>

        {user && (
          <button
            className="header__btn header__btn--logout"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
