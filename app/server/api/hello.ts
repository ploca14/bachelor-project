export default defineEventHandler(async (event) => {
  console.log("starting");
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log("progress");
  await new Promise((resolve) => setTimeout(resolve, 120000));
  console.log("done");

  return {
    hello: "world",
  };
});
