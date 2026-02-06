import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { SlotControllers } from "./slot.controller";

const router = Router();

router.post("/generate", checkAuth(Role.PSYCHOLOGIST), SlotControllers.createSlots);

router.get("/", checkAuth(...Object.values(Role)), SlotControllers.getAllSlots);

router.delete("/:id", checkAuth(Role.PSYCHOLOGIST, Role.ADMIN, Role.SUPER_ADMIN), SlotControllers.deleteSlotById);

router.delete("/bulk-delete", checkAuth(Role.PSYCHOLOGIST), SlotControllers.deleteSlotsByDate);

export const SlotRoutes = router;