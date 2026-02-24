const toneClassMap = {
  default: 'badge badge-default',
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
  info: 'badge badge-info',
};

export default function Badge({ children, tone = 'default' }) {
  return <span className={toneClassMap[tone] || toneClassMap.default}>{children}</span>;
}
