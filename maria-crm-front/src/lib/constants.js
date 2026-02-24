export const leadStatusLabels = {
  new: 'جدید',
  contacted: 'تماس گرفته شده',
  qualified: 'واجد شرایط',
  converted: 'تبدیل شده',
  lost: 'از دست رفته',
};

export const contactStatusLabels = {
  active: 'فعال',
  inactive: 'غیرفعال',
  archived: 'بایگانی',
};

export const dealStatusLabels = {
  open: 'باز',
  won: 'موفق',
  lost: 'ناموفق',
};

export const activityStatusLabels = {
  todo: 'در انتظار',
  in_progress: 'در حال انجام',
  done: 'انجام شده',
};

export const activityTypeLabels = {
  follow_up: 'پیگیری',
  task: 'وظیفه',
  meeting: 'جلسه',
  call: 'تماس',
};

export const ticketStatusLabels = {
  open: 'باز',
  pending: 'در انتظار',
  resolved: 'حل شده',
  closed: 'بسته',
};

export const ticketPriorityLabels = {
  low: 'کم',
  normal: 'عادی',
  high: 'بالا',
  urgent: 'فوری',
};

export const contactTypeLabels = {
  buyer: 'خریدار',
  investor: 'سرمایه‌گذار',
  partner: 'همکار',
  lead_converted: 'تبدیل‌شده از سرنخ',
};

export const roleCodeLabels = {
  super_admin: 'مدیر کل',
  sales_manager: 'مدیر فروش',
  sales_agent: 'کارشناس فروش',
  support_agent: 'کارشناس پشتیبانی',
};

const pipelineStageLabels = {
  'new lead': 'سرنخ اولیه',
  'initial negotiation': 'مذاکره اولیه',
  meeting: 'جلسه',
  proposal: 'پیشنهاد قیمت',
  won: 'موفق',
  'price and finalization': 'قیمت و نهایی کردن',
  follow_up: 'پیگیری',
  'initial notes': 'مذاکرات اولیه',
};

export function labelFromMap(map, value) {
  return map[value] || value || '---';
}

export function localizePipelineStage(stageName) {
  if (!stageName) {
    return '---';
  }

  const normalized = String(stageName).trim().toLowerCase();
  return pipelineStageLabels[normalized] || stageName;
}

export function localizeTimelineText(text) {
  if (!text) {
    return '---';
  }

  const stageMovedMatch = String(text).match(/^Stage moved to\s+(.+)$/i);
  if (stageMovedMatch) {
    return `تغییر مرحله به ${localizePipelineStage(stageMovedMatch[1])}`;
  }

  return text;
}
