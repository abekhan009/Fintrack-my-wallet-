import Card from '../../components/Card/Card';
import './Reports.css';

// Mock Data
const mockSummary = {
    income: 8500,
    expense: 2350,
    savings: 6150,
    savingsRate: 72
};

const mockCategories = [
    { name: 'Food & Dining', amount: 580, percentage: 25, color: '#ef4444', icon: '🍔' },
    { name: 'Transport', amount: 420, percentage: 18, color: '#f59e0b', icon: '🚗' },
    { name: 'Shopping', amount: 380, percentage: 16, color: '#8b5cf6', icon: '🛍️' },
    { name: 'Bills & Utilities', amount: 350, percentage: 15, color: '#3b82f6', icon: '📄' },
    { name: 'Entertainment', amount: 280, percentage: 12, color: '#ec4899', icon: '🎬' },
    { name: 'Health', amount: 220, percentage: 9, color: '#10b981', icon: '💊' },
    { name: 'Other', amount: 120, percentage: 5, color: '#6b7280', icon: '📌' },
];

function Reports() {
    return (
        <div className="reports">
            {/* Month Selector */}
            <div className="reports__month-selector">
                <button className="reports__month-btn">←</button>
                <span className="reports__month-label">January 2026</span>
                <button className="reports__month-btn">→</button>
            </div>

            {/* Summary Cards */}
            <div className="reports__summary">
                <Card className="reports__summary-card reports__summary-card--income">
                    <span className="reports__summary-icon">↑</span>
                    <div className="reports__summary-info">
                        <span className="reports__summary-label">Income</span>
                        <span className="reports__summary-value">${mockSummary.income.toLocaleString()}</span>
                    </div>
                </Card>

                <Card className="reports__summary-card reports__summary-card--expense">
                    <span className="reports__summary-icon">↓</span>
                    <div className="reports__summary-info">
                        <span className="reports__summary-label">Expense</span>
                        <span className="reports__summary-value">${mockSummary.expense.toLocaleString()}</span>
                    </div>
                </Card>

                <Card className="reports__summary-card reports__summary-card--savings">
                    <span className="reports__summary-icon">💰</span>
                    <div className="reports__summary-info">
                        <span className="reports__summary-label">Savings</span>
                        <span className="reports__summary-value">${mockSummary.savings.toLocaleString()}</span>
                    </div>
                </Card>
            </div>

            {/* Savings Progress */}
            <Card className="reports__progress-card">
                <div className="reports__progress-header">
                    <span className="reports__progress-title">Savings Rate</span>
                    <span className="reports__progress-value">{mockSummary.savingsRate}%</span>
                </div>
                <div className="reports__progress-bar">
                    <div
                        className="reports__progress-fill"
                        style={{ width: `${mockSummary.savingsRate}%` }}
                    ></div>
                </div>
                <p className="reports__progress-text">
                    Great job! You saved {mockSummary.savingsRate}% of your income this month.
                </p>
            </Card>

            {/* Category Breakdown */}
            <Card className="reports__categories-card">
                <h3 className="reports__categories-title">Expenses by Category</h3>
                <div className="reports__categories">
                    {mockCategories.map((category, index) => (
                        <div key={index} className="reports__category">
                            <div className="reports__category-info">
                                <span className="reports__category-icon">{category.icon}</span>
                                <span className="reports__category-name">{category.name}</span>
                            </div>
                            <div className="reports__category-bar-wrapper">
                                <div className="reports__category-bar">
                                    <div
                                        className="reports__category-bar-fill"
                                        style={{ width: `${category.percentage}%`, background: category.color }}
                                    ></div>
                                </div>
                                <span className="reports__category-amount">${category.amount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default Reports;
