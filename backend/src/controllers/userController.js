import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";

export const DEFAULT_PASSWORD = "Trans#2026";

const ALLOWED_ROLES = ["DRIVER", "FLEET_MANAGER", "OPERATIONS_MANAGER", "MAINTENANCE_COMPLIANCE", "TECHNICIAN_MECHANIC"];

function clean(value) {
  return typeof value === "string" ? value.trim() : value;
}

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, active: true, workshop: true, driverId: true, createdAt: true, driver: { select: { employeeNumber: true, firstName: true, lastName: true } } },
  });
  res.json({ success: true, data: users });
}

export async function createUser(req, res) {
  try {
    const { name, email, role, phone, employeeNumber, licenseNumber, licenseExpiry, workshop } = req.body;
    const normalizedEmail = clean(email)?.toLowerCase();
    const normalizedName = clean(name);

    if (!normalizedName || !normalizedEmail || !role) return res.status(400).json({ success: false, message: "Name, email and role are required." });
    if (!ALLOWED_ROLES.includes(role)) return res.status(400).json({ success: false, message: "Invalid account role." });

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ success: false, message: "An account with this email already exists." });

    if (role === "DRIVER") {
      if (!employeeNumber || !licenseNumber) return res.status(400).json({ success: false, message: "Driver accounts require employee number and license number." });
      const existingDriver = await prisma.driver.findFirst({ where: { OR: [{ employeeNumber: clean(employeeNumber) }, { licenseNumber: clean(licenseNumber) }, { email: normalizedEmail }] } });
      if (existingDriver) return res.status(409).json({ success: false, message: "The driver employee number, license number, or email is already in use." });
    }

    const password = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    const result = await prisma.$transaction(async (tx) => {
      let driverId = null;
      if (role === "DRIVER") {
        const parts = normalizedName.split(/\s+/);
        const firstName = parts.shift() || normalizedName;
        const lastName = parts.join(" ") || "Driver";
        const driver = await tx.driver.create({ data: { employeeNumber: clean(employeeNumber), firstName, lastName, email: normalizedEmail, phone: clean(phone) || null, licenseNumber: clean(licenseNumber), licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null } });
        driverId = driver.id;
      }
      return tx.user.create({ data: { name: normalizedName, email: normalizedEmail, password, role, driverId, workshop: clean(workshop) || null } });
    });

    return res.status(201).json({ success: true, data: { id: result.id, name: result.name, email: result.email, role: result.role, driverId: result.driverId }, credentials: { email: normalizedEmail, password: DEFAULT_PASSWORD } });
  } catch (error) {
    console.error("createUser", error);
    return res.status(500).json({ success: false, message: error.code === "P2002" ? "A unique account or driver value already exists." : "Unable to create user." });
  }
}


export async function updateUser(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: "Invalid user ID." });
  if (id === req.user.id) return res.status(400).json({ success: false, message: "Use your own profile settings to change your account details." });
  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "User not found." });
    const name = clean(req.body.name);
    const email = clean(req.body.email)?.toLowerCase();
    const workshop = clean(req.body.workshop) || null;
    if (!name || !email) return res.status(400).json({ success: false, message: "Name and email are required." });
    if (existing.role === "TECHNICIAN_MECHANIC" && !workshop) return res.status(400).json({ success: false, message: "Workshop is required for a Mechanic." });
    const duplicate = await prisma.user.findFirst({ where: { email, NOT: { id } }, select: { id: true } });
    if (duplicate) return res.status(409).json({ success: false, message: "An account with this email already exists." });
    const updated = await prisma.user.update({
      where: { id },
      data: { name, email, workshop: existing.role === "TECHNICIAN_MECHANIC" ? workshop : existing.workshop },
      select: { id: true, name: true, email: true, role: true, active: true, workshop: true, driverId: true, driver: { select: { employeeNumber: true, firstName: true, lastName: true } } },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("updateUser", error);
    return res.status(500).json({ success: false, message: error.code === "P2002" ? "An account with this email already exists." : "Unable to update user." });
  }
}

export async function updateUserStatus(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: "Invalid user ID." });
  if (id === req.user.id) return res.status(400).json({ success: false, message: "You cannot deactivate your own account." });
  const user = await prisma.user.update({ where: { id }, data: { active: Boolean(req.body.active) }, select: { id: true, active: true } });
  res.json({ success: true, data: user });
}

export async function resetPassword(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: "Invalid user ID." });
  const password = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  await prisma.user.update({ where: { id }, data: { password } });
  res.json({ success: true, credentials: { password: DEFAULT_PASSWORD } });
}

export async function deleteUser(req,res){
 const id=Number(req.params.id); if(!Number.isInteger(id)) return res.status(400).json({success:false,message:"Invalid user ID."});
 if(id===req.user.id) return res.status(400).json({success:false,message:"You cannot delete your own account."});
 const user=await prisma.user.findUnique({where:{id}}); if(!user) return res.status(404).json({success:false,message:"User not found."});
 await prisma.user.delete({where:{id}}); return res.json({success:true,message:"User deleted successfully."});
}
