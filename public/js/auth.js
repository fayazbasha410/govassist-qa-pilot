// ─────────────────────────────────────────
// GovMurshid — Auth Helper
// Adapted from Tawfeer's proven pattern (public/js/auth.js)
// ─────────────────────────────────────────


var AUTH_TOKEN_KEY = 'govmurshid_token';
var AUTH_USER_KEY  = 'govmurshid_user';


function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}


function getStoredUser() {
  var raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}


function storeAuth(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}


function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}


function isLoggedIn() {
  return !!getStoredToken() && !!getStoredUser();
}


// GovMurshid, unlike Tawfeer, allows fully anonymous chat — requireAuth()
// exists for future account-only pages (e.g. a profile/history view),
// not the main chat itself. Not called from index.html today.
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}


function requireGuest() {
  if (isLoggedIn()) {
    window.location.href = '/';
    return false;
  }
  return true;
}


function logout() {
  var token = getStoredToken();
  if (token) {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }).catch(function () {});
  }
  clearAuth();
  window.location.href = '/pages/login.html';
}


