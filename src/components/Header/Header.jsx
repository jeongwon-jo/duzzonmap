// src/components/Header/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { logoutOwner } from '../../firebase/auth';
import './Header.scss';

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

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
        <div className="header__logo-icon">
          <img src="/images/logo_icon.png" alt="" width={45} />
        </div>
        <div className="header__logo-text">
          두쫀맵
        </div>
      </Link>

      <div className="header__actions">
        {user && (
          <button
            className="header__btn header__btn--my-stores"
            onClick={() => navigate('/my-stores')}
          >
            매장 관리
          </button>
        )}

        <button
          className="header__btn header__btn--register"
          onClick={() => navigate('/register')}
        >
          매장 등록
        </button>

        {user && (
          <button
            className="header__btn header__btn--logout"
            onClick={handleLogout}
            title="로그아웃"
          >
            <LogoutIcon />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
