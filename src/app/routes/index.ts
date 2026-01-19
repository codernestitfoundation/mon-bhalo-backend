import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";


const router = Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
]

moduleRoutes.forEach(({ path, route }) => {
    router.use(path, route);
});

export default router;
