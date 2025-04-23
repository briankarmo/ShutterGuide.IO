// ProtectedResetPassword.js
import { Navigate } from 'react-router-dom';

const ProtectedResetPassword = ({ children }) => {
  const oobCode = new URLSearchParams(window.location.search).get('oobCode');
  
  if (!oobCode) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedResetPassword