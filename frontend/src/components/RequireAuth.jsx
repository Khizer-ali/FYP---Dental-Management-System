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

