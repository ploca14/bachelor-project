import { Application } from "https://deno.land/x/oak/mod.ts";
import router from "./routes";
import _404 from "./controllers/404";
import errorHandler from "./controllers/errorHandler";

const app = new Application();

app.use(errorHandler);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(_404);

await app.listen({ port: 8000 });
