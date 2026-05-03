import { Router, type IRouter } from "express";
import healthRouter from "./health";
import backlinksRouter from "./backlinks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(backlinksRouter);

export default router;
