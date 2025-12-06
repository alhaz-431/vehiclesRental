import { Request, Response } from "express";
import { pool } from "../models/db";

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
    const result = await pool.query(
      `INSERT INTO vehicles (vehicle_name,type,registration_number,daily_rent_price,availability_status)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );
    res.status(201).json({ success: true, message: "Vehicle created successfully", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error creating vehicle", errors: err.message });
  }
};

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM vehicles`);
    if (result.rows.length === 0)
      return res.status(200).json({ success: true, message: "No vehicles found", data: [] });

    res.status(200).json({ success: true, message: "Vehicles retrieved successfully", data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error fetching vehicles", errors: err.message });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const result = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [vehicleId]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Vehicle not found" });

    res.status(200).json({ success: true, message: "Vehicle retrieved successfully", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error fetching vehicle", errors: err.message });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

    const result = await pool.query(
      `UPDATE vehicles SET vehicle_name=COALESCE($1,vehicle_name), type=COALESCE($2,type), registration_number=COALESCE($3,registration_number), daily_rent_price=COALESCE($4,daily_rent_price), availability_status=COALESCE($5,availability_status), updated_at=NOW() WHERE id=$6 RETURNING *`,
      [vehicle_name, type, registration_number, daily_rent_price, availability_status, vehicleId]
    );

    if (!result.rows.length) return res.status(404).json({ success: false, message: "Vehicle not found" });

    res.status(200).json({ success: true, message: "Vehicle updated successfully", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error updating vehicle", errors: err.message });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;

    const bookings = await pool.query(`SELECT * FROM bookings WHERE vehicle_id=$1 AND status='active'`, [vehicleId]);
    if (bookings.rows.length > 0) return res.status(400).json({ success: false, message: "Cannot delete vehicle with active bookings" });

    await pool.query(`DELETE FROM vehicles WHERE id=$1`, [vehicleId]);
    res.status(200).json({ success: true, message: "Vehicle deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error deleting vehicle", errors: err.message });
  }
};
