import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "transsafe-dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "12h";

export async function login(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (user.active === false) return res.status(403).json({ success: false, message: "This account is inactive. Contact the system administrator." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid email or password." });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role, driverId: user.driverId || null }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, driverId: user.driverId || null };
    return res.json({ success: true, data: { token, user: safeUser } });
  } catch (error) {
    console.error("[AUTH LOGIN ERROR]", error);
    return res.status(500).json({ success: false, message: "Login failed on the server. Check the backend console for details." });
  }
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { driver: true } });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, driverId: user.driverId, driver: user.driver || null } });
  } catch (error) {
    console.error("[AUTH ME ERROR]", error);
    return res.status(500).json({ success: false, message: "Unable to load your account." });
  }
}
