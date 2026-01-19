import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserSchema } from "./user.validation";

const router = Router();

router.post('/register', validateRequest(createUserSchema), UserControllers.createUser);
router.get('/', UserControllers.getAllUsers);


export const UserRoutes = router;