export default defineNuxtRouteMiddleware((to) => {
  const login = "/login";
  const callback = "/confirm";

  // Do not redirect on login route and callback route
  if (to.path === login || to.path === callback) {
    return;
  }

  const user = useAuth().user;
  if (!user.value) {
    return navigateTo(login);
  }
});
