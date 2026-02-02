import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import BottomNav from '../components/BottomNav/BottomNav';
import PersonalSidebar from '../components/Sidebar/PersonalSidebar';
import { useWorkspaceSync } from '../hooks/useWorkspaceSync';
import './AppLayout.css';

const pageTitles = {
    '/app/home': 'Dashboard',
    '/app/transactions': 'Transactions',
    '/app/add': 'Add Transaction',
    '/app/wallets': 'Wallets',
    '/app/reports': 'Reports',
    '/app/settings': 'Settings',
    '/app/recurring': 'Recurring Expenses',
    '/app/recurring/add': 'Add Recurring Expense'
};

function PersonalLayout() {
    const location = useLocation();
    useWorkspaceSync(); // Sync workspace with route
    
    const pageTitle = pageTitles[location.pathname] || '';

    return (
        <div className="app-layout">
            <PersonalSidebar />

            <div className="app-layout__main">
                <Header title={pageTitle} mode="personal" />

                <main className="app-layout__content">
                    <Outlet />
                </main>

                <BottomNav />
            </div>
        </div>
    );
}

export default PersonalLayout;