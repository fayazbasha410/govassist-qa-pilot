


// ─────────────────────────────────────────────────────────────────────────────
// GovMurshid — UAE Government Policy Documents
// All 7 Emirates | English + Arabic
// Sources: UAE Official Government Portals, MOI, u.ae, Gulf News, Khaleej Times
// Last updated: July 2025
//
// NOTE: Transport-related policies (driving license, vehicle registration,
// traffic fines) were removed in v3.6.0 — that scope now belongs to the
// sister project, Tawfeer (tawfeer-ai.onrender.com).
// ─────────────────────────────────────────────────────────────────────────────

const policies = [

  // ─── ALL UAE ─────────────────────────────────────────────────────────────

  {
    id: 'POL-004',
    emirate: 'All UAE',
    category: 'appointments',
    title: 'Appointment Booking at Government Service Centers',
    content: `Government service appointments can be booked online across all UAE emirates.

Abu Dhabi: Book via TAMM platform (tamm.abudhabi) or call 800-TAMM (8266).
Dubai: Book via Dubai Now app, RTA app, or ICA Smart Services.
Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah: Book via MOI UAE app or the respective emirate government portal.

Services available for appointment booking include:
- Emirates ID
- Residency visa stamping
- Trade license services
- Health card applications

---

حجز المواعيد في مراكز الخدمة الحكومية بالإمارات

يمكن حجز مواعيد الخدمات الحكومية عبر الإنترنت في جميع إمارات الدولة.

أبوظبي: عبر منصة تام أو الاتصال على 800-8266.
دبي: عبر تطبيق دبي ناو أو تطبيق هيئة الطرق أو ICA Smart Services.
الشارقة، عجمان، أم القيوين، رأس الخيمة، الفجيرة: عبر تطبيق MOI UAE أو بوابة حكومة الإمارة.

الخدمات المتاحة للحجز تشمل: الهوية الإماراتية، ختم تأشيرة الإقامة، خدمات الترخيص التجاري، طلبات البطاقة الصحية.`
  },

  {
    id: 'POL-005',
    emirate: 'All UAE',
    category: 'identity',
    title: 'Emirates ID Renewal',
    content: `The Emirates ID must be renewed before expiry. Expatriates should renew it linked to their residence visa renewal. UAE nationals must renew every 5-10 years depending on age.

Apply via:
- ICA Smart Services website (icp.gov.ae)
- TAMM platform (Abu Dhabi)
- Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) app

Required documents:
- Passport with valid UAE residence visa (for expatriates)
- Recent passport-size photograph

Fee: Approximately AED 100–370 depending on card validity period and applicant type.
Processing time: 3–5 working days.

Penalty for not carrying Emirates ID: AED 100 fine.

---

تجديد الهوية الإماراتية

يجب تجديد الهوية الإماراتية قبل انتهاء صلاحيتها. يجب على المقيمين الأجانب ربط تجديدها بتجديد تأشيرة الإقامة.

التقديم عبر:
- موقع ICP الذكي (icp.gov.ae)
- منصة تام (أبوظبي)
- تطبيق الهيئة الاتحادية للهوية والجنسية والجمارك وأمن المنافذ

المستندات المطلوبة:
- جواز سفر بتأشيرة إقامة سارية (للمقيمين الأجانب)
- صورة شخصية حديثة

الرسوم: من 100 إلى 370 درهماً حسب مدة صلاحية البطاقة ونوع المتقدم.
وقت المعالجة: 3-5 أيام عمل.
غرامة عدم حمل الهوية: 100 درهم.`
  },

  {
    id: 'POL-006',
    emirate: 'All UAE',
    category: 'identity',
    title: 'Residency Visa Renewal',
    content: `Expatriate residents must renew their UAE residence visa before expiry. Overstaying without renewal incurs a fine of AED 25 per day.

Apply via:
- ICA Smart Services (icp.gov.ae) — for sponsored workers
- TAMM (Abu Dhabi) — for Abu Dhabi residents
- GDRFA Dubai — for Dubai residents
- MOI UAE app — for other emirates

Required documents:
- Valid passport (minimum 6 months validity)
- Emirates ID
- Sponsor's documents (for employment visa)
- Valid health insurance (mandatory as of 1 January 2025 for all emirates)
- Medical fitness certificate
- Passport-size photographs

Processing time: 5–10 working days.

---

تجديد تأشيرة الإقامة

يجب على المقيمين الأجانب تجديد تأشيرة إقامتهم قبل انتهاء صلاحيتها. تُفرض غرامة تجاوز قدرها 25 درهماً يومياً عند التأخر.

التقديم عبر:
- ICA Smart Services (icp.gov.ae) للعمال المكفولين
- منصة تام لمقيمي أبوظبي
- GDRFA دبي لمقيمي دبي
- تطبيق MOI UAE لباقي الإمارات

المستندات المطلوبة:
- جواز سفر ساري المفعول (6 أشهر على الأقل)
- الهوية الإماراتية
- وثائق الكفيل (لتأشيرة العمل)
- تأمين صحي ساري (إلزامي اعتباراً من 1 يناير 2025 في جميع الإمارات)
- شهادة لياقة طبية
- صور شخصية`
  },

  {
    id: 'POL-007',
    emirate: 'All UAE',
    category: 'identity',
    title: 'New Residence Visa Application',
    content: `New residence visas in the UAE are sponsored by an employer, family member, or obtained through investment/property ownership.

Types of residence visas:
- Employment visa (sponsored by employer)
- Family visa (sponsored by resident family member)
- Investor/property owner visa
- Golden Visa (long-term, 5 or 10 years)
- Student visa
- Retirement visa

Apply via:
- ICA Smart Services (icp.gov.ae)
- TAMM (Abu Dhabi)
- GDRFA Dubai (gdrfad.gov.ae) for Dubai
- MOI UAE app for other emirates

General requirements:
- Valid passport
- Medical fitness certificate
- Valid health insurance (mandatory from 1 January 2025)
- Sponsor's documents

---

طلب تأشيرة إقامة جديدة

تُمنح تأشيرات الإقامة في الإمارات بكفالة صاحب عمل أو أحد أفراد الأسرة أو عبر الاستثمار أو تملك العقار.

أنواع تأشيرات الإقامة:
- تأشيرة عمل (بكفالة صاحب العمل)
- تأشيرة أسرة (بكفالة فرد مقيم)
- تأشيرة مستثمر / مالك عقار
- الإقامة الذهبية (طويلة الأمد، 5 أو 10 سنوات)
- تأشيرة طالب
- تأشيرة تقاعد

التقديم عبر: icp.gov.ae أو منصة تام أو GDRFA دبي أو تطبيق MOI UAE.`
  },

  {
    id: 'POL-008',
    emirate: 'All UAE',
    category: 'housing',
    title: 'Building Permit Application',
    content: `Building permits are required for all construction, renovation, and modification works in the UAE. Applications are managed by each emirate's municipality.

Abu Dhabi: Apply via TAMM (tamm.abudhabi) — Abu Dhabi City Municipality.
Dubai: Apply via Dubai Municipality (dm.gov.ae).
Sharjah: Apply via Sharjah City Municipality (shjmun.gov.ae).
Ajman: Apply via Ajman Municipality (ajman.ae).
Umm Al Quwain: Apply via UAQ Municipality.
Ras Al Khaimah: Apply via RAK Municipality (mun.rak.ae).
Fujairah: Apply via Fujairah Municipality.

General requirements:
- Approved architectural drawings
- Land ownership documents
- No objection certificate (NOC) where applicable

---

طلب رخصة البناء في الإمارات

تُشترط رخصة البناء لجميع أعمال البناء والتجديد والتعديل. تُدار الطلبات عبر بلدية كل إمارة.

أبوظبي: عبر منصة تام.
دبي: عبر بلدية دبي (dm.gov.ae).
الشارقة: عبر بلدية مدينة الشارقة (shjmun.gov.ae).
عجمان: عبر بلدية عجمان (ajman.ae).
أم القيوين: عبر بلدية أم القيوين.
رأس الخيمة: عبر بلدية رأس الخيمة (mun.rak.ae).
الفجيرة: عبر بلدية الفجيرة.`
  },

  {
    id: 'POL-013',
    emirate: 'All UAE',
    category: 'education',
    title: 'Higher Education and University Admission',
    content: `University and higher education admissions in the UAE are managed by the Ministry of Education and individual institutions.

Key regulatory body: Ministry of Education — Commission for Academic Accreditation (CAA).

Public universities (free for UAE nationals): UAE University, Zayed University, Higher Colleges of Technology.
Private universities operate across all 7 emirates and accept both nationals and expatriates.

General admission requirements:
- Secondary school certificate (or equivalent)
- Minimum grade requirements per institution
- English/Arabic proficiency tests (IELTS, TOEFL, EmSAT)
- Medical fitness certificate

Apply directly to institutions or via the UAE Ministry of Education portal (moe.gov.ae).

---

القبول في التعليم العالي والجامعات بالإمارات

تُدار قبولات الجامعات في الإمارات من قِبَل وزارة التربية والتعليم والمؤسسات الأكاديمية.

الجامعات الحكومية (مجانية للمواطنين): جامعة الإمارات، جامعة زايد، كليات التقنية العليا.
تقبل الجامعات الخاصة في جميع الإمارات المواطنين والمقيمين الأجانب.

متطلبات القبول العامة:
- شهادة الثانوية العامة أو ما يعادلها
- الحد الأدنى من الدرجات حسب كل مؤسسة
- اختبارات اللغة الإنجليزية/العربية (IELTS، TOEFL، EmSAT)
- شهادة لياقة طبية`
  },

  {
    id: 'POL-016',
    emirate: 'All UAE',
    category: 'healthcare',
    title: 'Medical Fitness Certificate',
    content: `A medical fitness certificate is required for residence visa applications and renewals across all UAE emirates. It is issued by Ministry of Health approved centers.

The medical fitness test includes:
- Blood test (HIV, Hepatitis B and C, TB screening)
- Chest X-ray
- General physical examination

Where to apply:
- Abu Dhabi: SEHA health centers or approved clinics
- Dubai: DHA-approved medical fitness centers
- Other emirates: MOH-approved medical fitness centers

Fee: Approximately AED 220–320 depending on center and emirate.
Processing time: Same day to 3 working days.
Results are sent directly to ICP/immigration system.

---

شهادة اللياقة الطبية في الإمارات

تُشترط شهادة اللياقة الطبية لطلبات تأشيرة الإقامة وتجديدها في جميع إمارات الدولة. تصدرها المراكز الصحية المعتمدة من وزارة الصحة.

يشمل الفحص الطبي:
- تحليل دم (فيروس نقص المناعة، التهاب الكبد B وC، السل)
- أشعة الصدر
- فحص طبي عام

أماكن التقديم:
- أبوظبي: مراكز صحة أو عيادات معتمدة
- دبي: مراكز اللياقة الطبية المعتمدة من هيئة الصحة
- باقي الإمارات: مراكز معتمدة من وزارة الصحة

الرسوم: من 220 إلى 320 درهماً. وقت المعالجة: في نفس اليوم إلى 3 أيام عمل.`
  },

  {
    id: 'POL-020',
    emirate: 'All UAE',
    category: 'housing',
    title: 'Property Purchase by Expatriates',
    content: `Expatriates can purchase freehold property in designated areas across all UAE emirates.

Abu Dhabi: Freehold areas include Yas Island, Saadiyat Island, Al Reem Island, Al Maryah Island.
Dubai: Over 60 designated freehold areas including Downtown Dubai, Dubai Marina, Palm Jumeirah.
Sharjah: Limited freehold areas; GCC nationals have broader rights. Check SRERD for current designated areas.
Ajman, Ras Al Khaimah, Fujairah: Freehold areas available; check respective land departments.

Property ownership may entitle expatriates to a UAE residence visa:
- Investment of AED 750,000+: 2-year investor visa
- Investment of AED 2,000,000+: 10-year Golden Visa

---

شراء العقارات للمقيمين الأجانب في الإمارات

يحق للمقيمين الأجانب شراء عقارات تملك حر في مناطق مخصصة في جميع الإمارات.

أبوظبي: جزيرة ياس، جزيرة السعديات، جزيرة الريم، جزيرة الماريا.
دبي: أكثر من 60 منطقة تملك حر تشمل وسط دبي ومرسى دبي ونخلة جميرا.
الشارقة: مناطق تملك حر محدودة؛ للمواطنين الخليجيين صلاحيات أوسع.
عجمان، رأس الخيمة، الفجيرة: مناطق تملك حر متاحة؛ راجع دائرة الأراضي المعنية.

قد يُتيح تملك العقار للأجانب الحصول على تأشيرة إقامة:
- استثمار 750,000 درهم+: تأشيرة مستثمر لمدة سنتين
- استثمار 2,000,000 درهم+: إقامة ذهبية لمدة 10 سنوات`
  },

  {
    id: 'POL-023',
    emirate: 'All UAE',
    category: 'business',
    title: 'Value Added Tax (VAT) Registration',
    content: `VAT was introduced in the UAE on 1 January 2018 at a standard rate of 5%.

Mandatory registration: Businesses with taxable supplies exceeding AED 375,000 per year must register for VAT.
Voluntary registration: Businesses with taxable supplies exceeding AED 187,500 per year may register voluntarily.

Register via the Federal Tax Authority (FTA) portal: tax.gov.ae

Filing: VAT returns must be filed quarterly (or monthly for large businesses).
Penalty for late registration: AED 10,000–20,000.
Penalty for late filing: AED 1,000 first time, AED 2,000 subsequent times.

Zero-rated supplies include: healthcare, education, international transport, exports.
Exempt supplies include: bare land, local passenger transport, residential property (first sale).

---

التسجيل في ضريبة القيمة المضافة بالإمارات

طُبِّقت ضريبة القيمة المضافة في الإمارات في 1 يناير 2018 بمعدل 5%.

التسجيل الإلزامي: الشركات التي تتجاوز إمداداتها الخاضعة للضريبة 375,000 درهم سنوياً.
التسجيل الاختياري: الشركات التي تتجاوز إمداداتها 187,500 درهم سنوياً.

التسجيل عبر: موقع الهيئة الاتحادية للضرائب (tax.gov.ae).
التقديم: كل 3 أشهر (أو شهرياً للشركات الكبيرة).`
  },

  {
    id: 'POL-024',
    emirate: 'All UAE',
    category: 'business',
    title: 'Freelance Permit and Self-Employment',
    content: `Freelance permits allow individuals to work independently in the UAE without a company sponsor.

Available through:
- Abu Dhabi: ADIO Freelance Permit (via tamm.abudhabi)
- Dubai: Dubai Economy and Tourism (DET) or free zones (Dubai Media City, Dubai Internet City)
- Sharjah: SHAMS Free Zone — freelance license from AED 5,750/year
- Ajman: Ajman Media City — from AED 5,500/year (includes 1-year visa)
- Ras Al Khaimah: RAKEZ freelance license
- Umm Al Quwain: UAQ Free Trade Zone
- Fujairah: Fujairah Free Zone

Freelance permits allow:
- Self-sponsorship of residence visa
- Opening a personal UAE bank account
- Invoicing clients legally

---

تصريح العمل الحر في الإمارات

تتيح تصاريح العمل الحر للأفراد العمل باستقلالية دون كفيل.

المتاح عبر:
- أبوظبي: تصريح العمل الحر من ADIO (عبر منصة تام)
- دبي: اقتصاد دبي والسياحة أو المناطق الحرة
- الشارقة: منطقة شمس الحرة — من 5,750 درهم سنوياً
- عجمان: مدينة عجمان الإعلامية — من 5,500 درهم سنوياً (تشمل تأشيرة سنة)
- رأس الخيمة: RAKEZ
- أم القيوين: المنطقة الحرة لأم القيوين
- الفجيرة: المنطقة الحرة في الفجيرة

تتيح تصاريح العمل الحر: كفالة تأشيرة الإقامة الذاتية، فتح حساب مصرفي، إصدار فواتير للعملاء قانونياً.`
  },

  {
    id: 'POL-026',
    emirate: 'All UAE',
    category: 'social',
    title: 'Zakat and Charitable Support',
    content: `Zakat management and charitable giving in the UAE is regulated by the General Authority of Islamic Affairs and Endowments.

Official Zakat channels:
- Zakat Fund (zakatfund.gov.ae): Accepts Zakat payments and distributes to eligible beneficiaries.
- Emirates Red Crescent: Charitable donations for humanitarian causes.
- Community Development Authority (CDA) Dubai: Regulates social support and charity.

Zakat is calculated at 2.5% of eligible savings and assets held for one lunar year (nisab threshold).

---

الزكاة والدعم الخيري في الإمارات

تُنظِّم الهيئة العامة للشؤون الإسلامية والأوقاف إدارة الزكاة والعمل الخيري في الإمارات.

قنوات الزكاة الرسمية:
- صندوق الزكاة (zakatfund.gov.ae): يقبل دفعات الزكاة ويوزعها على المستحقين.
- الهلال الأحمر الإماراتي: التبرعات الخيرية للأعمال الإنسانية.
- هيئة تنمية المجتمع دبي: تنظيم الدعم الاجتماعي والعمل الخيري.

تُحسب الزكاة بنسبة 2.5% من المدخرات والأصول المؤهلة المحتفظ بها لمدة سنة هجرية.`
  },

  {
    id: 'POL-027',
    emirate: 'All UAE',
    category: 'social',
    title: 'People of Determination — Support Services',
    content: `The UAE provides comprehensive support for People of Determination (individuals with disabilities) across all emirates.

Key services:
- Determination Card (Bata'qa Al Himma): Issued by Ministry of Community Development. Provides access to discounts and priority services.
- Parking permits: Free designated parking across UAE.
- Education: Inclusive education programs in public and private schools.
- Employment: Mandatory 1% employment quota for People of Determination in private sector companies with 50+ employees (Federal Law No. 29 of 2006).

Apply via:
- Ministry of Community Development: mocd.gov.ae
- Each emirate's social services authority

---

خدمات دعم ذوي الهمم في الإمارات

توفر الإمارات دعماً شاملاً لذوي الهمم في جميع الإمارات.

الخدمات الرئيسية:
- بطاقة الهمة: تصدرها وزارة تنمية المجتمع وتتيح الخصومات والأولوية في الخدمات.
- تصاريح مواقف: مواقف مخصصة مجانية في جميع أنحاء الإمارات.
- التعليم: برامج التعليم الدامج في المدارس الحكومية والخاصة.
- التوظيف: حصة إلزامية 1% لتوظيف ذوي الهمم في الشركات الخاصة التي لديها 50 موظفاً فأكثر.

التقديم عبر: وزارة تنمية المجتمع (mocd.gov.ae) أو جهة الخدمات الاجتماعية في كل إمارة.`
  },

  {
    id: 'POL-028',
    emirate: 'All UAE',
    category: 'social',
    title: 'Retirement and End of Service Benefits',
    content: `End of service gratuity is a legal right for all private sector employees in the UAE who have completed at least 1 year of service.

Calculation (UAE Labour Law):
- 21 days basic salary per year for the first 5 years
- 30 days basic salary per year for each year beyond 5 years
- Maximum gratuity: 2 years total basic salary

Paid by employer upon resignation, termination, or contract end.
For unlimited contracts: gratuity reduces if employee resigns before 5 years.

Public sector employees in Abu Dhabi, Dubai, and Sharjah: covered by UAE Pension Authority (GPSSA) or emirate-level pension authority.

File a complaint for non-payment: Ministry of Human Resources and Emiratisation (mohre.gov.ae).

---

مكافأة نهاية الخدمة والتقاعد في الإمارات

مكافأة نهاية الخدمة حق قانوني لجميع موظفي القطاع الخاص الذين أتمّوا سنة خدمة على الأقل.

الحساب (قانون العمل الإماراتي):
- 21 يوماً من الراتب الأساسي عن كل سنة للسنوات الخمس الأولى
- 30 يوماً من الراتب الأساسي عن كل سنة تتجاوز الخمس سنوات
- الحد الأقصى: راتب أساسي لسنتين

يدفعها صاحب العمل عند الاستقالة أو الإنهاء أو انتهاء العقد.
للشكوى عند عدم الدفع: وزارة الموارد البشرية والتوطين (mohre.gov.ae).`
  },

  {
    id: 'POL-031',
    emirate: 'All UAE',
    category: 'identity',
    title: 'Birth Certificate Registration',
    content: `Birth certificates in the UAE must be registered within 30 days of birth. Late registration (after 30 days) requires additional approvals.

Abu Dhabi: Register at SEHA hospitals or via TAMM platform.
Dubai: Register at DHA hospitals or via Dubai Health Authority.
Other emirates: Register at the Ministry of Health hospital where the birth occurred.

Required documents:
- Hospital birth notification
- Parents' passports and Emirates IDs
- Parents' marriage certificate
- UAE residence visa of the mother

The birth certificate is required for Emirates ID registration and residence visa for the child.

---

تسجيل شهادات الميلاد في الإمارات

يجب تسجيل شهادات الميلاد في الإمارات خلال 30 يوماً من الولادة.

أبوظبي: في مستشفيات صحة أو عبر منصة تام.
دبي: في مستشفيات هيئة الصحة أو عبر الهيئة.
باقي الإمارات: في مستشفى وزارة الصحة حيث جرت الولادة.

المستندات المطلوبة:
- إشعار الولادة من المستشفى
- جوازات سفر الوالدين وهوياتهم الإماراتية
- عقد زواج الوالدين
- تأشيرة إقامة الأم في الإمارات`
  },

  {
    id: 'POL-032',
    emirate: 'All UAE',
    category: 'identity',
    title: 'Marriage Certificate — UAE',
    content: `Marriage registration and attestation in the UAE applies to both Muslims and non-Muslims.

Muslim marriages: Registered at the Islamic Affairs and Charitable Activities Department (IACAD) in Dubai, or equivalent authority in each emirate.

Non-Muslim marriages: Registered at the Abu Dhabi Judicial Department (for Abu Dhabi) or Personal Status Courts.

Foreign marriage certificates must be attested by:
1. Country of origin's Ministry of Foreign Affairs
2. UAE Embassy in that country
3. UAE Ministry of Foreign Affairs

Required for: family visa applications, residence visa for spouse, Emirates ID for spouse.

---

تسجيل عقد الزواج في الإمارات

ينطبق تسجيل الزواج وتوثيقه في الإمارات على المسلمين وغير المسلمين.

زواج المسلمين: يُسجَّل في دائرة الشؤون الإسلامية والعمل الخيري في دبي أو الجهة المعادلة في كل إمارة.
زواج غير المسلمين: يُسجَّل في دائرة القضاء في أبوظبي أو محاكم الأحوال الشخصية.

يجب توثيق شهادات الزواج الأجنبية عبر: وزارة الخارجية في بلد المنشأ، ثم السفارة الإماراتية، ثم وزارة الخارجية الإماراتية.`
  },

  {
    id: 'POL-033',
    emirate: 'All UAE',
    category: 'identity',
    title: 'UAE Passport Renewal — Nationals',
    content: `UAE national passport renewal is handled by the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP).

Apply via:
- ICP Smart Services (icp.gov.ae)
- TAMM platform (Abu Dhabi)
- UAE Pass app

Required documents:
- Current UAE passport
- Emirates ID
- Recent passport-size photograph

Fees: Vary by processing speed (normal, urgent, express).
Processing time: 2–7 working days.

Expatriates must renew their home country passport through their home country embassy in the UAE.

---

تجديد جواز السفر الإماراتي للمواطنين

تُنجز الهيئة الاتحادية للهوية والجنسية والجمارك وأمن المنافذ (ICP) تجديد جوازات السفر الإماراتية.

التقديم عبر: موقع ICP (icp.gov.ae) أو منصة تام أو تطبيق الهوية الرقمية UAE Pass.

المستندات المطلوبة:
- جواز السفر الحالي
- الهوية الإماراتية
- صورة شخصية حديثة

وقت المعالجة: 2-7 أيام عمل. الرسوم تختلف حسب سرعة الإنجاز.`
  },

  {
    id: 'POL-034',
    emirate: 'All UAE',
    category: 'environment',
    title: 'Noise and Environmental Complaints',
    content: `Environmental and noise complaints can be filed with the relevant authority in each emirate.

Abu Dhabi: Environment Agency Abu Dhabi (EAD) — ead.gov.ae or call 800-EAD (323).
Dubai: Dubai Municipality Environment Department — dm.gov.ae or Dubai Now app.
Sharjah: Sharjah Environment and Protected Areas Authority — epaa.shj.ae.
Ajman: Ajman Municipality — ajman.ae.
Umm Al Quwain: UAQ Municipality.
Ras Al Khaimah: RAK Environment and Protected Areas Authority.
Fujairah: Fujairah Municipality.

Common reportable issues: construction noise, air/water pollution, illegal dumping, industrial emissions.

---

شكاوى الضوضاء والبيئة في الإمارات

يمكن تقديم شكاوى بيئية وشكاوى الضوضاء للجهة المختصة في كل إمارة.

أبوظبي: هيئة البيئة أبوظبي (ead.gov.ae) أو الاتصال على 800-323.
دبي: دائرة البيئة ببلدية دبي (dm.gov.ae) أو تطبيق دبي ناو.
الشارقة: هيئة البيئة والمناطق المحمية في الشارقة (epaa.shj.ae).
عجمان: بلدية عجمان (ajman.ae).
أم القيوين: بلدية أم القيوين.
رأس الخيمة: هيئة البيئة والمناطق المحمية برأس الخيمة.
الفجيرة: بلدية الفجيرة.`
  },

  {
    id: 'POL-035',
    emirate: 'All UAE',
    category: 'identity',
    title: 'Golden Visa Application',
    content: `The UAE Golden Visa grants long-term residency of 5 or 10 years to eligible individuals without needing a sponsor.

Eligible categories (10-year Golden Visa):
- Investors: Minimum AED 2 million real estate investment or AED 2 million in a UAE company
- Entrepreneurs: Owner of a project valued at AED 500,000+
- Specialized talents: Doctors, engineers, scientists, artists, athletes
- Outstanding students: Top graduates from UAE or international universities
- Humanitarian pioneers

Eligible categories (5-year Golden Visa):
- Property owners with property valued at AED 750,000+
- Real estate investors

Apply via:
- ICA Smart Services (icp.gov.ae)
- TAMM (Abu Dhabi)
- GDRFA Dubai

Benefits: 10-year residence, sponsor family members, self-sponsorship, multiple entry.

---

طلب الإقامة الذهبية في الإمارات

تمنح الإقامة الذهبية إقامة طويلة الأمد لمدة 5 أو 10 سنوات دون الحاجة إلى كفيل.

فئات الأهلية (إقامة 10 سنوات):
- المستثمرون: حد أدنى 2 مليون درهم في العقارات أو الشركات الإماراتية
- رواد الأعمال: أصحاب مشاريع بقيمة 500,000 درهم فأكثر
- الكفاءات المتخصصة: أطباء، مهندسون، علماء، فنانون، رياضيون
- الطلاب المتميزون: خريجو الجامعات الإماراتية والدولية بتقدير مميز
- الرواد الإنسانيون

فئات أهلية الإقامة الذهبية (5 سنوات):
- مالكو العقارات بقيمة 750,000 درهم فأكثر

التقديم عبر: icp.gov.ae أو منصة تام أو GDRFA دبي.
المزايا: إقامة 10 سنوات، كفالة أفراد الأسرة، الكفالة الذاتية، تأشيرة متعددة الدخول.`
  },

  // ─── ABU DHABI ────────────────────────────────────────────────────────────

  {
    id: 'POL-010',
    emirate: 'Abu Dhabi',
    category: 'healthcare',
    title: 'Health Card Application — Abu Dhabi',
    content: `The Abu Dhabi Health Card (Daman) provides access to government healthcare services in Abu Dhabi.

Eligible: UAE nationals and expatriate residents of Abu Dhabi.

Apply via:
- Daman website (damanhealth.ae)
- TAMM platform (tamm.abudhabi)
- Abu Dhabi Department of Health service centers

Required documents:
- Emirates ID
- Residence visa
- Passport

Health insurance is mandatory for all Abu Dhabi residents. Employers must provide health insurance for employees. Domestic workers' insurance is the sponsor's responsibility.

---

طلب البطاقة الصحية في أبوظبي

توفر البطاقة الصحية لأبوظبي (ضمان) الوصول إلى خدمات الرعاية الصحية الحكومية.

المستحقون: المواطنون والمقيمون الأجانب في أبوظبي.

التقديم عبر: موقع ضمان (damanhealth.ae) أو منصة تام أو مراكز دائرة الصحة.

المستندات المطلوبة: الهوية الإماراتية، تأشيرة الإقامة، جواز السفر.
التأمين الصحي إلزامي لجميع مقيمي أبوظبي.`
  },

  {
    id: 'POL-012',
    emirate: 'Abu Dhabi',
    category: 'education',
    title: 'School Enrollment — Abu Dhabi (ADEK)',
    content: `School enrollment in Abu Dhabi is regulated by the Abu Dhabi Department of Education and Knowledge (ADEK).

Public schools (free for UAE nationals): Enroll via ADEK portal (adek.gov.ae).
Private schools: Apply directly to the school. ADEK licenses and regulates all private schools.

General enrollment requirements:
- Emirates ID of child and parents
- Birth certificate (attested)
- Previous school records (transfer students)
- Vaccination record
- Passport copies

Enrollment periods: March–May for the following academic year (September start).
Age for KG1: Child must turn 4 by 31 December of enrollment year.

---

التسجيل المدرسي في أبوظبي (ADEK)

تُشرف دائرة التعليم والمعرفة في أبوظبي (ADEK) على التسجيل المدرسي.

المدارس الحكومية (مجانية للمواطنين): التسجيل عبر بوابة ADEK (adek.gov.ae).
المدارس الخاصة: التقديم مباشرة للمدرسة. تُرخِّص ADEK جميع المدارس الخاصة وتُنظِّمها.

متطلبات التسجيل العامة:
- الهوية الإماراتية للطفل والوالدين
- شهادة الميلاد (موثقة)
- السجلات المدرسية السابقة (للمنتقلين)
- سجل التطعيمات
- صور جوازات السفر

فترات التسجيل: مارس-مايو للعام الدراسي التالي.`
  },

  {
    id: 'POL-015',
    emirate: 'Abu Dhabi',
    category: 'healthcare',
    title: 'Health Insurance — Abu Dhabi (HAAD/DoH)',
    content: `Health insurance is mandatory for all Abu Dhabi residents under the Health Authority Abu Dhabi (now Department of Health — DoH).

Employers must provide health insurance for all employees.
Sponsors must provide health insurance for sponsored dependents and domestic workers.

Minimum coverage (Basic Health Insurance Plan):
- Inpatient and outpatient care
- Emergency care
- Maternity care
- Chronic disease management

Regulated by: Department of Health Abu Dhabi (DOH) — doh.gov.ae
Insurance providers must be licensed by DOH.

Fine for employer non-compliance: AED 500 per uninsured employee per month.

---

التأمين الصحي الإلزامي في أبوظبي (DoH)

التأمين الصحي إلزامي لجميع مقيمي أبوظبي بموجب دائرة الصحة.

يجب على أصحاب العمل توفير التأمين الصحي لجميع موظفيهم.
يجب على الكفلاء توفير التأمين الصحي للمعالين والعمالة المنزلية.

الحد الأدنى من التغطية:
- الرعاية الداخلية والخارجية
- الرعاية الطارئة
- رعاية الأمومة
- إدارة الأمراض المزمنة

الجهة التنظيمية: دائرة الصحة أبوظبي (doh.gov.ae).
غرامة المخالفة: 500 درهم لكل موظف غير مؤمَّن شهرياً.`
  },

  {
    id: 'POL-019',
    emirate: 'Abu Dhabi',
    category: 'housing',
    title: 'Tawtheeq Tenancy Registration — Abu Dhabi',
    content: `Tawtheeq is Abu Dhabi's official tenancy contract registration system, managed by the Department of Municipalities and Transport (DMT).

Registration is mandatory for all rental agreements in Abu Dhabi.
The landlord (or property manager) is legally responsible for registering the contract.

Register via:
- TAMM platform (tamm.abudhabi) using UAE Pass
- SmartHub platform

Required documents:
- Signed tenancy agreement
- Landlord's Emirates ID and ownership documents
- Tenant's Emirates ID and residence visa

Fees:
- Property first registration: AED 900 per property (landlord's responsibility)
- New tenancy contract: AED 50 per year
- Contract renewal: AED 50 per year

A valid Tawtheeq contract is required to activate ADDC (water and electricity) services.

---

نظام توثيق عقود الإيجار في أبوظبي

توثيق هو نظام تسجيل عقود الإيجار الرسمي في أبوظبي، تديره دائرة البلديات والنقل.

التسجيل إلزامي لجميع عقود الإيجار في أبوظبي. المالك (أو مدير العقار) مسؤول قانونياً عن تسجيل العقد.

التسجيل عبر: منصة تام (tamm.abudhabi) باستخدام UAE Pass أو منصة SmartHub.

الرسوم:
- أول تسجيل عقار: 900 درهم لكل عقار (على المالك)
- عقد إيجار جديد: 50 درهم سنوياً
- تجديد العقد: 50 درهم سنوياً

يُشترط عقد توثيق ساري للحصول على خدمات شركة توزيع الكهرباء والمياه (ADDC).`
  },

  {
    id: 'POL-022',
    emirate: 'Abu Dhabi',
    category: 'business',
    title: 'Trade License Renewal — Abu Dhabi',
    content: `Trade licenses in Abu Dhabi are issued and renewed by the Abu Dhabi Department of Economic Development (ADDED).

Renew via:
- TAMM platform (tamm.abudhabi)
- ADDED website (added.gov.ae)
- Abu Dhabi service centers

Required documents for renewal:
- Current trade license
- Tenancy contract (Tawtheeq registered)
- Partner/owner passport copies and Emirates IDs
- No objection certificates where applicable

Fees: Vary by business activity, legal structure, and office size. Contact ADDED for exact fees.
Renewal must be done annually before license expiry.
Grace period: 30 days after expiry before fines apply.

---

تجديد الرخصة التجارية في أبوظبي

تُصدر دائرة التنمية الاقتصادية في أبوظبي (ADDED) الرخص التجارية وتجدّدها.

التجديد عبر: منصة تام أو موقع ADDED (added.gov.ae) أو مراكز الخدمة.

المستندات المطلوبة للتجديد:
- الرخصة التجارية الحالية
- عقد الإيجار (مسجَّل في توثيق)
- صور جوازات الشركاء/الملاك وهوياتهم
- شهادات عدم ممانعة عند الاقتضاء

يجب التجديد سنوياً قبل انتهاء الرخصة. فترة السماح: 30 يوماً بعد الانتهاء.`
  },

  {
    id: 'POL-025',
    emirate: 'Abu Dhabi',
    category: 'social',
    title: 'Social Support Application — Abu Dhabi',
    content: `Social support in Abu Dhabi is managed by the Department of Community Development (DCD).

Eligible for support:
- Low-income UAE national families
- Widows and divorcees
- Orphans
- Families of prisoners
- Individuals with disabilities

Apply via:
- TAMM platform (tamm.abudhabi)
- DCD website (dcd.gov.ae)
- Abu Dhabi Social Support Centers

Required documents:
- Emirates ID
- Family book (Khulasat Al Qaid) for nationals
- Proof of income and financial status
- Medical reports (where applicable)

---

طلب الدعم الاجتماعي في أبوظبي

تُدير دائرة التنمية المجتمعية (DCD) الدعم الاجتماعي في أبوظبي.

المستحقون للدعم:
- الأسر الإماراتية ذات الدخل المنخفض
- الأرامل والمطلقات
- الأيتام
- أسر المسجونين
- ذوو الإعاقات

التقديم عبر: منصة تام أو موقع DCD (dcd.gov.ae) أو مراكز الدعم الاجتماعي.

المستندات المطلوبة: الهوية الإماراتية، خلاصة القيد للمواطنين، إثبات الدخل، التقارير الطبية عند الاقتضاء.`
  },

  {
    id: 'POL-030',
    emirate: 'Abu Dhabi',
    category: 'utilities',
    title: 'ADDC/AADC Connection — Abu Dhabi',
    content: `Electricity and water connections in Abu Dhabi are managed by Abu Dhabi Distribution Company (ADDC) for Abu Dhabi city, and Al Ain Distribution Company (AADC) for Al Ain.

Apply via:
- ADDC website (addc.ae) or app
- TAMM platform (tamm.abudhabi)
- ADDC service centers

Required documents:
- Valid Tawtheeq (tenancy contract registration) — mandatory
- Emirates ID
- Property ownership document (for owners)

A security deposit is required (amount varies by property type).
Processing time: 1–3 working days after document submission.

---

توصيل الكهرباء والمياه في أبوظبي

تُدير شركة أبوظبي لتوزيع الكهرباء والمياه (ADDC) توصيل الكهرباء والمياه في مدينة أبوظبي، وشركة العين لتوزيع الكهرباء والمياه (AADC) لمدينة العين.

التقديم عبر: موقع ADDC (addc.ae) أو تطبيقها أو منصة تام أو مراكز الخدمة.

المستندات المطلوبة:
- عقد توثيق ساري (إلزامي)
- الهوية الإماراتية
- وثيقة ملكية العقار (للملاك)

يُطلب مبلغ تأمين يختلف حسب نوع العقار. وقت المعالجة: 1-3 أيام عمل.`
  },

  // ─── DUBAI ───────────────────────────────────────────────────────────────

  {
    id: 'POL-009',
    emirate: 'Dubai',
    category: 'social',
    title: 'Muwafaq Social Support — Dubai',
    content: `Social support in Dubai is managed by the Community Development Authority (CDA) through the Muwafaq program.

Eligible for support:
- Low-income UAE national families in Dubai
- Orphans and children of unknown parentage
- Elderly without family support
- Individuals with disabilities

Apply via:
- CDA website (cda.gov.ae)
- Dubai Now app
- CDA service centers in Dubai

Required documents:
- Emirates ID
- Family book (for nationals)
- Proof of residence in Dubai
- Financial status documentation

---

برنامج موافق للدعم الاجتماعي في دبي

تُدير هيئة تنمية المجتمع (CDA) الدعم الاجتماعي في دبي عبر برنامج موافق.

المستحقون للدعم:
- الأسر الإماراتية ذات الدخل المنخفض في دبي
- الأيتام ومجهولو النسب
- كبار السن بلا دعم أسري
- ذوو الإعاقات

التقديم عبر: موقع CDA (cda.gov.ae) أو تطبيق دبي ناو أو مراكز الهيئة في دبي.`
  },

  {
    id: 'POL-011',
    emirate: 'Dubai',
    category: 'education',
    title: 'School Enrollment — Dubai (KHDA)',
    content: `School enrollment in Dubai is regulated by the Knowledge and Human Development Authority (KHDA).

Public schools (free for UAE nationals): Managed by Dubai Schools (formerly DSOA schools).
Private schools: Apply directly to the school. KHDA licenses and inspects all private schools.

Enrollment requirements:
- Emirates ID of child and parents
- Birth certificate (attested)
- Previous school records (transfer students)
- Vaccination record
- Passport copies

Enrollment periods: Typically February–April for the following September academic year.
Age for KG1: Child must turn 4 by 31 August of the enrollment year.

Inspect school ratings at: khda.gov.ae

---

التسجيل المدرسي في دبي (KHDA)

تُنظِّم هيئة المعرفة والتنمية البشرية (KHDA) التسجيل المدرسي في دبي.

المدارس الحكومية (مجانية للمواطنين): تُدارها مدارس دبي.
المدارس الخاصة: التقديم مباشرة للمدرسة. KHDA تُرخِّص وتتفقد جميع المدارس.

متطلبات التسجيل:
- الهوية الإماراتية للطفل والوالدين
- شهادة الميلاد (موثقة)
- السجلات المدرسية السابقة (للمنتقلين)
- سجل التطعيمات
- صور جوازات السفر

فترات التسجيل: فبراير-أبريل للعام الدراسي التالي (سبتمبر).`
  },

  {
    id: 'POL-014',
    emirate: 'Dubai',
    category: 'healthcare',
    title: 'Health Insurance — Dubai (DHA)',
    content: `Health insurance is mandatory for all Dubai residents under the Dubai Health Authority (DHA).

Employers must provide health insurance for all employees.
Sponsors must provide health insurance for sponsored dependents and domestic workers.

Minimum coverage (Essential Benefits Plan — EBP):
- Annual limit: AED 150,000 per year
- Covers: Emergency care, inpatient and outpatient treatment, maternity care
- Co-payment: 20% of costs up to AED 500 per claim, maximum AED 1,000 per year (inpatient)
- Outpatient co-payment: 25% up to AED 100 per visit

Insurance must be from a DHA-approved provider. List available at dha.gov.ae.

Fine for employer non-compliance: AED 500 per uninsured employee per month.

---

التأمين الصحي الإلزامي في دبي (DHA)

التأمين الصحي إلزامي لجميع مقيمي دبي بموجب هيئة الصحة بدبي (DHA).

يجب على أصحاب العمل توفير التأمين لجميع موظفيهم والكفلاء توفيره للمعالين.

الحد الأدنى من التغطية (خطة المنافع الأساسية):
- السقف السنوي: 150,000 درهم سنوياً
- التغطية: الطوارئ، العلاج الداخلي والخارجي، الأمومة
- المشاركة: 20% حتى 500 درهم لكل مطالبة، بحد أقصى 1,000 درهم سنوياً (داخلي)

غرامة المخالفة: 500 درهم لكل موظف غير مؤمَّن شهرياً.`
  },

  {
    id: 'POL-017',
    emirate: 'Dubai',
    category: 'healthcare',
    title: 'Dubai Health Authority (DHA) Professional License',
    content: `Healthcare professionals working in Dubai must obtain a DHA professional license before practicing.

Eligible professions: Doctors, nurses, pharmacists, dentists, physiotherapists, and all regulated healthcare roles.

Apply via:
- Sheryan platform (sheryan.dha.gov.ae)

Requirements:
- Primary source verification of qualifications
- Good Standing Certificate from previous licensing authority
- UAE residence visa
- Emirates ID
- Medical fitness certificate
- Valid health insurance

Exam: Some professions require a DHA licensing exam.

Processing time: Varies by profession; typically 4–12 weeks.
License must be renewed annually.

---

رخصة المهن الصحية من هيئة الصحة بدبي (DHA)

يجب على المهنيين الصحيين العاملين في دبي الحصول على رخصة مهنية من DHA قبل مزاولة العمل.

المهن المؤهلة: الأطباء، الممرضون، الصيادلة، أطباء الأسنان، المعالجون الفيزيائيون وجميع المهن الصحية المنظَّمة.

التقديم عبر: منصة شريان (sheryan.dha.gov.ae).

المتطلبات: التحقق من المؤهلات، شهادة حسن السيرة من جهة الترخيص السابقة، الإقامة، الهوية، اللياقة الطبية، التأمين الصحي.
قد يُشترط اجتياز اختبار ترخيص DHA في بعض المهن. وقت المعالجة: 4-12 أسبوعاً. تُجدَّد الرخصة سنوياً.`
  },

  {
    id: 'POL-018',
    emirate: 'Dubai',
    category: 'housing',
    title: 'Ejari Tenancy Registration — Dubai',
    content: `Ejari is Dubai's official tenancy contract registration system, managed by the Real Estate Regulatory Authority (RERA) under the Dubai Land Department (DLD).

All tenancy contracts in Dubai must be registered with Ejari. The tenant is typically responsible for registration.

Register via:
- Dubai REST app
- DLD website (dubailand.gov.ae)
- Ejari typing centers across Dubai
- RERA-registered real estate brokers

Required documents:
- Signed tenancy contract
- Landlord's Emirates ID or passport
- Tenant's Emirates ID and residence visa
- Previous Ejari certificate (for renewal)
- DEWA premise number

Fee: AED 220 (online) or AED 220 + typing center service charge (in person).

Ejari is required to activate DEWA (electricity and water) and for visa applications.

---

تسجيل عقد الإيجار في إيجاري — دبي

إيجاري هو نظام تسجيل عقود الإيجار الرسمي في دبي، يديره مؤسسة التنظيم العقاري (RERA) التابعة لدائرة الأراضي والأملاك.

يجب تسجيل جميع عقود الإيجار في دبي مع إيجاري. المستأجر عادةً مسؤول عن التسجيل.

التسجيل عبر: تطبيق Dubai REST أو موقع DLD أو مراكز الطباعة المعتمدة.

المستندات المطلوبة: عقد الإيجار الموقَّع، هوية المالك أو جواز سفره، هوية المستأجر وتأشيرة إقامته، شهادة إيجاري السابقة (للتجديد)، رقم مبنى DEWA.

الرسوم: 220 درهم (إلكترونياً). يُشترط إيجاري لتفعيل خدمات DEWA وتقديم طلبات التأشيرة.`
  },

  {
    id: 'POL-021',
    emirate: 'Dubai',
    category: 'business',
    title: 'Trade License Renewal — Dubai',
    content: `Trade licenses in Dubai are issued by the Department of Economy and Tourism (DET), formerly Dubai Economic Department (DED).

Renew via:
- Dubai Now app
- DET website (dubaided.gov.ae)
- Amer Centers
- Business registration service centers

Required documents for renewal:
- Current trade license
- Ejari-registered tenancy contract
- Partner/owner passport copies and Emirates IDs
- Activity-specific approvals where required

Fees: Vary by business activity and number of activities. Contact DET for exact fees.
Annual renewal required before license expiry.
Grace period: 30 days after expiry.

---

تجديد الرخصة التجارية في دبي

تُصدر دائرة الاقتصاد والسياحة في دبي (DET) الرخص التجارية وتجدِّدها.

التجديد عبر: تطبيق دبي ناو أو موقع DET أو مراكز أمر أو مراكز خدمة تسجيل الأعمال.

المستندات المطلوبة للتجديد:
- الرخصة التجارية الحالية
- عقد إيجار مسجَّل في إيجاري
- صور جوازات الشركاء/الملاك وهوياتهم
- موافقات خاصة بالنشاط عند الاقتضاء

التجديد سنوياً قبل انتهاء الرخصة. فترة السماح: 30 يوماً.`
  },

  {
    id: 'POL-029',
    emirate: 'Dubai',
    category: 'utilities',
    title: 'DEWA Connection — Dubai',
    content: `Electricity and water connections in Dubai are provided by Dubai Electricity and Water Authority (DEWA).

Apply via:
- DEWA website (dewa.gov.ae)
- DEWA app
- Dubai Now app

Required documents:
- Valid Ejari certificate — mandatory
- Emirates ID
- Property ownership document (for owners)

Security deposit: AED 2,000 for apartments, AED 4,000 for villas (refundable).
Processing time: Connection within 1–2 working days after approval.
Green visa holders and UAE nationals may have different deposit requirements.

---

توصيل الكهرباء والمياه في دبي (DEWA)

تُوفِّر هيئة كهرباء ومياه دبي (DEWA) خدمات توصيل الكهرباء والمياه في دبي.

التقديم عبر: موقع DEWA (dewa.gov.ae) أو تطبيق DEWA أو تطبيق دبي ناو.

المستندات المطلوبة:
- شهادة إيجاري سارية (إلزامية)
- الهوية الإماراتية
- وثيقة الملكية (للملاك)

التأمين: 2,000 درهم للشقق، 4,000 درهم للفيلات (قابل للاسترداد).
وقت التوصيل: 1-2 يوم عمل بعد الموافقة.`
  },

  // ─── SHARJAH ─────────────────────────────────────────────────────────────

  {
    id: 'POL-037',
    emirate: 'Sharjah',
    category: 'healthcare',
    title: 'Health Insurance — Sharjah',
    content: `Health insurance is mandatory for all private sector employees and domestic workers in Sharjah as of 1 January 2025, under a UAE Cabinet decision.

Employer obligation: All private sector employers must provide health insurance as a condition for issuing or renewing employee residence permits.
Domestic worker sponsors must also provide health insurance.

Minimum coverage (Basic Workers Health Insurance — WHI Plan):
- Annual cost: AED 320 per employee per year
- Covers individuals aged 1–64 years
- Inpatient and outpatient care
- Emergency care
- No waiting period for chronic illness
- Outpatient co-payment: 25% per visit (capped at AED 100 per visit)
- Inpatient co-payment: 20% per stay (capped at AED 500 per claim)
- Medication co-payment: 30% (annual cap AED 1,500)

Purchase insurance via: whi.ae (official Workers Health Insurance portal)

Penalty for non-compliance: Monthly fines ranging from AED 300 to AED 150,000 for groups; fines double for repeat violations within one year.

---

التأمين الصحي الإلزامي في الشارقة

أصبح التأمين الصحي إلزامياً لجميع موظفي القطاع الخاص والعمالة المنزلية في الشارقة اعتباراً من 1 يناير 2025.

التزام صاحب العمل: يجب على جميع أصحاب العمل في القطاع الخاص توفير التأمين الصحي شرطاً لإصدار أو تجديد تصاريح الإقامة.

الحد الأدنى من التغطية (خطة التأمين الصحي الأساسية للعمال):
- التكلفة السنوية: 320 درهم للموظف سنوياً
- تغطي الأعمار من 1 إلى 64 سنة
- رعاية داخلية وخارجية وطوارئ
- بدون فترة انتظار للأمراض المزمنة

موقع الشراء: whi.ae (البوابة الرسمية للتأمين الصحي للعمال)

غرامة المخالفة: من 300 إلى 150,000 درهم شهرياً؛ تتضاعف الغرامة عند التكرار خلال عام.`
  },

  {
    id: 'POL-038',
    emirate: 'Sharjah',
    category: 'education',
    title: 'School Enrollment — Sharjah (SPEA)',
    content: `School enrollment in Sharjah is regulated by the Sharjah Private Education Authority (SPEA) for private schools, established under Emiri Decree No. 45 of 2018.

Public schools: Managed by the Ministry of Education Sharjah educational zone (free for UAE nationals).
Private schools: Apply directly to the school. SPEA licenses and inspects all private schools in Sharjah.

Enrollment requirements:
- Emirates ID of child and parents
- Birth certificate (attested)
- Previous school records (transfer students)
- Vaccination record
- Passport copies

Enrollment periods: Typically March–May for the following September academic year.
Age for KG1: Child must turn 4 by 31 December of the enrollment year (confirm with specific school).

Search for schools: spea.shj.ae

---

التسجيل المدرسي في الشارقة (SPEA)

تُنظِّم هيئة التعليم الخاص في الشارقة (SPEA) التسجيل في المدارس الخاصة.

المدارس الحكومية: تُدارها وزارة التربية والتعليم عبر المنطقة التعليمية في الشارقة (مجانية للمواطنين).
المدارس الخاصة: التقديم مباشرة للمدرسة. SPEA تُرخِّصها وتتفقدها.

متطلبات التسجيل:
- الهوية الإماراتية للطفل والوالدين
- شهادة الميلاد (موثقة)
- السجلات المدرسية السابقة (للمنتقلين)
- سجل التطعيمات
- صور جوازات السفر

البحث عن المدارس: spea.shj.ae`
  },

  {
    id: 'POL-039',
    emirate: 'Sharjah',
    category: 'housing',
    title: 'Tenancy Contract Registration — Sharjah (Tasdeeq)',
    content: `Tenancy contract attestation (Tasdeeq / تصديق) is mandatory for all residential and commercial rental contracts in Sharjah, managed by Sharjah City Municipality.

Register via:
- Sharjah City Municipality website (shjmun.gov.ae)
- Sharjah City Municipality service centers

Required documents:
- Signed tenancy contract
- Landlord's Emirates ID or ownership document
- Tenant's Emirates ID and residence visa
- Passport copies of both parties

Fees:
- Attestation fee: 4% of annual rent (minimum AED 500) — typically the tenant's responsibility
- In-person form fee: AED 100
- Express service: AED 150 per transaction

Processing time: Within 1 working day.

A valid attested tenancy contract is required to activate SEWA (Sharjah Electricity and Water Authority) connections.

---

تسجيل عقد الإيجار في الشارقة (التصديق)

التصديق على عقد الإيجار إلزامي لجميع عقود الإيجار السكنية والتجارية في الشارقة، تُديره بلدية مدينة الشارقة.

التسجيل عبر: موقع بلدية مدينة الشارقة (shjmun.gov.ae) أو مراكز الخدمة.

المستندات المطلوبة:
- عقد الإيجار الموقَّع
- هوية المالك أو وثيقة الملكية
- هوية المستأجر الإماراتية وتأشيرة إقامته
- صور جوازات الطرفين

الرسوم:
- رسوم التصديق: 4% من قيمة الإيجار السنوي (حد أدنى 500 درهم) — عادةً على المستأجر
- رسوم الاستمارة (حضورياً): 100 درهم
- الخدمة العاجلة: 150 درهم لكل معاملة

وقت المعالجة: يوم عمل واحد. يُشترط العقد الموثَّق لتفعيل خدمات SEWA.`
  },

  {
    id: 'POL-040',
    emirate: 'Sharjah',
    category: 'business',
    title: 'Trade License Renewal — Sharjah (SEDD)',
    content: `Trade licenses in Sharjah are issued and renewed by the Sharjah Economic Development Department (SEDD).

Renew via:
- SEDD website (sedd.gov.ae)
- SEDD service centers in Sharjah

Required documents for renewal:
- Current trade license
- Tenancy contract (Tasdeeq attested by Sharjah City Municipality)
- Partner/owner passport copies and Emirates IDs
- Activity-specific government approvals where applicable

Fees:
- Renewal fee: 13% of annual office rent, minimum AED 11,000 for mainland licenses
- Free zone licenses (SHAMS, SAIF Zone, Hamriyah): fees vary by zone

Renewal must be done annually. Grace period: 30 days after expiry before fines apply.
If expired more than 3 months: contact SEDD Inspection Division.

---

تجديد الرخصة التجارية في الشارقة (SEDD)

تُصدر دائرة التنمية الاقتصادية في الشارقة (SEDD) الرخص التجارية وتجدِّدها.

التجديد عبر: موقع SEDD (sedd.gov.ae) أو مراكز الخدمة في الشارقة.

المستندات المطلوبة للتجديد:
- الرخصة التجارية الحالية
- عقد إيجار موثَّق من بلدية الشارجة
- صور جوازات الشركاء/الملاك وهوياتهم
- موافقات حكومية خاصة بالنشاط عند الاقتضاء

الرسوم:
- رسوم التجديد: 13% من قيمة الإيجار السنوي، بحد أدنى 11,000 درهم لرخص البر الرئيسي
- رخص المناطق الحرة: تختلف حسب المنطقة

التجديد سنوياً. فترة السماح: 30 يوماً. إذا انتهت الرخصة منذ أكثر من 3 أشهر: تواصل مع قسم التفتيش في SEDD.`
  },

  // ─── AJMAN ───────────────────────────────────────────────────────────────

  {
    id: 'POL-042',
    emirate: 'Ajman',
    category: 'healthcare',
    title: 'Health Insurance — Ajman',
    content: `Health insurance is mandatory for all private sector employees and domestic workers in Ajman as of 1 January 2025, under a UAE Cabinet decision.

Employer obligation: All private sector employers must provide health insurance as a condition for issuing or renewing employee residence permits.

Minimum coverage (Basic Workers Health Insurance — WHI Plan):
- Annual cost: AED 320 per employee per year
- Covers individuals aged 1–64 years
- Inpatient and outpatient care, emergency care, no waiting period for chronic illness
- Outpatient co-payment: 25% per visit (capped at AED 100 per visit)
- Inpatient co-payment: 20% per stay (capped at AED 500 per claim)
- Medication co-payment: 30% (annual cap AED 1,500)

Purchase via: whi.ae (official Workers Health Insurance portal)

---

التأمين الصحي الإلزامي في عجمان

أصبح التأمين الصحي إلزامياً لجميع موظفي القطاع الخاص والعمالة المنزلية في عجمان اعتباراً من 1 يناير 2025.

التزام صاحب العمل: توفير التأمين الصحي شرط لإصدار أو تجديد تصاريح الإقامة.

خطة التأمين الصحي الأساسية للعمال (WHI):
- التكلفة: 320 درهم للموظف سنوياً
- تغطي الأعمار 1-64 سنة
- رعاية داخلية وخارجية وطوارئ

موقع الشراء: whi.ae`
  },

  {
    id: 'POL-043',
    emirate: 'Ajman',
    category: 'education',
    title: 'School Enrollment — Ajman',
    content: `Schools in Ajman are supervised by the Ministry of Education (MOE) through its Ajman educational zone for both public and private schools.

Public schools (free for UAE nationals): Apply through the Ministry of Education Ajman zone.
Private schools: Apply directly to the school. MOE oversees compliance and standards.

Enrollment requirements:
- Emirates ID of child and parents
- Birth certificate (attested)
- Previous school records (transfer students)
- Vaccination record
- Passport copies

Enrollment periods: Typically March–May for the following September academic year.
Age for KG1: Child must turn 4 by 31 December of the enrollment year (confirm with specific school and MOE Ajman zone).

Contact: Ajman Government portal (ajman.ae) or Ministry of Education (moe.gov.ae).

---

التسجيل المدرسي في عجمان

تُشرف وزارة التربية والتعليم على المدارس في عجمان عبر منطقتها التعليمية.

المدارس الحكومية: مجانية للمواطنين.
المدارس الخاصة: التقديم مباشرة للمدرسة.

متطلبات التسجيل:
- الهوية الإماراتية للطفل والوالدين
- شهادة الميلاد (موثقة)
- السجلات المدرسية السابقة (للمنتقلين)
- سجل التطعيمات
- صور جوازات السفر

التواصل: بوابة حكومة عجمان (ajman.ae) أو وزارة التربية والتعليم (moe.gov.ae).`
  },

  {
    id: 'POL-044',
    emirate: 'Ajman',
    category: 'business',
    title: 'Trade License Renewal — Ajman (DED)',
    content: `Trade licenses in Ajman are issued and renewed by the Ajman Department of Economic Development (Ajman DED).

Renew via:
- Ajman government portal (ajman.ae) — Digital Services Portal
- Ajman DED service centers

Required documents for renewal:
- Current trade license
- Valid tenancy contract
- Partner/owner passport copies and Emirates IDs
- Activity-specific approvals where applicable

Key fees (from official Ajman DED portal):
- Economic license renewal fee: AED 600
- Administrative services application: AED 50
- Commercial register registration: AED 200
- Unified economic activities register: AED 200
- CSR UAE Fund contribution: AED 1,500 (for companies and establishments)
- Commercial registration certificate: AED 200
- Late renewal fine: applied per month for each month expired

Renewal must be done annually before license expiry.

---

تجديد الرخصة التجارية في عجمان

تُصدر دائرة التنمية الاقتصادية في عجمان الرخص التجارية وتجدِّدها.

التجديد عبر: بوابة حكومة عجمان (ajman.ae) أو مراكز الخدمة.

المستندات المطلوبة للتجديد:
- الرخصة التجارية الحالية
- عقد إيجار ساري
- صور جوازات الشركاء/الملاك وهوياتهم

الرسوم الرئيسية (من بوابة عجمان الرسمية):
- رسوم تجديد الرخصة الاقتصادية: 600 درهم
- طلب الخدمات الإدارية: 50 درهم
- تسجيل السجل التجاري: 200 درهم
- مساهمة صندوق CSR الإماراتي: 1,500 درهم

التجديد سنوياً قبل انتهاء الرخصة.`
  },

  // ─── UMM AL QUWAIN ───────────────────────────────────────────────────────

  {
    id: 'POL-046',
    emirate: 'Umm Al Quwain',
    category: 'healthcare',
    title: 'Health Insurance — Umm Al Quwain',
    content: `Health insurance is mandatory for all private sector employees and domestic workers in Umm Al Quwain as of 1 January 2025, under a UAE Cabinet decision.

Employer obligation: All private sector employers must provide health insurance as a condition for issuing or renewing employee residence permits.

Minimum coverage (Basic Workers Health Insurance — WHI Plan):
- Annual cost: AED 320 per employee per year
- Covers individuals aged 1–64 years
- Inpatient and outpatient care, emergency care
- No waiting period for chronic illness

Purchase via: whi.ae (official Workers Health Insurance portal)

For healthcare facilities and hospitals in Umm Al Quwain: contact UAQ Department of Health or Ministry of Health (moh.gov.ae).

---

التأمين الصحي الإلزامي في أم القيوين

أصبح التأمين الصحي إلزامياً لجميع موظفي القطاع الخاص والعمالة المنزلية في أم القيوين اعتباراً من 1 يناير 2025.

خطة التأمين الصحي الأساسية للعمال:
- التكلفة: 320 درهم للموظف سنوياً
- تغطي الأعمار 1-64 سنة
- رعاية داخلية وخارجية وطوارئ

موقع الشراء: whi.ae
للمرافق الصحية: وزارة الصحة (moh.gov.ae).`
  },

  {
    id: 'POL-047',
    emirate: 'Umm Al Quwain',
    category: 'education',
    title: 'School Enrollment — Umm Al Quwain',
    content: `Schools in Umm Al Quwain are supervised by the Ministry of Education (MOE) through its regional educational zone.

Public schools (free for UAE nationals): Apply through the MOE Umm Al Quwain educational zone.
Private schools: Apply directly to the school. MOE oversees compliance and quality.

Enrollment requirements:
- Emirates ID of child and parents
- Birth certificate (attested)
- Previous school records (transfer students)
- Vaccination record
- Passport copies

Contact: Ministry of Education (moe.gov.ae) or UAQ Government portal for local school listings and enrollment information.

---

التسجيل المدرسي في أم القيوين

تُشرف وزارة التربية والتعليم على المدارس في أم القيوين عبر منطقتها التعليمية.

المدارس الحكومية: مجانية للمواطنين.
المدارس الخاصة: التقديم مباشرة للمدرسة.

متطلبات التسجيل:
- الهوية الإماراتية للطفل والوالدين
- شهادة الميلاد (موثقة)
- السجلات المدرسية السابقة (للمنتقلين)
- سجل التطعيمات

التواصل: وزارة التربية والتعليم (moe.gov.ae).`
  },

  // ─── RAS AL KHAIMAH ──────────────────────────────────────────────────────

  {
    id: 'POL-049',
    emirate: 'Ras Al Khaimah',
    category: 'healthcare',
    title: 'Health Insurance — Ras Al Khaimah',
    content: `Health insurance is mandatory for all private sector employees and domestic workers in Ras Al Khaimah as of 1 January 2025, under a UAE Cabinet decision.

Employer obligation: All private sector employers must provide health insurance as a condition for issuing or renewing employee residence permits.

Minimum coverage (Basic Workers Health Insurance — WHI Plan):
- Annual cost: AED 320 per employee per year
- Covers individuals aged 1–64 years
- Inpatient and outpatient care, emergency care
- No waiting period for chronic illness

Purchase via: whi.ae (official Workers Health Insurance portal)

For healthcare in RAK: RAK Hospital, Ibrahim Bin Hamad Obaidallah Hospital, and Ministry of Health clinics.
Contact: RAK Government portal (rak.ae) or Ministry of Health (moh.gov.ae).

---

التأمين الصحي الإلزامي في رأس الخيمة

أصبح التأمين الصحي إلزامياً لجميع موظفي القطاع الخاص والعمالة المنزلية في رأس الخيمة اعتباراً من 1 يناير 2025.

خطة التأمين الصحي الأساسية للعمال:
- التكلفة: 320 درهم للموظف سنوياً
- تغطي الأعمار 1-64 سنة
- رعاية داخلية وخارجية وطوارئ بلا فترة انتظار للأمراض المزمنة

موقع الشراء: whi.ae
للرعاية الصحية في رأس الخيمة: مستشفى رأس الخيمة ومستشفى إبراهيم بن حمد عبيدالله وعيادات وزارة الصحة.`
  },

  {
    id: 'POL-050',
    emirate: 'Ras Al Khaimah',
    category: 'education',
    title: 'School Enrollment — Ras Al Khaimah',
    content: `Schools in Ras Al Khaimah are supervised by the Ministry of Education (MOE) through its RAK educational zone.

Public schools (free for UAE nationals): Apply through the MOE Ras Al Khaimah educational zone.
Private schools: Apply directly to the school. MOE oversees compliance.

Enrollment requirements:
- Emirates ID of child and parents
- Birth certificate (attested)
- Previous school records (transfer students)
- Vaccination record
- Passport copies

Search for schools: RAK Government portal (rak.ae) or Ministry of Education (moe.gov.ae).

---

التسجيل المدرسي في رأس الخيمة

تُشرف وزارة التربية والتعليم على المدارس في رأس الخيمة عبر منطقتها التعليمية.

المدارس الحكومية: مجانية للمواطنين.
المدارس الخاصة: التقديم مباشرة للمدرسة.

متطلبات التسجيل:
- الهوية الإماراتية للطفل والوالدين
- شهادة الميلاد (موثقة)
- السجلات المدرسية السابقة
- سجل التطعيمات

البحث عن المدارس: bوابة حكومة رأس الخيمة (rak.ae) أو وزارة التربية والتعليم (moe.gov.ae).`
  },

  {
    id: 'POL-051',
    emirate: 'Ras Al Khaimah',
    category: 'business',
    title: 'Trade License Renewal — Ras Al Khaimah (RAK DED / RAKEZ)',
    content: `Trade licenses in Ras Al Khaimah are issued by the RAK Department of Economic Development (RAK DED) for mainland businesses, or RAKEZ (Ras Al Khaimah Economic Zone) for free zone businesses.

Renew mainland license via:
- RAK DED website or service centers

Renew RAKEZ free zone license via:
- RAKEZ portal (rakez.com)

Required documents for renewal (mainland):
- Current trade license
- Valid tenancy contract with Ejari (minimum 1-month lease)
- Partner/owner passport copies and Emirates IDs
- Activity-specific approvals where applicable

Fees:
- Mainland (RAK DED): Varies by business activity and size. Contact RAK DED for exact fees.
- RAKEZ free zone: Starting from AED 6,250/year for basic packages; varies by license type, office space, and visa allocation.

License is valid for 1 year and must be renewed annually.

---

تجديد الرخصة التجارية في رأس الخيمة

تُصدر دائرة التنمية الاقتصادية في رأس الخيمة الرخص التجارية للبر الرئيسي، وRAKEZ للمناطق الحرة.

التجديد (البر الرئيسي): عبر موقع RAK DED أو مراكز الخدمة.
التجديد (المنطقة الحرة): عبر بوابة RAKEZ (rakez.com).

المستندات المطلوبة (البر الرئيسي):
- الرخصة التجارية الحالية
- عقد إيجار ساري مع إيجاري (شهر على الأقل)
- صور جوازات الشركاء/الملاك وهوياتهم

الرسوم:
- البر الرئيسي: تختلف حسب النشاط والحجم
- RAKEZ: تبدأ من 6,250 درهم سنوياً للباقات الأساسية

الرخصة سارية لمدة سنة وتُجدَّد سنوياً.`
  },

  // ─── FUJAIRAH ────────────────────────────────────────────────────────────

  {
    id: 'POL-053',
    emirate: 'Fujairah',
    category: 'healthcare',
    title: 'Health Insurance — Fujairah',
    content: `Health insurance is mandatory for all private sector employees and domestic workers in Fujairah as of 1 January 2025, under a UAE Cabinet decision.

Employer obligation: All private sector employers must provide health insurance as a condition for issuing or renewing employee residence permits.

Minimum coverage (Basic Workers Health Insurance — WHI Plan):
- Annual cost: AED 320 per employee per year
- Covers individuals aged 1–64 years
- Inpatient and outpatient care, emergency care
- No waiting period for chronic illness

Purchase via: whi.ae (official Workers Health Insurance portal)

For healthcare in Fujairah: Fujairah Hospital and Ministry of Health clinics.
Contact: Fujairah Government portal or Ministry of Health (moh.gov.ae).

---

التأمين الصحي الإلزامي في الفجيرة

أصبح التأمين الصحي إلزامياً لجميع موظفي القطاع الخاص والعمالة المنزلية في الفجيرة اعتباراً من 1 يناير 2025.

خطة التأمين الصحي الأساسية للعمال:
- التكلفة: 320 درهم للموظف سنوياً
- تغطي الأعمار 1-64 سنة
- رعاية داخلية وخارجية وطوارئ

موقع الشراء: whi.ae
للرعاية الصحية في الفجيرة: مستشفى الفجيرة وعيادات وزارة الصحة.`
  },

  {
    id: 'POL-054',
    emirate: 'Fujairah',
    category: 'education',
    title: 'School Enrollment — Fujairah',
    content: `Schools in Fujairah are supervised by the Ministry of Education (MOE) through its Fujairah educational zone.

Public schools (free for UAE nationals): Apply through the MOE Fujairah educational zone.
Private schools: Apply directly to the school. MOE ensures compliance with national standards.

Enrollment requirements:
- Emirates ID of child and parents
- Birth certificate (attested)
- Previous school records (transfer students)
- Vaccination record
- Passport copies

Education in Fujairah includes vocational programs aligned with the emirate's economy (fisheries, agriculture, tourism, logistics) through the Institute of Applied Technology Fujairah.

Search for schools: Fujairah Government portal or Ministry of Education (moe.gov.ae).

---

التسجيل المدرسي في الفجيرة

تُشرف وزارة التربية والتعليم على المدارس في الفجيرة عبر منطقتها التعليمية.

المدارس الحكومية: مجانية للمواطنين.
المدارس الخاصة: التقديم مباشرة للمدرسة.

متطلبات التسجيل:
- الهوية الإماراتية للطفل والوالدين
- شهادة الميلاد (موثقة)
- السجلات المدرسية السابقة
- سجل التطعيمات

يشمل التعليم في الفجيرة برامج مهنية عبر معهد التقنية التطبيقية في الفجيرة.
البحث عن المدارس: بوابة حكومة الفجيرة أو moe.gov.ae.`
  },

  {
    id: 'POL-055',
    emirate: 'Fujairah',
    category: 'business',
    title: 'Trade License Renewal — Fujairah (FED / FFZA)',
    content: `Trade licenses in Fujairah are issued by the Fujairah Economic Department (FED) for mainland businesses, or the Fujairah Free Zone Authority (FFZA) for free zone businesses.

Renew mainland license via:
- Fujairah Economic Department (FED) service centers
- Fujairah Digital Platform

Renew FFZA free zone license via:
- FFZA portal or service centers

Required documents for renewal:
- Current trade license
- Valid tenancy contract registered with Fujairah Municipality
- Partner/owner passport copies and Emirates IDs
- Activity-specific approvals where applicable

Fees:
- Mainland (FED): Basic professional license from AED 4,500/year; varies by activity and structure. Contact FED for exact fees.
- FFZA free zone: AED 8,000–15,000/year depending on license type and package.

License is valid for 1 year and must be renewed annually.

---

تجديد الرخصة التجارية في الفجيرة

تُصدر دائرة الاقتصاد في الفجيرة (FED) رخص البر الرئيسي، وهيئة منطقة الفجيرة الحرة (FFZA) رخص المنطقة الحرة.

التجديد (البر الرئيسي): عبر مراكز دائرة الاقتصاد في الفجيرة أو المنصة الرقمية.
التجديد (المنطقة الحرة): عبر بوابة FFZA أو مراكز الخدمة.

المستندات المطلوبة للتجديد:
- الرخصة التجارية الحالية
- عقد إيجار ساري مسجَّل لدى بلدية الفجيرة
- صور جوازات الشركاء/الملاك وهوياتهم

الرسوم:
- البر الرئيسي: من 4,500 درهم سنوياً للرخص المهنية الأساسية
- FFZA: من 8,000 إلى 15,000 درهم سنوياً

الرخصة سارية لمدة سنة وتُجدَّد سنوياً.`
  },

  // ─── STEP 3 ADDITIONS (v3.7.0) — filling non-transport coverage gaps ─────

  {
    id: 'POL-056',
    emirate: 'All UAE',
    category: 'identity',
    title: 'MOI Services — Passport Loss, Emirates ID Replacement',
    content: `The Ministry of Interior (MOI) and the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) handle reporting and replacement for lost or damaged identity documents across all UAE emirates.

Lost or stolen passport:
- Report immediately at the nearest police station (any emirate) to obtain a police report — this is required before replacement can be requested.
- Expatriates: contact your home country's embassy or consulate in the UAE to issue a replacement or emergency travel document.
- UAE nationals: apply for a replacement passport via ICP Smart Services (icp.gov.ae) or the UAE Pass app, using the police report as supporting documentation.

Lost or damaged Emirates ID:
- Report loss at any ICP typing/service center or via icp.gov.ae — no police report required for the Emirates ID itself, though one may be requested for accompanying lost items.
- Apply for a replacement card via ICP Smart Services, TAMM (Abu Dhabi residents), or the ICP app.
- Replacement fee: approximately AED 300 (standard replacement), reduced fees may apply for reported theft with a police report.
- A temporary certificate can typically be issued same-day while the physical card is being reprinted (processing: 3–5 working days).

Required documents (replacement, either document):
- Police report (for theft, or where applicable)
- Valid UAE residence visa (expatriates)
- Recent passport-size photograph

---

خدمات وزارة الداخلية — فقدان جواز السفر واستبدال الهوية الإماراتية

تتولى وزارة الداخلية والهيئة الاتحادية للهوية والجنسية والجمارك وأمن المنافذ (ICP) التعامل مع فقدان أو تلف الوثائق الرسمية في جميع الإمارات.

فقدان أو سرقة جواز السفر:
- الإبلاغ فوراً في أقرب مركز شرطة للحصول على محضر رسمي، وهو مطلوب قبل طلب الاستبدال.
- المقيمون الأجانب: التواصل مع سفارة أو قنصلية بلدهم في الإمارات لإصدار بديل أو وثيقة سفر طارئة.
- المواطنون: التقديم لاستبدال الجواز عبر ICP Smart Services أو تطبيق UAE Pass مع إرفاق محضر الشرطة.

فقدان أو تلف الهوية الإماراتية:
- الإبلاغ في أي مركز طباعة تابع لـ ICP أو عبر icp.gov.ae؛ لا يُشترط محضر شرطة للبطاقة نفسها في العادة.
- التقديم للاستبدال عبر ICP Smart Services أو منصة تام (لمقيمي أبوظبي) أو تطبيق ICP.
- رسوم الاستبدال: نحو 300 درهم، وقد تُخفَّض في حالات السرقة المبلَّغ عنها بمحضر شرطة.
- يمكن إصدار شهادة مؤقتة في نفس اليوم أثناء طباعة البطاقة (المعالجة: 3-5 أيام عمل).

المستندات المطلوبة:
- محضر الشرطة (عند السرقة، أو حسب الحالة)
- تأشيرة الإقامة السارية (للمقيمين الأجانب)
- صورة شخصية حديثة`
  },

  {
    id: 'POL-057',
    emirate: 'All UAE',
    category: 'labour',
    title: 'MOHRE — Labour Complaints, End of Service Disputes, Salary Protection',
    content: `The Ministry of Human Resources and Emiratisation (MOHRE) handles private sector labour disputes, wage complaints, and end of service disputes across all UAE emirates. (Public sector and free zone employees are generally covered by separate authorities — check your specific free zone.)

Filing a labour complaint:
- Call the MOHRE hotline: 80060
- Submit via MOHRE app or website (mohre.gov.ae)
- Visit a Tas-heel or Amer service center in person

Common complaint types:
- Unpaid or delayed wages
- Non-payment of end of service gratuity
- Unlawful termination
- Contract violations (working conditions, leave entitlements)

Process:
1. MOHRE first attempts mediation between employer and employee (typically within 7–14 days).
2. If mediation fails, MOHRE refers the case to the Labour Court for a binding judicial decision.
3. Cases are generally free to file for the employee; MOHRE does not charge complaint filing fees.

Wage Protection System (WPS):
- All private sector employers must pay salaries via WPS, a system that verifies employees are paid on time and in full through registered UAE banks or exchange houses.
- Employers with repeated WPS violations face fines, work permit suspension, and referral to MOHRE for further action.
- Employees whose employer stops WPS payments should file a complaint immediately — this is treated as a priority case.

---

وزارة الموارد البشرية والتوطين — شكاوى العمل ونزاعات نهاية الخدمة وحماية الأجور

تتولى وزارة الموارد البشرية والتوطين (MOHRE) التعامل مع نزاعات العمل في القطاع الخاص عبر جميع الإمارات. (موظفو القطاع العام والمناطق الحرة يخضعون عادةً لجهات منفصلة.)

تقديم شكوى عمالية:
- الاتصال بالخط الساخن: 80060
- التقديم عبر تطبيق أو موقع الوزارة (mohre.gov.ae)
- زيارة أحد مراكز تسهيل أو أمر

أنواع الشكاوى الشائعة:
- تأخر أو عدم دفع الرواتب
- عدم دفع مكافأة نهاية الخدمة
- الفصل التعسفي
- مخالفات العقد (ظروف العمل، استحقاقات الإجازات)

الإجراءات:
1. تحاول الوزارة الوساطة بين الطرفين أولاً (خلال 7-14 يوماً عادةً).
2. عند فشل الوساطة، تحال القضية إلى محكمة العمل لإصدار حكم ملزم.
3. تقديم الشكوى مجاني للموظف في العادة.

نظام حماية الأجور (WPS):
- يجب على جميع أصحاب العمل في القطاع الخاص دفع الرواتب عبر نظام حماية الأجور، الذي يتحقق من دفع الرواتب في موعدها وبالكامل عبر بنوك أو مؤسسات صرافة مسجَّلة.
- المخالفات المتكررة تؤدي لغرامات وتعليق تصاريح العمل وإحالة الشركة للوزارة.
- على الموظف الذي يتوقف صرف راتبه عبر WPS تقديم شكوى فوراً؛ تُعامَل هذه الحالات كأولوية.`
  },

  {
    id: 'POL-058',
    emirate: 'All UAE',
    category: 'social',
    title: 'Zakat Fund — Eligibility and Application Process',
    content: `The UAE Zakat Fund (zakatfund.gov.ae), under the General Authority of Islamic Affairs and Endowments, both collects Zakat from donors and distributes it to eligible beneficiaries.

Eligibility to receive Zakat support (the eight categories recognized under Islamic law, as administered by the Zakat Fund):
- The poor (Al-Fuqara) and needy (Al-Masakin) — verified through income and asset assessment
- Zakat administrators
- Those whose hearts are to be reconciled
- Freeing captives / those in debt bondage (historical category, rarely applied in UAE context)
- Debtors unable to repay essential debts
- In the cause of Allah (community welfare projects)
- Stranded travelers in genuine need

How to apply for support:
- Submit an application via the Zakat Fund website (zakatfund.gov.ae) or in person at its Abu Dhabi or Dubai offices.
- Required documents: Emirates ID, proof of income (or lack thereof), family book (for UAE nationals), and supporting documentation for the specific hardship (medical bills, debt statements, etc.).
- Applications are reviewed by a committee; approval and disbursement timelines vary by case complexity.

How to pay Zakat (for donors):
- Calculate 2.5% of eligible zakatable assets (savings, gold, business inventory) held for one full lunar (Hijri) year above the nisab threshold.
- Pay via the Zakat Fund portal, bank transfer, or in person.
- The Fund also accepts Zakat Al-Fitr (obligatory pre-Eid charity) seasonally around Ramadan.

For broader humanitarian and charitable donations outside Zakat specifically, the Emirates Red Crescent (emiratesrc.ae) is the other major official channel.

---

صندوق الزكاة — الأهلية وإجراءات التقديم

يتولى صندوق الزكاة الإماراتي (zakatfund.gov.ae)، التابع للهيئة العامة للشؤون الإسلامية والأوقاف، جمع الزكاة وتوزيعها على المستحقين.

فئات الاستحقاق (الأصناف الثمانية الشرعية كما يديرها الصندوق):
- الفقراء والمساكين — يُتحقق منهم عبر تقييم الدخل والأصول
- العاملون على الزكاة
- المؤلفة قلوبهم
- في الرقاب (فئة تاريخية نادرة التطبيق في السياق الإماراتي)
- الغارمون (المدينون غير القادرين على السداد)
- في سبيل الله (مشاريع الرفاه المجتمعي)
- ابن السبيل (المسافر المنقطع المحتاج)

طريقة التقديم للحصول على الدعم:
- تقديم طلب عبر موقع صندوق الزكاة أو حضورياً في مكاتبه بأبوظبي أو دبي.
- المستندات المطلوبة: الهوية الإماراتية، إثبات الدخل (أو انعدامه)، خلاصة القيد (للمواطنين)، ومستندات داعمة للحالة (فواتير طبية، كشوف ديون، إلخ).
- تُراجَع الطلبات من قِبَل لجنة، وتختلف مدة الموافقة والصرف حسب تعقيد الحالة.

طريقة دفع الزكاة (للمتبرعين):
- تُحسب بنسبة 2.5% من الأصول الزكوية المؤهلة المحتفظ بها لسنة هجرية كاملة فوق حد النصاب.
- الدفع عبر بوابة الصندوق أو التحويل البنكي أو حضورياً.
- يقبل الصندوق أيضاً زكاة الفطر موسمياً حول شهر رمضان.

للتبرعات الإنسانية والخيرية الأوسع خارج نطاق الزكاة تحديداً، يُعد الهلال الأحمر الإماراتي (emiratesrc.ae) القناة الرسمية الكبرى الأخرى.`
  },

  {
    id: 'POL-059',
    emirate: 'All UAE',
    category: 'social',
    title: 'Support for People of Determination and Widows — Eligibility Deep Dive',
    content: `This expands on eligibility specifics for two of the UAE's core social support categories: People of Determination (individuals with disabilities) and widows.

People of Determination — benefits in detail:
- Determination Card (Bata'qa Al Himma): free issuance via Ministry of Community Development (mocd.gov.ae); required to access most benefits below.
- Financial assistance: monthly stipends for eligible UAE national families, amount varies by assessed need and is reviewed by MOCD or the relevant emirate authority (e.g., DCD in Dubai, DCD in Abu Dhabi).
- Free or subsidized assistive devices (wheelchairs, hearing aids) through MOCD-affiliated centers.
- Priority processing and free/discounted parking, government service queues, and public transport (where applicable).
- Employment: 1% mandatory private-sector employment quota (Federal Law No. 29 of 2006) applies to companies with 50+ employees; MOHRE monitors compliance.
- Education: inclusive education entitlement in public schools; private schools must reasonably accommodate under KHDA/ADEK/relevant authority inclusion policies.

Widows — support eligibility:
- UAE national widows may apply for social welfare support through their emirate's social/community development authority (DCD Abu Dhabi, CDA Dubai, or the equivalent MOCD-affiliated body in other emirates).
- Eligibility generally requires: UAE nationality, proof of spouse's death (death certificate), and an income/asset assessment showing financial need.
- Support can include a monthly stipend, housing assistance, and priority access to Sheikh Zayed Housing Programme benefits (za.gov.ae) for eligible national widows.
- Widows of deceased government/military personnel may additionally be eligible for a separate pension continuation through GPSSA or the relevant emirate pension authority.

Apply via: Ministry of Community Development (mocd.gov.ae) at the federal level, or your emirate's local social/community development authority.

---

دعم ذوي الهمم والأرامل — تفاصيل الأهلية

هذه السياسة تتوسع في تفاصيل أهلية فئتين أساسيتين من فئات الدعم الاجتماعي في الإمارات: ذوو الهمم والأرامل.

ذوو الهمم — المزايا بالتفصيل:
- بطاقة الهمة: تصدر مجاناً عبر وزارة تنمية المجتمع (mocd.gov.ae) وهي مطلوبة للوصول لمعظم المزايا أدناه.
- المساعدة المالية: مخصصات شهرية للأسر الإماراتية المؤهلة، يختلف المبلغ حسب تقييم الاحتياج.
- أجهزة مساعدة مجانية أو مدعومة (كراسي متحركة، سماعات) عبر مراكز تابعة لوزارة تنمية المجتمع.
- أولوية في الإجراءات ومواقف مجانية أو مخفضة وأولوية في طوابير الخدمات الحكومية.
- التوظيف: حصة إلزامية 1% في القطاع الخاص للشركات التي لديها 50 موظفاً فأكثر.
- التعليم: حق التعليم الدامج في المدارس الحكومية، والمدارس الخاصة ملزَمة بالتكيف وفق سياسات الجهات التعليمية المعنية.

الأرامل — أهلية الدعم:
- يمكن للأرملة الإماراتية التقديم للدعم الاجتماعي عبر جهة التنمية المجتمعية في إمارتها.
- تشترط الأهلية عادةً: الجنسية الإماراتية، إثبات وفاة الزوج (شهادة الوفاة)، وتقييم دخل/أصول يُظهر الحاجة المالية.
- قد يشمل الدعم مخصصاً شهرياً ومساعدة سكنية وأولوية في برنامج الشيخ زايد للإسكان (za.gov.ae) للأرامل المواطنات المؤهلات.
- أرامل منتسبي القطاع الحكومي/العسكري المتوفين قد يستحققن استمرارية معاش منفصلة عبر GPSSA أو جهة التقاعد في الإمارة.

التقديم عبر: وزارة تنمية المجتمع على المستوى الاتحادي، أو جهة التنمية المجتمعية في الإمارة.`
  },

  {
    id: 'POL-060',
    emirate: 'All UAE',
    category: 'utilities',
    title: 'Telecom Connection — Etisalat and du Setup',
    content: `The UAE has two licensed telecom operators: Etisalat by e& (etisalat.ae) and du (du.ae). Both offer mobile, home internet, and TV services across all seven emirates.

New mobile line (postpaid or prepaid):
- Visit an Etisalat or du store, or apply online/via app.
- Required: Emirates ID (or passport + visa for new residents without an Emirates ID yet — a temporary line can sometimes be issued).
- Prepaid SIMs are available with minimal documentation at airports, malls, and kiosks.
- Postpaid plans require a credit check and, for expatriates, an active residence visa.

Home internet and TV (fiber/broadband):
- Apply via etisalat.ae or du.ae, or visit a store.
- Required: Emirates ID, valid tenancy contract (Ejari for Dubai, Tawtheeq for Abu Dhabi, or the equivalent municipality-attested contract elsewhere).
- Installation is typically scheduled within 1–5 working days depending on building readiness (existing fiber infrastructure vs. new installation).
- A security deposit or first-month advance payment may apply for expatriates without a prior UAE credit history.

Which operator serves which area:
- Both operators have overlapping coverage in Dubai and Abu Dhabi.
- In some newer or more remote developments, only one operator may have infrastructure — check availability by building/community before signing a tenancy agreement if connectivity is a priority.

Cancelling or transferring service: contact the provider's customer service (Etisalat: 101, du: 155) or visit a store; early termination of a contracted plan may carry a fee.

---

توصيل خدمات الاتصالات — إعداد اتصالات ودو

تعمل في الإمارات شركتا اتصالات مرخّصتان: اتصالات by e& (etisalat.ae) ودو (du.ae)، وتقدمان خدمات الجوال والإنترنت المنزلي والتلفزيون في جميع الإمارات السبع.

خط جوال جديد (فوترة لاحقة أو مسبقة الدفع):
- زيارة أحد فروع اتصالات أو دو، أو التقديم عبر الإنترنت أو التطبيق.
- المطلوب: الهوية الإماراتية (أو جواز السفر والتأشيرة للمقيمين الجدد الذين لم يحصلوا على الهوية بعد).
- شرائح الدفع المسبق متاحة بمستندات بسيطة في المطارات والمولات والأكشاك.
- باقات الفوترة اللاحقة تتطلب فحص ائتمان، وللمقيمين الأجانب تأشيرة إقامة سارية.

الإنترنت المنزلي والتلفزيون (الألياف الضوئية):
- التقديم عبر etisalat.ae أو du.ae أو زيارة فرع.
- المطلوب: الهوية الإماراتية، وعقد إيجار ساري (إيجاري لدبي، توثيق لأبوظبي، أو ما يعادلهما في الإمارات الأخرى).
- التركيب عادةً خلال 1-5 أيام عمل حسب جاهزية البناية.
- قد يُطلب مبلغ تأمين أو دفعة الشهر الأول مقدماً للمقيمين الأجانب الجدد بدون سجل ائتماني سابق في الإمارات.

أي مشغل يخدم أي منطقة:
- تتداخل التغطية بين المشغلين في دبي وأبوظبي.
- في بعض المناطق الجديدة أو النائية، قد تتوفر بنية تحتية لمشغل واحد فقط؛ يُنصح بالتحقق قبل توقيع عقد الإيجار إذا كانت جودة الاتصال أولوية.

إلغاء أو نقل الخدمة: التواصل مع خدمة العملاء (اتصالات: 101، دو: 155) أو زيارة فرع؛ قد يترتب رسم على الإنهاء المبكر للباقات التعاقدية.`
  },

  {
    id: 'POL-061',
    emirate: 'All UAE',
    category: 'healthcare',
    title: 'Medical Fitness Certificate for Employment',
    content: `A medical fitness certificate is also commonly required as a pre-employment or occupational health requirement, separate from (though sometimes combined with) the general residence visa medical fitness test.

When employment-specific medical fitness is required:
- Certain regulated professions (healthcare workers, food handlers, aviation staff, offshore/oil and gas workers) require a role-specific occupational health clearance in addition to the standard visa medical test.
- Some employers require a general fitness-to-work certificate as part of onboarding, particularly for physically demanding roles (construction, manufacturing).

Standard visa-linked medical test (see also: Medical Fitness Certificate, POL-016) covers:
- Blood test (HIV, Hepatitis B and C, TB screening)
- Chest X-ray
- General physical examination

Employment-specific additions may include:
- Drug and alcohol screening
- Vision and hearing tests (for driving-adjacent, machinery, or aviation roles)
- Vaccination verification (particularly for healthcare and food service roles)
- Psychometric or fitness assessments (for specific high-risk occupations)

Where to apply:
- The same MOH-, DHA-, or DoH-approved medical fitness centers used for visa purposes typically offer employment-specific add-on packages — ask the center directly which tests your employer or profession requires.
- Some employers, particularly larger corporations and government entities, direct new hires to a specific approved clinic.

Fee: Employment-specific add-ons typically cost AED 100–400 on top of the standard visa medical fitness fee (AED 220–320), depending on which additional tests are required.

Results and confidentiality: Employment-related results are typically shared with the employer's HR/occupational health function only to the extent needed to confirm fitness for the role — not full medical details, per UAE health data privacy regulations.

---

شهادة اللياقة الطبية للتوظيف

تُشترط شهادة اللياقة الطبية أحياناً كمتطلب توظيف أو صحة مهنية، منفصلة عن (وقد تُدمج مع) فحص اللياقة العام لتأشيرة الإقامة.

متى تُشترط اللياقة الطبية الخاصة بالتوظيف:
- بعض المهن المنظمة (العاملون الصحيون، مناولو الأغذية، طاقم الطيران، العاملون في النفط والغاز البحري) تتطلب فحصاً مهنياً إضافياً.
- بعض أصحاب العمل يشترطون شهادة لياقة عامة للعمل كجزء من التعيين، خصوصاً للأدوار البدنية الشاقة.

الفحص القياسي المرتبط بالتأشيرة (راجع أيضاً: شهادة اللياقة الطبية، POL-016) يشمل:
- تحليل دم (فيروس نقص المناعة، التهاب الكبد B وC، السل)
- أشعة الصدر
- فحص طبي عام

إضافات خاصة بالتوظيف قد تشمل:
- فحص المخدرات والكحول
- فحوصات النظر والسمع (للأدوار المرتبطة بالقيادة أو الآلات أو الطيران)
- التحقق من التطعيمات (خصوصاً للعاملين الصحيين وفي الأغذية)
- تقييمات نفسية أو بدنية (لمهن عالية الخطورة محددة)

أماكن التقديم: نفس المراكز المعتمدة من وزارة الصحة أو DHA أو DoH المستخدمة لأغراض التأشيرة، تقدم عادة باقات إضافية خاصة بالتوظيف.

الرسوم: تتراوح الإضافات الخاصة بالتوظيف بين 100 و400 درهم فوق رسوم اللياقة القياسية (220-320 درهم).`
  },

  {
    id: 'POL-062',
    emirate: 'All UAE',
    category: 'identity',
    title: 'Death Certificate Registration and Attestation',
    content: `Death certificates in the UAE must be registered before a body can be released for burial or repatriation, and before related legal matters (inheritance, insurance claims, visa cancellation) can proceed.

Registration process:
- Deaths occurring in a hospital: the hospital issues an initial death notification, which is then registered with the relevant health authority (DHA for Dubai, DoH for Abu Dhabi, Ministry of Health for other emirates).
- Deaths outside a hospital (including accidents): require police involvement and, in some cases, forensic examination before a death certificate can be issued.
- The death must typically be registered within 48 hours.

Where to register:
- Abu Dhabi: SEHA hospitals or via TAMM platform
- Dubai: Dubai Health Authority (DHA) facilities
- Other emirates: Ministry of Health hospital or health center where the death occurred, or was confirmed

Required documents:
- Hospital or police death notification
- Deceased's passport and Emirates ID
- Applicant's (next of kin/sponsor's) Emirates ID and relationship documentation

Attestation for use abroad:
- For expatriates whose death certificate needs to be used in their home country (inheritance, insurance, repatriation), the certificate must be attested by:
  1. UAE Ministry of Foreign Affairs
  2. The deceased's home country embassy in the UAE
  3. Possibly the home country's own Ministry of Foreign Affairs upon arrival, depending on that country's requirements

Related next steps after registration:
- Visa cancellation: the sponsor must cancel the deceased's residence visa via ICP/GDRFA.
- Repatriation of remains: requires NOC from police (for non-natural deaths) and coordination with the airline and the deceased's embassy.
- Local burial: requires a burial permit from the municipality, in addition to the death certificate.

---

تسجيل شهادة الوفاة وتوثيقها

يجب تسجيل شهادة الوفاة في الإمارات قبل الإفراج عن الجثمان للدفن أو الترحيل، وقبل متابعة الأمور القانونية المرتبطة (الميراث، مطالبات التأمين، إلغاء التأشيرة).

إجراءات التسجيل:
- الوفاة داخل المستشفى: يصدر المستشفى إشعاراً أولياً يُسجَّل لدى الجهة الصحية المعنية (DHA لدبي، دائرة الصحة لأبوظبي، وزارة الصحة لباقي الإمارات).
- الوفاة خارج المستشفى (بما فيها الحوادث): تتطلب تدخل الشرطة وأحياناً فحصاً جنائياً قبل إصدار الشهادة.
- يجب التسجيل عادة خلال 48 ساعة.

أماكن التسجيل:
- أبوظبي: مستشفيات صحة أو عبر منصة تام
- دبي: منشآت هيئة الصحة بدبي
- باقي الإمارات: مستشفى أو مركز صحي تابع لوزارة الصحة حيث وقعت الوفاة

المستندات المطلوبة:
- إشعار الوفاة من المستشفى أو الشرطة
- جواز سفر المتوفى وهويته الإماراتية
- هوية مقدم الطلب (أقرب الأقارب/الكفيل) ومستندات إثبات القرابة

التوثيق للاستخدام خارج الإمارات:
- لتوثيق شهادة وفاة مقيم أجنبي لاستخدامها في بلده (الميراث، التأمين، الترحيل): وزارة الخارجية الإماراتية، ثم سفارة بلد المتوفى في الإمارات، وربما وزارة خارجية البلد الأصلي عند الوصول.

خطوات لاحقة بعد التسجيل:
- إلغاء التأشيرة: يجب على الكفيل إلغاء تأشيرة إقامة المتوفى عبر ICP/GDRFA.
- ترحيل الجثمان: يتطلب عدم ممانعة من الشرطة (للوفيات غير الطبيعية) والتنسيق مع شركة الطيران والسفارة.
- الدفن المحلي: يتطلب تصريح دفن من البلدية بالإضافة إلى شهادة الوفاة.`
  },

  {
    id: 'POL-063',
    emirate: 'All UAE',
    category: 'business',
    title: 'Company Formation — Mainland vs Free Zone',
    content: `Setting up a business in the UAE means choosing between mainland and free zone jurisdictions — the choice affects ownership rules, where you can operate, and licensing authority.

Mainland companies:
- Licensed by each emirate's Department of Economic Development (DED / ADDED / SEDD / etc.) — see the relevant emirate-specific trade license policy for details.
- Since 2021 reforms, 100% foreign ownership is permitted for most commercial and industrial activities (some strategic sectors still require a UAE national partner or agent).
- Can trade directly anywhere in the UAE mainland market and bid on government contracts without a local distributor.
- Generally requires a physical office lease (Ejari/Tawtheeq registered) in the emirate of licensing.

Free zone companies:
- Each free zone (e.g., Dubai Multi Commodities Centre — DMCC, Dubai Internet City, Sharjah's SHAMS, RAKEZ, Abu Dhabi's Masdar City / ADGM) has its own licensing authority, independent of the DED.
- 100% foreign ownership as standard, with full repatriation of profits and capital.
- Cannot trade directly with the UAE mainland market without appointing a local distributor/agent or setting up a separate mainland branch — free zone companies primarily serve international trade or clients within the same/other free zones.
- Often offers lower setup costs, flexi-desk/shared office options (no dedicated physical office required for some license types), and 0% corporate tax within qualifying free zone activities under current UAE Corporate Tax rules (subject to conditions — verify current Federal Tax Authority guidance).

Choosing between them — general guidance:
- Selling primarily within the UAE, need government contracts, or want retail/physical presence anywhere in the country → mainland is usually the better fit.
- Import/export, international consulting/services, or industry-specific hub benefits (media, tech, commodities) → free zone is often more cost-effective and faster to set up.

Registration steps (general, both types):
1. Choose and reserve a trade name.
2. Select business activity and legal structure (LLC, sole establishment, branch, etc.).
3. Obtain initial approval from the licensing authority.
4. Secure office/facility (physical or flexi-desk depending on license type).
5. Submit final documents and pay license fees.
6. Obtain the trade license, then proceed to visa processing for owners/employees if needed.

---

تأسيس الشركات — البر الرئيسي مقابل المنطقة الحرة

يتطلب تأسيس شركة في الإمارات الاختيار بين الترخيص في البر الرئيسي أو منطقة حرة، وهو اختيار يؤثر على قواعد الملكية ونطاق العمل والجهة المرخِّصة.

شركات البر الرئيسي:
- تُرخَّص عبر دائرة التنمية الاقتصادية في كل إمارة.
- منذ إصلاحات 2021، يُسمح بالملكية الأجنبية الكاملة (100%) لمعظم الأنشطة التجارية والصناعية.
- يمكنها التعامل مباشرة في أي مكان بسوق البر الرئيسي والتقدم للعقود الحكومية دون موزع محلي.
- تتطلب عادة عقد إيجار مكتب فعلي (مسجَّل في إيجاري أو توثيق) في إمارة الترخيص.

شركات المناطق الحرة:
- لكل منطقة حرة (مثل DMCC، مدينة دبي للإنترنت، شمس بالشارقة، RAKEZ، مصدر سيتي/ADGM بأبوظبي) جهة ترخيص مستقلة خاصة بها.
- ملكية أجنبية كاملة كمعيار قياسي، مع حرية كاملة لتحويل الأرباح ورأس المال.
- لا يمكنها التعامل مباشرة مع سوق البر الرئيسي دون تعيين موزع/وكيل محلي أو تأسيس فرع منفصل في البر الرئيسي.
- غالباً ما توفر تكاليف تأسيس أقل، وخيارات مكتب مرن دون الحاجة لمكتب فعلي مخصص لبعض أنواع التراخيص.

اختيار النوع الأنسب — إرشادات عامة:
- البيع بشكل أساسي داخل الإمارات، أو الحاجة لعقود حكومية، أو تواجد تجزئة فعلي في أي مكان بالدولة ← البر الرئيسي عادة الأنسب.
- الاستيراد/التصدير، الاستشارات/الخدمات الدولية، أو مزايا القطاعات المتخصصة ← المنطقة الحرة غالباً أوفر وأسرع تأسيساً.

خطوات التسجيل (عامة لكلا النوعين):
1. اختيار وحجز الاسم التجاري.
2. تحديد النشاط التجاري والهيكل القانوني.
3. الحصول على الموافقة الأولية من جهة الترخيص.
4. تأمين المكتب أو المنشأة.
5. تقديم المستندات النهائية ودفع رسوم الترخيص.
6. الحصول على الرخصة التجارية، ثم متابعة إجراءات التأشيرات إذا لزم.`
  },

  {
    id: 'POL-064',
    emirate: 'All UAE',
    category: 'identity',
    title: 'Divorce Certificate — Registration and Attestation',
    content: `Divorce registration and attestation in the UAE applies differently depending on whether the marriage was conducted under Islamic (Sharia) law or as a civil/non-Muslim marriage.

Muslim divorces:
- Filed and processed through the Personal Status Courts, or in Dubai specifically, initially through the Family Guidance section of the Dubai Courts before proceeding to litigation if reconciliation fails.
- The court issues an official divorce certificate/judgment upon finalization.

Non-Muslim / civil divorces:
- The Abu Dhabi Judicial Department operates a dedicated Civil Family Court accepting non-Muslim divorce cases regardless of nationality or where the marriage took place, under UAE's civil personal status law framework (Federal Law No. 41 of 2022 and related regulations).
- Dubai Courts also has provisions for non-Muslim personal status matters.
- Foreign nationals may alternatively choose to divorce in their home country if that is more relevant to their circumstances (e.g., for property or custody matters governed by home-country law).

Attestation for use abroad:
- A UAE-issued divorce certificate that needs to be recognized in another country typically requires:
  1. Attestation by the UAE Ministry of Foreign Affairs
  2. Attestation/legalization by the relevant country's embassy in the UAE
  3. Possibly further legalization by that country's foreign ministry upon arrival

Attestation of a foreign divorce certificate for use in the UAE:
- Must be attested by: the issuing country's Ministry of Foreign Affairs, then the UAE Embassy in that country, then the UAE Ministry of Foreign Affairs upon arrival in the UAE.
- Required for matters such as remarriage in the UAE, custody/visa sponsorship changes, or updating Emirates ID/visa marital status.

Where to start: Dubai Courts (dc.gov.ae), Abu Dhabi Judicial Department (adjd.gov.ae), or the relevant Personal Status Court in your emirate of residence.

---

شهادة الطلاق — التسجيل والتوثيق

يختلف تسجيل الطلاق وتوثيقه في الإمارات حسب ما إذا كان الزواج قد عُقد وفق الشريعة الإسلامية أو كزواج مدني/غير مسلم.

طلاق المسلمين:
- يُقدَّم ويُعالَج عبر محاكم الأحوال الشخصية، وفي دبي تحديداً عبر قسم الإرشاد الأسري بمحاكم دبي أولاً قبل التقاضي إذا فشل الصلح.
- تصدر المحكمة شهادة/حكم طلاق رسمي عند الانتهاء.

طلاق غير المسلمين / المدني:
- تدير دائرة القضاء بأبوظبي محكمة أسرة مدنية مخصصة تقبل قضايا طلاق غير المسلمين بغض النظر عن الجنسية أو مكان عقد الزواج.
- لدى محاكم دبي أيضاً أحكام لمسائل الأحوال الشخصية لغير المسلمين.
- يمكن للأجانب اختيار الطلاق في بلدهم الأصلي إذا كان ذلك أنسب لظروفهم.

التوثيق للاستخدام خارج الإمارات:
- وزارة الخارجية الإماراتية، ثم سفارة البلد المعني في الإمارات، وربما مزيد من التصديق لدى وصول البلد الأصلي.

توثيق شهادة طلاق أجنبية للاستخدام في الإمارات:
- وزارة خارجية البلد المُصدِر، ثم سفارة الإمارات في ذلك البلد، ثم وزارة الخارجية الإماراتية عند الوصول.
- مطلوبة لأمور مثل الزواج مرة أخرى في الإمارات، أو تغييرات الحضانة/كفالة التأشيرة، أو تحديث الحالة الاجتماعية في الهوية/التأشيرة.

نقطة البداية: محاكم دبي، دائرة القضاء بأبوظبي، أو محكمة الأحوال الشخصية المعنية في إمارة الإقامة.`
  },

  {
    id: 'POL-065',
    emirate: 'Abu Dhabi',
    category: 'government-services',
    title: 'TAMM Platform — Abu Dhabi Digital Government Services',
    content: `TAMM (tamm.abudhabi) is Abu Dhabi's unified digital government services platform, consolidating services from over 40 government entities into a single portal and app.

Access:
- Website: tamm.abudhabi
- Mobile app: available on iOS and Android
- In-person: TAMM service centers across Abu Dhabi (walk-in or by appointment)
- Phone: 800-TAMM (8266)

Login: TAMM uses UAE Pass for secure digital identity verification — residents should set up UAE Pass (via the UAE Pass app, linked to Emirates ID) before using TAMM's authenticated services.

Categories of services available via TAMM (non-exhaustive):
- Identity & visas: residence visa renewal support, Emirates ID appointments
- Business: trade license issuance/renewal (ADDED-integrated), business setup guidance
- Housing: Tawtheeq tenancy registration, ADDC utility connections
- Health: Daman health card, medical appointment booking at government facilities
- Education: ADEK school enrollment support
- Traffic & transport: integrated with Department of Municipalities and Transport services (for Abu Dhabi transport matters — see Tawfeer for full transport service coverage)
- Payments: unified bill payment for multiple government fees and utilities in one transaction
- Complaints & feedback: a single channel to raise issues across participating entities rather than contacting each department separately

TAMM Business specifically: a dedicated section for entrepreneurs and companies covering licensing, approvals, and compliance across Abu Dhabi government entities, aimed at reducing the number of separate government touchpoints needed to run a business in the emirate.

Support: TAMM's contact center (800-8266) can route inquiries to the correct underlying government entity even if you're unsure which department actually owns a given service — this is one of the platform's core value propositions (a single front door to Abu Dhabi government).

---

منصة تام — الخدمات الحكومية الرقمية في أبوظبي

منصة تام (tamm.abudhabi) هي المنصة الموحدة للخدمات الحكومية الرقمية في أبوظبي، وتجمع خدمات أكثر من 40 جهة حكومية في بوابة وتطبيق واحد.

الوصول:
- الموقع: tamm.abudhabi
- التطبيق: متاح على iOS وAndroid
- حضورياً: مراكز خدمة تام في أبوظبي
- الهاتف: 800-8266

تسجيل الدخول: تستخدم تام الهوية الرقمية UAE Pass للتحقق الآمن؛ يُنصح بإعداد UAE Pass قبل استخدام الخدمات الموثقة على تام.

فئات الخدمات المتاحة عبر تام (غير شاملة):
- الهوية والتأشيرات: دعم تجديد تأشيرة الإقامة، مواعيد الهوية الإماراتية
- الأعمال: إصدار/تجديد الرخصة التجارية، إرشادات تأسيس الأعمال
- الإسكان: تسجيل عقود الإيجار عبر توثيق، توصيلات ADDC
- الصحة: البطاقة الصحية ضمان، حجز المواعيد الطبية في المنشآت الحكومية
- التعليم: دعم التسجيل المدرسي عبر ADEK
- المرور والنقل: متكامل مع خدمات دائرة البلديات والنقل (لمسائل النقل في أبوظبي — راجع Tawfeer للتغطية الكاملة لخدمات النقل)
- المدفوعات: دفع موحد لعدة رسوم حكومية ومرافق في معاملة واحدة
- الشكاوى والملاحظات: قناة واحدة لرفع القضايا عبر الجهات المشاركة

تام للأعمال: قسم مخصص لرواد الأعمال والشركات يغطي التراخيص والموافقات والامتثال عبر جهات حكومة أبوظبي.

الدعم: مركز اتصال تام (800-8266) يمكنه توجيه الاستفسارات للجهة الحكومية الصحيحة حتى لو لم تكن متأكداً من الجهة المسؤولة عن خدمة معينة.`
  },

  {
    id: 'POL-066',
    emirate: 'Dubai',
    category: 'housing',
    title: 'Dubai Land Department, RERA, and Rent Disputes',
    content: `The Dubai Land Department (DLD, dubailand.gov.ae) is the government entity overseeing all real estate transactions, registration, and regulation in Dubai. The Real Estate Regulatory Agency (RERA) operates under DLD and specifically regulates the rental and brokerage market.

Dubai Land Department (DLD) — core functions:
- Property title registration and transfer for all Dubai real estate transactions (sales, mortgages, gifts, inheritance).
- Issuing title deeds.
- Registering off-plan (under-construction) property sales through the Oqood system.
- Real estate broker and developer licensing.

RERA — core functions:
- Regulates real estate brokers, requiring licensing (RERA card) for anyone practicing brokerage in Dubai.
- Sets and publishes the annual Rental Increase Calculator, which determines the maximum legal percentage a landlord can increase rent based on how far current rent sits below the average market rate for similar units (accessible via dubailand.gov.ae).
- Oversees the Ejari tenancy registration system (see also POL-018).
- Regulates real estate development escrow accounts to protect off-plan buyers' payments.

Rent disputes — Rental Dispute Settlement Centre (RDSC):
- The RDSC (a Dubai Courts-affiliated body, rdc.dubaicourts.gov.ae) handles disputes between landlords and tenants in Dubai — eviction disputes, unpaid rent, illegal rent increases, maintenance disputes, and security deposit disagreements.
- Filing a case requires: a valid Ejari certificate for the tenancy in question, the tenancy contract, and supporting evidence for the specific dispute (payment records, correspondence, photos for maintenance issues, etc.).
- Filing fee: typically calculated as a percentage of the annual rent value (minimum and maximum caps apply) — check the current RDSC fee schedule, as rates are periodically updated.
- Cases below a certain value threshold may be handled through a faster summary process; larger or more complex disputes proceed to a full hearing.
- Landlords seeking eviction for personal use or sale of the property must provide legally mandated notice periods (typically 12 months' notice via registered mail/notary, delivered before the current contract's renewal date) — evicting without proper notice is a common basis for tenants to successfully dispute an eviction.

Where to start a rent dispute: rdc.dubaicourts.gov.ae, or in person at the RDSC office in Dubai.

---

دائرة الأراضي والأملاك في دبي، مؤسسة التنظيم العقاري، ونزاعات الإيجار

دائرة الأراضي والأملاك في دبي (DLD) هي الجهة الحكومية المشرفة على جميع معاملات وتسجيل وتنظيم العقارات في دبي. تعمل مؤسسة التنظيم العقاري (RERA) تحت مظلة الدائرة وتُنظِّم تحديداً سوق الإيجار والوساطة.

دائرة الأراضي والأملاك — الوظائف الأساسية:
- تسجيل ونقل ملكية العقارات لجميع معاملات دبي العقارية.
- إصدار سندات الملكية.
- تسجيل مبيعات العقارات على الخارطة عبر نظام عقود.
- ترخيص الوسطاء العقاريين والمطورين.

مؤسسة التنظيم العقاري (RERA) — الوظائف الأساسية:
- تنظيم الوسطاء العقاريين، وتشترط الترخيص (بطاقة RERA) لممارسة الوساطة في دبي.
- وضع ونشر حاسبة الزيادة السنوية للإيجار، التي تحدد الحد الأقصى القانوني لنسبة زيادة الإيجار.
- الإشراف على نظام تسجيل عقود الإيجار إيجاري (راجع أيضاً POL-018).
- تنظيم حسابات الضمان لحماية مدفوعات مشتري العقارات على الخارطة.

نزاعات الإيجار — مركز فض المنازعات الإيجارية (RDSC):
- يتعامل المركز (تابع لمحاكم دبي) مع نزاعات المالك والمستأجر: الإخلاء، الإيجار غير المدفوع، الزيادات غير القانونية، نزاعات الصيانة، والتأمين.
- تقديم القضية يتطلب: شهادة إيجاري سارية، عقد الإيجار، ومستندات داعمة للنزاع المحدد.
- رسوم التقديم: تُحسب عادة كنسبة من قيمة الإيجار السنوي (بحدود دنيا وعليا).
- القضايا الأقل من حد معين قد تُعالَج عبر إجراء مستعجل أسرع؛ النزاعات الأكبر تخضع لجلسة استماع كاملة.
- على المُلّاك الراغبين في الإخلاء لأغراض الاستخدام الشخصي أو البيع تقديم إشعار مسبق قانوني (عادة 12 شهراً عبر بريد مسجَّل/كاتب عدل).

نقطة البداية لنزاع إيجاري: rdc.dubaicourts.gov.ae، أو حضورياً في مكتب المركز في دبي.`
  }

];

module.exports = policies;