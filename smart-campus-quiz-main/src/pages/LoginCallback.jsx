import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveUserData, fetchAndSaveUser } from '@/utils/auth';
import { Loader2 } from 'lucide-react';

const LoginCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        saveUserData(token);
        const user = await fetchAndSaveUser();
        
        const role = user.role;
        if (role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (role === 'FACULTY') {
          navigate('/faculty/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } catch (error) {
        console.error('Error during login callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
      <div className="text-center space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary-foreground mx-auto" />
        <p className="text-xl font-semibold text-primary-foreground">
          Signing you in...
        </p>
      </div>
    </div>
  );
};

export default LoginCallback;
