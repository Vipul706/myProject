import { Router } from "express";
import type { RequestHandler } from "express-serve-static-core";
import { getCvTemp } from "../../controller/index";
import { AppError } from "../../types/express-error";
import { emitter } from "../../utils/emiter";

const cvTemplatesRoutes = async (...middlewares: RequestHandler[]) => {
  try {
    const route = Router();
    route.get("/", ...middlewares, getCvTemp);
    emitter.emit("log", {
      msg: `Cv Request Route Initialized`,
      level: "info",
    });
    return route;
  } catch (error: unknown) {
    const errObj = error as Error;
    const err = new AppError(
      errObj.stack ?? "No stack",
      errObj.message ?? "Unknown error",
      500,
      cvTemplatesRoutes.name,
      errObj.name ?? "UnknownError"
    );

    throw err;
  }
};

export { cvTemplatesRoutes };
