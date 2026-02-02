import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import TuitionSetup from '../../components/TuitionSetup/TuitionSetup';
import './AddStudent.css';

const classOptions = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O Level', 'A Level'];
const subjectOptions = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Computer', 'Science', 'Pakistan Studies', 'Islamiat'];

function AddStudent() {
    const navigate = useNavigate();
    const { addStudent, userProfile, profileLoading } = useData();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTuitionSetup, setShowTuitionSetup] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        guardianPhone: '',
        class: 'Class 9',
        subjects: [],
        monthlyFee: '',
        discount: '0',
        admissionFee: '0',
        startMonth: new Date().toISOString().slice(0, 7)
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSubject = (subject) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.monthlyFee || formData.subjects.length === 0) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            await addStudent({
                name: formData.name,
                phone: formData.phone || null,
                guardianPhone: formData.guardianPhone || null, // Changed from parentPhone
                class: formData.class, // Changed from grade
                subjects: formData.subjects,
                monthlyFee: parseFloat(formData.monthlyFee),
                discount: parseFloat(formData.discount) || 0,
                admissionFee: parseFloat(formData.admissionFee) || 0,
                startDate: formData.startMonth ? new Date(formData.startMonth + '-01').toISOString() : undefined
            });

            navigate('/students');
        } catch (err) {
            console.error('Failed to add student:', err);
            
            // Check if error is about tuition center requirement
            if (err.code === 'TUITION_CENTER_REQUIRED') {
                setShowTuitionSetup(true);
            } else {
                setError(err.message || 'Failed to add student. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTuitionSetupComplete = () => {
        setShowTuitionSetup(false);
        // Retry the student creation
        handleSubmit(new Event('submit'));
    };

    // Show loading while profile is loading
    if (profileLoading) {
        return (
            <div className="add-student">
                <div className="add-student__loading">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Show tuition setup if required
    if (showTuitionSetup || (!userProfile?.tuitionCenterName && !profileLoading)) {
        return <TuitionSetup onComplete={handleTuitionSetupComplete} />;
    }

    return (
        <div className="add-student">
            {error && (
                <div className="add-student__error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="add-student__form">
                {/* Basic Info */}
                <Card className="add-student__section">
                    <h2 className="add-student__section-title">📋 Basic Information</h2>

                    <div className="add-student__field">
                        <label>Student Name *</label>
                        <input
                            type="text"
                            placeholder="Enter student name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="add-student__row">
                        <div className="add-student__field">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="0300-1234567"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="add-student__field">
                            <label>Guardian Phone</label>
                            <input
                                type="tel"
                                placeholder="0300-1234567"
                                value={formData.guardianPhone}
                                onChange={(e) => handleChange('guardianPhone', e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="add-student__field">
                        <label>Class / Grade *</label>
                        <select
                            value={formData.class}
                            onChange={(e) => handleChange('class', e.target.value)}
                            required
                            disabled={loading}
                        >
                            {classOptions.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </Card>

                {/* Subjects */}
                <Card className="add-student__section">
                    <h2 className="add-student__section-title">📚 Subjects *</h2>
                    <div className="add-student__subjects">
                        {subjectOptions.map(subject => (
                            <button
                                key={subject}
                                type="button"
                                className={`add-student__subject ${formData.subjects.includes(subject) ? 'add-student__subject--active' : ''}`}
                                onClick={() => toggleSubject(subject)}
                                disabled={loading}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Fee Settings */}
                <Card className="add-student__section">
                    <h2 className="add-student__section-title">💰 Fee Settings</h2>

                    <div className="add-student__row">
                        <div className="add-student__field">
                            <label>Monthly Fee (Rs.) *</label>
                            <input
                                type="number"
                                placeholder="3000"
                                value={formData.monthlyFee}
                                onChange={(e) => handleChange('monthlyFee', e.target.value)}
                                min="0"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="add-student__field">
                            <label>Discount (Rs.)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.discount}
                                onChange={(e) => handleChange('discount', e.target.value)}
                                min="0"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="add-student__row">
                        <div className="add-student__field">
                            <label>Admission Fee (Rs.)</label>
                            <input
                                type="number"
                                placeholder="500"
                                value={formData.admissionFee}
                                onChange={(e) => handleChange('admissionFee', e.target.value)}
                                min="0"
                                disabled={loading}
                            />
                        </div>
                        <div className="add-student__field">
                            <label>Start Month</label>
                            <input
                                type="month"
                                value={formData.startMonth}
                                onChange={(e) => handleChange('startMonth', e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {formData.monthlyFee && (
                        <div className="add-student__summary">
                            <span>Net Monthly Fee:</span>
                            <strong>Rs. {((parseFloat(formData.monthlyFee) || 0) - (parseFloat(formData.discount) || 0)).toLocaleString()}</strong>
                        </div>
                    )}
                </Card>

                {/* Submit */}
                <div className="add-student__submit">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => navigate('/students')}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary" 
                        size="large"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Student'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AddStudent;
