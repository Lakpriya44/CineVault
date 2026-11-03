import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Login and register pages: signed-in users are sent straight to the app.
// The page renders immediately while the session check runs, so there is no blank screen.
export default function PublicOnlyRoute() {
  const { user } = useAuth();

  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}
