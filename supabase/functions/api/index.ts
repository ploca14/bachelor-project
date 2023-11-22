import { Application } from "https://deno.land/x/oak/mod.ts";
import router from "./routes.ts";
import notFoundController from "./controllers/notFoundController.ts";
import errorMiddleware from "./middleware/errorMiddleware.ts";

const app = new Application();

app.use(errorMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(notFoundController);

await app.listen({ port: 8000 });
