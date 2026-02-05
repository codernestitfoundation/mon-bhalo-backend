import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { PsychologistRoutes } from "../modules/psychologist/psychologist.route";
import { SlotRoutes } from "../modules/slot/slot.route";


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
]

moduleRoutes.forEach(({ path, route }) => {
    router.use(path, route);
});

export default router;
