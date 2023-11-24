export default defineEventHandler((event) => {
  setResponseStatus(event, 202);

  // Wait 120 seconds before console logging
  console.log("Waiting 120 seconds...", new Date());
  setTimeout(() => {
    console.log("Done waiting!");
  }, 120000);
});
