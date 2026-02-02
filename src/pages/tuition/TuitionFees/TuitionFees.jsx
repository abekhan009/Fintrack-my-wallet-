import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { studentsApi } from '../../../services/api';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import './TuitionFees.css';

function TuitionFees() {
    const navigate = useNavigate();
    const { students } = useData();
    const [feePayments, setFeePayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7),
        studentId: 'all'
    });

    useEffect(() => {
        fetchFeeRecords();
    }, [filters]);

    const fetchFeeRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const queryFilters = {
                month: filters.month,
                limit: 50
            };

            if (filters.studentId !== 'all') {
                queryFilters.studentId = filters.studentId;
            }

            const response = await studentsApi.getAllFeePayments(queryFilters);
            setFeePayments(response.feePayments || []);
        } catch (err) {
            console.error('Failed to fetch fee records:', err);
            setError('Failed to load fee records');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const totalCollected = feePayments.reduce((sum, payment) => sum + (payment.paid || 0), 0);

    return (
        <div className="tuition-fees">
            <div className="tuition-fees__header">
                <h1 className="tuition-fees__title">Fee Records</h1>
                <Button
                    variant="primary"
                    onClick={() => navigate('/tuition/students')}
                >
                    Record Payment
                </Button>
            </div>

            {/* Filters */}
            <Card className="tuition-fees__filters">
                <div className="tuition-fees__filter-group">
                    <div className="tuition-fees__filter">
                        <label className="tuition-fees__filter-label">Month</label>
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(e) => handleFilterChange('month', e.target.value)}
                            className="tuition-fees__filter-input"
                        />
                    </div>
                    <div className="tuition-fees__filter">
                        <label className="tuition-fees__filter-label">Student</label>
                        <select
                            value={filters.studentId}
                            onChange={(e) => handleFilterChange('studentId', e.target.value)}
                            className="tuition-fees__filter-select"
                        >
                            <option value="all">All Students</option>
                            {students.map(student => (
                                <option key={student.id || student._id} value={student.id || student._id}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Summary */}
            <Card className="tuition-fees__summary">
                <div className="tuition-fees__summary-content">
                    <div className="tuition-fees__summary-stat">
                        <span className="tuition-fees__summary-label">Total Collected</span>
                        <span className="tuition-fees__summary-value">Rs. {totalCollected.toLocaleString()}</span>
                    </div>
                    <div className="tuition-fees__summary-stat">
                        <span className="tuition-fees__summary-label">Total Records</span>
                        <span className="tuition-fees__summary-value">{feePayments.length}</span>
                    </div>
                </div>
            </Card>

            {/* Fee Records List */}
            <div className="tuition-fees__content">
                {error && (
                    <div className="tuition-fees__error">
                        <span className="tuition-fees__error-icon">⚠️</span>
                        <p>{error}</p>
                        <Button variant="primary" onClick={fetchFeeRecords}>
                            Retry
                        </Button>
                    </div>
                )}

                {loading ? (
                    <div className="tuition-fees__loading">
                        <div className="tuition-fees__spinner"></div>
                        <p>Loading fee records...</p>
                    </div>
                ) : feePayments.length > 0 ? (
                    <div className="tuition-fees__list">
                        {feePayments.map(payment => (
                            <Card key={payment.id} className="tuition-fees__payment-card">
                                <div className="tuition-fees__payment-header">
                                    <div className="tuition-fees__payment-info">
                                        <h3 className="tuition-fees__student-name">{payment.studentName}</h3>
                                        <span className="tuition-fees__student-class">{payment.studentClass}</span>
                                    </div>
                                    <div className="tuition-fees__payment-amount">
                                        <span className="tuition-fees__amount">Rs. {payment.paid.toLocaleString()}</span>
                                        <span className="tuition-fees__month">{payment.month}</span>
                                    </div>
                                </div>
                                
                                <div className="tuition-fees__payment-details">
                                    <div className="tuition-fees__detail-item">
                                        <span className="tuition-fees__detail-label">Due:</span>
                                        <span className="tuition-fees__detail-value">Rs. {payment.due.toLocaleString()}</span>
                                    </div>
                                    <div className="tuition-fees__detail-item">
                                        <span className="tuition-fees__detail-label">Paid:</span>
                                        <span className="tuition-fees__detail-value">Rs. {payment.paid.toLocaleString()}</span>
                                    </div>
                                    {payment.remaining > 0 && (
                                        <div className="tuition-fees__detail-item">
                                            <span className="tuition-fees__detail-label">Remaining:</span>
                                            <span className="tuition-fees__detail-value tuition-fees__detail-value--warning">
                                                Rs. {payment.remaining.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="tuition-fees__detail-item">
                                        <span className="tuition-fees__detail-label">Method:</span>
                                        <span className="tuition-fees__detail-value tuition-fees__method">
                                            {payment.method || 'Cash'}
                                        </span>
                                    </div>
                                    <div className="tuition-fees__detail-item">
                                        <span className="tuition-fees__detail-label">Date:</span>
                                        <span className="tuition-fees__detail-value">
                                            {payment.paymentDate || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {payment.notes && (
                                    <div className="tuition-fees__payment-notes">
                                        <span className="tuition-fees__notes-label">Notes:</span>
                                        <span className="tuition-fees__notes-text">{payment.notes}</span>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="tuition-fees__empty">
                        <span className="tuition-fees__empty-icon">📋</span>
                        <h3>No Fee Records Found</h3>
                        <p>No fee payments recorded for the selected month.</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/tuition/students')}
                        >
                            Record First Payment
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TuitionFees;