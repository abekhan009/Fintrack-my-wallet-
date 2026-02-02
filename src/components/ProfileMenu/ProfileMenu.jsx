import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProfileMenu.css';

function ProfileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    // Compute initials from fullName
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };
    const userInitials = getInitials(user?.fullName);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleLogout = () => {
        setIsOpen(false);
        logout();
        navigate('/');
    };

    const handleNavigate = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    if (!user) return null;

    return (
        <div className="profile-menu" ref={menuRef}>
            <button
                className="profile-menu__trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="profile-menu__avatar"
                    />
                ) : (
                    <span className="profile-menu__initials">{userInitials}</span>
                )}
            </button>

            {isOpen && (
                <div className="profile-menu__dropdown" role="menu">
                    <div className="profile-menu__header">
                        <div className="profile-menu__user-avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.fullName} />
                            ) : (
                                <span>{userInitials}</span>
                            )}
                        </div>
                        <div className="profile-menu__user-info">
                            <span className="profile-menu__user-name">{user.fullName}</span>
                            <span className="profile-menu__user-email">{user.email}</span>
                        </div>
                    </div>

                    <div className="profile-menu__divider"></div>

                    <button
                        className="profile-menu__item"
                        onClick={() => handleNavigate('/settings')}
                        role="menuitem"
                    >
                        <span className="profile-menu__item-icon">👤</span>
                        <span className="profile-menu__item-label">Profile</span>
                    </button>

                    <button
                        className="profile-menu__item"
                        onClick={() => handleNavigate('/settings')}
                        role="menuitem"
                    >
                        <span className="profile-menu__item-icon">⚙️</span>
                        <span className="profile-menu__item-label">Settings</span>
                    </button>

                    <div className="profile-menu__divider"></div>

                    <button
                        className="profile-menu__item profile-menu__item--danger"
                        onClick={handleLogout}
                        role="menuitem"
                    >
                        <span className="profile-menu__item-icon">🚪</span>
                        <span className="profile-menu__item-label">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProfileMenu;
