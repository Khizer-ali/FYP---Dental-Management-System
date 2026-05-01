<<<<<<< HEAD
import { Navigate, useLocation } from 'react-router-dom';

function isAuthenticated() {
  const token = window.localStorage.getItem('authToken');
  const userRaw = window.localStorage.getItem('authUser');
  if (!token || !userRaw) return false;
  try {
    JSON.parse(userRaw);
    return true;
  } catch {
    return false;
  }
}

export default function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

=======
import { Navigate, useLocation } from 'react-router-dom';

function isAuthenticated() {
  const token = window.localStorage.getItem('authToken');
  const userRaw = window.localStorage.getItem('authUser');
  if (!token || !userRaw) return false;
  try {
    JSON.parse(userRaw);
    return true;
  } catch {
    return false;
  }
}

export default function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

>>>>>>> 21d5d1dd93ec57f1b541daadb89588e7896dc201
