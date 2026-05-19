import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-cyan-500">
        <span className="text-xl font-bold animate-pulse">Verifying Access...</span>
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}