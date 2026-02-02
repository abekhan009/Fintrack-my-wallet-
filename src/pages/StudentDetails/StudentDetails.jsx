import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { studentsApi, walletsApi } from '../../services/api';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import './StudentDetails.css';

function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { students, recordPayment, updateStudent, deleteStudent } = useData();
    const [student, setStudent] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        month: new Date().toISOString().slice(0, 7),
        amount: '',
        method: 'cash',
        walletId: '',
        notes: ''
    });

    // Try to find student in local state first, then fetch from API
    useEffect(() => {
        const findStudent = async () => {
            setLoading(true);
            setError(null);

            // First, try to find in local students array
            const localStudent = students.find(s => (s.id || s._id) === id || s.id === parseInt(id));
            
            if (localStudent) {
                setStudent(localStudent);
                setLoading(false);
                return;
            }

            // If not found locally, fetch from API
            if (!id || id === ':id') {
                setError('Invalid student ID');
                setLoading(false);
                return;
            }

            try {
                const response = await studentsApi.getById(id);
                setStudent(response.student);
            } catch (err) {
                console.error('Failed to fetch student:', err);
                setError(err.message || 'Failed to load student details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            findStudent();
        }
    }, [id, students]);

    // Fetch wallets for payment
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const response = await walletsApi.getAll();
                setWallets(response.wallets || []);
                // Set default wallet if available
                if (response.wallets && response.wallets.length > 0) {
                    setPaymentData(prev => ({ 
                        ...prev, 
                        walletId: response.wallets[0].id 
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch wallets:', err);
            }
        };

        fetchWallets();
    }, []);

    // Edit form state
    const [editData, setEditData] = useState({
        name: student?.name || '',
        phone: student?.phone || '',
        guardianPhone: student?.guardianPhone || '',
        class: student?.class || '',
        subjects: student?.subjects || [],
        monthlyFee: student?.monthlyFee || '',
        discount: student?.discount || 0,
        notes: student?.notes || ''
    });

    // Update edit data when student changes
    useEffect(() => {
        if (student) {
            setEditData({
                name: student.name || '',
                phone: student.phone || '',
                guardianPhone: student.guardianPhone || '',
                class: student.class || '',
                subjects: student.subjects || [],
                monthlyFee: student.monthlyFee || '',
                discount: student.discount || 0,
                notes: student.notes || ''
            });
        }
    }, [student]);

    if (loading) {
        return (
            <div className="student-details__loading">
                <div className="student-details__spinner"></div>
                <p>Loading student details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-details__error">
                <span>⚠️</span>
                <h2>Error loading student</h2>
                <p>{error}</p>
                <Button variant="primary" onClick={() => navigate('/students')}>
                    Back to Students
                </Button>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="student-details__not-found">
                <span>🔍</span>
                <h2>Student not found</h2>
                <Button variant="primary" onClick={() => navigate('/students')}>
                    Back to Students
                </Button>
            </div>
        );
    }

    const due = student.monthlyFee - student.discount;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentFee = student.feeHistory.find(f => f.month === currentMonth);
    const paidThisMonth = currentFee?.paid || 0;

    const handleRecordPayment = (e) => {
        e.preventDefault();
        if (!paymentData.amount) return;

        recordPayment(student.id || student._id, {
            month: paymentData.month,
            amount: parseFloat(paymentData.amount),
            method: paymentData.method,
            walletId: paymentData.walletId,
            notes: paymentData.notes,
            date: new Date().toISOString().split('T')[0]
        });

        setShowPaymentModal(false);
        setPaymentData({ 
            month: currentMonth, 
            amount: '', 
            method: 'cash', 
            walletId: wallets.length > 0 ? wallets[0].id : '',
            notes: '' 
        });
    };

    const handleEditStudent = (e) => {
        e.preventDefault();
        
        updateStudent(student.id || student._id, {
            ...editData,
            monthlyFee: parseFloat(editData.monthlyFee),
            discount: parseFloat(editData.discount) || 0
        });

        setShowEditModal(false);
        // Update local editData with the new values
        setEditData({
            ...editData,
            monthlyFee: parseFloat(editData.monthlyFee),
            discount: parseFloat(editData.discount) || 0
        });
    };

    const handleDeleteStudent = () => {
        deleteStudent(student.id || student._id);
        navigate('/students');
    };

    const toggleSubject = (subject) => {
        setEditData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    const subjectOptions = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Computer', 'Science', 'Pakistan Studies', 'Islamiat'];
    const classOptions = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O Level', 'A Level'];

    const formatMonth = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="student-details">
            {/* Profile Card */}
            <Card className="student-details__profile">
                <div className="student-details__profile-header">
                    <div className="student-details__avatar">
                        {student.name.charAt(0)}
                    </div>
                    <div className="student-details__info">
                        <h1 className="student-details__name">{student.name}</h1>
                        <span className="student-details__class">{student.class}</span>
                        <span className={`student-details__status student-details__status--${student.status}`}>
                            {student.status === 'active' ? '● Active' : '○ Inactive'}
                        </span>
                    </div>
                </div>

                <div className="student-details__contact">
                    <div className="student-details__contact-item">
                        <span className="student-details__contact-icon">📱</span>
                        <span>{student.phone}</span>
                    </div>
                    <div className="student-details__contact-item">
                        <span className="student-details__contact-icon">👨‍👩‍👦</span>
                        <span>Guardian: {student.guardianPhone}</span>
                    </div>
                </div>

                <div className="student-details__subjects">
                    {student.subjects.map((subject, i) => (
                        <span key={i} className="student-details__tag">{subject}</span>
                    ))}
                </div>
            </Card>

            {/* Fee Settings */}
            <Card className="student-details__fee-settings">
                <h2 className="student-details__section-title">Fee Settings</h2>
                <div className="student-details__fee-grid">
                    <div className="student-details__fee-item">
                        <span className="student-details__fee-label">Monthly Fee</span>
                        <span className="student-details__fee-value">Rs. {student.monthlyFee.toLocaleString()}</span>
                    </div>
                    <div className="student-details__fee-item">
                        <span className="student-details__fee-label">Discount</span>
                        <span className="student-details__fee-value">Rs. {student.discount.toLocaleString()}</span>
                    </div>
                    <div className="student-details__fee-item">
                        <span className="student-details__fee-label">Net Payable</span>
                        <span className="student-details__fee-value student-details__fee-value--highlight">
                            Rs. {due.toLocaleString()}
                        </span>
                    </div>
                    <div className="student-details__fee-item">
                        <span className="student-details__fee-label">This Month</span>
                        <span className={`student-details__fee-value ${paidThisMonth >= due ? 'student-details__fee-value--success' : 'student-details__fee-value--warning'}`}>
                            Rs. {paidThisMonth.toLocaleString()} / {due.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="student-details__actions">
                    <Button variant="primary" onClick={() => setShowPaymentModal(true)}>
                        💳 Record Payment
                    </Button>
                    <Button variant="secondary" onClick={() => setShowEditModal(true)}>
                        ✏️ Edit Student
                    </Button>
                    <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                        🗑️ Delete Student
                    </Button>
                </div>
            </Card>

            {/* Fee History */}
            <Card className="student-details__history">
                <h2 className="student-details__section-title">Fee History</h2>
                <div className="student-details__table-wrapper">
                    <table className="student-details__table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Due</th>
                                <th>Paid</th>
                                <th>Remaining</th>
                                <th>Method</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {student.feeHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="student-details__table-empty">
                                        No payment history yet
                                    </td>
                                </tr>
                            ) : (
                                student.feeHistory.slice().reverse().map((fee, index) => (
                                    <tr key={index}>
                                        <td>{formatMonth(fee.month)}</td>
                                        <td>Rs. {fee.due.toLocaleString()}</td>
                                        <td className={fee.paid > 0 ? 'student-details__cell--success' : ''}>
                                            Rs. {fee.paid.toLocaleString()}
                                        </td>
                                        <td className={fee.remaining > 0 ? 'student-details__cell--danger' : ''}>
                                            Rs. {fee.remaining.toLocaleString()}
                                        </td>
                                        <td className="student-details__cell--capitalize">{fee.method || '-'}</td>
                                        <td>{fee.date || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="student-details__modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="student-details__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="student-details__modal-header">
                            <h2>Record Payment</h2>
                            <button className="student-details__modal-close" onClick={() => setShowPaymentModal(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleRecordPayment} className="student-details__modal-form">
                            <div className="student-details__form-group">
                                <label>Month</label>
                                <input
                                    type="month"
                                    value={paymentData.month}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, month: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="student-details__form-group">
                                <label>Amount (Rs.)</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="student-details__form-group">
                                <label>Add to Wallet</label>
                                <select
                                    value={paymentData.walletId}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, walletId: e.target.value }))}
                                    className="student-details__form-select"
                                    required
                                >
                                    <option value="">Select wallet...</option>
                                    {wallets.map(wallet => (
                                        <option key={wallet.id} value={wallet.id}>
                                            {wallet.name} (Rs. {wallet.balance?.toLocaleString() || 0})
                                        </option>
                                    ))}
                                </select>
                                <small className="student-details__form-help">
                                    This payment will be added to your selected wallet and recorded in both tuition and personal transactions.
                                </small>
                            </div>

                            <div className="student-details__form-group">
                                <label>Payment Method</label>
                                <div className="student-details__method-options">
                                    {['cash', 'bank', 'easypaisa'].map(method => (
                                        <button
                                            key={method}
                                            type="button"
                                            className={`student-details__method-btn ${paymentData.method === method ? 'student-details__method-btn--active' : ''}`}
                                            onClick={() => setPaymentData(prev => ({ ...prev, method }))}
                                        >
                                            {method === 'cash' ? '💵' : method === 'bank' ? '🏦' : '📱'} {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="student-details__form-group">
                                <label>Notes (optional)</label>
                                <input
                                    type="text"
                                    placeholder="Add notes..."
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>

                            <div className="student-details__modal-actions">
                                <Button type="button" variant="ghost" onClick={() => setShowPaymentModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="success">
                                    Save Payment
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {showEditModal && (
                <div className="student-details__modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="student-details__modal student-details__modal--large" onClick={(e) => e.stopPropagation()}>
                        <div className="student-details__modal-header">
                            <h2>Edit Student</h2>
                            <button className="student-details__modal-close" onClick={() => setShowEditModal(false)}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleEditStudent} className="student-details__modal-form">
                            <div className="student-details__form-row">
                                <div className="student-details__form-group">
                                    <label>Student Name *</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="student-details__form-group">
                                    <label>Class *</label>
                                    <select
                                        value={editData.class}
                                        onChange={(e) => setEditData(prev => ({ ...prev, class: e.target.value }))}
                                        required
                                    >
                                        {classOptions.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="student-details__form-row">
                                <div className="student-details__form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={editData.phone}
                                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                                <div className="student-details__form-group">
                                    <label>Guardian Phone</label>
                                    <input
                                        type="tel"
                                        value={editData.guardianPhone}
                                        onChange={(e) => setEditData(prev => ({ ...prev, guardianPhone: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="student-details__form-group">
                                <label>Subjects *</label>
                                <div className="student-details__subjects-grid">
                                    {subjectOptions.map(subject => (
                                        <button
                                            key={subject}
                                            type="button"
                                            className={`student-details__subject-btn ${editData.subjects.includes(subject) ? 'student-details__subject-btn--active' : ''}`}
                                            onClick={() => toggleSubject(subject)}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="student-details__form-row">
                                <div className="student-details__form-group">
                                    <label>Monthly Fee (Rs.) *</label>
                                    <input
                                        type="number"
                                        value={editData.monthlyFee}
                                        onChange={(e) => setEditData(prev => ({ ...prev, monthlyFee: e.target.value }))}
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="student-details__form-group">
                                    <label>Discount (Rs.)</label>
                                    <input
                                        type="number"
                                        value={editData.discount}
                                        onChange={(e) => setEditData(prev => ({ ...prev, discount: e.target.value }))}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="student-details__form-group">
                                <label>Notes</label>
                                <textarea
                                    value={editData.notes}
                                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows="3"
                                    placeholder="Additional notes about the student..."
                                />
                            </div>

                            <div className="student-details__fee-preview">
                                <span>Net Monthly Fee: <strong>Rs. {((parseFloat(editData.monthlyFee) || 0) - (parseFloat(editData.discount) || 0)).toLocaleString()}</strong></span>
                            </div>

                            <div className="student-details__modal-actions">
                                <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="student-details__modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="student-details__modal student-details__modal--small" onClick={(e) => e.stopPropagation()}>
                        <div className="student-details__modal-header">
                            <h2>Delete Student</h2>
                            <button className="student-details__modal-close" onClick={() => setShowDeleteModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="student-details__delete-content">
                            <div className="student-details__delete-icon">⚠️</div>
                            <p>Are you sure you want to delete <strong>{student.name}</strong>?</p>
                            <p className="student-details__delete-warning">
                                This action cannot be undone. All fee history and records will be permanently removed.
                            </p>
                        </div>

                        <div className="student-details__modal-actions">
                            <Button type="button" variant="ghost" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button type="button" variant="danger" onClick={handleDeleteStudent}>
                                Delete Student
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentDetails;
