// ─────────────────────────────────────────
// TEXT DETECTION — topic groups, emirate detection, Arabic detection
// Extracted from server.js (v3.8.0) for unit testability.
// ─────────────────────────────────────────


// NOTE: 'driving' topic group removed in v3.6.0 — transport queries
// (driving license, vehicle registration, traffic fines) now belong
// to the sister project, Tawfeer (tawfeer-ai.onrender.com).
const TOPIC_GROUPS = {
    school:   ['school', 'education', 'enroll', 'enrollment', 'student', 'khda', 'adek', 'university', 'college', 'child', 'kindergarten', 'kg'],
    insurance:['insurance', 'health', 'dha', 'daman', 'coverage', 'medical', 'clinic', 'hospital'],
    visa:     ['visa', 'residency', 'residence', 'emirates id', 'eid', 'passport', 'golden', 'permit', 'immigration', 'ica'],
    housing:  ['housing', 'tenancy', 'tenant', 'rent', 'rental', 'ejari', 'tawtheeq', 'apartment', 'flat', 'property'],
    business: ['business', 'trade', 'license', 'freelance', 'vat', 'tax', 'commercial', 'company', 'startup', 'added', 'ded'],
    social:   ['social', 'support', 'gratuity', 'pension', 'disability', 'determination', 'zakat', 'welfare', 'end of service'],
    utilities:['electricity', 'water', 'dewa', 'addc', 'utility', 'bill'],
  };
  
  
  const EMIRATES = ['abu dhabi', 'dubai', 'sharjah', 'ajman', 'umm al quwain', 'ras al khaimah', 'fujairah', 'uaq', 'rak'];
  
  
  function detectTopicGroup(text) {
    const lower = text.toLowerCase();
    const scores = {};
    for (const [group, keywords] of Object.entries(TOPIC_GROUPS)) {
      scores[group] = keywords.filter(k => lower.includes(k)).length;
    }
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best && best[1] > 0 ? best[0] : null;
  }
  
  
  function detectEmirate(text) {
    const lower = text.toLowerCase();
    return EMIRATES.find(e => lower.includes(e)) || null;
  }
  
  
  function detectArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
  }
  
  
  module.exports = {
    TOPIC_GROUPS,
    EMIRATES,
    detectTopicGroup,
    detectEmirate,
    detectArabic,
  };  