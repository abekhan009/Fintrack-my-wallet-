import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, categoryInfo } from '../../context/DataContext';
import { transactionsApi, recurringApi } from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import TransactionItem from '../../components/TransactionItem/TransactionItem';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const { workspace, students, getTuitionStats } = useData();

    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [recurringExpenses, setRecurringExpenses] = useState([]);
    const [tuitionStats, setTuitionStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const startDate = `${currentMonth}-01`;
    const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch transactions, summary, and recurring expenses
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [txnData, summaryData, recurringData] = await Promise.all([
                    transactionsApi.getAll({
                        workspace: 'personal', // Always fetch personal data for Home component
                        limit: 5,
                        startDate,
                        endDate
                    }),
                    transactionsApi.getSummary({
                        workspace: 'personal', // Always fetch personal data for Home component
                        startDate,
                        endDate
                    }),
                    recurringApi.getAll({ workspace: 'personal' }).catch(() => ({ recurringExpenses: [] }))
                ]);

                setTransactions(txnData.transactions || []);
                setSummary(summaryData || { income: 0, expense: 0, balance: 0 });
                setRecurringExpenses(recurringData.recurringExpenses || []);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate]); // Removed workspace dependency

    // Fetch tuition stats when in tuition workspace
    useEffect(() => {
        const fetchTuitionStats = async () => {
            if (workspace === 'tuition') {
                try {
                    const stats = await getTuitionStats();
                    setTuitionStats(stats);
                } catch (err) {
                    console.error('Failed to fetch tuition stats:', err);
                    setTuitionStats({
                        totalCollected: 0,
                        totalPending: 0,
                        pendingCount: 0
                    });
                }
            } else {
                setTuitionStats(null);
            }
        };

        fetchTuitionStats();
    }, [workspace, getTuitionStats]);

    const activeStudents = students.filter(s => s && s.status === 'active').length;

    const formatMonth = () => {
        const date = new Date();
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Recurring expenses total
    const recurringTotal = recurringExpenses.filter(e => e.status === 'active').reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="home">
            {/* Balance Card - Personal Workspace */}
            {workspace === 'personal' && (
                <Card variant="gradient" className="home__balance">
                    <div className="home__balance-header">
                        <span className="home__balance-label">Total Balance</span>
                        <span className="home__balance-month">{formatMonth()}</span>
                    </div>
                    <div className="home__balance-amount">
                        Rs. {(summary.balance || 0).toLocaleString()}
                    </div>
                    <div className="home__balance-stats">
                        <div className="home__balance-stat">
                            <span className="home__balance-stat-icon">↑</span>
                            <div className="home__balance-stat-info">
                                <span className="home__balance-stat-label">Income</span>
                                <span className="home__balance-stat-value">Rs. {(summary.income || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="home__balance-stat">
                            <span className="home__balance-stat-icon home__balance-stat-icon--expense">↓</span>
                            <div className="home__balance-stat-info">
                                <span className="home__balance-stat-label">Expense</span>
                                <span className="home__balance-stat-value">Rs. {(summary.expense || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Tuition Dashboard */}
            {workspace === 'tuition' && (
                <>
                    {/* Tuition Balance Card */}
                    <Card variant="gradient" className="home__balance home__balance--tuition">
                        <div className="home__balance-header">
                            <span className="home__balance-label">🎓 Tuition Center</span>
                            <span className="home__balance-month">{formatMonth()}</span>
                        </div>
                        <div className="home__balance-amount">
                            Rs. {(tuitionStats?.totalCollected || 0).toLocaleString()}
                        </div>
                        <span className="home__balance-sublabel">Collected This Month</span>
                        <div className="home__balance-stats">
                            <div className="home__balance-stat">
                                <span className="home__balance-stat-icon">👥</span>
                                <div className="home__balance-stat-info">
                                    <span className="home__balance-stat-label">Students</span>
                                    <span className="home__balance-stat-value">{activeStudents}</span>
                                </div>
                            </div>
                            <div className="home__balance-stat">
                                <span className="home__balance-stat-icon home__balance-stat-icon--warning">⏳</span>
                                <div className="home__balance-stat-info">
                                    <span className="home__balance-stat-label">Pending</span>
                                    <span className="home__balance-stat-value">Rs. {(tuitionStats?.totalPending || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Pending Alert */}
                    {tuitionStats && tuitionStats.pendingCount > 0 && (
                        <Card className="home__alert home__alert--warning">
                            <div className="home__alert-content">
                                <span className="home__alert-icon">⚠️</span>
                                <div className="home__alert-text">
                                    <strong>{tuitionStats.pendingCount} students</strong> have pending fees
                                    <span className="home__alert-amount">Rs. {(tuitionStats.totalPending || 0).toLocaleString()}</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="small" onClick={() => navigate('/students')}>
                                View
                            </Button>
                        </Card>
                    )}
                </>
            )}

            {/* Quick Actions */}
            <div className="home__actions">
                {workspace === 'personal' ? (
                    <>
                        <Button
                            variant="success"
                            className="home__action-btn"
                            onClick={() => navigate('/add?type=income')}
                        >
                            <span className="home__action-icon">+</span>
                            Add Income
                        </Button>
                        <Button
                            variant="danger"
                            className="home__action-btn"
                            onClick={() => navigate('/add?type=expense')}
                        >
                            <span className="home__action-icon">−</span>
                            Add Expense
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="primary"
                            className="home__action-btn"
                            onClick={() => navigate('/students/add')}
                        >
                            <span className="home__action-icon">👤</span>
                            Add Student
                        </Button>
                        <Button
                            variant="success"
                            className="home__action-btn"
                            onClick={() => navigate('/students')}
                        >
                            <span className="home__action-icon">💳</span>
                            Record Payment
                        </Button>
                        <Button
                            variant="danger"
                            className="home__action-btn"
                            onClick={() => navigate('/add?type=expense')}
                        >
                            <span className="home__action-icon">−</span>
                            Add Expense
                        </Button>
                    </>
                )}
            </div>

            {/* Recurring Expenses Summary (for both workspaces) */}
            {recurringTotal > 0 && (
                <Card className="home__recurring" onClick={() => navigate('/recurring')}>
                    <div className="home__recurring-info">
                        <span className="home__recurring-icon">🔄</span>
                        <div className="home__recurring-text">
                            <span className="home__recurring-label">Monthly Recurring Expenses</span>
                            <span className="home__recurring-value">Rs. {recurringTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <span className="home__recurring-arrow">→</span>
                </Card>
            )}

            {/* Recent Transactions / Payments */}
            <div className="home__section">
                <div className="home__section-header">
                    <h2 className="home__section-title">
                        {workspace === 'personal' ? 'Recent Transactions' : 'Recent Fee Payments'}
                    </h2>
                    <button
                        className="home__section-link"
                        onClick={() => navigate('/transactions')}
                    >
                        View All
                    </button>
                </div>

                <div className="home__transactions">
                    {loading ? (
                        <div className="home__loading">
                            <p>Loading...</p>
                        </div>
                    ) : transactions.length > 0 ? (
                        transactions.map(transaction => (
                            <TransactionItem
                                key={transaction.id || transaction._id}
                                transaction={{
                                    ...transaction,
                                    wallet: transaction.walletId?.name || 'Unknown'
                                }}
                            />
                        ))
                    ) : (
                        <div className="home__empty">
                            <span>📋</span>
                            <p>No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
