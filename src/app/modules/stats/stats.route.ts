import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";

const router = express.Router();

// Get a combined overview of all stats (High-level dashboard)
router.get(
    "/overview",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getAdminDashboardOverview
);

router.get(
    "/user",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getUserStats
);

router.get(
    "/psychologist",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getPsychologistStats
);

router.get(
    "/slot",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getSlotStats
);

router.get(
    "/booking",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getBookingStats
);

router.get(
    "/payment",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getPaymentStats
);

export const StatsRoutes = router;