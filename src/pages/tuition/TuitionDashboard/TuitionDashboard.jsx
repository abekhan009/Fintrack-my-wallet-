import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { tuitionApi } from '../../../services/api';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import TransactionItem from '../../../components/TransactionItem/TransactionItem';
import './TuitionDashboard.css';

function TuitionDashboard() {
    const navigate = useNavigate();
    const { students, userProfile } = useData();

    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [tuitionStats, setTuitionStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const startDate = `${currentMonth}-01`;
    const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch tuition data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, txnData, summaryData] = await Promise.all([
                    tuitionApi.getStats({ month: currentMonth }),
                    tuitionApi.getTransactions({
                        type: 'income',
                        category: 'student_fee',
                        limit: 5,
                        startDate,
                        endDate
                    }),
                    tuitionApi.getTransactionSummary({
                        startDate,
                        endDate
                    })
                ]);

                setTuitionStats(statsData);
                setTransactions(txnData.transactions || []);
                setSummary(summaryData || { income: 0, expense: 0, balance: 0 });
            } catch (err) {
                console.error('Failed to fetch tuition data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate, currentMonth]);

    const activeStudents = students.filter(s => s && s.status === 'active').length;

    const formatMonth = () => {
        const date = new Date();
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (!userProfile?.tuitionCenterName) {
        return (
            <div className="tuition-dashboard">
                <Card className="tuition-dashboard__setup">
                    <div className="tuition-dashboard__setup-content">
                        <span className="tuition-dashboard__setup-icon">🎓</span>
                        <h2>Welcome to Tuition Center Management</h2>
                        <p>Please set up your tuition center name in settings to get started.</p>
                        <Button variant="primary" onClick={() => navigate('/tuition/settings')}>
                            Go to Settings
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="tuition-dashboard">
            {/* Tuition Center Header */}
            <Card variant="gradient" className="tuition-dashboard__header">
                <div className="tuition-dashboard__header-content">
                    <div className="tuition-dashboard__header-info">
                        <span className="tuition-dashboard__header-icon">🎓</span>
                        <div>
                            <h1 className="tuition-dashboard__header-title">{userProfile.tuitionCenterName}</h1>
                            <span className="tuition-dashboard__header-subtitle">{formatMonth()}</span>
                        </div>
                    </div>
                    <div className="tuition-dashboard__header-stats">
                        <div className="tuition-dashboard__stat">
                            <span className="tuition-dashboard__stat-value">Rs. {tuitionStats?.totalCollected?.toLocaleString() || 0}</span>
                            <span className="tuition-dashboard__stat-label">Collected This Month</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Quick Stats */}
            <div className="tuition-dashboard__stats">
                <Card className="tuition-dashboard__stat-card">
                    <div className="tuition-dashboard__stat-content">
                        <span className="tuition-dashboard__stat-icon">👥</span>
                        <div>
                            <span className="tuition-dashboard__stat-number">{activeStudents}</span>
                            <span className="tuition-dashboard__stat-text">Active Students</span>
                        </div>
                    </div>
                </Card>

                <Card className="tuition-dashboard__stat-card">
                    <div className="tuition-dashboard__stat-content">
                        <span className="tuition-dashboard__stat-icon">💰</span>
                        <div>
                            <span className="tuition-dashboard__stat-number">Rs. {tuitionStats?.totalPending?.toLocaleString() || 0}</span>
                            <span className="tuition-dashboard__stat-text">Pending Fees</span>
                        </div>
                    </div>
                </Card>

                <Card className="tuition-dashboard__stat-card">
                    <div className="tuition-dashboard__stat-content">
                        <span className="tuition-dashboard__stat-icon">📊</span>
                        <div>
                            <span className="tuition-dashboard__stat-number">Rs. {tuitionStats?.totalCollected?.toLocaleString() || 0}</span>
                            <span className="tuition-dashboard__stat-text">Monthly Income</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pending Alert */}
            {tuitionStats?.pendingCount > 0 && (
                <Card className="tuition-dashboard__alert tuition-dashboard__alert--warning">
                    <div className="tuition-dashboard__alert-content">
                        <span className="tuition-dashboard__alert-icon">⚠️</span>
                        <div className="tuition-dashboard__alert-text">
                            <strong>{tuitionStats.pendingCount} students</strong> have pending fees
                            <span className="tuition-dashboard__alert-amount">Rs. {tuitionStats.totalPending.toLocaleString()}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="small" onClick={() => navigate('/tuition/students')}>
                        View Students
                    </Button>
                </Card>
            )}

            {/* Quick Actions */}
            <div className="tuition-dashboard__actions">
                <Button
                    variant="primary"
                    className="tuition-dashboard__action-btn"
                    onClick={() => navigate('/tuition/students/add')}
                >
                    <span className="tuition-dashboard__action-icon">👤</span>
                    Add Student
                </Button>
                <Button
                    variant="success"
                    className="tuition-dashboard__action-btn"
                    onClick={() => navigate('/tuition/students')}
                >
                    <span className="tuition-dashboard__action-icon">💳</span>
                    Record Payment
                </Button>
                <Button
                    variant="secondary"
                    className="tuition-dashboard__action-btn"
                    onClick={() => navigate('/tuition/fees')}
                >
                    <span className="tuition-dashboard__action-icon">📋</span>
                    Fee Records
                </Button>
            </div>

            {/* Recent Transactions */}
            <div className="tuition-dashboard__section">
                <div className="tuition-dashboard__section-header">
                    <h2 className="tuition-dashboard__section-title">Recent Fee Payments</h2>
                    <button
                        className="tuition-dashboard__section-link"
                        onClick={() => navigate('/tuition/fees')}
                    >
                        View All
                    </button>
                </div>

                <div className="tuition-dashboard__transactions">
                    {loading ? (
                        <div className="tuition-dashboard__loading">
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
                        <div className="tuition-dashboard__empty">
                            <span>📋</span>
                            <p>No fee payments yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Personal Finance Integration Info */}
            <Card className="tuition-dashboard__info">
                <h3>💰 Personal Finance Integration</h3>
                <p>
                    All student fee payments are automatically recorded in both your tuition center records 
                    and your personal wallet transactions. This helps you track your tuition income as part 
                    of your overall financial picture.
                </p>
                <div className="tuition-dashboard__info-features">
                    <span>✓ Wallet balance updates</span>
                    <span>✓ Personal transaction history</span>
                    <span>✓ Income categorization</span>
                </div>
            </Card>
        </div>
    );
}

export default TuitionDashboard;