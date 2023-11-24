export default defineEventHandler((event) => {
  setResponseStatus(event, 202);

  fetch("/api/hello");
});
