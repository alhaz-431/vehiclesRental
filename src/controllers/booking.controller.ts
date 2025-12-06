

import { AuthRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import { pool } from "../models/db";
import { calculatePrice } from "../utils/calculatePrice";

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {

    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;


    const vehicleRes = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [vehicle_id]);
    if (!vehicleRes.rows.length) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    if (vehicleRes.rows[0].availability_status !== "available") {
      return res.status(400).json({ success: false, message: "Vehicle not available" });
    }

    const total_price = calculatePrice(vehicleRes.rows[0].daily_rent_price, rent_start_date, rent_end_date);

    const bookingRes = await pool.query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
       VALUES ($1,$2,$3,$4,$5,'active') RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    await pool.query(`UPDATE vehicles SET availability_status='booked' WHERE id=$1`, [vehicle_id]);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: { ...bookingRes.rows[0], vehicle: vehicleRes.rows[0] },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error creating booking", errors: err.message });
  }
};



export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    let result;

    if (req.user.role === "admin") {
      result = await pool.query(
        `SELECT b.*, u.name AS customer_name, u.email AS customer_email, v.vehicle_name, v.registration_number
         FROM bookings b
         JOIN users u ON b.customer_id=u.id
         JOIN vehicles v ON b.vehicle_id=v.id`
      );
      res.status(200).json({ success: true, message: "Bookings retrieved successfully", data: result.rows });
    } else {
      result = await pool.query(
        `SELECT b.*, v.vehicle_name, v.registration_number, v.type
         FROM bookings b
         JOIN vehicles v ON b.vehicle_id=v.id
         WHERE b.customer_id=$1`,
        [req.user.id]
      );
      res.status(200).json({ success: true, message: "Your bookings retrieved successfully", data: result.rows });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error fetching bookings", errors: err.message });
  }
};



export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const bookingRes = await pool.query(`SELECT * FROM bookings WHERE id=$1`, [bookingId]);
    if (!bookingRes.rows.length) return res.status(404).json({ success: false, message: "Booking not found" });

    const booking = bookingRes.rows[0];

    if (status === "cancelled") {
      if (req.user.role !== "customer" || req.user.id !== booking.customer_id)
        return res.status(403).json({ success: false, message: "Forbidden" });

      if (new Date() >= new Date(booking.rent_start_date))
        return res.status(400).json({ success: false, message: "Cannot cancel after start date" });

      await pool.query(`UPDATE bookings SET status='cancelled' WHERE id=$1`, [bookingId]);
      await pool.query(`UPDATE vehicles SET availability_status='available' WHERE id=$1`, [booking.vehicle_id]);

      res.status(200).json({ success: true, message: "Booking cancelled successfully", data: { ...booking, status: "cancelled" } });
    } else if (status === "returned") {
      if (req.user.role !== "admin")
        return res.status(403).json({ success: false, message: "Forbidden" });

      await pool.query(`UPDATE bookings SET status='returned' WHERE id=$1`, [bookingId]);
      await pool.query(`UPDATE vehicles SET availability_status='available' WHERE id=$1`, [booking.vehicle_id]);

      res.status(200).json({
        success: true,
        message: "Booking marked as returned. Vehicle is now available",
        data: { ...booking, status: "returned", vehicle: { availability_status: "available" } },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid status update" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error updating booking", errors: err.message });
  }
};


