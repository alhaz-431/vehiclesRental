
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../models/db";

const SALT_ROUNDS = 10;

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (name,email,password,phone,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,phone,role`,
      [name, email.toLowerCase(), hashedPassword, phone, role]
    );

    res.status(201).json({ success: true, message: "User registered successfully", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error registering user", errors: err.message });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userRes = await pool.query(`SELECT * FROM users WHERE email=$1`, [email.toLowerCase()]);
    const user = userRes.rows[0];

    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    res.status(200).json({ success: true, message: "Login successful", data: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Error signing in", errors: err.message });
  }
};


