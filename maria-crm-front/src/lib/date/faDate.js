const faDateTimeFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const faDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  dateStyle: 'medium',
});

export function formatFaDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return faDateTimeFormatter.format(date);
}

export function formatFaDate(value) {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return faDateFormatter.format(date);
}

export function toIsoDateTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 19).replace('T', ' ');
}
