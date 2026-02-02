import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import TuitionSetup from '../../components/TuitionSetup/TuitionSetup';
import './Students.css';

function Students() {
    const navigate = useNavigate();
    const { students, studentsLoading, studentsError, deleteStudent, userProfile, profileLoading } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [deletingStudent, setDeletingStudent] = useState(false);

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Ensure students is always an array
    const safeStudents = Array.isArray(students) ? students.filter(Boolean) : [];

    const getStudentFeeStatus = (student) => {
        if (!student) return 'unpaid';
        
        const currentFee = student.feeHistory?.find(f => f.month === currentMonth);
        const due = (student.monthlyFee || 0) - (student.discount || 0);

        if (!currentFee || currentFee.paid === 0) return 'unpaid';
        if (currentFee.paid >= due) return 'paid';
        return 'partial';
    };

    const filteredStudents = safeStudents.filter(student => {
        // Ensure student object exists
        if (!student) return false;
        
        // Search filter
        const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (student.phone && student.phone.includes(searchQuery));

        // Status filter
        if (statusFilter === 'all') return matchesSearch && student.status !== 'inactive';
        if (statusFilter === 'inactive') return matchesSearch && student.status === 'inactive';

        const feeStatus = getStudentFeeStatus(student);
        return matchesSearch && feeStatus === statusFilter && student.status !== 'inactive';
    });

    const activeStudents = safeStudents.filter(s => s && s.status !== 'inactive');
    const stats = {
        total: activeStudents.length,
        paid: activeStudents.filter(s => s && getStudentFeeStatus(s) === 'paid').length,
        unpaid: activeStudents.filter(s => s && getStudentFeeStatus(s) === 'unpaid').length,
        partial: activeStudents.filter(s => s && getStudentFeeStatus(s) === 'partial').length
    };

    const handleDeleteClick = (e, student) => {
        e.stopPropagation(); // Prevent card click
        setStudentToDelete(student);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (studentToDelete) {
            setDeletingStudent(true);
            try {
                await deleteStudent(studentToDelete.id || studentToDelete._id);
                setShowDeleteModal(false);
                setStudentToDelete(null);
            } catch (error) {
                console.error('Failed to delete student:', error);
                // You could show an error message here
            } finally {
                setDeletingStudent(false);
            }
        }
    };

    const handleEditClick = (e, student) => {
        e.stopPropagation(); // Prevent card click
        navigate(`/students/${student.id || student._id}`);
    };

    if (studentsLoading) {
        return (
            <div className="students">
                <div className="students__loading">
                    <div className="students__spinner"></div>
                    <p>Loading students...</p>
                </div>
            </div>
        );
    }

    if (studentsError) {
        return (
            <div className="students">
                <div className="students__error">
                    <span className="students__error-icon">⚠️</span>
                    <p>Failed to load students: {studentsError}</p>
                    <Button variant="primary" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Show tuition setup if required
    if (!profileLoading && !userProfile?.tuitionCenterName) {
        return <TuitionSetup onComplete={() => window.location.reload()} />;
    }

    return (
        <div className="students">
            {/* Stats Row */}
            <div className="students__stats">
                <button
                    className={`students__stat ${statusFilter === 'all' ? 'students__stat--active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                >
                    <span className="students__stat-value">{stats.total}</span>
                    <span className="students__stat-label">Total</span>
                </button>
                <button
                    className={`students__stat students__stat--paid ${statusFilter === 'paid' ? 'students__stat--active' : ''}`}
                    onClick={() => setStatusFilter('paid')}
                >
                    <span className="students__stat-value">{stats.paid}</span>
                    <span className="students__stat-label">Paid</span>
                </button>
                <button
                    className={`students__stat students__stat--partial ${statusFilter === 'partial' ? 'students__stat--active' : ''}`}
                    onClick={() => setStatusFilter('partial')}
                >
                    <span className="students__stat-value">{stats.partial}</span>
                    <span className="students__stat-label">Partial</span>
                </button>
                <button
                    className={`students__stat students__stat--unpaid ${statusFilter === 'unpaid' ? 'students__stat--active' : ''}`}
                    onClick={() => setStatusFilter('unpaid')}
                >
                    <span className="students__stat-value">{stats.unpaid}</span>
                    <span className="students__stat-label">Unpaid</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="students__search">
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="students__search-input"
                />
                <Button variant="primary" onClick={() => navigate('/students/add')}>
                    + Add Student
                </Button>
            </div>

            {/* Students List */}
            <div className="students__list">
                {filteredStudents.map(student => {
                    const feeStatus = getStudentFeeStatus(student);
                    const due = student.monthlyFee - (student.discount || 0);
                    const currentFee = student.feeHistory?.find(f => f.month === currentMonth);
                    const paid = currentFee?.paid || 0;

                    return (
                        <Card key={student.id || student._id} className="students__card">
                            <div className="students__card-content" onClick={() => navigate(`/students/${student.id || student._id}`)}>
                                <div className="students__card-header">
                                    <div className="students__card-info">
                                        <h3 className="students__card-name">{student.name}</h3>
                                        <span className="students__card-class">{student.grade || student.class}</span>
                                    </div>
                                    <span className={`students__badge students__badge--${feeStatus}`}>
                                        {feeStatus === 'paid' ? '✓ Paid' : feeStatus === 'partial' ? '◐ Partial' : '✗ Unpaid'}
                                    </span>
                                </div>

                                <div className="students__card-subjects">
                                    {(student.subjects || []).map((subject, i) => (
                                        <span key={i} className="students__tag">{subject}</span>
                                    ))}
                                </div>

                                <div className="students__card-footer">
                                    <div className="students__card-fee">
                                        <span className="students__card-fee-label">Monthly Fee</span>
                                        <span className="students__card-fee-value">Rs. {due.toLocaleString()}</span>
                                    </div>
                                    {feeStatus === 'partial' && (
                                        <div className="students__card-remaining">
                                            <span>Paid: Rs. {paid.toLocaleString()}</span>
                                            <span className="students__card-remaining-due">Due: Rs. {(due - paid).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="students__card-actions">
                                <button 
                                    className="students__action-btn students__action-btn--edit"
                                    onClick={(e) => handleEditClick(e, student)}
                                    title="Edit Student"
                                >
                                    ✏️
                                </button>
                                <button 
                                    className="students__action-btn students__action-btn--delete"
                                    onClick={(e) => handleDeleteClick(e, student)}
                                    title="Delete Student"
                                >
                                    🗑️
                                </button>
                            </div>
                        </Card>
                    );
                })}

                {filteredStudents.length === 0 && !studentsLoading && (
                    <div className="students__empty">
                        <span className="students__empty-icon">🎓</span>
                        <p>No students found</p>
                        <Button variant="primary" onClick={() => navigate('/students/add')}>
                            Add First Student
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && studentToDelete && (
                <div className="students__modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="students__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="students__modal-header">
                            <h2>Delete Student</h2>
                            <button className="students__modal-close" onClick={() => setShowDeleteModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="students__delete-content">
                            <div className="students__delete-icon">⚠️</div>
                            <p>Are you sure you want to delete <strong>{studentToDelete.name}</strong>?</p>
                            <p className="students__delete-warning">
                                This action cannot be undone. All fee history and records will be permanently removed.
                            </p>
                        </div>

                        <div className="students__modal-actions">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deletingStudent}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button" 
                                variant="danger" 
                                onClick={handleConfirmDelete}
                                disabled={deletingStudent}
                            >
                                {deletingStudent ? 'Deleting...' : 'Delete Student'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Students;
