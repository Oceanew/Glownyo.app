import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Guards the GlowNyo admin space. Unauthenticated visitors are sent to the
// login page; authenticated non-admins (clients and providers) are redirected
// to their account page so the admin rubric stays invisible and inaccessible
// to anyone without the administrator role.
const AdminRoute = ({ children }) => {
  const { isAuthed, isAdmin } = useAuth();
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

  if (!isAdmin) {
    return <Navigate to="/mon-compte" replace />;
  }

  return children;
};

export default AdminRoute;
