export default defineNuxtRouteMiddleware((to) => {
  const home = "/";
  const login = "/login";
  const callback = "/confirm";

  // On the login page, check whether the user is logged in. If so, redirect to the home page.
  if (to.path === login) {
    if (isDefined(useAuth().user)) {
      return navigateTo(home);
    }
  } else if (to.path === callback) {
    // On the callback page, do nothing.
    return;
  } else {
    // On any other page, check whether the user is logged in. If not, redirect to the login page.
    if (!isDefined(useAuth().user)) {
      return navigateTo(login);
    }
  }
});
