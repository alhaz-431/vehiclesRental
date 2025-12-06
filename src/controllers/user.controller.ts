import { Request, Response } from "express";
import { pool } from "../models/db";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT id, name, email, phone, role FROM users`);
    res.status(200).json({ success: true, message: "Users retrieved successfully", data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error fetching users", errors: err.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, role } = req.body;

    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (req.user.role !== "admin" && req.user.id != Number(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const result = await pool.query(
      `UPDATE users 
       SET name=COALESCE($1, name), 
           email=COALESCE($2, email), 
           phone=COALESCE($3, phone), 
           role=COALESCE($4, role), 
           updated_at=NOW() 
       WHERE id=$5 RETURNING id, name, email, phone, role`,
      [name, email?.toLowerCase(), phone, role, userId]
    );

    res.status(200).json({ success: true, message: "User updated successfully", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error updating user", errors: err.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

    const bookings = await pool.query(
      `SELECT * FROM bookings WHERE customer_id=$1 AND status='active'`,
      [userId]
    );
    if (bookings.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete user with active bookings" });
    }

    await pool.query(`DELETE FROM users WHERE id=$1`, [userId]);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error deleting user", errors: err.message });
  }
};
