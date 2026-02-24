const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const numberFormatter = new Intl.NumberFormat('fa-IR');

export function formatDate(value) {
  if (!value) {
    return '---';
  }

  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) {
    return '---';
  }

  return dateTimeFormatter.format(new Date(value));
}

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0';
  }

  return numberFormatter.format(Number(value));
}

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '---';
  }

  return `${numberFormatter.format(Number(value))} تومان`;
}
