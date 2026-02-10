import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
// import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { PsychologistControllers } from "./psychologist.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createPsychologistSchema, updatePsychologistSchema } from "./psychologist.validation";
import { multerUpload } from "../../config/multer.config";
// import { createPsychologistSchema, updatePsychologistSchema } from "./psychologist.validation";

const router = Router();

router.post(
  "/apply",
  checkAuth(Role.USER),
  multerUpload.array("files"),
  validateRequest(createPsychologistSchema),
  PsychologistControllers.applyAsPsychologist,
);

router.patch(
  "/approve/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  PsychologistControllers.approvePsychologist,
);

router.get("/", PsychologistControllers.getAllPsychologists);

router.patch(
  "/:id",
  checkAuth(Role.PSYCHOLOGIST, Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("files"),
  validateRequest(updatePsychologistSchema),
  PsychologistControllers.updatePsychologist,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  PsychologistControllers.deletePsychologist,
);

export const PsychologistRoutes = router;
