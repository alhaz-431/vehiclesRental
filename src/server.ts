import express from "express";
import dotenv from "dotenv";
import initDB from "./models/db.js";


import authRoutes from "./routes/auth.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running perfectly!");
});


initDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}



export default app;