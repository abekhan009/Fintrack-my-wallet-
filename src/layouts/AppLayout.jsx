import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import BottomNav from '../components/BottomNav/BottomNav';
import Sidebar from '../components/Sidebar/Sidebar';
import './AppLayout.css';

const pageTitles = {
    '/home': 'Dashboard',
    '/transactions': 'Transactions',
    '/add': 'Add Transaction',
    '/wallets': 'Wallets',
    '/reports': 'Reports',
    '/settings': 'Settings'
};

function AppLayout() {
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] || '';

    return (
        <div className="app-layout">
            <Sidebar />

            <div className="app-layout__main">
                <Header title={pageTitle} />

                <main className="app-layout__content">
                    <Outlet />
                </main>

                <BottomNav />
            </div>
        </div>
    );
}

export default AppLayout;
