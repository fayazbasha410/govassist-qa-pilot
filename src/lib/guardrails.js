// ─────────────────────────────────────────
// GUARDRAILS — prompt injection + off-topic detection (EN + AR)
// Extracted from server.js (v3.8.0) for unit testability.
// ─────────────────────────────────────────


const BANNED_PHRASES = [
    'ignore previous instructions', 'ignore all instructions', 'you are now',
    'pretend you are', 'forget your instructions', 'jailbreak', 'dan mode',
    'developer mode', 'system prompt', 'override', 'bypass'
  ];
  
  
  const ARABIC_BANNED_PHRASES = [
    'تجاهل التعليمات', 'تجاهل جميع التعليمات', 'أنت الآن', 'تظاهر بأنك',
    'انسَ تعليماتك', 'تجاوز', 'بدون قيود', 'بلا قيود', 'وضع المطور',
    'الموجه النظامي', 'تجاوز إعداداتك', 'تجاوز القيود', 'تصرف كمساعد مختلف'
  ];
  
  
  const OFF_TOPIC_PHRASES = [
    'weather', 'recipe', 'sports', 'movie', 'music', 'joke', 'game',
    'dating', 'stock', 'crypto', 'bitcoin', 'football', 'cricket',
    'basketball', 'tennis', 'match'
  ];
  
  
  const ARABIC_OFF_TOPIC_PHRASES = [
    'الطقس', 'وصفة', 'رياضة', 'كرة القدم', 'كرة السلة', 'مباراة',
    'فيلم', 'موسيقى', 'نكتة', 'العملات المشفرة', 'بيتكوين', 'مواعدة',
    'الأسهم', 'البورصة'
  ];
  
  
  function checkGuardrails(message) {
    const lower = message.toLowerCase();
  
  
    for (const p of BANNED_PHRASES) {
      if (lower.includes(p)) return { blocked: true, reason: 'prompt_injection', message: 'I can only assist with UAE government services. I cannot follow instructions that attempt to change my behaviour.' };
    }
    for (const p of ARABIC_BANNED_PHRASES) {
      if (message.includes(p)) return { blocked: true, reason: 'prompt_injection', message: 'يمكنني فقط المساعدة في خدمات حكومة الإمارات. لا يمكنني اتباع تعليمات تحاول تغيير سلوكي.' };
    }
    for (const t of OFF_TOPIC_PHRASES) {
      if (lower.includes(t)) return { blocked: true, reason: 'off_topic', message: `I'm GovMurshid, specialising in UAE government services across all seven emirates. I can help with Emirates ID, visas, appointments, housing, healthcare, education, business, and social services.` };
    }
    for (const t of ARABIC_OFF_TOPIC_PHRASES) {
      if (message.includes(t)) return { blocked: true, reason: 'off_topic', message: `أنا GovMurshid، متخصص في خدمات حكومة الإمارات عبر جميع الإمارات السبع.` };
    }
    return { blocked: false };
  }
  
  
  module.exports = {
    BANNED_PHRASES,
    ARABIC_BANNED_PHRASES,
    OFF_TOPIC_PHRASES,
    ARABIC_OFF_TOPIC_PHRASES,
    checkGuardrails,
  };  