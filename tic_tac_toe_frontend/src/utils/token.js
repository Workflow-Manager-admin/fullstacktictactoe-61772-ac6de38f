// PUBLIC_INTERFACE
export function getStoredToken() {
  return window.localStorage.getItem("ttt_token");
}
// PUBLIC_INTERFACE
export function removeStoredToken() {
  window.localStorage.removeItem("ttt_token");
}
