import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import BottomNav from '../components/BottomNav/BottomNav';
import TuitionSidebar from '../components/Sidebar/TuitionSidebar';
import { useWorkspaceSync } from '../hooks/useWorkspaceSync';
import './AppLayout.css';

const pageTitles = {
    '/tuition/dashboard': 'Tuition Dashboard',
    '/tuition/students': 'Students',
    '/tuition/students/add': 'Add Student',
    '/tuition/fees': 'Fee Records',
    '/tuition/reports': 'Reports',
    '/tuition/settings': 'Settings'
};

function TuitionLayout() {
    const location = useLocation();
    useWorkspaceSync(); // Sync workspace with route
    
    const pageTitle = pageTitles[location.pathname] || '';

    return (
        <div className="app-layout">
            <TuitionSidebar />

            <div className="app-layout__main">
                <Header title={pageTitle} mode="tuition" />

                <main className="app-layout__content">
                    <Outlet />
                </main>

                <BottomNav />
            </div>
        </div>
    );
}

export default TuitionLayout;