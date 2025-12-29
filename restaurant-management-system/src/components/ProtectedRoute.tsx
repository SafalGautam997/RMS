import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'Admin' | 'Waiter';
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={user?.role === 'Admin' ? '/admin' : '/waiter'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
