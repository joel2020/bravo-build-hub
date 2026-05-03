import { Router, type IRouter } from "express";
import healthRouter from "./health";
import backlinksRouter from "./backlinks";
import citationsRouter from "./citations";
import socialRouter from "./social";

const router: IRouter = Router();

router.use(healthRouter);
router.use(backlinksRouter);
router.use(citationsRouter);
router.use(socialRouter);

export default router;
