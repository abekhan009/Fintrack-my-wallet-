import { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { walletsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Wallets.css';

// Wallet type options
const WALLET_TYPES = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'bank', label: 'Bank Account', icon: '🏦' },
    { value: 'credit_card', label: 'Credit Card', icon: '💳' },
    { value: 'e_wallet', label: 'E-Wallet', icon: '📱' },
    { value: 'other', label: 'Other', icon: '💰' },
];

// Color options for wallets
const WALLET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
    '#3b82f6', '#2563eb',
];

function Wallets() {
    const { user } = useAuth();
    const [wallets, setWallets] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        type: 'cash',
        initialBalance: '',
        color: '#6366f1',
        icon: '💵',
    });
    const [editingWallet, setEditingWallet] = useState(null);
    const [deletingWallet, setDeletingWallet] = useState(null);
    const [transferData, setTransferData] = useState({
        fromWalletId: '',
        toWalletId: '',
        amount: '',
        note: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    // Fetch wallets on mount
    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await walletsApi.getAll();
            setWallets(data.wallets || []);
            setTotalBalance(data.totalBalance || 0);
        } catch (err) {
            setError(err.message || 'Failed to load wallets');
        } finally {
            setLoading(false);
        }
    };

    // Get currency symbol from user settings
    const getCurrencySymbol = () => {
        const currency = user?.settings?.currency || 'PKR';
        const symbols = { PKR: 'Rs.', USD: '$', EUR: '€', GBP: '£', INR: '₹' };
        return symbols[currency] || currency;
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `${getCurrencySymbol()} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-set icon based on type
        if (name === 'type') {
            const typeObj = WALLET_TYPES.find(t => t.value === value);
            if (typeObj) {
                setFormData(prev => ({ ...prev, icon: typeObj.icon }));
            }
        }
    };

    // Handle create wallet
    const handleCreateWallet = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        try {
            const walletData = {
                name: formData.name,
                type: formData.type,
                initialBalance: formData.initialBalance ? parseFloat(formData.initialBalance) : 0,
                color: formData.color,
                icon: formData.icon,
            };
            await walletsApi.create(walletData);
            setShowAddModal(false);
            setFormData({ name: '', type: 'cash', initialBalance: '', color: '#6366f1', icon: '💵' });
            await fetchWallets();
        } catch (err) {
            setFormError(err.message || 'Failed to create wallet');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle edit wallet
    const openEditModal = (wallet) => {
        setEditingWallet(wallet);
        setFormData({
            name: wallet.name,
            type: wallet.type,
            initialBalance: '',
            color: wallet.color,
            icon: wallet.icon,
        });
        setShowEditModal(true);
    };

    const handleUpdateWallet = async (e) => {
        e.preventDefault();
        if (!editingWallet) return;

        setFormLoading(true);
        setFormError(null);

        try {
            await walletsApi.update(editingWallet.id, {
                name: formData.name,
                color: formData.color,
                icon: formData.icon,
            });
            setShowEditModal(false);
            setEditingWallet(null);
            await fetchWallets();
        } catch (err) {
            setFormError(err.message || 'Failed to update wallet');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete wallet
    const openDeleteConfirm = (wallet) => {
        setDeletingWallet(wallet);
        setShowDeleteConfirm(true);
    };

    const handleDeleteWallet = async () => {
        if (!deletingWallet) return;

        setFormLoading(true);
        setFormError(null);

        try {
            await walletsApi.delete(deletingWallet.id);
            setShowDeleteConfirm(false);
            setDeletingWallet(null);
            await fetchWallets();
        } catch (err) {
            setFormError(err.message || 'Failed to delete wallet');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle transfer
    const handleTransferChange = (e) => {
        const { name, value } = e.target;
        setTransferData(prev => ({ ...prev, [name]: value }));
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        try {
            await walletsApi.transfer({
                fromWalletId: transferData.fromWalletId,
                toWalletId: transferData.toWalletId,
                amount: parseFloat(transferData.amount),
                note: transferData.note || undefined,
            });
            setShowTransferModal(false);
            setTransferData({ fromWalletId: '', toWalletId: '', amount: '', note: '' });
            await fetchWallets();
        } catch (err) {
            setFormError(err.message || 'Failed to transfer funds');
        } finally {
            setFormLoading(false);
        }
    };

    // Close modals
    const closeModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowTransferModal(false);
        setShowDeleteConfirm(false);
        setFormError(null);
        setEditingWallet(null);
        setDeletingWallet(null);
    };

    if (loading) {
        return (
            <div className="wallets">
                <div className="wallets__loading">Loading wallets...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wallets">
                <div className="wallets__error">
                    <p>{error}</p>
                    <Button onClick={fetchWallets}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="wallets">
            {/* Total Balance */}
            <Card variant="gradient" className="wallets__total">
                <span className="wallets__total-label">Total Net Worth</span>
                <span className="wallets__total-amount">
                    {formatCurrency(totalBalance)}
                </span>
                <span className="wallets__total-count">{wallets.length} accounts</span>
            </Card>

            {/* Action Buttons */}
            {wallets.length >= 2 && (
                <div className="wallets__actions">
                    <Button
                        variant="secondary"
                        onClick={() => setShowTransferModal(true)}
                    >
                        🔄 Transfer Funds
                    </Button>
                </div>
            )}

            {/* Wallet Cards */}
            <div className="wallets__grid">
                {wallets.map((wallet) => (
                    <Card key={wallet.id} className="wallets__card">
                        <div className="wallets__card-header">
                            <div className="wallets__card-icon" style={{ background: wallet.color }}>
                                {wallet.icon}
                            </div>
                            <div className="wallets__card-actions">
                                <button
                                    className="wallets__card-btn"
                                    onClick={() => openEditModal(wallet)}
                                    aria-label="Edit wallet"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="wallets__card-btn wallets__card-btn--danger"
                                    onClick={() => openDeleteConfirm(wallet)}
                                    aria-label="Delete wallet"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div className="wallets__card-info">
                            <span className="wallets__card-name">
                                {wallet.name}
                                {wallet.isDefault && <span className="wallets__card-badge">Default</span>}
                            </span>
                            <span className={`wallets__card-balance ${wallet.balance < 0 ? 'wallets__card-balance--negative' : ''}`}>
                                {formatCurrency(wallet.balance)}
                            </span>
                        </div>
                    </Card>
                ))}

                {/* Add Wallet Card */}
                <button className="wallets__add" onClick={() => setShowAddModal(true)}>
                    <span className="wallets__add-icon">+</span>
                    <span className="wallets__add-text">Add Wallet</span>
                </button>
            </div>

            {/* Add Wallet Modal */}
            {showAddModal && (
                <div className="wallets__modal-overlay" onClick={closeModals}>
                    <div className="wallets__modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="wallets__modal-title">Create New Wallet</h2>
                        <form onSubmit={handleCreateWallet}>
                            {formError && <div className="wallets__modal-error">{formError}</div>}

                            <Input
                                label="Wallet Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., My Bank Account"
                                required
                            />

                            <div className="wallets__form-group">
                                <label className="wallets__form-label">Wallet Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="wallets__form-select"
                                >
                                    {WALLET_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Initial Balance"
                                name="initialBalance"
                                type="number"
                                value={formData.initialBalance}
                                onChange={handleInputChange}
                                placeholder="0"
                            />

                            <div className="wallets__form-group">
                                <label className="wallets__form-label">Color</label>
                                <div className="wallets__color-picker">
                                    {WALLET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`wallets__color-option ${formData.color === color ? 'wallets__color-option--active' : ''}`}
                                            style={{ background: color }}
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="wallets__modal-actions">
                                <Button type="button" variant="ghost" onClick={closeModals}>Cancel</Button>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading ? 'Creating...' : 'Create Wallet'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Wallet Modal */}
            {showEditModal && editingWallet && (
                <div className="wallets__modal-overlay" onClick={closeModals}>
                    <div className="wallets__modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="wallets__modal-title">Edit Wallet</h2>
                        <form onSubmit={handleUpdateWallet}>
                            {formError && <div className="wallets__modal-error">{formError}</div>}

                            <Input
                                label="Wallet Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., My Bank Account"
                                required
                            />

                            <div className="wallets__form-group">
                                <label className="wallets__form-label">Color</label>
                                <div className="wallets__color-picker">
                                    {WALLET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`wallets__color-option ${formData.color === color ? 'wallets__color-option--active' : ''}`}
                                            style={{ background: color }}
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="wallets__modal-actions">
                                <Button type="button" variant="ghost" onClick={closeModals}>Cancel</Button>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="wallets__modal-overlay" onClick={closeModals}>
                    <div className="wallets__modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="wallets__modal-title">Transfer Funds</h2>
                        <form onSubmit={handleTransfer}>
                            {formError && <div className="wallets__modal-error">{formError}</div>}

                            <div className="wallets__form-group">
                                <label className="wallets__form-label">From Wallet</label>
                                <select
                                    name="fromWalletId"
                                    value={transferData.fromWalletId}
                                    onChange={handleTransferChange}
                                    className="wallets__form-select"
                                    required
                                >
                                    <option value="">Select source wallet</option>
                                    {wallets.map(w => (
                                        <option key={w.id} value={w.id}>
                                            {w.icon} {w.name} ({formatCurrency(w.balance)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="wallets__form-group">
                                <label className="wallets__form-label">To Wallet</label>
                                <select
                                    name="toWalletId"
                                    value={transferData.toWalletId}
                                    onChange={handleTransferChange}
                                    className="wallets__form-select"
                                    required
                                >
                                    <option value="">Select destination wallet</option>
                                    {wallets
                                        .filter(w => w.id !== transferData.fromWalletId)
                                        .map(w => (
                                            <option key={w.id} value={w.id}>
                                                {w.icon} {w.name} ({formatCurrency(w.balance)})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <Input
                                label="Amount"
                                name="amount"
                                type="number"
                                value={transferData.amount}
                                onChange={handleTransferChange}
                                placeholder="Enter amount"
                                required
                            />

                            <Input
                                label="Note (optional)"
                                name="note"
                                value={transferData.note}
                                onChange={handleTransferChange}
                                placeholder="e.g., Savings transfer"
                            />

                            <div className="wallets__modal-actions">
                                <Button type="button" variant="ghost" onClick={closeModals}>Cancel</Button>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading ? 'Transferring...' : 'Transfer'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && deletingWallet && (
                <div className="wallets__modal-overlay" onClick={closeModals}>
                    <div className="wallets__modal wallets__modal--small" onClick={(e) => e.stopPropagation()}>
                        <h2 className="wallets__modal-title">Delete Wallet</h2>
                        <p className="wallets__modal-text">
                            Are you sure you want to delete <strong>{deletingWallet.name}</strong>?
                            This action cannot be undone.
                        </p>
                        {formError && <div className="wallets__modal-error">{formError}</div>}
                        <div className="wallets__modal-actions">
                            <Button type="button" variant="ghost" onClick={closeModals}>Cancel</Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleDeleteWallet}
                                disabled={formLoading}
                            >
                                {formLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Wallets;
