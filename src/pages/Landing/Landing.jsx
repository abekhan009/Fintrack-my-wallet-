import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSessionExpiredMessage } from '../../services/api';
import Button from '../../components/Button/Button';
import Logo from '../../components/Logo/Logo';
import './Landing.css';

function Landing() {
    const navigate = useNavigate();
    const { isAuthenticated, login, register, error: authError, clearError } = useAuth();
    const [activeTab, setActiveTab] = useState('login');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [sessionExpiredError, setSessionExpiredError] = useState('');

    // Login form state
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [loginErrors, setLoginErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Register form state
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        tuitionCenterName: '',
        agreeToTerms: false
    });
    const [registerErrors, setRegisterErrors] = useState({});
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Check for session expired message on mount
    useEffect(() => {
        const message = getSessionExpiredMessage();
        if (message) {
            setSessionExpiredError(message);
            // Auto-clear after 10 seconds
            setTimeout(() => setSessionExpiredError(''), 10000);
        }
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        const errors = {};
        setApiError('');

        if (!loginForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!loginForm.password) {
            errors.password = 'Password is required';
        }

        if (Object.keys(errors).length > 0) {
            setLoginErrors(errors);
            return;
        }

        setIsSubmitting(true);
        setLoginErrors({});

        try {
            const result = await login(loginForm.email, loginForm.password);
            if (result.success) {
                navigate('/home');
            } else {
                setApiError(result.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            setApiError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle register
    const handleRegister = async (e) => {
        e.preventDefault();
        const errors = {};
        setApiError('');

        if (!registerForm.name.trim()) {
            errors.name = 'Full name is required';
        } else if (registerForm.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!registerForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!registerForm.password) {
            errors.password = 'Password is required';
        } else if (registerForm.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (!/[a-zA-Z]/.test(registerForm.password)) {
            errors.password = 'Password must contain at least one letter';
        } else if (!/[0-9]/.test(registerForm.password)) {
            errors.password = 'Password must contain at least one number';
        }

        if (!registerForm.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (registerForm.password !== registerForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!registerForm.agreeToTerms) {
            errors.agreeToTerms = 'You must agree to the terms';
        }

        if (Object.keys(errors).length > 0) {
            setRegisterErrors(errors);
            return;
        }

        setIsSubmitting(true);
        setRegisterErrors({});

        try {
            const result = await register({
                name: registerForm.name,
                email: registerForm.email,
                password: registerForm.password,
                tuitionCenterName: registerForm.tuitionCenterName || null
            });
            if (result.success) {
                navigate('/home');
            } else {
                setApiError(result.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setApiError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const features = [
        { icon: '💸', text: 'Track income & expenses with ease' },
        { icon: '🎓', text: 'Manage students and fee records' },
        { icon: '🔁', text: 'Recurring monthly bills support' }
    ];

    return (
        <div className="landing">
            {/* Background Orbs */}
            <div className="landing__orb landing__orb--1"></div>
            <div className="landing__orb landing__orb--2"></div>
            <div className="landing__orb landing__orb--3"></div>

            <div className="landing__container">
                {/* Brand Section (Left) */}
                <div className="landing__brand">
                    <div className="landing__brand-content">
                        <div className="landing__logo">
                            <Logo size={64} className="logo--animated" />
                            <h1 className="landing__logo-text">FinTrack</h1>
                        </div>

                        <p className="landing__tagline">
                            Personal Finance + Tuition Management in one place.
                        </p>

                        <ul className="landing__features">
                            {features.map((feature, index) => (
                                <li key={index} className="landing__feature">
                                    <span className="landing__feature-icon">{feature.icon}</span>
                                    <span className="landing__feature-text">{feature.text}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Mini Preview Card */}
                        <div className="landing__preview">
                            <div className="landing__preview-header">
                                <div className="landing__preview-dot"></div>
                                <div className="landing__preview-dot"></div>
                                <div className="landing__preview-dot"></div>
                            </div>
                            <div className="landing__preview-balance">
                                <span className="landing__preview-label">Total Balance</span>
                                <span className="landing__preview-amount">Rs. 125,450</span>
                            </div>
                            <div className="landing__preview-stats">
                                <div className="landing__preview-stat landing__preview-stat--income">
                                    <span>↑</span>
                                    <span>+Rs. 50,000</span>
                                </div>
                                <div className="landing__preview-stat landing__preview-stat--expense">
                                    <span>↓</span>
                                    <span>-Rs. 12,500</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Auth Card (Right) */}
                <div className="landing__auth">
                    <div className="auth-card">
                        {/* Tabs */}
                        <div className="auth-card__tabs">
                            <button
                                className={`auth-card__tab ${activeTab === 'login' ? 'auth-card__tab--active' : ''}`}
                                onClick={() => {
                                    setActiveTab('login');
                                    setRegisterErrors({});
                                    setApiError('');
                                }}
                            >
                                Login
                            </button>
                            <button
                                className={`auth-card__tab ${activeTab === 'register' ? 'auth-card__tab--active' : ''}`}
                                onClick={() => {
                                    setActiveTab('register');
                                    setLoginErrors({});
                                    setApiError('');
                                }}
                            >
                                Register
                            </button>
                            <div
                                className="auth-card__tab-indicator"
                                style={{ transform: `translateX(${activeTab === 'register' ? '100%' : '0'})` }}
                            ></div>
                        </div>

                        {/* Login Form */}
                        <div className={`auth-card__form-container ${activeTab === 'login' ? 'auth-card__form-container--active' : ''}`}>
                            <form className="auth-card__form" onSubmit={handleLogin}>
                                <h2 className="auth-card__title">Welcome back!</h2>
                                <p className="auth-card__subtitle">Sign in to continue to your account</p>

                                {sessionExpiredError && (
                                    <div className="auth-card__session-expired">
                                        <span className="auth-card__session-expired-icon">🔒</span>
                                        <span>{sessionExpiredError}</span>
                                        <button
                                            type="button"
                                            className="auth-card__session-expired-close"
                                            onClick={() => setSessionExpiredError('')}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                {apiError && (
                                    <div className="auth-card__api-error">
                                        <span className="auth-card__api-error-icon">⚠️</span>
                                        <span>{apiError}</span>
                                    </div>
                                )}

                                <div className="auth-card__field">
                                    <label className="auth-card__label" htmlFor="login-email">Email</label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        className={`auth-card__input ${loginErrors.email ? 'auth-card__input--error' : ''}`}
                                        placeholder="Enter your email"
                                        value={loginForm.email}
                                        onChange={(e) => {
                                            setLoginForm({ ...loginForm, email: e.target.value });
                                            setLoginErrors({ ...loginErrors, email: '' });
                                        }}
                                    />
                                    {loginErrors.email && (
                                        <span className="auth-card__error">{loginErrors.email}</span>
                                    )}
                                </div>

                                <div className="auth-card__field">
                                    <label className="auth-card__label" htmlFor="login-password">Password</label>
                                    <div className="auth-card__input-wrapper">
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            className={`auth-card__input ${loginErrors.password ? 'auth-card__input--error' : ''}`}
                                            placeholder="Enter your password"
                                            value={loginForm.password}
                                            onChange={(e) => {
                                                setLoginForm({ ...loginForm, password: e.target.value });
                                                setLoginErrors({ ...loginErrors, password: '' });
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="auth-card__toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                    {loginErrors.password && (
                                        <span className="auth-card__error">{loginErrors.password}</span>
                                    )}
                                </div>

                                <div className="auth-card__options">
                                    <label className="auth-card__checkbox-label">
                                        <input
                                            type="checkbox"
                                            className="auth-card__checkbox"
                                            checked={loginForm.rememberMe}
                                            onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                                        />
                                        <span className="auth-card__checkbox-text">Remember me</span>
                                    </label>
                                    <button type="button" className="auth-card__link">
                                        Forgot password?
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Signing in...' : 'Login'}
                                </Button>

                                <p className="auth-card__footer">
                                    New here?{' '}
                                    <button
                                        type="button"
                                        className="auth-card__switch"
                                        onClick={() => setActiveTab('register')}
                                    >
                                        Create an account
                                    </button>
                                </p>
                            </form>
                        </div>

                        {/* Register Form */}
                        <div className={`auth-card__form-container ${activeTab === 'register' ? 'auth-card__form-container--active' : ''}`}>
                            <form className="auth-card__form" onSubmit={handleRegister}>
                                <h2 className="auth-card__title">Create Account</h2>
                                <p className="auth-card__subtitle">Get started with your free account</p>

                                {apiError && (
                                    <div className="auth-card__api-error">
                                        <span className="auth-card__api-error-icon">⚠️</span>
                                        <span>{apiError}</span>
                                    </div>
                                )}

                                <div className="auth-card__field">
                                    <label className="auth-card__label" htmlFor="reg-name">Full Name</label>
                                    <input
                                        id="reg-name"
                                        type="text"
                                        className={`auth-card__input ${registerErrors.name ? 'auth-card__input--error' : ''}`}
                                        placeholder="Enter your full name"
                                        value={registerForm.name}
                                        onChange={(e) => {
                                            setRegisterForm({ ...registerForm, name: e.target.value });
                                            setRegisterErrors({ ...registerErrors, name: '' });
                                        }}
                                    />
                                    {registerErrors.name && (
                                        <span className="auth-card__error">{registerErrors.name}</span>
                                    )}
                                </div>

                                <div className="auth-card__field">
                                    <label className="auth-card__label" htmlFor="reg-email">Email</label>
                                    <input
                                        id="reg-email"
                                        type="email"
                                        className={`auth-card__input ${registerErrors.email ? 'auth-card__input--error' : ''}`}
                                        placeholder="Enter your email"
                                        value={registerForm.email}
                                        onChange={(e) => {
                                            setRegisterForm({ ...registerForm, email: e.target.value });
                                            setRegisterErrors({ ...registerErrors, email: '' });
                                        }}
                                    />
                                    {registerErrors.email && (
                                        <span className="auth-card__error">{registerErrors.email}</span>
                                    )}
                                </div>

                                <div className="auth-card__row">
                                    <div className="auth-card__field">
                                        <label className="auth-card__label" htmlFor="reg-password">Password</label>
                                        <div className="auth-card__input-wrapper">
                                            <input
                                                id="reg-password"
                                                type={showRegPassword ? 'text' : 'password'}
                                                className={`auth-card__input ${registerErrors.password ? 'auth-card__input--error' : ''}`}
                                                placeholder="Create password"
                                                value={registerForm.password}
                                                onChange={(e) => {
                                                    setRegisterForm({ ...registerForm, password: e.target.value });
                                                    setRegisterErrors({ ...registerErrors, password: '' });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="auth-card__toggle-password"
                                                onClick={() => setShowRegPassword(!showRegPassword)}
                                            >
                                                {showRegPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                        {registerErrors.password && (
                                            <span className="auth-card__error">{registerErrors.password}</span>
                                        )}
                                    </div>

                                    <div className="auth-card__field">
                                        <label className="auth-card__label" htmlFor="reg-confirm">Confirm Password</label>
                                        <div className="auth-card__input-wrapper">
                                            <input
                                                id="reg-confirm"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className={`auth-card__input ${registerErrors.confirmPassword ? 'auth-card__input--error' : ''}`}
                                                placeholder="Confirm password"
                                                value={registerForm.confirmPassword}
                                                onChange={(e) => {
                                                    setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                                                    setRegisterErrors({ ...registerErrors, confirmPassword: '' });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="auth-card__toggle-password"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                        {registerErrors.confirmPassword && (
                                            <span className="auth-card__error">{registerErrors.confirmPassword}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="auth-card__field">
                                    <label className="auth-card__label" htmlFor="reg-tuition">
                                        Tuition Center Name <span className="auth-card__optional">(Optional)</span>
                                    </label>
                                    <input
                                        id="reg-tuition"
                                        type="text"
                                        className="auth-card__input"
                                        placeholder="e.g., ABC Tuition Center"
                                        value={registerForm.tuitionCenterName}
                                        onChange={(e) => setRegisterForm({ ...registerForm, tuitionCenterName: e.target.value })}
                                    />
                                </div>

                                <div className="auth-card__field">
                                    <label className={`auth-card__checkbox-label ${registerErrors.agreeToTerms ? 'auth-card__checkbox-label--error' : ''}`}>
                                        <input
                                            type="checkbox"
                                            className="auth-card__checkbox"
                                            checked={registerForm.agreeToTerms}
                                            onChange={(e) => {
                                                setRegisterForm({ ...registerForm, agreeToTerms: e.target.checked });
                                                setRegisterErrors({ ...registerErrors, agreeToTerms: '' });
                                            }}
                                        />
                                        <span className="auth-card__checkbox-text">
                                            I agree to the <button type="button" className="auth-card__link">Terms of Service</button> and <button type="button" className="auth-card__link">Privacy Policy</button>
                                        </span>
                                    </label>
                                    {registerErrors.agreeToTerms && (
                                        <span className="auth-card__error">{registerErrors.agreeToTerms}</span>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                                </Button>

                                <p className="auth-card__footer">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        className="auth-card__switch"
                                        onClick={() => setActiveTab('login')}
                                    >
                                        Login
                                    </button>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;
