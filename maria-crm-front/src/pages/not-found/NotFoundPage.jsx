import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="state-card">
      <h2>صفحه موردنظر پیدا نشد</h2>
      <p>مسیر واردشده معتبر نیست یا به این بخش دسترسی ندارید.</p>
      <Link to="/dashboard" className="btn btn-primary">
        بازگشت به داشبورد
      </Link>
    </section>
  );
}
