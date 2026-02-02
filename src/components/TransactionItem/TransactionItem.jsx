import { categoryInfo } from '../../context/DataContext';
import './TransactionItem.css';

function TransactionItem({ transaction }) {
    const { type, category, amount, date, note, wallet } = transaction;
    const isIncome = type === 'income';

    // Get category info from DataContext, with fallback
    const catInfo = categoryInfo[category] || { label: category, icon: '📌' };

    return (
        <div className="transaction-item">
            <div className="transaction-item__icon">
                {catInfo.icon}
            </div>

            <div className="transaction-item__details">
                <span className="transaction-item__category">{catInfo.label}</span>
                <span className="transaction-item__meta">
                    {wallet} • {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {note && <span className="transaction-item__note">{note}</span>}
            </div>

            <div className={`transaction-item__amount ${isIncome ? 'transaction-item__amount--income' : 'transaction-item__amount--expense'}`}>
                {isIncome ? '+' : '-'}Rs. {Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
        </div>
    );
}

export default TransactionItem;
