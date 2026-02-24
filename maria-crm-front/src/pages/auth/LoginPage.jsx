import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

export default function LoginPage() {
  const location = useLocation();
  const { login, loading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/dashboard';

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (submitError) {
      if (submitError.status === 401) {
        setError('ایمیل یا رمز عبور اشتباه است.');
      } else {
        setError(submitError.message || 'ورود انجام نشد.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span>ماریا سی آر ام</span>
          <h1>ورود به پنل مدیریت ارتباط با مشتری</h1>
          <p>برای ادامه، ایمیل و رمز عبور خود را وارد کنید.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>ایمیل</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ایمیل سازمانی"
              required
            />
          </label>

          <label>
            <span>رمز عبور</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="رمز عبور"
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
}

