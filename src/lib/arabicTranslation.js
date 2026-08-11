// ─────────────────────────────────────────
// ARABIC QUERY TRANSLATION
// Extracted from server.js (v3.10.0) so the eval scripts (deepeval-metrics.js)
// can share the exact same translation logic the live app uses, instead of
// maintaining a second copy that could drift out of sync.
// ─────────────────────────────────────────


const TRANSLATIONS = {
    'الهوية الإماراتية':                 'Emirates ID',
    'بطاقة الهوية':                      'Emirates ID',
    'هوية':                              'Emirates ID',
    'هويتي':                             'Emirates ID',
    'فقدت':                              'lost',
    'بدل فاقد':                          'replacement lost item',
    'بدل':                               'replacement',
    'مفقود':                             'lost',
    'المفقودة':                          'lost',
    'تأشيرة الإقامة':                    'residency visa',
    'تأشيرة':                            'visa',
    'إقامة ذهبية':                       'golden visa',
    'الإقامة الذهبية':                   'golden visa',
    'فيزا ذهبية':                        'golden visa',
    'التقدم للحصول على الإقامة الذهبية': 'golden visa eligibility investors entrepreneurs',
    'إقامة':                             'residency',
    'جواز سفر':                          'passport',
    'شهادة ميلاد':                       'birth certificate',
    'التأمين الصحي إلزامي':              'health insurance mandatory DHA employer',
    'التأمين الصحي':                     'health insurance DHA',
    'تأمين صحي':                         'health insurance',
    'تأمين':                             'insurance',
    'صحي':                               'health',
    'إلزامي':                            'mandatory required',
    'لياقة طبية':                        'medical fitness',
    'فحص طبي':                           'medical fitness',
    'شهادة لياقة':                       'medical fitness certificate',
    'مدرسة':                             'school',
    'تعليم':                             'education',
    'تسجيل مدرسي':                       'school enrollment',
    'التسجيل في المدرسة':                'school enrollment KHDA',
    'عقد الإيجار':                       'tenancy contract',
    'عقد إيجار':                         'tenancy contract',
    'إيجار':                             'tenancy rental',
    'إيجاري':                            'Ejari',
    'توثيق':                             'Tawtheeq',
    'تسجيل عقد الإيجار':                 'tenancy contract registration Ejari',
    'ترخيص تجاري':                       'trade license',
    'رخصة تجارية':                       'trade license',
    'ضريبة القيمة المضافة':              'VAT Federal Tax Authority',
    'ضريبة':                             'VAT tax',
    'عمل حر':                            'freelance permit',
    'فريلانس':                           'freelance',
    'دعم اجتماعي':                       'social support',
    'زكاة':                              'Zakat',
    'معاش':                              'pension gratuity',
    'مكافأة نهاية الخدمة':               'end of service gratuity',
    'نهاية الخدمة':                      'end of service gratuity',
    'ذوي الهمم':                         'people of determination disability',
    'كهرباء':                            'electricity DEWA ADDC',
    'ماء':                               'water utility',
    'حجز موعد':                          'book appointment',
    'موعد':                              'appointment',
    'الإمارات':                          'UAE emirates',
    'أبوظبي':                            'Abu Dhabi',
    'دبي':                               'Dubai',
    'الشارقة':                           'Sharjah',
    'عجمان':                             'Ajman',
    'رأس الخيمة':                        'Ras Al Khaimah',
    'الفجيرة':                           'Fujairah',
    'أم القيوين':                        'Umm Al Quwain',
    'كيف': '', 'ما هي': '', 'ما هو': '', 'هل': '', 'من': '',
    'متى': '', 'أين': '', 'في': '', 'على': '', 'من يحق له': '',
    'يحق له': '', 'للحصول على': '', 'التقدم': '',
    'أسجل': 'registration', 'أجدد': 'renewal',
    'أحصل': '', 'يمكنني': '', 'أريد': '',
  };
  
  
  function translateArabicQuery(text) {
    let translated = text;
    const sortedEntries = Object.entries(TRANSLATIONS).sort((a, b) => b[0].length - a[0].length);
    for (const [arabic, english] of sortedEntries) {
      translated = translated.replace(new RegExp(arabic, 'g'), english);
    }
    return translated
      .replace(/[\u0600-\u06FF]+/g, '')
      .replace(/[؟،]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  
  module.exports = { TRANSLATIONS, translateArabicQuery };  