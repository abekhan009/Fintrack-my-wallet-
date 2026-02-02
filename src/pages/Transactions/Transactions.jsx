import { useState, useEffect } from 'react';
import { useData, categoryInfo } from '../../context/DataContext';
import { transactionsApi } from '../../services/api';
import { walletsApi } from '../../services/api';
import TransactionItem from '../../components/TransactionItem/TransactionItem';
import './Transactions.css';

function Transactions() {
    // Remove workspace dependency since this is only used in personal layout
    const [transactions, setTransactions] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearLoading, setClearLoading] = useState(false);
    const [clearError, setClearError] = useState(null);
    const [clearSuccess, setClearSuccess] = useState(null);

    const [filters, setFilters] = useState({
        type: 'all',
        walletId: '',
    });

    // Fetch wallets for filter dropdown
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const data = await walletsApi.getAll();
                setWallets(data.wallets || []);
            } catch (err) {
                console.error('Failed to fetch wallets:', err);
            }
        };
        fetchWallets();
    }, []);

    // Fetch transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError(null);
            try {
                const queryFilters = {
                    workspace: 'personal', // Always use personal workspace
                    page: pagination.page,
                    limit: 20,
                };

                if (filters.type !== 'all') {
                    queryFilters.type = filters.type;
                }
                if (filters.walletId) {
                    queryFilters.walletId = filters.walletId;
                }

                const data = await transactionsApi.getAll(queryFilters);
                setTransactions(data.transactions || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: data.pagination?.totalPages || 1,
                }));
            } catch (err) {
                setError(err.message || 'Failed to load transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [filters, pagination.page]); // Removed workspace dependency

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    };

    const handleClearTransactions = async () => {
        setClearLoading(true);
        setClearError(null);
        setClearSuccess(null);

        try {
            const result = await transactionsApi.clearAll('personal');
            setClearSuccess(result.message || 'All transactions cleared successfully');
            setShowClearModal(false);
            
            // Refresh transactions list
            setTransactions([]);
            setPagination({ page: 1, totalPages: 1 });
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setClearSuccess(null);
            }, 3000);
        } catch (err) {
            setClearError(err.message || 'Failed to clear transactions');
        } finally {
            setClearLoading(false);
        }
    };

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const dateStr = new Date(transaction.date).toISOString().split('T')[0];
        if (!groups[dateStr]) {
            groups[dateStr] = [];
        }
        groups[dateStr].push(transaction);
        return groups;
    }, {});

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="transactions">
                <div className="transactions__loading">
                    <div className="transactions__spinner"></div>
                    <p>Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="transactions">
            {/* Success Message */}
            {clearSuccess && (
                <div className="transactions__success">
                    <span className="transactions__success-icon">✓</span>
                    <p>{clearSuccess}</p>
                </div>
            )}

            {/* Error Message */}
            {(error || clearError) && (
                <div className="transactions__error">
                    <p>{error || clearError}</p>
                    <button onClick={() => {
                        setError(null);
                        setClearError(null);
                        setPagination(prev => ({ ...prev }));
                    }}>Retry</button>
                </div>
            )}

            {/* Header with Clear Button */}
            <div className="transactions__header">
                <h2 className="transactions__title">Transactions</h2>
                {transactions.length > 0 && (
                    <button 
                        className="transactions__clear-btn"
                        onClick={() => setShowClearModal(true)}
                        disabled={clearLoading}
                    >
                        🗑️ Clear All
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="transactions__filters">
                <div className="transactions__filter-group">
                    {['all', 'income', 'expense'].map((type) => (
                        <button
                            key={type}
                            className={`transactions__filter-btn ${filters.type === type ? 'transactions__filter-btn--active' : ''}`}
                            onClick={() => handleFilterChange('type', type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                <select
                    className="transactions__filter-select"
                    value={filters.walletId}
                    onChange={(e) => handleFilterChange('walletId', e.target.value)}
                >
                    <option value="">All Wallets</option>
                    {wallets.map((wallet) => (
                        <option key={wallet.id || wallet._id} value={wallet.id || wallet._id}>
                            {wallet.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Transaction List */}
            <div className="transactions__list">
                {Object.entries(groupedTransactions)
                    .sort(([a], [b]) => new Date(b) - new Date(a))
                    .map(([date, txns]) => (
                        <div key={date} className="transactions__group">
                            <h3 className="transactions__date">{formatDate(date)}</h3>
                            <div className="transactions__items">
                                {txns.map(transaction => (
                                    <TransactionItem
                                        key={transaction.id || transaction._id}
                                        transaction={{
                                            ...transaction,
                                            wallet: transaction.walletId?.name || 'Unknown'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                {transactions.length === 0 && !loading && (
                    <div className="transactions__empty">
                        <span className="transactions__empty-icon">📭</span>
                        <p>No transactions found</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="transactions__pagination">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Clear Confirmation Modal */}
            {showClearModal && (
                <div className="transactions__modal-overlay">
                    <div className="transactions__modal">
                        <div className="transactions__modal-header">
                            <h3>Clear All Transactions</h3>
                            <button 
                                className="transactions__modal-close"
                                onClick={() => setShowClearModal(false)}
                                disabled={clearLoading}
                            >
                                ×
                            </button>
                        </div>
                        <div className="transactions__modal-body">
                            <p>Are you sure you want to clear all transactions?</p>
                            <p className="transactions__modal-warning">
                                ⚠️ This action cannot be undone. All transaction history will be permanently deleted, and wallet balances will be reset to reflect the removal of these transactions.
                            </p>
                        </div>
                        <div className="transactions__modal-footer">
                            <button 
                                className="transactions__modal-btn transactions__modal-btn--cancel"
                                onClick={() => setShowClearModal(false)}
                                disabled={clearLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="transactions__modal-btn transactions__modal-btn--danger"
                                onClick={handleClearTransactions}
                                disabled={clearLoading}
                            >
                                {clearLoading ? 'Clearing...' : 'Clear All Transactions'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;
