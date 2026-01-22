import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { PsychologistRoutes } from "../modules/psychologist/psychologist.route";


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
]

moduleRoutes.forEach(({ path, route }) => {
    router.use(path, route);
});

export default router;
