import express from "express";
import dotenv from "dotenv";
import initDB from "./models/db";


import authRoutes from "./routes/auth.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import bookingRoutes from "./routes/booking.routes";

dotenv.config();

const app = express();
app.use(express.json());

initDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
