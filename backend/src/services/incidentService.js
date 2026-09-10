import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import prisma from "../config/prisma.js";

const INCIDENT_TYPES = [
  "COLLISION",
  "BREAKDOWN",
  "THEFT",
  "VANDALISM",
  "WEATHER",
  "FIRE",
  "INJURY",
  "MECHANICAL_FAILURE",
  "ROAD_HAZARD",
  "OTHER",
];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["OPEN", "UNDER_INVESTIGATION", "RESOLVED", "CLOSED"];
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const optionalNullableInt = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : Number(value)),
  z.number().int().positive().nullable()
);

const createSchema = z.object({
  vehicleId: z.coerce.number().int().positive(),
  driverId: optionalNullableInt.optional(),
  incidentDate: z.coerce.date(),
  incidentType: z.string().trim().min(2).max(100),
  severity: z.enum(SEVERITIES),
  location: z.string().trim().min(2).max(255),
  description: z.string().trim().min(10).max(5000),
  injuries: z.coerce.number().int().min(0).max(10000).default(0),
  estimatedCost: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : Number(value)),
    z.number().finite().min(0).max(1000000000).nullable()
  ).default(null),
  policeReported: z.preprocess(
    (value) => {
      if (value === true || value === "true" || value === 1 || value === "1") return true;
      if (value === false || value === "false" || value === 0 || value === "0") return false;
      return Boolean(value);
    },
    z.boolean()
  ).default(false),
  reportedBy: z.string().trim().min(2).max(150),
  status: z.enum(STATUSES).default("OPEN"),
  attachment: z.any().optional(),
  removeAttachment: z.preprocess(
    (value) => value === true || value === "true" || value === 1 || value === "1",
    z.boolean()
  ).optional().default(false),
});

const updateSchema = createSchema.partial().extend({
  vehicleId: z.coerce.number().int().positive().optional(),
  incidentDate: z.coerce.date().optional(),
  severity: z.enum(SEVERITIES).optional(),
  status: z.enum(STATUSES).optional(),
  removeAttachment: z.preprocess(
    (value) => value === true || value === "true" || value === 1 || value === "1",
    z.boolean()
  ).optional().default(false),
});

function validateDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Incident date is invalid.");
  }

  if (date.getTime() > Date.now()) {
    throw new Error("Incident date cannot be in the future.");
  }
}

function validateAttachment(attachment) {
  if (!attachment) return;

  if (typeof attachment !== "object") {
    throw new Error("Invalid attachment.");
  }

  const { name, type, size, data } = attachment;

  if (!name || !type || !data) {
    throw new Error("Attachment is incomplete.");
  }

  const numericSize = Number(size);
  if (!Number.isFinite(numericSize) || numericSize <= 0 || numericSize > MAX_ATTACHMENT_BYTES) {
    throw new Error("Attachment must be 5 MB or smaller.");
  }

  if (!ALLOWED_ATTACHMENT_TYPES.includes(type)) {
    throw new Error("Only PDF, JPG, PNG, and WEBP files are supported.");
  }

  if (typeof data !== "string" || !data.startsWith("data:")) {
    throw new Error("Invalid attachment data.");
  }
}

function safeFileName(name) {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return `${Date.now()}-${randomUUID()}${ext || ".bin"}`;
}

async function saveAttachment(attachment) {
  validateAttachment(attachment);

  const match = /^data:([^;]+);base64,(.+)$/s.exec(attachment.data);
  if (!match) throw new Error("Invalid attachment encoding.");

  const [, mimeType, base64] = match;
  if (mimeType !== attachment.type) {
    throw new Error("Attachment type does not match its content.");
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > MAX_ATTACHMENT_BYTES) {
    throw new Error("Attachment must be 5 MB or smaller.");
  }

  const uploadsDir = path.join(BACKEND_ROOT, "uploads", "incidents");
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = safeFileName(attachment.name);
  await fs.writeFile(path.join(uploadsDir, filename), buffer);

  return {
    attachmentName: String(attachment.name).slice(0, 255),
    attachmentPath: `/uploads/incidents/${filename}`,
    attachmentMimeType: mimeType,
    attachmentSize: buffer.length,
  };
}

