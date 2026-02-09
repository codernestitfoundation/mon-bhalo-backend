import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { PsychologistRoutes } from "../modules/psychologist/psychologist.route";
import { SlotRoutes } from "../modules/slot/slot.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { PaymentRoutes } from '../modules/payment/payment.route';
import { OtpRoutes } from "../modules/otp/otp.route";
import { StatsRoutes } from "../modules/stats/stats.route";


const router = Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/psychologist',
        route: PsychologistRoutes
    },
    {
        path: '/slot',
        route: SlotRoutes
    },
    {
        path: '/booking',
        route: BookingRoutes
    },
    {
        path: '/payment',
        route: PaymentRoutes
    },
    {
        path: '/otp',
        route: OtpRoutes
    },
    {
        path: '/stats',
        route: StatsRoutes
    },
]

moduleRoutes.forEach(({ path, route }) => {
    router.use(path, route);
});

export default router;
