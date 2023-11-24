export default defineEventHandler((event) => {
  setResponseStatus(event, 202);

  console.log("Waiting 10 seconds...", new Date());
  setTimeout(() => {
    console.log("Done waiting!");
  }, 10000);

  // Wait 120 seconds before console logging
  console.log("Waiting 120 seconds...", new Date());
  setTimeout(() => {
    console.log("Done waiting!");
  }, 120000);
});
