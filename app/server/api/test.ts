export default defineEventHandler((event) => {
  setResponseStatus(event, 202);

  // Wait 120 seconds before console logging
  setTimeout(() => {
    console.log("Hello from the server!");
  }, 120000);
});
