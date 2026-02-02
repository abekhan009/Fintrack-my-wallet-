import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { walletsApi, recurringApi } from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import './AddRecurring.css';

function AddRecurring() {
    const navigate = useNavigate();
    const { DEFAULT_CATEGORIES } = useData(); // Only need categories, not workspace

    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        walletId: '',
        category: '',
        frequency: 'monthly',
        startMonth: new Date().toISOString().slice(0, 7),
        endMonth: '',
        dayOfMonth: 1,
    });

    // Fetch wallets
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const data = await walletsApi.getAll({ workspace: 'personal' }); // Always use personal workspace
                setWallets(data.wallets || []);
                if (data.wallets?.length > 0) {
                    setFormData(prev => ({ ...prev, walletId: data.wallets[0].id }));
                }
            } catch (err) {
                setError('Failed to load wallets');
            } finally {
                setLoading(false);
            }
        };

        fetchWallets();
    }, []); // Removed workspace dependency

    // Get categories based on personal workspace
    const categories = DEFAULT_CATEGORIES.personal?.expense || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' || name === 'dayOfMonth'
                ? (value === '' ? '' : Number(value))
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                amount: formData.amount,
                walletId: formData.walletId,
                category: formData.category,
                workspace: 'personal', // Always use personal workspace
                frequency: formData.frequency,
                startMonth: formData.startMonth,
                dayOfMonth: formData.dayOfMonth,
            };

            if (formData.endMonth) {
                payload.endMonth = formData.endMonth;
            }

            await recurringApi.create(payload);
            setSuccess(true);
            setTimeout(() => navigate('/recurring'), 1500);
        } catch (err) {
            setError(err.message || 'Failed to create recurring expense');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="add-recurring">
                <div className="add-recurring__loading">
                    <div className="add-recurring__spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (wallets.length === 0) {
        return (
            <div className="add-recurring">
                <Card className="add-recurring__no-wallets">
                    <h2>No Wallets Available</h2>
                    <p>Create a wallet first before adding recurring expenses.</p>
                    <Button variant="primary" onClick={() => navigate('/wallets')}>
                        Go to Wallets
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="add-recurring">
            <div className="add-recurring__header">
                <button className="add-recurring__back" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h1 className="add-recurring__title">Add Recurring Expense</h1>
            </div>

            {success && (
                <div className="add-recurring__success">
                    ✓ Recurring expense created successfully!
                </div>
            )}

            {error && (
                <div className="add-recurring__error">
                    {error}
                </div>
            )}

            <Card className="add-recurring__card">
                <form onSubmit={handleSubmit} className="add-recurring__form">
                    {/* Name */}
                    <Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Internet Bill"
                        required
                    />

                    {/* Amount */}
                    <Input
                        label="Amount (Rs.)"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0"
                        min="1"
                        step="1"
                        required
                    />

                    {/* Wallet */}
                    <div className="add-recurring__field">
                        <label className="add-recurring__label">Wallet</label>
                        <select
                            name="walletId"
                            value={formData.walletId}
                            onChange={handleChange}
                            className="add-recurring__select"
                            required
                        >
                            {wallets.map(wallet => (
                                <option key={wallet.id} value={wallet.id}>
                                    {wallet.icon} {wallet.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="add-recurring__field">
                        <label className="add-recurring__label">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="add-recurring__select"
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat.key} value={cat.key}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Frequency */}
                    <div className="add-recurring__field">
                        <label className="add-recurring__label">Frequency</label>
                        <select
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            className="add-recurring__select"
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    {/* Day of Month */}
                    <div className="add-recurring__field">
                        <label className="add-recurring__label">Day of Month (1-31)</label>
                        <input
                            type="number"
                            name="dayOfMonth"
                            value={formData.dayOfMonth}
                            onChange={handleChange}
                            min="1"
                            max="31"
                            className="add-recurring__input"
                        />
                    </div>

                    {/* Start Month */}
                    <div className="add-recurring__field">
                        <label className="add-recurring__label">Start Month</label>
                        <input
                            type="month"
                            name="startMonth"
                            value={formData.startMonth}
                            onChange={handleChange}
                            className="add-recurring__input"
                            required
                        />
                    </div>

                    {/* End Month (Optional) */}
                    <div className="add-recurring__field">
                        <label className="add-recurring__label">End Month (Optional)</label>
                        <input
                            type="month"
                            name="endMonth"
                            value={formData.endMonth}
                            onChange={handleChange}
                            className="add-recurring__input"
                            min={formData.startMonth}
                        />
                        <span className="add-recurring__hint">Leave empty for indefinite</span>
                    </div>

                    {/* Submit */}
                    <div className="add-recurring__actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(-1)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting || success}
                        >
                            {submitting ? 'Creating...' : 'Create Recurring Expense'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

export default AddRecurring;
