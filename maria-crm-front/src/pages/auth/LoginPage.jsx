import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@mariacrm.local');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const targetPath = location.state?.from || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, navigate, targetPath]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(targetPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'ورود ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-black text-gray-900 text-center">ورود به MariaCRM</h1>
        <p className="text-sm text-gray-500 mt-2 text-center">برای ادامه وارد حساب خود شوید.</p>

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">ایمیل</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#006039]"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">رمز عبور</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#006039]"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div> : null}

          <button
            type="submit"
            className="w-full bg-[#006039] hover:bg-[#004d2e] text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
}
