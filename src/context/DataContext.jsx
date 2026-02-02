import { createContext, useContext, useState, useEffect } from 'react';
import { studentsApi, usersApi, tuitionApi } from '../services/api';

// Category information for transactions
export const categoryInfo = {
    // Income categories
    salary: { label: 'Salary', icon: '💰' },
    freelance: { label: 'Freelance', icon: '💻' },
    business: { label: 'Business', icon: '🏢' },
    investment: { label: 'Investment', icon: '📈' },
    gift: { label: 'Gift', icon: '🎁' },
    other_income: { label: 'Other Income', icon: '💵' },

    // Expense categories
    food: { label: 'Food & Dining', icon: '🍽️' },
    transport: { label: 'Transportation', icon: '🚗' },
    shopping: { label: 'Shopping', icon: '🛍️' },
    entertainment: { label: 'Entertainment', icon: '🎬' },
    bills: { label: 'Bills & Utilities', icon: '📄' },
    healthcare: { label: 'Healthcare', icon: '🏥' },
    education: { label: 'Education', icon: '📚' },
    travel: { label: 'Travel', icon: '✈️' },
    other_expense: { label: 'Other Expense', icon: '💸' },

    // Tuition categories
    student_fee: { label: 'Student Fee', icon: '🎓' },
    admission_fee: { label: 'Admission Fee', icon: '📝' },
    extra_classes: { label: 'Extra Classes', icon: '📖' },
    rent: { label: 'Rent', icon: '🏠' },
    utility_bills: { label: 'Utility Bills', icon: '⚡' },
    staff_salary: { label: 'Staff Salary', icon: '👥' },
    stationery: { label: 'Stationery', icon: '📝' },
    internet: { label: 'Internet', icon: '🌐' }
};

export const DEFAULT_CATEGORIES = {
    personal: {
        income: [
            { key: 'salary', label: 'Salary', icon: '💰' },
            { key: 'freelance', label: 'Freelance', icon: '💻' },
            { key: 'business', label: 'Business', icon: '🏢' },
            { key: 'investment', label: 'Investment', icon: '📈' },
            { key: 'gift', label: 'Gift', icon: '🎁' },
            { key: 'other_income', label: 'Other Income', icon: '💵' }
        ],
        expense: [
            { key: 'food', label: 'Food & Dining', icon: '🍽️' },
            { key: 'transport', label: 'Transportation', icon: '🚗' },
            { key: 'shopping', label: 'Shopping', icon: '🛍️' },
            { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
            { key: 'bills', label: 'Bills & Utilities', icon: '📄' },
            { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
            { key: 'education', label: 'Education', icon: '📚' },
            { key: 'travel', label: 'Travel', icon: '✈️' },
            { key: 'other_expense', label: 'Other Expense', icon: '💸' }
        ]
    },
    tuition: {
        income: [
            { key: 'student_fee', label: 'Student Fee', icon: '🎓' },
            { key: 'admission_fee', label: 'Admission Fee', icon: '📝' },
            { key: 'extra_classes', label: 'Extra Classes', icon: '📖' }
        ],
        expense: [
            { key: 'rent', label: 'Rent', icon: '🏠' },
            { key: 'utility_bills', label: 'Utility Bills', icon: '⚡' },
            { key: 'staff_salary', label: 'Staff Salary', icon: '👥' },
            { key: 'stationery', label: 'Stationery', icon: '📝' },
            { key: 'internet', label: 'Internet', icon: '🌐' },
            { key: 'other_expense', label: 'Other Expense', icon: '💸' }
        ]
    }
};

const DataContext = createContext();

export function DataProvider({ children }) {
    const [workspace, setWorkspace] = useState('personal');
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(true);
    const [studentsError, setStudentsError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Load user profile on mount
    useEffect(() => {
        loadUserProfile();
    }, []);

    // Load students from API when in tuition workspace
    useEffect(() => {
        if (workspace === 'tuition') {
            loadStudents();
        } else {
            setStudents([]);
            setStudentsLoading(false);
        }
    }, [workspace]);

    const loadUserProfile = async () => {
        try {
            setProfileLoading(true);
            const response = await usersApi.getProfile();
            setUserProfile(response.user);
        } catch (error) {
            console.error('Failed to load user profile:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const updateUserProfile = async (profileData) => {
        try {
            const response = await usersApi.updateProfile(profileData);
            setUserProfile(response.user);
            return response.user;
        } catch (error) {
            console.error('Failed to update user profile:', error);
            throw error;
        }
    };

    const loadStudents = async () => {
        try {
            setStudentsLoading(true);
            setStudentsError(null);
            const response = await studentsApi.getAll();
            // Ensure we have a valid array and filter out any null/undefined values
            const studentsArray = Array.isArray(response.students) ? response.students.filter(Boolean) : [];
            setStudents(studentsArray);
        } catch (error) {
            console.error('Failed to load students:', error);
            setStudentsError(error.message || 'Failed to load students');
            setStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    };

    // Student management functions
    const addStudent = async (studentData) => {
        try {
            const response = await studentsApi.create(studentData);
            const newStudent = response.student;
            setStudents(prev => [...(Array.isArray(prev) ? prev : []), newStudent]);
            return newStudent;
        } catch (error) {
            console.error('Failed to add student:', error);
            throw error;
        }
    };

    const updateStudent = async (studentId, updatedData) => {
        try {
            const response = await studentsApi.update(studentId, updatedData);
            const updatedStudent = response.student;
            setStudents(prev => (Array.isArray(prev) ? prev : []).map(student => 
                student && (student.id || student._id) === studentId ? updatedStudent : student
            ));
            return updatedStudent;
        } catch (error) {
            console.error('Failed to update student:', error);
            throw error;
        }
    };

    const deleteStudent = async (studentId) => {
        try {
            await studentsApi.delete(studentId);
            setStudents(prev => (Array.isArray(prev) ? prev : []).filter(student => 
                student && (student.id || student._id) !== studentId
            ));
        } catch (error) {
            console.error('Failed to delete student:', error);
            throw error;
        }
    };

    const recordPayment = async (studentId, paymentData) => {
        try {
            const response = await studentsApi.recordPayment(studentId, paymentData);
            const updatedStudent = response.student;
            setStudents(prev => (Array.isArray(prev) ? prev : []).map(student => 
                student && (student.id || student._id) === studentId ? updatedStudent : student
            ));
            return response.payment;
        } catch (error) {
            console.error('Failed to record payment:', error);
            throw error;
        }
    };

    // Tuition stats calculation
    const getTuitionStats = async () => {
        try {
            const stats = await tuitionApi.getStats();
            return stats;
        } catch (error) {
            console.error('Failed to get tuition stats:', error);
            return {
                totalCollected: 0,
                totalPending: 0,
                pendingCount: 0
            };
        }
    };

    const value = {
        workspace,
        setWorkspace,
        students,
        setStudents,
        studentsLoading,
        studentsError,
        loadStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        recordPayment,
        getTuitionStats,
        userProfile,
        profileLoading,
        loadUserProfile,
        updateUserProfile,
        DEFAULT_CATEGORIES,
        categoryInfo
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}