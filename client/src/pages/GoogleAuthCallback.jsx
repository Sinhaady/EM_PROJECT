import { useEffect, useRef } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const GoogleAuthCallback = () => {
  const { completeGoogleLogin, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (hasCompleted.current) {
      return;
    }

    hasCompleted.current = true;
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    const finishLogin = async () => {
      const errorMsg = await completeGoogleLogin(token);

      if (errorMsg) {
        toast.error(errorMsg);
        navigate('/login', { replace: true });
        return;
      }

      toast.success('Signed in with Google!');
      navigate('/', { replace: true });
    };

    finishLogin();
  }, [completeGoogleLogin, navigate, searchParams]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
        <p className="text-sm text-zinc-400">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
