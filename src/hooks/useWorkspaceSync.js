import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';

/**
 * Hook to sync workspace state with current route
 * This must be used within a Router context
 */
export function useWorkspaceSync() {
    const location = useLocation();
    const { workspace, setWorkspace } = useData();

    useEffect(() => {
        const currentWorkspace = location.pathname.startsWith('/tuition') ? 'tuition' : 'personal';
        
        if (workspace !== currentWorkspace) {
            setWorkspace(currentWorkspace);
        }
    }, [location.pathname, workspace, setWorkspace]);

    return workspace;
}