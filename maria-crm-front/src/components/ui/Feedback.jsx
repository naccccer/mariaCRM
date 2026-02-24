import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react';

export function LoadingState({ message = 'در حال بارگذاری...', fullPage = false }) {
  return (
    <div className={fullPage ? 'state-full-page' : 'state-card'}>
      <LoaderCircle className="spin" size={22} />
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'خطایی رخ داده است.', onRetry }) {
  return (
    <div className="state-card error">
      <AlertTriangle size={22} />
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn-light" onClick={onRetry}>
          تلاش مجدد
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message = 'موردی برای نمایش وجود ندارد.' }) {
  return (
    <div className="state-card empty">
      <Inbox size={22} />
      <p>{message}</p>
    </div>
  );
}
