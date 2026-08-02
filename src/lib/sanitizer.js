// ─────────────────────────────────────────
// OUTPUT SANITISER
// Extracted from server.js (v3.8.0) for unit testability.
// Strips characters outside Arabic Unicode, Latin, digits, standard
// punctuation and whitespace — catches the Chinese-char hallucination
// bug (e.g. ل避ance) before it reaches the user.
// ─────────────────────────────────────────


function sanitiseOutput(text, isArabic) {
    if (!text) return text;
  
  
    if (isArabic) {
      // Arabic response: keep Arabic script, Latin (for policy IDs like POL-001),
      // digits, common punctuation, whitespace
      return text
        .replace(/[^\u0600-\u06FF\u0020-\u007Ea-zA-Z0-9\s\n\r.,!?;:()\-\[\]\/٪٫٬،؛؟۰-۹]/g, '')
        .replace(/\s{3,}/g, '\n\n')  // collapse excessive whitespace
        .trim();
    } else {
      // English response: keep Latin, digits, standard punctuation, whitespace
      // Allow Arabic only for proper nouns inside English answers (e.g. policy titles)
      return text
        .replace(/[^\u0000-\u007F\u0600-\u06FF\u00C0-\u024F\s\n\r]/g, '')
        .replace(/\s{3,}/g, '\n\n')
        .trim();
    }
  }
  
  
  module.exports = { sanitiseOutput };  