async function deleteAttachment(filePath) {
  if (!filePath) return;

  const uploadsRoot = path.join(BACKEND_ROOT, "uploads", "incidents");
  const filename = path.basename(filePath);
  const target = path.resolve(uploadsRoot, filename);

  if (!target.startsWith(`${uploadsRoot}${path.sep}`)) return;

  try {
    await fs.unlink(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function serializeIncident(incident) {
  if (!incident) return incident;

  return {
    ...incident,
    estimatedCost:
      incident.estimatedCost === null || incident.estimatedCost === undefined
        ? null
        : Number(incident.estimatedCost),
  };
}

async function ensureRelations(data) {
  if (data.vehicleId !== undefined) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(data.vehicleId) } });
    if (!vehicle) throw new Error("Selected vehicle does not exist.");
  }

  if (data.driverId !== undefined && data.driverId !== null) {
    const driver = await prisma.driver.findUnique({ where: { id: Number(data.driverId) } });
    if (!driver) throw new Error("Selected driver does not exist.");
  }
}

class IncidentService {
  async getAllIncidents() {
    const incidents = await prisma.incident.findMany({
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { incidentDate: "desc" },
    });

    return incidents.map(serializeIncident);
  }

  async getIncidentById(id) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) return null;

    const incident = await prisma.incident.findUnique({
      where: { id: numericId },
      include: { vehicle: true, driver: true },
    });

    return serializeIncident(incident);
  }

  async createIncident(rawData) {
    const data = createSchema.parse(rawData);
    validateDate(data.incidentDate);
    await ensureRelations(data);

    const attachment = data.attachment ? await saveAttachment(data.attachment) : {};

    try {
      const incident = await prisma.incident.create({
        data: {
          vehicleId: data.vehicleId,
          driverId: data.driverId ?? null,
          incidentDate: data.incidentDate,
          incidentType: data.incidentType,
          severity: data.severity,
          location: data.location,
          description: data.description,
          injuries: data.injuries,
          estimatedCost: data.estimatedCost,
          policeReported: data.policeReported,
          reportedBy: data.reportedBy,
          status: data.status ?? "OPEN",
          ...attachment,
        },
        include: { vehicle: true, driver: true },
      });

      return serializeIncident(incident);
    } catch (error) {
      if (attachment.attachmentPath) await deleteAttachment(attachment.attachmentPath);
      throw error;
    }
  }

  async updateIncident(id, rawData) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new Error("Invalid incident ID.");
    }

    const existing = await prisma.incident.findUnique({ where: { id: numericId } });
    if (!existing) return null;

    const data = updateSchema.parse(rawData);
    if (data.incidentDate) validateDate(data.incidentDate);
    await ensureRelations(data);

    const updateData = {};
    const fields = [
      "vehicleId",
      "driverId",
      "incidentDate",
      "incidentType",
      "severity",
      "location",
      "description",
      "injuries",
      "estimatedCost",
      "policeReported",
      "reportedBy",
      "status",
    ];

    for (const field of fields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }

    let newAttachment = null;
    if (data.attachment) {
      newAttachment = await saveAttachment(data.attachment);
      Object.assign(updateData, newAttachment);
    } else if (data.removeAttachment) {
      updateData.attachmentName = null;
      updateData.attachmentPath = null;
      updateData.attachmentMimeType = null;
      updateData.attachmentSize = null;
    }

    try {
      const incident = await prisma.incident.update({
        where: { id: numericId },
        data: updateData,
        include: { vehicle: true, driver: true },
      });

      if (newAttachment && existing.attachmentPath) {
        await deleteAttachment(existing.attachmentPath);
      } else if (data.removeAttachment && existing.attachmentPath) {
        await deleteAttachment(existing.attachmentPath);
      }

      return serializeIncident(incident);
    } catch (error) {
      if (newAttachment?.attachmentPath) await deleteAttachment(newAttachment.attachmentPath);
      throw error;
    }
  }

  async deleteIncident(id) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new Error("Invalid incident ID.");
    }

    const existing = await prisma.incident.findUnique({ where: { id: numericId } });
    if (!existing) return null;

    const deleted = await prisma.incident.delete({ where: { id: numericId } });
    if (existing.attachmentPath) await deleteAttachment(existing.attachmentPath);

    return deleted;
  }
}

export { INCIDENT_TYPES, SEVERITIES, STATUSES };
export default new IncidentService();
