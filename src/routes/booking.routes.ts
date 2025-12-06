import { Router } from "express";
import { createBooking, getMyBookings, updateBooking } from "../controllers/booking.controller";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createBooking);

router.get("/me", authenticate, getMyBookings);

router.patch("/:bookingId/cancel", authenticate, (req, res) => {
  req.body.status = "cancelled";
  updateBooking(req, res);
});

router.patch("/:bookingId/return", authenticate, (req, res) => {
  req.body.status = "returned";
  updateBooking(req, res);
});

export default router;
