import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Redirects unauthenticated visitors to /connexion, preserving the page they
// tried to reach so we can send them back after a successful sign-in.
const ProtectedRoute = ({ children }) => {
  const { isAuthed } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return (
      <Navigate
        to="/connexion"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
