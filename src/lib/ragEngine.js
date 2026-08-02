// ─────────────────────────────────────────
// RAG ENGINE — retrieval with emirate boost, confidence scoring
// Extracted from server.js (v3.8.0) for unit testability.
// ─────────────────────────────────────────


const { detectEmirate } = require('./textDetection');


const SYNONYMS = {
  'expires':      ['expiry', 'expired', 'renewal', 'renew'],
  'expired':      ['expiry', 'expired', 'renewal'],
  'register':     ['registration', 'registered'],
  'registration': ['register', 'registered', 'mandatory', 'threshold'],
  'renew':        ['renewal', 'renewing', 'renewed'],
  'renewal':      ['renew', 'renewed'],
  'pay':          ['payment', 'paying', 'paid'],
  'payment':      ['pay', 'paid'],
  'apply':        ['application', 'applying'],
  'application':  ['apply', 'applying'],
  'mandatory':    ['required', 'compulsory', 'must'],
  'required':     ['mandatory', 'compulsory', 'requirement'],
  'documents':    ['document', 'documentation', 'requirements'],
  'license':      ['licence', 'licensed'],
  'school':       ['education', 'enrollment', 'enroll'],
  'enroll':       ['enrollment', 'school', 'education'],
  'insurance':    ['insured', 'coverage', 'health'],
  'tenancy':      ['tenant', 'rent', 'rental', 'contract'],
  'contract':     ['tenancy', 'rental', 'agreement'],
  'visa':         ['residency', 'residence', 'permit'],
  'benefits':     ['gratuity', 'entitlement', 'service'],
  'gratuity':     ['benefits', 'entitlement', 'end of service'],
  'trade':        ['business', 'commercial', 'license'],
  'vat':          ['tax', 'value added', 'federal tax', 'taxable', 'supplies'],
  'threshold':    ['exceeding', 'mandatory', 'registration', 'taxable'],
  'golden':       ['visa', 'long-term', 'residence'],
};


function retrieveRelevantDocs(query, policies, topK = 5) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);


  const expandedWords = new Set(queryWords);
  for (const word of queryWords) {
    const syns = SYNONYMS[word] || [];
    syns.forEach(s => expandedWords.add(s));
  }


  const queryEmirate = detectEmirate(query);


  const scored = policies.map(doc => {
    const text = (
      doc.title + ' ' +
      doc.content + ' ' +
      (doc.emirate || '') + ' ' +
      (doc.category || '')
    ).toLowerCase();


    let score = 0;
    for (const word of expandedWords) {
      if (text.includes(word)) score += 1;
    }
    for (const word of queryWords) {
      if (doc.title.toLowerCase().includes(word)) score += 2;
    }


    if (queryEmirate) {
      const docEmirate = (doc.emirate || '').toLowerCase();
      if (docEmirate === queryEmirate) {
        score += 5;
      } else if (docEmirate === 'all uae' || docEmirate === 'uae') {
        score += 1;
      } else if (docEmirate && docEmirate !== queryEmirate) {
        score -= 2;
      }
    }


    return { ...doc, score };
  });


  return scored
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}


function computeConfidence(docs, query) {
  if (!docs || docs.length === 0) {
    return { level: 'low', label: 'Low confidence', policyId: null, reason: 'No matching policies found' };
  }


  const top = docs[0];
  const second = docs[1];
  const topScore = top.score || 0;
  const scoreGap = second ? topScore - (second.score || 0) : topScore;
  const queryEmirate = detectEmirate(query);
  const emirateMatch = queryEmirate && (top.emirate || '').toLowerCase() === queryEmirate;


  let level, label, reason;


  if (topScore >= 8 && scoreGap >= 3) {
    level = 'high';
    label = 'High confidence';
    reason = emirateMatch
      ? `Matched emirate-specific policy ${top.id}`
      : `Strong match on ${top.id}`;
  } else if (topScore >= 5 || scoreGap >= 2) {
    level = 'medium';
    label = 'Medium confidence';
    reason = `Partial match — please verify at the official portal`;
  } else {
    level = 'low';
    label = 'Low confidence';
    reason = `Weak match — please verify at the relevant UAE portal`;
  }


  return { level, label, policyId: top.id, reason };
}


module.exports = {
  SYNONYMS,
  retrieveRelevantDocs,
  computeConfidence,
};