import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData, categoryInfo, DEFAULT_CATEGORIES } from '../../context/DataContext';
import { transactionsApi, walletsApi } from '../../services/api';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import './AddTransaction.css';

function AddTransaction() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') || 'expense';

    // Remove workspace dependency since this is only used in personal layout
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [walletsLoading, setWalletsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        type: initialType,
        amount: '',
        category: '',
        walletId: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        isRecurring: false,
    });

    // Fetch wallets on mount
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const data = await walletsApi.getAll();
                const activeWallets = (data.wallets || []).filter(w => !w.isArchived);
                setWallets(activeWallets);
                // Set first wallet as default if available
                if (activeWallets.length > 0 && !formData.walletId) {
                    setFormData(prev => ({ ...prev, walletId: activeWallets[0].id || activeWallets[0]._id }));
                }
            } catch (err) {
                console.error('Failed to fetch wallets:', err);
                setError('Failed to load wallets');
            } finally {
                setWalletsLoading(false);
            }
        };
        fetchWallets();
    }, []);

    // Get categories based on personal workspace and type
    const getCategories = () => {
        try {
            const wsCategories = DEFAULT_CATEGORIES.personal; // Always use personal categories
            const categories = wsCategories[formData.type] || [];
            return categories;
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    };

    const handleTypeChange = (type) => {
        setFormData(prev => ({ ...prev, type, category: '', isRecurring: false }));
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.amount || !formData.category || !formData.walletId) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            await transactionsApi.create({
                walletId: formData.walletId,
                type: formData.type,
                category: formData.category,
                amount: parseFloat(formData.amount),
                date: formData.date,
                note: formData.note,
                workspace: 'personal', // Always use personal workspace
                isRecurring: formData.isRecurring,
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/home');
            }, 1000);
        } catch (err) {
            setError(err.message || 'Failed to create transaction');
        } finally {
            setLoading(false);
        }
    };

    const currentCategories = getCategories();

    if (walletsLoading) {
        return (
            <div className="add-transaction">
                <div className="add-transaction__loading">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (wallets.length === 0) {
        return (
            <div className="add-transaction">
                <Card className="add-transaction__no-wallets">
                    <h3>No Wallets Found</h3>
                    <p>Please create a wallet first before adding transactions.</p>
                    <Button onClick={() => navigate('/wallets')}>
                        Go to Wallets
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="add-transaction">
            {success && (
                <div className="add-transaction__success">
                    ✓ Transaction saved successfully!
                </div>
            )}

            {error && (
                <div className="add-transaction__error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="add-transaction__form">
                {/* Type Selector */}
                <div className="add-transaction__type-selector">
                    {['income', 'expense'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={`add-transaction__type-btn ${formData.type === type ? `add-transaction__type-btn--active add-transaction__type-btn--${type}` : ''}`}
                            onClick={() => handleTypeChange(type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Amount Input */}
                <Card className="add-transaction__amount-card">
                    <label className="add-transaction__amount-label">Amount</label>
                    <div className="add-transaction__amount-wrapper">
                        <span className="add-transaction__currency">Rs.</span>
                        <input
                            type="number"
                            className="add-transaction__amount-input"
                            placeholder="0"
                            value={formData.amount}
                            onChange={(e) => handleChange('amount', e.target.value)}
                            min="0"
                            step="1"
                            required
                        />
                    </div>
                </Card>

                {/* Category Selector */}
                <div className="add-transaction__field">
                    <label className="add-transaction__label">Category</label>
                    <div className="add-transaction__categories">
                        {currentCategories && currentCategories.length > 0 ? (
                            currentCategories.map((cat) => (
                                <button
                                    key={cat.key}
                                    type="button"
                                    className={`add-transaction__category ${formData.category === cat.key ? 'add-transaction__category--active' : ''}`}
                                    onClick={() => handleChange('category', cat.key)}
                                >
                                    <span className="add-transaction__category-icon">
                                        {cat.icon}
                                    </span>
                                    <span className="add-transaction__category-name">
                                        {cat.label}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="add-transaction__no-categories">
                                No categories available for {formData.type}
                            </div>
                        )}
                    </div>
                </div>

                {/* Expense Frequency (only for expense type) */}
                {formData.type === 'expense' && (
                    <div className="add-transaction__field">
                        <label className="add-transaction__label">Expense Frequency</label>
                        <div className="add-transaction__frequency">
                            <button
                                type="button"
                                className={`add-transaction__freq-btn ${!formData.isRecurring ? 'add-transaction__freq-btn--active' : ''}`}
                                onClick={() => handleChange('isRecurring', false)}
                            >
                                <span className="add-transaction__freq-icon">📆</span>
                                One-time
                                <span className="add-transaction__freq-desc">This month only</span>
                            </button>
                            <button
                                type="button"
                                className={`add-transaction__freq-btn ${formData.isRecurring ? 'add-transaction__freq-btn--active' : ''}`}
                                onClick={() => handleChange('isRecurring', true)}
                            >
                                <span className="add-transaction__freq-icon">🔄</span>
                                Recurring
                                <span className="add-transaction__freq-desc">Repeat every month</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Wallet Selector */}
                <div className="add-transaction__field">
                    <label className="add-transaction__label">Wallet</label>
                    <div className="add-transaction__wallets">
                        {wallets.map((wallet) => (
                            <button
                                key={wallet.id || wallet._id}
                                type="button"
                                className={`add-transaction__wallet ${formData.walletId === (wallet.id || wallet._id) ? 'add-transaction__wallet--active' : ''}`}
                                onClick={() => handleChange('walletId', wallet.id || wallet._id)}
                            >
                                {wallet.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date */}
                <div className="add-transaction__field">
                    <label className="add-transaction__label">Date</label>
                    <input
                        type="date"
                        className="add-transaction__date-input"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                    />
                </div>

                {/* Notes */}
                <div className="add-transaction__field">
                    <label className="add-transaction__label">Notes (optional)</label>
                    <input
                        type="text"
                        className="add-transaction__note-input"
                        placeholder="Add a note..."
                        value={formData.note}
                        onChange={(e) => handleChange('note', e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <div className="add-transaction__submit">
                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (formData.isRecurring ? 'Save Recurring Expense' : 'Save Transaction')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AddTransaction;
