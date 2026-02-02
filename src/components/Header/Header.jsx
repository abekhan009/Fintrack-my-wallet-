import { useLocation, useNavigate } from 'react-router-dom';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import './Header.css';

function Header({ title, showBack = false, onBack, mode }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current mode from route if not explicitly passed
  const currentMode = mode || (location.pathname.startsWith('/tuition') ? 'tuition' : 'personal');

  const handleModeSwitch = (newMode) => {
    if (newMode === 'personal') {
      navigate('/app/home');
    } else {
      navigate('/tuition/dashboard');
    }
  };

  return (
    <header className="header">
      <div className="header__left">
        {showBack ? (
          <button className="header__back" onClick={onBack} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="header__logo">
            <span className="header__logo-icon">{currentMode === 'personal' ? '💰' : '🎓'}</span>
            <span className="header__logo-text">{title || (currentMode === 'personal' ? 'My Wallet' : 'Tuition Center')}</span>
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="header__workspace-toggle">
        <button
          className={`header__workspace-btn ${currentMode === 'personal' ? 'header__workspace-btn--active' : ''}`}
          onClick={() => handleModeSwitch('personal')}
        >
          💰 Personal
        </button>
        <button
          className={`header__workspace-btn ${currentMode === 'tuition' ? 'header__workspace-btn--active' : ''}`}
          onClick={() => handleModeSwitch('tuition')}
        >
          🎓 Tuition
        </button>
      </div>

      <div className="header__right">
        <ProfileMenu />
      </div>
    </header>
  );
}

export default Header;

