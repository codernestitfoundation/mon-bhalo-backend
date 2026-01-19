import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { createUserSchema, updateUserSchema } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserSchema),
  UserControllers.createUser,
);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.getAllUsers,
);
router.patch(
  "/:id",
  validateRequest(updateUserSchema),
  checkAuth(...Object.values(Role)),
  UserControllers.updateUser,
);

export const UserRoutes = router;
