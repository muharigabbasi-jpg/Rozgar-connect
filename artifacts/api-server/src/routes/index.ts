import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import workersRouter from "./workers";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(workersRouter);
router.use(bookingsRouter);
router.use(reviewsRouter);
router.use(statsRouter);

export default router;
