import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { usersApi } from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import './Settings.css';

// Allowed currencies (matches backend)
const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR'];

function Settings() {
    const { user, logout, refreshUser } = useAuth();
    const { workspace, loadUserProfile } = useData();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Settings state (synced with backend)
    const [settings, setSettings] = useState({
        currency: 'PKR',
        notificationsEnabled: true,
        darkModeEnabled: false,
        biometricEnabled: false,
    });

    // Profile edit state
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [tuitionCenterName, setTuitionCenterName] = useState('');

    // Password change modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Delete account modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    // Loading and error states
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Sync settings from user context
    useEffect(() => {
        if (user?.settings) {
            setSettings({
                currency: user.settings.currency || 'PKR',
                notificationsEnabled: user.settings.notificationsEnabled ?? true,
                darkModeEnabled: user.settings.darkModeEnabled ?? false,
                biometricEnabled: user.settings.biometricEnabled ?? false,
            });
        }
        if (user?.fullName) {
            setProfileName(user.fullName);
        }
        if (user?.tuitionCenterName) {
            setTuitionCenterName(user.tuitionCenterName);
        }
    }, [user]);

    // Get user initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Clear messages after delay
    const showMessage = (type, message) => {
        if (type === 'error') setError(message);
        if (type === 'success') setSuccess(message);
        setTimeout(() => {
            setError(null);
            setSuccess(null);
        }, 3000);
    };

    // Handle settings toggle
    const handleToggle = async (key) => {
        const newValue = !settings[key];
        const prevSettings = { ...settings };

        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            setSavingSettings(true);
            await usersApi.updateSettings({ [key]: newValue });
            if (refreshUser) await refreshUser();
        } catch (err) {
            // Revert on error
            setSettings(prevSettings);
            showMessage('error', err.message || 'Failed to update setting');
        } finally {
            setSavingSettings(false);
        }
    };

    // Handle currency change
    const handleCurrencyChange = async (e) => {
        const newCurrency = e.target.value;
        const prevCurrency = settings.currency;

        // Optimistic update
        setSettings(prev => ({ ...prev, currency: newCurrency }));

        try {
            setSavingSettings(true);
            await usersApi.updateSettings({ currency: newCurrency });
            if (refreshUser) await refreshUser();
        } catch (err) {
            setSettings(prev => ({ ...prev, currency: prevCurrency }));
            showMessage('error', err.message || 'Failed to update currency');
        } finally {
            setSavingSettings(false);
        }
    };

    // Handle profile update
    const handleProfileSave = async () => {
        if (!profileName.trim()) {
            showMessage('error', 'Name cannot be empty');
            return;
        }

        try {
            setSavingProfile(true);
            const updateData = { fullName: profileName.trim() };
            
            // Only include tuitionCenterName if it's changed or if we're in tuition workspace
            if (workspace === 'tuition' || tuitionCenterName !== (user?.tuitionCenterName || '')) {
                updateData.tuitionCenterName = tuitionCenterName.trim() || null;
            }
            
            await usersApi.updateProfile(updateData);
            if (refreshUser) await refreshUser();
            if (loadUserProfile) await loadUserProfile();
            setEditingProfile(false);
            showMessage('success', 'Profile updated successfully');
        } catch (err) {
            showMessage('error', err.message || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    // Handle avatar upload
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('error', 'Please upload a PNG, JPEG, or WebP image');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            showMessage('error', 'Image must be less than 2MB');
            return;
        }

        try {
            setUploadingAvatar(true);
            await usersApi.uploadAvatar(file);
            if (refreshUser) await refreshUser();
            showMessage('success', 'Avatar updated successfully');
        } catch (err) {
            showMessage('error', err.message || 'Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
            e.target.value = ''; // Reset file input
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('error', 'New passwords do not match');
            return;
        }

        try {
            setSavingSettings(true);
            await usersApi.changePassword(passwordData);
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showMessage('success', 'Password changed successfully');
        } catch (err) {
            showMessage('error', err.message || 'Failed to change password');
        } finally {
            setSavingSettings(false);
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async (e) => {
        e.preventDefault();

        if (!deletePassword) {
            showMessage('error', 'Please enter your password');
            return;
        }

        try {
            setSavingSettings(true);
            await usersApi.deleteAccount(deletePassword);
            await logout();
            navigate('/login');
        } catch (err) {
            showMessage('error', err.message || 'Failed to delete account');
        } finally {
            setSavingSettings(false);
        }
    };

    // Close modals
    const closeModals = () => {
        setShowPasswordModal(false);
        setShowDeleteModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setDeletePassword('');
    };

    return (
        <div className="settings">
            {/* Status Messages */}
            {error && <div className="settings__message settings__message--error">{error}</div>}
            {success && <div className="settings__message settings__message--success">{success}</div>}

            {/* Profile Section */}
            <Card className="settings__profile">
                <div className="settings__profile-avatar" onClick={handleAvatarClick}>
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profile" />
                    ) : (
                        <div className="settings__profile-initials">
                            {getInitials(user?.fullName)}
                        </div>
                    )}
                    <button className="settings__profile-edit" disabled={uploadingAvatar}>
                        {uploadingAvatar ? '...' : '📷'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                    />
                </div>
                <div className="settings__profile-info">
                    {editingProfile ? (
                        <div className="settings__profile-edit-form">
                            <Input
                                label="Full Name"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                placeholder="Your name"
                            />
                            {workspace === 'tuition' && (
                                <Input
                                    label="Tuition Center Name"
                                    value={tuitionCenterName}
                                    onChange={(e) => setTuitionCenterName(e.target.value)}
                                    placeholder="e.g., ABC Learning Center"
                                />
                            )}
                            <div className="settings__profile-edit-actions">
                                <Button
                                    variant="ghost"
                                    size="small"
                                    onClick={() => {
                                        setEditingProfile(false);
                                        setProfileName(user?.fullName || '');
                                        setTuitionCenterName(user?.tuitionCenterName || '');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="small"
                                    onClick={handleProfileSave}
                                    disabled={savingProfile}
                                >
                                    {savingProfile ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="settings__profile-name">{user?.fullName || 'User'}</h2>
                            <p className="settings__profile-email">{user?.email || 'No email'}</p>
                            {workspace === 'tuition' && user?.tuitionCenterName && (
                                <p className="settings__profile-tuition">🎓 {user.tuitionCenterName}</p>
                            )}
                        </>
                    )}
                </div>
                {!editingProfile && (
                    <Button variant="secondary" size="small" onClick={() => setEditingProfile(true)}>
                        Edit Profile
                    </Button>
                )}
            </Card>

            {/* Preferences */}
            <div className="settings__section">
                <h3 className="settings__section-title">Preferences</h3>

                <Card className="settings__list">
                    {/* Currency */}
                    <div className="settings__item">
                        <div className="settings__item-info">
                            <span className="settings__item-icon">💱</span>
                            <div className="settings__item-text">
                                <span className="settings__item-label">Currency</span>
                                <span className="settings__item-desc">Display currency for amounts</span>
                            </div>
                        </div>
                        <select
                            className="settings__select"
                            value={settings.currency}
                            onChange={handleCurrencyChange}
                            disabled={savingSettings}
                        >
                            {CURRENCIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Notifications */}
                    <div className="settings__item">
                        <div className="settings__item-info">
                            <span className="settings__item-icon">🔔</span>
                            <div className="settings__item-text">
                                <span className="settings__item-label">Notifications</span>
                                <span className="settings__item-desc">Get reminders and alerts</span>
                            </div>
                        </div>
                        <button
                            className={`settings__toggle ${settings.notificationsEnabled ? 'settings__toggle--on' : ''}`}
                            onClick={() => handleToggle('notificationsEnabled')}
                            aria-label="Toggle notifications"
                            disabled={savingSettings}
                        >
                            <span className="settings__toggle-knob"></span>
                        </button>
                    </div>

                    {/* Dark Mode */}
                    <div className="settings__item">
                        <div className="settings__item-info">
                            <span className="settings__item-icon">🌙</span>
                            <div className="settings__item-text">
                                <span className="settings__item-label">Dark Mode</span>
                                <span className="settings__item-desc">Use dark theme</span>
                            </div>
                        </div>
                        <button
                            className={`settings__toggle ${settings.darkModeEnabled ? 'settings__toggle--on' : ''}`}
                            onClick={() => handleToggle('darkModeEnabled')}
                            aria-label="Toggle dark mode"
                            disabled={savingSettings}
                        >
                            <span className="settings__toggle-knob"></span>
                        </button>
                    </div>

                    {/* Biometric */}
                    <div className="settings__item">
                        <div className="settings__item-info">
                            <span className="settings__item-icon">🔐</span>
                            <div className="settings__item-text">
                                <span className="settings__item-label">Biometric Lock</span>
                                <span className="settings__item-desc">Secure with fingerprint/face</span>
                            </div>
                        </div>
                        <button
                            className={`settings__toggle ${settings.biometricEnabled ? 'settings__toggle--on' : ''}`}
                            onClick={() => handleToggle('biometricEnabled')}
                            aria-label="Toggle biometric lock"
                            disabled={savingSettings}
                        >
                            <span className="settings__toggle-knob"></span>
                        </button>
                    </div>
                </Card>
            </div>

            {/* Security Section */}
            <div className="settings__section">
                <h3 className="settings__section-title">Security</h3>

                <Card className="settings__list">
                    <button className="settings__action" onClick={() => setShowPasswordModal(true)}>
                        <span className="settings__action-icon">🔑</span>
                        <span className="settings__action-label">Change Password</span>
                        <span className="settings__action-arrow">→</span>
                    </button>
                </Card>
            </div>

            {/* Danger Zone */}
            <div className="settings__section">
                <h3 className="settings__section-title settings__section-title--danger">Danger Zone</h3>

                <Card className="settings__list">
                    <button
                        className="settings__action settings__action--danger"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <span className="settings__action-icon">🗑️</span>
                        <span className="settings__action-label">Delete Account</span>
                        <span className="settings__action-arrow">→</span>
                    </button>
                </Card>
            </div>

            {/* App Info */}
            <div className="settings__footer">
                <p>My Wallet v1.0.0</p>
                <p>Made with ❤️ for better finances</p>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="settings__modal-overlay" onClick={closeModals}>
                    <div className="settings__modal" onClick={e => e.stopPropagation()}>
                        <h2 className="settings__modal-title">Change Password</h2>
                        <form onSubmit={handlePasswordChange}>
                            <Input
                                label="Current Password"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                                required
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                                required
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                                required
                            />
                            <div className="settings__modal-actions">
                                <Button type="button" variant="ghost" onClick={closeModals}>Cancel</Button>
                                <Button type="submit" disabled={savingSettings}>
                                    {savingSettings ? 'Changing...' : 'Change Password'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="settings__modal-overlay" onClick={closeModals}>
                    <div className="settings__modal settings__modal--small" onClick={e => e.stopPropagation()}>
                        <h2 className="settings__modal-title settings__modal-title--danger">Delete Account</h2>
                        <p className="settings__modal-text">
                            This action is <strong>permanent</strong> and cannot be undone.
                            All your data will be deleted. Enter your password to confirm.
                        </p>
                        <form onSubmit={handleDeleteAccount}>
                            <Input
                                label="Password"
                                type="password"
                                value={deletePassword}
                                onChange={e => setDeletePassword(e.target.value)}
                                required
                            />
                            <div className="settings__modal-actions">
                                <Button type="button" variant="ghost" onClick={closeModals}>Cancel</Button>
                                <Button type="submit" variant="danger" disabled={savingSettings}>
                                    {savingSettings ? 'Deleting...' : 'Delete Account'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
