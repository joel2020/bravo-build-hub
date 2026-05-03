import { Router, type IRouter } from "express";
import healthRouter from "./health";
import backlinksRouter from "./backlinks";
import citationsRouter from "./citations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(backlinksRouter);
router.use(citationsRouter);

export default router;
