import { Router } from "express";
import {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller";

import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createVehicle);
router.get("/", getVehicles);
router.get("/:id", getVehicles);
router.patch("/:id", authenticate, updateVehicle);
router.delete("/:id", authenticate, deleteVehicle);

export default router;
