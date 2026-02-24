// این فایل تمام داده‌های نمونه رابط کاربری را نگه می‌دارد تا صفحات از هم مستقل بمانند.

export const KPI_DATA = [
  { title: 'کل مشتریان', value: '۱۴۲', trend: '+۱۲%' },
  { title: 'مذاکرات تهاتر', value: '۱۸', trend: '+۸%' },
  { title: 'واحدهای موجود (شمال)', value: '۸۴', trend: '-۲%' },
  { title: 'قراردادهای موفق (امسال)', value: '۱۴', trend: '+۲۰%' },
];

export const EXTENDED_CLIENTS = [
  { id: 1, name: 'کوروش ستوده', phone: '09123456789', type: 'خریدار', budget: '۱۵۰ میلیارد', interest: 'برج ساحلی ژوان', status: 'فعال', agent: 'براتی', date: '۱۴۰۲/۱۱/۱۵', pipeline: 2 },
  { id: 2, name: 'الناز وکیلی', phone: '09129876543', type: 'تهاتر', budget: '۸۵ میلیارد (ملک)', interest: 'برج مسکونی کادنس', status: 'در انتظار', agent: 'سارا', date: '۱۴۰۲/۱۱/۱۶', pipeline: 1 },
  { id: 3, name: 'مهندس رضایی', phone: '09121112233', type: 'سرمایه‌گذار', budget: '۳۰۰+ میلیارد', interest: 'ویلا برج سولاریس', status: 'جدید', agent: 'براتی', date: '۱۴۰۲/۱۱/۱۸', pipeline: 0 },
  { id: 4, name: 'گروه توسعه پارس', phone: '02188889999', type: 'حقوقی', budget: 'نامشخص', interest: 'برج آفرینش', status: 'مذاکره', agent: 'براتی', date: '۱۴۰۲/۱۱/۲۰', pipeline: 2 },
  { id: 5, name: 'شرکت عمران سازه', phone: '02122223344', type: 'تهاتر', budget: '۲۰۰ میلیارد (مصالح)', interest: 'پروژه آتی (تهران)', status: 'فعال', agent: 'براتی', date: '۱۴۰۲/۱۱/۲۲', pipeline: 3 },
];

export const CLIENT_HISTORY = [
  { id: 1, type: 'note', text: 'مشتری به دنبال پنت‌هاوس با ویو ابدی دریاست. تهاتر قبول نمی‌کند.', date: '۱۴۰۲/۱۱/۱۶ - ۱۰:۳۰', author: 'براتی' },
  { id: 2, type: 'call', text: 'تماس اولیه گرفته شد. پرزنت برج ژوان انجام شد. قرار بازدید ست شد.', date: '۱۴۰۲/۱۱/۱۸ - ۱۴:۱۵', author: 'براتی' },
  { id: 3, type: 'meeting', text: 'بازدید از بلوک B انجام شد. بسیار راضی بود. منتظر استعلام قیمت نهایی هستیم.', date: '۱۴۰۲/۱۱/۲۰ - ۱۶:۰۰', author: 'براتی' },
];

export const ACTIVITIES_DATA = [
  { id: 1, client: 'کوروش ستوده', title: 'تماس پیگیری وضعیت', desc: 'استعلام تصمیم نهایی برای پنت‌هاوس بلوک B', due: '۱۴۰۲/۱۱/۲۵', status: 'در حال انجام', agent: 'براتی' },
  { id: 2, client: 'الناز وکیلی', title: 'جلسه کارشناسی ملک', desc: 'بازدید کارشناس از ویلای دشت‌نور جهت تهاتر', due: '۱۴۰۲/۱۱/۲۶', status: 'سررسید گذشته', agent: 'سارا' },
  { id: 3, client: 'مهندس رضایی', title: 'ارسال کاتالوگ', desc: 'ارسال بروشور دیجیتال پروژه سولاریس در واتساپ', due: '۱۴۰۲/۱۱/۲۴', status: 'انجام شده', agent: 'براتی' },
  { id: 4, client: 'گروه توسعه پارس', title: 'تماس بازهم', desc: 'پیگیری جلسه با هیئت مدیره', due: '۱۴۰۲/۱۱/۲۸', status: 'در حال انجام', agent: 'براتی' },
];

export const PROJECTS_DATA = [
  { id: 1, name: 'ویلا برج سولاریس', location: 'محمودآباد', type: 'مسکونی / تفریحی لوکس', totalUnits: 120, availableUnits: 15, progress: 85, basePrice: 'متری ۱۵۰ میلیون', status: 'در حال ساخت', color: 'from-emerald-800 to-emerald-600' },
  { id: 2, name: 'برج مسکونی کادنس', location: 'چالوس', type: 'برج باغ مدرن', totalUnits: 80, availableUnits: 32, progress: 40, basePrice: 'متری ۱۲۰ میلیون', status: 'پیش‌فروش', color: 'from-slate-800 to-slate-600' },
  { id: 3, name: 'برج ساحلی ژوان', location: 'شیرود', type: 'مسکونی ساحلی', totalUnits: 65, availableUnits: 4, progress: 95, basePrice: 'متری ۲۰۰ میلیون', status: 'آماده تحویل', color: 'from-sky-800 to-sky-600' },
  { id: 4, name: 'پروژه بلوما', location: 'رویان', type: 'شهرک ویلایی اختصاصی', totalUnits: 40, availableUnits: 12, progress: 60, basePrice: 'پایه از ۵۰ میلیارد', status: 'در حال ساخت', color: 'from-stone-800 to-stone-600' },
  { id: 5, name: 'برج آفرینش', location: 'رامسر', type: 'مجتمع مسکونی رفاهی', totalUnits: 150, availableUnits: 45, progress: 30, basePrice: 'متری ۱۳۰ میلیون', status: 'پیش‌فروش', color: 'from-indigo-800 to-indigo-600' },
  { id: 6, name: 'مجتمع یاقوت مصلی', location: 'تهران', type: 'اداری / تجاری لوکس', totalUnits: 200, availableUnits: 180, progress: 15, basePrice: 'در حال قیمت‌گذاری', status: 'پذیره‌نویسی', color: 'from-rose-800 to-rose-600' },
];
