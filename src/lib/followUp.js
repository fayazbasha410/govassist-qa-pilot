// ─────────────────────────────────────────
// FOLLOW-UP ENRICHMENT
// Extracted from server.js (v3.8.0) for unit testability.
// ─────────────────────────────────────────


const { TOPIC_GROUPS, EMIRATES, detectTopicGroup, detectEmirate } = require('./textDetection');


const FOLLOW_UP_TRIGGERS = [
  /^how about (.+)/i,
  /^what about (.+)/i,
  /^and (.+)/i,
  /^in (.+)/i,
  /^for (.+)/i,
  /^what (about )?(.+)/i,
];


function isFollowUp(message) {
  const lower = message.trim().toLowerCase();
  if (lower.split(/\s+/).length <= 4 && EMIRATES.some(e => lower.includes(e))) return true;
  return FOLLOW_UP_TRIGGERS.some(r => r.test(lower));
}


function enrichFollowUp(message, session) {
  const detectedEmirate = detectEmirate(message);
  const detectedTopic = detectTopicGroup(message);
  const topic = detectedTopic || session.currentTopic;
  const emirate = detectedEmirate || session.currentEmirate;
  if (!topic && !emirate) return message;
  const topicKeywords = topic ? TOPIC_GROUPS[topic].slice(0, 3).join(' ') : '';
  return [topicKeywords, emirate].filter(Boolean).join(' ');
}


module.exports = {
  FOLLOW_UP_TRIGGERS,
  isFollowUp,
  enrichFollowUp,
};