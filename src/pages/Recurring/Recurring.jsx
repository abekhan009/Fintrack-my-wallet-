import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, categoryInfo } from '../../context/DataContext';
import { recurringApi, walletsApi, transactionsApi } from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './Recurring.css';

function Recurring() {
    const navigate = useNavigate();
    // Remove workspace dependency since this is only used in personal layout

    const [recurringExpenses, setRecurringExpenses] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // ID of item being acted on
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentType: 'full', // 'full' or 'partial'
        walletId: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Fetch recurring expenses and wallets
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [recurringData, walletsData] = await Promise.all([
                    recurringApi.getAll({ workspace: 'personal' }),
                    walletsApi.getAll()
                ]);
                setRecurringExpenses(recurringData.recurringExpenses || []);
                setWallets(walletsData.wallets || []);
            } catch (err) {
                setError(err.message || 'Failed to load data');
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Removed workspace dependency

    const formatMonth = (monthStr) => {
        if (!monthStr) return 'No end';
        const [year, month] = monthStr.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const getNextDueDate = (expense) => {
        if (expense.status !== 'active') return '-';
        
        const now = new Date();
        const isPaid = isPaidForCurrentPeriod(expense);
        
        let dueDate;
        
        switch (expense.frequency) {
            case 'weekly':
                if (isPaid) {
                    // Show next week's due date
                    dueDate = new Date(now);
                    dueDate.setDate(now.getDate() + 7);
                } else {
                    // Show this week's due date (today or next occurrence)
                    dueDate = new Date(now);
                }
                return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
            case 'monthly':
                if (isPaid) {
                    // Show next month's due date
                    dueDate = new Date(now.getFullYear(), now.getMonth() + 1, expense.dayOfMonth || 1);
                } else {
                    // Show current month's due date
                    dueDate = new Date(now.getFullYear(), now.getMonth(), expense.dayOfMonth || 1);
                    if (dueDate < now) {
                        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, expense.dayOfMonth || 1);
                    }
                }
                return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
            case 'yearly':
                if (isPaid) {
                    // Show next year's due date
                    dueDate = new Date(now.getFullYear() + 1, (expense.dayOfMonth || 1) - 1, 1);
                } else {
                    // Show this year's due date
                    dueDate = new Date(now.getFullYear(), (expense.dayOfMonth || 1) - 1, 1);
                    if (dueDate < now) {
                        dueDate = new Date(now.getFullYear() + 1, (expense.dayOfMonth || 1) - 1, 1);
                    }
                }
                return dueDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                
            default:
                return '-';
        }
    };

    const isPaidForCurrentPeriod = (expense) => {
        if (!expense.lastProcessedMonth) return false;
        
        const now = new Date();
        const lastProcessedDate = new Date(expense.lastProcessedMonth + '-01');
        
        switch (expense.frequency) {
            case 'weekly':
                // For weekly, check if paid within the last 7 days
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                return lastProcessedDate >= weekAgo;
                
            case 'monthly':
                // For monthly, check if paid this month
                const currentMonth = now.toISOString().slice(0, 7);
                return expense.lastProcessedMonth === currentMonth;
                
            case 'yearly':
                // For yearly, check if paid this year
                const currentYear = now.getFullYear().toString();
                const lastProcessedYear = expense.lastProcessedMonth.slice(0, 4);
                return lastProcessedYear === currentYear;
                
            default:
                return false;
        }
    };

    const getPaymentPeriodLabel = (expense) => {
        switch (expense.frequency) {
            case 'weekly':
                return 'This Week';
            case 'monthly':
                return 'This Month';
            case 'yearly':
                return 'This Year';
            default:
                return 'Current Period';
        }
    };

    const totalMonthly = recurringExpenses
        .filter(e => e.status === 'active')
        .reduce((sum, e) => sum + e.amount, 0);

    const handlePauseResume = async (expense) => {
        setActionLoading(expense.id);
        try {
            if (expense.status === 'active') {
                const result = await recurringApi.pause(expense.id);
                setRecurringExpenses(prev => prev.map(e =>
                    e.id === expense.id ? result.recurringExpense : e
                ));
            } else {
                const result = await recurringApi.resume(expense.id);
                setRecurringExpenses(prev => prev.map(e =>
                    e.id === expense.id ? result.recurringExpense : e
                ));
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            setError(err.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (expense) => {
        if (!confirm(`Delete "${expense.name}"?`)) return;

        setActionLoading(expense.id);
        try {
            await recurringApi.delete(expense.id);
            setRecurringExpenses(prev => prev.filter(e => e.id !== expense.id));
        } catch (err) {
            console.error('Failed to delete:', err);
            setError(err.message || 'Failed to delete');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePayClick = (expense) => {
        setSelectedExpense(expense);
        setPaymentError(null);
        setPaymentSuccess(null);
        setPaymentData({
            amount: expense.amount.toString(),
            paymentType: 'full',
            walletId: wallets.length > 0 ? wallets[0].id : '',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedExpense || !paymentData.amount || !paymentData.walletId) return;

        setActionLoading(selectedExpense.id);
        setPaymentError(null);
        setPaymentSuccess(null);
        
        try {
            // Create a transaction for the payment
            await transactionsApi.create({
                walletId: paymentData.walletId,
                type: 'expense',
                category: selectedExpense.category,
                amount: parseFloat(paymentData.amount),
                date: paymentData.date,
                note: `${selectedExpense.name} - Recurring payment${paymentData.notes ? ` (${paymentData.notes})` : ''}`,
                workspace: 'personal'
            });

            // Update the recurring expense's last processed period based on frequency
            let lastProcessedPeriod;
            const paymentDate = new Date(paymentData.date);
            
            switch (selectedExpense.frequency) {
                case 'weekly':
                    // For weekly, store the week's Monday date in YYYY-MM-DD format
                    const monday = new Date(paymentDate);
                    monday.setDate(paymentDate.getDate() - paymentDate.getDay() + 1);
                    lastProcessedPeriod = monday.toISOString().slice(0, 7); // Still use YYYY-MM for consistency
                    break;
                    
                case 'monthly':
                    // For monthly, store YYYY-MM
                    lastProcessedPeriod = paymentDate.toISOString().slice(0, 7);
                    break;
                    
                case 'yearly':
                    // For yearly, store YYYY-01 (January of the year)
                    lastProcessedPeriod = `${paymentDate.getFullYear()}-01`;
                    break;
                    
                default:
                    lastProcessedPeriod = paymentDate.toISOString().slice(0, 7);
            }

            await recurringApi.update(selectedExpense.id, {
                lastProcessedMonth: lastProcessedPeriod
            });

            // Refresh the data
            const data = await recurringApi.getAll({ workspace: 'personal' });
            setRecurringExpenses(data.recurringExpenses || []);

            setPaymentSuccess('Payment recorded successfully!');
            
            // Close modal after a short delay to show success message
            setTimeout(() => {
                setShowPaymentModal(false);
                setSelectedExpense(null);
                setPaymentSuccess(null);
            }, 1500);
            
        } catch (err) {
            console.error('Payment failed:', err);
            setPaymentError(err.message || 'Failed to record payment. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePaymentTypeChange = (type) => {
        setPaymentData(prev => ({
            ...prev,
            paymentType: type,
            amount: type === 'full' ? selectedExpense?.amount.toString() || '' : ''
        }));
    };

    if (loading) {
        return (
            <div className="recurring">
                <div className="recurring__loading">
                    <div className="recurring__spinner"></div>
                    <p>Loading recurring expenses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recurring">
            {/* Error */}
            {error && (
                <div className="recurring__error">
                    <span>{error}</span>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            )}

            {/* Summary Card */}
            <Card variant="gradient" className="recurring__summary">
                <span className="recurring__summary-label">Total Monthly Recurring</span>
                <span className="recurring__summary-amount">Rs. {totalMonthly.toLocaleString()}</span>
                <span className="recurring__summary-count">
                    {recurringExpenses.filter(e => e.status === 'active').length} active expenses
                </span>
            </Card>

            {/* Header */}
            <div className="recurring__header">
                <h2 className="recurring__title">Recurring Expenses</h2>
                <Button variant="primary" onClick={() => navigate('/recurring/add')}>
                    + Add Recurring
                </Button>
            </div>

            {/* List */}
            <div className="recurring__list">
                {recurringExpenses.map((expense, index) => (
                    <Card key={expense.id || expense._id || index} className="recurring__card">
                        <div className="recurring__card-main">
                            <div className="recurring__card-icon">
                                {categoryInfo[expense.category]?.icon || '📌'}
                            </div>
                            <div className="recurring__card-info">
                                <h3 className="recurring__card-name">{expense.name}</h3>
                                <span className="recurring__card-category">
                                    {categoryInfo[expense.category]?.label || expense.category}
                                </span>
                            </div>
                            <div className="recurring__card-amount">
                                <span className="recurring__card-amount-value">Rs. {expense.amount.toLocaleString()}</span>
                                <span className="recurring__card-frequency">{expense.frequency}</span>
                            </div>
                        </div>

                        <div className="recurring__card-details">
                            <div className="recurring__card-detail">
                                <span className="recurring__card-detail-label">Wallet</span>
                                <span>{expense.wallet || expense.walletId?.name || 'Unknown'}</span>
                            </div>
                            <div className="recurring__card-detail">
                                <span className="recurring__card-detail-label">Started</span>
                                <span>{formatMonth(expense.startMonth)}</span>
                            </div>
                            <div className="recurring__card-detail">
                                <span className="recurring__card-detail-label">Ends</span>
                                <span>{formatMonth(expense.endMonth)}</span>
                            </div>
                            <div className="recurring__card-detail">
                                <span className="recurring__card-detail-label">Next Due</span>
                                <span>{getNextDueDate(expense)}</span>
                            </div>
                            {expense.status === 'active' && (
                                <div className="recurring__card-detail">
                                    <span className="recurring__card-detail-label">{getPaymentPeriodLabel(expense)}</span>
                                    <span className={`recurring__payment-status ${isPaidForCurrentPeriod(expense) ? 'recurring__payment-status--paid' : 'recurring__payment-status--pending'}`}>
                                        {isPaidForCurrentPeriod(expense) ? '✓ Paid' : '⏳ Pending'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="recurring__card-actions">
                            <span className={`recurring__status recurring__status--${expense.status}`}>
                                {expense.status === 'active' ? '● Active' : expense.status === 'paused' ? '○ Paused' : '✓ Completed'}
                            </span>
                            <div className="recurring__card-buttons">
                                {expense.status === 'active' && (
                                    <button
                                        className={`recurring__action-btn ${isPaidForCurrentPeriod(expense) ? 'recurring__action-btn--paid' : 'recurring__action-btn--pay'}`}
                                        onClick={() => handlePayClick(expense)}
                                        disabled={actionLoading === expense.id || isPaidForCurrentPeriod(expense)}
                                    >
                                        {actionLoading === expense.id ? '...' : 
                                         isPaidForCurrentPeriod(expense) ? '✓ Paid' : '💳 Pay'}
                                    </button>
                                )}
                                {expense.status !== 'completed' && (
                                    <button
                                        className="recurring__action-btn"
                                        onClick={() => handlePauseResume(expense)}
                                        disabled={actionLoading === expense.id}
                                    >
                                        {actionLoading === expense.id ? '...' :
                                            expense.status === 'active' ? '⏸️ Pause' : '▶️ Resume'}
                                    </button>
                                )}
                                <button
                                    className="recurring__action-btn recurring__action-btn--danger"
                                    onClick={() => handleDelete(expense)}
                                    disabled={actionLoading === expense.id}
                                >
                                    {actionLoading === expense.id ? '...' : '🗑️ Delete'}
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}

                {recurringExpenses.length === 0 && !error && (
                    <div className="recurring__empty">
                        <span className="recurring__empty-icon">🔄</span>
                        <p>No recurring expenses yet</p>
                        <Button variant="primary" onClick={() => navigate('/recurring/add')}>
                            Add First Recurring Expense
                        </Button>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <Card className="recurring__info">
                <h3>💡 About Recurring Expenses</h3>
                <p>
                    Recurring expenses are automatically processed on their specified day each month.
                    When processed, a transaction is created and your wallet balance is updated.
                </p>
            </Card>

            {/* Payment Modal */}
            {showPaymentModal && selectedExpense && (
                <div className="recurring__modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="recurring__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="recurring__modal-header">
                            <h2>Pay Recurring Expense</h2>
                            <button 
                                className="recurring__modal-close" 
                                onClick={() => setShowPaymentModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="recurring__modal-expense-info">
                            <div className="recurring__modal-expense-icon">
                                {categoryInfo[selectedExpense.category]?.icon || '📌'}
                            </div>
                            <div className="recurring__modal-expense-details">
                                <h3>{selectedExpense.name}</h3>
                                <span className="recurring__modal-expense-category">
                                    {categoryInfo[selectedExpense.category]?.label || selectedExpense.category}
                                </span>
                                <span className="recurring__modal-expense-amount">
                                    Rs. {selectedExpense.amount.toLocaleString()}
                                </span>
                                <span className="recurring__modal-expense-frequency">
                                    {selectedExpense.frequency} • {getPaymentPeriodLabel(selectedExpense)}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="recurring__modal-form">
                            {/* Error Display */}
                            {paymentError && (
                                <div className="recurring__payment-error">
                                    <span className="recurring__payment-error-icon">⚠️</span>
                                    <p>{paymentError}</p>
                                </div>
                            )}

                            {/* Success Display */}
                            {paymentSuccess && (
                                <div className="recurring__payment-success">
                                    <span className="recurring__payment-success-icon">✅</span>
                                    <p>{paymentSuccess}</p>
                                </div>
                            )}

                            {/* Payment Type */}
                            <div className="recurring__form-group">
                                <label className="recurring__form-label">Payment Type</label>
                                <div className="recurring__payment-type-options">
                                    <button
                                        type="button"
                                        className={`recurring__payment-type-btn ${paymentData.paymentType === 'full' ? 'recurring__payment-type-btn--active' : ''}`}
                                        onClick={() => handlePaymentTypeChange('full')}
                                        disabled={paymentSuccess}
                                    >
                                        💰 Full Payment
                                        <span>Rs. {selectedExpense.amount.toLocaleString()}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`recurring__payment-type-btn ${paymentData.paymentType === 'partial' ? 'recurring__payment-type-btn--active' : ''}`}
                                        onClick={() => handlePaymentTypeChange('partial')}
                                        disabled={paymentSuccess}
                                    >
                                        📊 Partial Payment
                                        <span>Custom amount</span>
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="recurring__form-group">
                                <label className="recurring__form-label">
                                    Amount (Rs.) {paymentData.paymentType === 'full' ? '(Fixed)' : ''}
                                </label>
                                <input
                                    type="number"
                                    className="recurring__form-input"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                                    min="0.01"
                                    max={paymentData.paymentType === 'partial' ? selectedExpense.amount : undefined}
                                    step="0.01"
                                    disabled={paymentData.paymentType === 'full' || paymentSuccess}
                                    required
                                />
                            </div>

                            {/* Wallet */}
                            <div className="recurring__form-group">
                                <label className="recurring__form-label">Pay from Wallet</label>
                                <select
                                    className="recurring__form-select"
                                    value={paymentData.walletId}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, walletId: e.target.value }))}
                                    disabled={paymentSuccess}
                                    required
                                >
                                    <option value="">Select wallet...</option>
                                    {wallets.map(wallet => (
                                        <option key={wallet.id} value={wallet.id}>
                                            {wallet.name} (Rs. {wallet.balance?.toLocaleString() || 0})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div className="recurring__form-group">
                                <label className="recurring__form-label">Payment Date</label>
                                <input
                                    type="date"
                                    className="recurring__form-input"
                                    value={paymentData.date}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                                    disabled={paymentSuccess}
                                    required
                                />
                            </div>

                            {/* Notes */}
                            <div className="recurring__form-group">
                                <label className="recurring__form-label">Notes (Optional)</label>
                                <textarea
                                    className="recurring__form-textarea"
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Add any notes about this payment..."
                                    rows="3"
                                    disabled={paymentSuccess}
                                />
                            </div>

                            <div className="recurring__modal-actions">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => setShowPaymentModal(false)}
                                    disabled={actionLoading === selectedExpense.id}
                                >
                                    {paymentSuccess ? 'Close' : 'Cancel'}
                                </Button>
                                {!paymentSuccess && (
                                    <Button 
                                        type="submit" 
                                        variant="success"
                                        disabled={actionLoading === selectedExpense.id}
                                    >
                                        {actionLoading === selectedExpense.id ? 'Processing...' : 'Record Payment'}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Recurring;
