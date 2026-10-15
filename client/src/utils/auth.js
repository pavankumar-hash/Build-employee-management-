export function logout() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("user");

  window.location.replace("/login");
}
