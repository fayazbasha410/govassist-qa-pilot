const policies = [

  // ── DRIVING & VEHICLES ──────────────────────────────────────────────────
  {
    id: 'POL-001',
    title: 'Driving License Renewal',
    emirate: 'All UAE',
    category: 'driving',
    content: `To renew your driving license in the UAE, visit any authorised service center or use your emirate's smart app (TAMM for Abu Dhabi, Dubai Drive for Dubai, Sharjah City for Sharjah).
    You must bring your Emirates ID, current driving license, and an eye test certificate from an approved optician.
    The renewal fee is AED 400 for a 10-year license in Abu Dhabi; AED 300 in Dubai.
    Processing takes 1–3 business days.
    Licenses can be renewed up to 6 months before expiry.
    Expatriates must hold a valid residence visa to renew their driving license.`
  },
  {
    id: 'POL-002',
    title: 'Vehicle Registration Renewal',
    emirate: 'All UAE',
    category: 'driving',
    content: `Vehicle registration must be renewed annually across all UAE emirates.
    Requirements: valid insurance certificate, Emirates ID, and a passing vehicle inspection if the car is over 3 years old.
    Fee in Abu Dhabi: AED 350 plus AED 35 knowledge and innovation fee.
    Fee in Dubai: AED 290 plus inspection fee of AED 150.
    You can renew online via your emirate's portal, at service centers, or at authorised Tasjeel/Muroor centers.
    Registration expires on the same date each year.
    Vehicles with unpaid fines cannot be renewed until fines are settled.`
  },
  {
    id: 'POL-003',
    title: 'Traffic Fine Payment',
    emirate: 'All UAE',
    category: 'driving',
    content: `Traffic fines in the UAE can be paid via smart apps, official websites, or at any service center.
    Abu Dhabi fines: paid via TAMM app or Abu Dhabi Police website.
    Dubai fines: paid via Dubai Police app or RTA website.
    Sharjah fines: paid via Sharjah Police portal.
    A 25% discount is available in Abu Dhabi if paid within 60 days of issue.
    Dubai offers a 25% discount during periodic discount campaigns announced by Dubai Police.
    Fines must be settled before vehicle registration renewal.
    You can check fines using your plate number or Emirates ID.
    Unpaid fines may result in vehicle impoundment or travel ban.`
  },
  {
    id: 'POL-004',
    title: 'Appointment Booking at Service Centers',
    emirate: 'All UAE',
    category: 'driving',
    content: `Appointments at UAE government service centers can be booked via each emirate's smart platform.
    Abu Dhabi: book via TAMM app or website.
    Dubai: book via Dubai Now app or respective authority websites (RTA, ICA, AMER).
    Sharjah: book via Sharjah eGovernment portal.
    Available services include driving license, vehicle registration, Emirates ID, and residency visa.
    Appointments can be booked up to 30 days in advance.
    Cancellations must be made at least 2 hours before the appointment time.
    Walk-in services are available but appointment holders are given priority.`
  },

  // ── IDENTITY & RESIDENCY ─────────────────────────────────────────────────
  {
    id: 'POL-005',
    title: 'Emirates ID Renewal',
    emirate: 'All UAE',
    category: 'identity',
    content: `Emirates ID must be renewed before expiry to avoid fines of AED 20 per day up to a maximum of AED 1,000.
    Renewal is handled by the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP).
    Can be done via ICA website, TAMM, Dubai Now, or authorised typing centers nationwide.
    Required documents: current Emirates ID and passport copy.
    Fee: AED 100 per year of validity plus AED 40 service fee.
    Processing takes 3–5 business days.
    Biometric data (fingerprints and photo) may be required for first-time applicants or major updates.`
  },
  {
    id: 'POL-006',
    title: 'Residency Visa Renewal',
    emirate: 'All UAE',
    category: 'identity',
    content: `Residency visa renewal must be initiated 30 days before expiry to avoid overstay fines.
    Employer-sponsored visas are renewed by the employer through MOHRE (Ministry of Human Resources and Emiratisation).
    Investor and freelance visa holders apply directly via ICA or relevant free zone authority.
    Required documents: passport with at least 6 months validity, Emirates ID, medical fitness certificate, and passport-size photos.
    Standard 2-year residence visa fee: AED 1,380.
    Golden Visa (5 or 10 year): fees vary by category; apply via ICA or GDRFA.
    Overstay fines: AED 25 per day after the grace period of 30 days post-expiry.`
  },
  {
    id: 'POL-007',
    title: 'New Residence Visa Application',
    emirate: 'All UAE',
    category: 'identity',
    content: `New residence visas are issued through employment, family sponsorship, investment, or free zone registration.
    Employment visa: employer applies via MOHRE and ICA; process takes 5–10 business days.
    Family sponsorship: sponsor must earn minimum AED 4,000/month (AED 10,000 for domestic workers).
    Investor visa: requires proof of business ownership or property worth AED 750,000+.
    Golden Visa eligibility: investors, entrepreneurs, specialised talents, researchers, outstanding students.
    Medical fitness test is mandatory for all applicants above age 18.
    Entry permit valid for 60 days; must be converted to residence visa within this period.`
  },
  {
    id: 'POL-008',
    title: 'Building Permit Application',
    emirate: 'All UAE',
    category: 'housing',
    content: `Building permits in the UAE are issued by each emirate's municipal authority.
    Abu Dhabi: permits issued by Abu Dhabi City Municipality; apply via TAMM platform.
    Dubai: permits issued by Dubai Municipality; apply via Dubai Building Permits portal.
    Sharjah: permits issued by Sharjah City Municipality.
    Required documents: architectural drawings approved by a licensed engineer, site plan, NOC from utilities, and engineer registration certificate.
    Processing time: 10–15 business days for residential; 20–30 business days for commercial.
    Permits are valid for 2 years from date of issue and can be renewed if construction is not completed.
    Construction without a valid permit is subject to fines and demolition orders.`
  },
  {
    id: 'POL-009',
    title: 'Muwafaq Social Support — Dubai',
    emirate: 'Dubai',
    category: 'social',
    content: `The Mohammed Bin Rashid Al Maktoum Humanitarian and Charity Establishment (Dubai Cares) and Community Development Authority (CDA) provide social support in Dubai.
    UAE nationals in Dubai may apply for monthly financial assistance, housing support, and utility subsidies through the CDA.
    Apply via the CDA smart app or website, or in person at CDA service centers.
    Required documents: Emirates ID, family book, salary certificate or proof of unemployment, tenancy contract, and bank account details.
    Eligibility is based on income level, family size, and housing situation.
    Processing time: 15–20 business days.
    Support amounts are reviewed annually and adjusted based on cost of living changes.
    Expatriates facing hardship may apply to the CDA for temporary emergency assistance.`
  },
  {
    id: 'POL-010',
    title: 'Health Card Application — Abu Dhabi',
    emirate: 'Abu Dhabi',
    category: 'healthcare',
    content: `Abu Dhabi health cards are linked to the Malaffi Health Information Exchange platform.
    UAE nationals receive Thiqa health cards automatically upon Emirates ID registration.
    Expatriate residents must obtain health insurance via their employer or self-sponsorship before accessing government healthcare.
    Health cards are required for access to government hospitals and clinics in Abu Dhabi.
    Apply via TAMM platform or at Department of Health service centers.
    Required documents: Emirates ID, passport copy, and valid health insurance certificate.
    Health cards are valid for one year and must be renewed alongside the residency visa.
    Malaffi connects all healthcare providers in Abu Dhabi for unified patient records.`
  },

  // ── EDUCATION ────────────────────────────────────────────────────────────
  {
    id: 'POL-011',
    title: 'School Enrollment — Dubai (KHDA)',
    emirate: 'Dubai',
    category: 'education',
    content: `School enrollment in Dubai is regulated by the Knowledge and Human Development Authority (KHDA).
    Parents must register children at a KHDA-approved private school via the school directly or Dubai Schools portal.
    Required documents: child's birth certificate, passport copy, Emirates ID, vaccination records, and previous school reports.
    The academic year runs from September to June.
    School fees are regulated by KHDA and vary by school rating (Outstanding, Good, Acceptable, Weak).
    Fee increases require KHDA approval and are linked to school inspection ratings.
    Public schools (Dubai School Establishment) are free for UAE nationals.
    Admission for new academic year typically opens in January–March.`
  },
  {
    id: 'POL-012',
    title: 'School Enrollment — Abu Dhabi (ADEK)',
    emirate: 'Abu Dhabi',
    category: 'education',
    content: `School enrollment in Abu Dhabi is regulated by the Abu Dhabi Department of Education and Knowledge (ADEK).
    Private school registration is done directly with the school; public schools via ADEK portal.
    Required documents: birth certificate, passport, Emirates ID, vaccination card, and transfer certificate from previous school.
    UAE nationals attend public schools free of charge.
    Private school fees are regulated and must not exceed ADEK-approved fee bands.
    ADEK inspects schools annually and publishes ratings to guide parents.
    Special needs students are supported through the Inclusion Support Program.
    The academic year runs September to June.`
  },
  {
    id: 'POL-013',
    title: 'Higher Education and University Admission',
    emirate: 'All UAE',
    category: 'education',
    content: `Public universities in the UAE include UAE University (Al Ain), Zayed University, and Higher Colleges of Technology.
    UAE nationals apply via the Ministry of Education's unified admissions portal.
    Minimum EmSAT scores are required for admission to specific programmes.
    Expatriate students apply directly to universities.
    Scholarships are available for UAE nationals through government programmes.
    Private universities are licensed by the Commission for Academic Accreditation (CAA).
    International degree equivalency is assessed by the Ministry of Education.`
  },

  // ── HEALTHCARE ───────────────────────────────────────────────────────────
  {
    id: 'POL-014',
    title: 'Health Insurance — Dubai (DHA)',
    emirate: 'Dubai',
    category: 'healthcare',
    content: `Health insurance is mandatory for all residents of Dubai under the Dubai Health Authority (DHA) law.
    Employers must provide health insurance for employees and their dependents.
    Essential Benefits Plan (EBP): minimum coverage for low-income workers earning below AED 4,000/month; cost capped at AED 650/year per person.
    Insurance must be activated before or simultaneously with the residence visa.
    Failure to provide insurance results in fines of AED 500/month per uninsured employee.
    DHA-licensed insurers and Third Party Administrators (TPAs) manage claims.
    Employees can check their insurance status via the DHA app.`
  },
  {
    id: 'POL-015',
    title: 'Health Insurance — Abu Dhabi (HAAD/DoH)',
    emirate: 'Abu Dhabi',
    category: 'healthcare',
    content: `Health insurance in Abu Dhabi is mandatory and regulated by the Department of Health (DoH), formerly HAAD.
    UAE nationals receive Thiqa insurance through ADNIC, covering comprehensive healthcare at government and private facilities.
    Expatriate employees must be insured by their employer under the Daman Basic plan or higher.
    Minimum coverage: AED 150,000 per year with specified co-payment rates.
    Self-sponsored residents must obtain their own health insurance.
    Health cards (Malaffi) are linked to the Abu Dhabi Health Information Exchange.
    Claims are submitted by healthcare providers directly to insurers.`
  },
  {
    id: 'POL-016',
    title: 'Medical Fitness Certificate',
    emirate: 'All UAE',
    category: 'healthcare',
    content: `Medical fitness certificates are required for residence visa applications, employment, and some professional licenses.
    Tests are conducted at approved medical fitness centres across all emirates.
    Standard tests include blood test (HIV, Hepatitis B and C, TB), chest X-ray, and general physical examination.
    Fee: approximately AED 230–300 depending on emirate and centre.
    Results are directly transmitted to immigration authorities.
    Processing time: same day to 3 business days.
    Applicants who fail the fitness test may be subject to deportation or visa rejection.`
  },
  {
    id: 'POL-017',
    title: 'Dubai Health Authority (DHA) Professional License',
    emirate: 'Dubai',
    category: 'healthcare',
    content: `Healthcare professionals practising in Dubai must hold a valid DHA license.
    Apply via the Sheryan system on the DHA website.
    Required: verified academic qualifications, good standing letter from home country authority, professional experience proof, and passing DHA licensing exam (for some specialties).
    Primary Source Verification (PSV) is mandatory for all credentials.
    License renewal is annual; renewal reminders are sent via email.
    Practising without a valid DHA license is a criminal offence.`
  },

  // ── HOUSING ──────────────────────────────────────────────────────────────
  {
    id: 'POL-018',
    title: 'Ejari Tenancy Registration — Dubai',
    emirate: 'Dubai',
    category: 'housing',
    content: `Ejari is the official tenancy registration system for Dubai, managed by the Real Estate Regulatory Agency (RERA) under Dubai Land Department (DLD).
    All rental contracts in Dubai must be registered with Ejari.
    Registration fee: AED 220 (online via Dubai REST app or approved typing centers).
    Required documents: signed tenancy contract, landlord's title deed, tenant's Emirates ID and passport copy, landlord's passport copy or trade license.
    Ejari certificate is required for DEWA connection, residency visa, and school enrollment.
    Renewal: register the new or renewed contract within 30 days of signing.
    Disputes between landlord and tenant are handled by RERA's Rental Dispute Settlement Centre.`
  },
  {
    id: 'POL-019',
    title: 'Tawtheeq Tenancy Registration — Abu Dhabi',
    emirate: 'Abu Dhabi',
    category: 'housing',
    content: `Tawtheeq is Abu Dhabi's official tenancy contract registration system, managed by the Abu Dhabi Department of Municipalities and Transport.
    All residential and commercial tenancy contracts must be registered via Tawtheeq.
    Registration is done online via the TAMM platform or at service centers.
    Required documents: tenancy contract, landlord's title deed, both parties' Emirates IDs, and landlord's bank details for rent payments.
    Tawtheeq certificate is required for ADDC/AADC utility connections and residency visa.
    Annual contract renewal must be registered within 30 days.
    Rental disputes are resolved by Abu Dhabi Rental Dispute Committee.`
  },
  {
    id: 'POL-020',
    title: 'Property Purchase by Expatriates',
    emirate: 'All UAE',
    category: 'housing',
    content: `Expatriates can purchase freehold property in designated areas across UAE emirates.
    Dubai: freehold areas include Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, and Jumeirah Village.
    Abu Dhabi: investment zones include Yas Island, Saadiyat Island, Al Reem Island, and Masdar City.
    Property purchase requires a No Objection Certificate (NOC) from the developer and registration with the land department.
    Dubai Land Department (DLD) registration fee: 4% of property value.
    Abu Dhabi: 2% registration fee (1% paid by buyer, 1% by seller).
    Property ownership may qualify the buyer for a UAE residence visa.`
  },

  // ── BUSINESS ─────────────────────────────────────────────────────────────
  {
    id: 'POL-021',
    title: 'Trade License Renewal — Dubai',
    emirate: 'Dubai',
    category: 'business',
    content: `Trade licenses in Dubai are issued and renewed by the Department of Economy and Tourism (DET), formerly DED.
    Renewal must be completed before the expiry date to avoid fines.
    Required documents: current trade license, tenancy contract (Ejari), and partner/owner Emirates IDs.
    Renewal fee varies by business activity and legal structure; typically AED 600–15,000+.
    Renew online via Dubai Now app, DET website, or approved business centers.
    Late renewal fine: AED 250 per month after expiry.
    Free zone licenses are renewed through the respective free zone authority (JAFZA, DMCC, DIFC, etc.).`
  },
  {
    id: 'POL-022',
    title: 'Trade License Renewal — Abu Dhabi',
    emirate: 'Abu Dhabi',
    category: 'business',
    content: `Business licenses in Abu Dhabi are issued by ADDED (Abu Dhabi Department of Economic Development).
    Renewal is required annually before the expiry date via TAMM platform or service centers.
    Required documents: current license copy, Tawtheeq-registered tenancy contract, and partner Emirates IDs.
    Fees vary by business activity and legal structure.
    Late renewal incurs a penalty of AED 250 per month.
    Mainland licenses require a UAE national partner holding at least 51% (or waived under new FDI rules for certain sectors).
    Free zone licenses (Masdar, KIZAD, twofour54) renewed via respective free zone.`
  },
  {
    id: 'POL-023',
    title: 'Value Added Tax (VAT) Registration',
    emirate: 'All UAE',
    category: 'business',
    content: `VAT was introduced in the UAE on 1 January 2018 at a standard rate of 5%.
    Mandatory registration: businesses with taxable supplies exceeding AED 375,000 per year.
    Voluntary registration: businesses with taxable supplies exceeding AED 187,500 per year.
    Registration is done via the Federal Tax Authority (FTA) website (tax.gov.ae).
    Required: trade license, Emirates ID of owner, bank account details, and financial records.
    VAT returns must be filed quarterly or monthly depending on FTA assignment.
    Penalties for non-registration or late filing start from AED 10,000.`
  },
  {
    id: 'POL-024',
    title: 'Freelance Permit and Self-Employment',
    emirate: 'All UAE',
    category: 'business',
    content: `Freelance permits allow individuals to work legally as independent professionals in the UAE.
    Available through free zones: Dubai Media City, Dubai Internet City, twofour54 (Abu Dhabi), Fujairah Creative City, Sharjah Media City (Shams).
    Shams freelance permit: AED 5,750/year — one of the most affordable options.
    twofour54 Abu Dhabi: AED 15,000/year for creative and media professionals.
    Required: passport copy, CV, portfolio or proof of expertise.
    Freelance permit holders can sponsor their own residence visa.
    Activities are restricted to the permit category (media, tech, education, etc.).`
  },

  // ── SOCIAL SERVICES ──────────────────────────────────────────────────────
  {
    id: 'POL-025',
    title: 'Social Support Application — Abu Dhabi',
    emirate: 'Abu Dhabi',
    category: 'social',
    content: `UAE nationals in Abu Dhabi may apply for social support via the Department of Community Development (DCD).
    Eligibility is assessed based on income, family size, housing status, and special needs.
    Support types: monthly financial assistance, housing allowance, education support, and utility bill subsidies.
    Applications submitted via TAMM platform or in-person at DCD service centers.
    Required documents: Emirates ID, family book, salary certificate or unemployment proof, and tenancy contract.
    Processing takes up to 20 business days.
    Approved beneficiaries are reviewed annually; changes in income must be reported within 30 days.`
  },
  {
    id: 'POL-026',
    title: 'Zakat and Charitable Support — UAE',
    emirate: 'All UAE',
    category: 'social',
    content: `Zakat is distributed by the Islamic Affairs and Charitable Activities Department in Dubai and Zakat Fund in Abu Dhabi.
    UAE nationals and eligible Muslim expatriate residents may apply for Zakat assistance.
    Eligibility criteria: income below the nisab threshold, outstanding debts, or extreme hardship.
    Apply via the Zakat Fund website or smart app with Emirates ID and income documentation.
    Charitable donations by the public are channelled through official Zakat funds to ensure proper distribution.
    Dubai Cares and Ghaith programme support orphans, widows, and families in need.
    During Ramadan, additional Zakat Al Fitr distributions are announced.`
  },
  {
    id: 'POL-027',
    title: 'People of Determination — Support Services',
    emirate: 'All UAE',
    category: 'social',
    content: `The UAE provides comprehensive support for People of Determination (persons with disabilities).
    Registration is done via the Community Development Authority (CDA) in Dubai or DCD in Abu Dhabi.
    Benefits include monthly financial support, free healthcare, education assistance, and priority government services.
    Disability card (People of Determination card) provides discounts and priority access across services.
    Employment support: Mowasalat subsidised transport, job placement via MOHRE, and Quota Law requires 1% employment in private sector firms with 50+ employees.
    Specialised education centres and inclusion programmes are available in all emirates.
    Apply via TAMM (Abu Dhabi) or DCD/CDA smart app (Dubai).`
  },
  {
    id: 'POL-028',
    title: 'Retirement and End of Service Benefits',
    emirate: 'All UAE',
    category: 'social',
    content: `UAE nationals are entitled to pension through the General Pension and Social Security Authority (GPSSA).
    Pension is calculated based on years of service and final salary; full pension at 35 years of service or age 60.
    Expatriate employees receive end-of-service gratuity under UAE Labour Law.
    Gratuity: 21 days basic salary per year for first 5 years; 30 days per year thereafter; capped at 2 years total salary.
    Gratuity is paid upon termination, resignation after 1+ years, or end of contract.
    The new Savings Scheme (DEWS for DIFC, End of Service Savings for mainland) replaces gratuity for enrolled employees.
    Apply for pension via GPSSA website or authorised service centers.`
  },

  // ── UTILITIES & ENVIRONMENT ──────────────────────────────────────────────
  {
    id: 'POL-029',
    title: 'DEWA Connection — Dubai',
    emirate: 'Dubai',
    category: 'utilities',
    content: `Dubai Electricity and Water Authority (DEWA) provides electricity and water services in Dubai.
    New connection requires: Ejari certificate, Emirates ID, and security deposit (AED 2,000 for apartments, AED 4,000 for villas).
    Apply online via DEWA app, website, or customer service centers.
    Connection is typically activated within 1–3 business days after application.
    Smart meters provide real-time consumption data via the DEWA app.
    Bill payment: via DEWA app, bank transfer, du/Etisalat payment, or service centers.
    Returned cheques or unpaid bills result in disconnection after notice period.`
  },
  {
    id: 'POL-030',
    title: 'ADDC/AADC Connection — Abu Dhabi',
    emirate: 'Abu Dhabi',
    category: 'utilities',
    content: `Abu Dhabi Distribution Company (ADDC) and Al Ain Distribution Company (AADC) supply electricity and water in Abu Dhabi emirate.
    New connection requires: Tawtheeq certificate, Emirates ID, and refundable security deposit.
    Apply via TAMM platform or directly at ADDC/AADC service centers.
    UAE nationals receive subsidised utility rates under government support schemes.
    Expatriate rates are higher than national rates per Federal Electricity and Water Authority (FEWA) tariff structure.
    Smart home meters are being rolled out across Abu Dhabi emirate.
    Connection processing: 3–5 business days.`
  },

  // ── ADDITIONAL SERVICES ──────────────────────────────────────────────────
  {
    id: 'POL-031',
    title: 'Birth Certificate Registration',
    emirate: 'All UAE',
    category: 'identity',
    content: `Births in the UAE must be registered within 30 days at the hospital or relevant authority.
    Hospital births: hospital submits the notification; parents collect the birth certificate from the Civil Registry.
    Required documents: parents' passports, Emirates IDs, marriage certificate, and hospital birth notification.
    UAE national births are registered with the Abu Dhabi Civil Registry or respective emirate registry.
    Expatriate births require registration at the parents' home country embassy as well.
    Late registration (after 30 days) may incur a fine of AED 25/day up to AED 1,000.
    Birth certificate is required for school enrollment, passport, and Emirates ID.`
  },
  {
    id: 'POL-032',
    title: 'Marriage Certificate — UAE',
    emirate: 'All UAE',
    category: 'identity',
    content: `Muslim marriages in the UAE are registered through the Islamic Affairs and Charitable Activities Department.
    Non-Muslim expatriates may register marriages at their home country embassy or through UAE courts.
    UAE nationals: marriage contract signed before a UAE marriage officer; registration at Civil Registry.
    Required documents: Emirates IDs, passport copies, birth certificates, medical fitness certificates, and no-objection letter from employer (if applicable).
    Marriage grant for UAE nationals: available through the Marriage Fund (Zayed Higher Organisation) for UAE national men marrying UAE national women.
    Foreign marriages must be attested by the UAE Ministry of Foreign Affairs for use in the country.`
  },
  {
    id: 'POL-033',
    title: 'UAE Passport Renewal — Nationals',
    emirate: 'All UAE',
    category: 'identity',
    content: `UAE national passports are renewed through the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP).
    Application via ICP website, smart app, or ICP service centers.
    Required: current passport, Emirates ID, and passport-size photograph.
    Processing fee: AED 200 for 5-year passport; AED 300 for 10-year passport (adults).
    Express service available for AED 150 additional fee.
    Processing time: 3–7 business days (express: same day or next day).
    Lost or stolen passport: must file a police report before applying for replacement.`
  },
  {
    id: 'POL-034',
    title: 'Noise and Environmental Complaints',
    emirate: 'All UAE',
    category: 'environment',
    content: `Noise complaints in residential areas can be filed with the local municipality or police.
    Dubai: file via Dubai Municipality app or call 800-900.
    Abu Dhabi: report via TAMM or Abu Dhabi City Municipality.
    Construction noise is restricted to specific hours: 7am–8pm on weekdays; prohibited on Fridays and public holidays without special permit.
    Environmental complaints (littering, illegal dumping, air pollution) are handled by each emirate's Environment Agency.
    Abu Dhabi: Environment Agency Abu Dhabi (EAD).
    Dubai: Dubai Municipality Environment Department.
    Penalties for environmental violations range from AED 500 to AED 500,000 depending on severity.`
  },
  {
    id: 'POL-035',
    title: 'Golden Visa Application',
    emirate: 'All UAE',
    category: 'identity',
    content: `The UAE Golden Visa provides long-term residence (5 or 10 years) to eligible individuals.
    Eligible categories: investors (property worth AED 2M+, or AED 2M business investment), entrepreneurs, specialised talents (doctors, scientists, engineers, artists), outstanding students, and humanitarian pioneers.
    Application via ICA website, GDRFA (Dubai), or TAMM (Abu Dhabi).
    Required documents: passport, Emirates ID, proof of eligibility (property deed, business registration, qualifications, etc.).
    Fee: varies by category; approximately AED 2,800 for 10-year visa.
    Golden Visa holders can sponsor unlimited family members and domestic workers.
    No requirement for UAE national sponsor.`
  }

];

module.exports = policies;