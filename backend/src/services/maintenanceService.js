
import prisma from "../config/prisma.js";
import { z } from "zod";

const id = z.coerce.number().int().positive();
const optionalId = z.union([z.coerce.number().int().positive(), z.null(), z.literal("")]).transform(v => v === "" ? null : v);

const scheduleSchema = z.object({
  scheduleNumber: z.string().trim().min(1).max(50),
  vehicleId: id,
  assignedDriverId: optionalId.optional(),
  serviceType: z.string().trim().min(1).max(100),
  maintenanceCategory: z.string().trim().min(1).max(100),
  dueDate: z.string().datetime().nullable().optional(),
  dueMileage: z.coerce.number().min(0).nullable().optional(),
  scheduledDate: z.string().datetime(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  reason: z.string().trim().min(1).max(500),
  description: z.string().trim().min(1).max(5000),
  assignedTechnician: z.string().trim().max(150).nullable().optional(),
  assignedWorkshop: z.string().trim().max(150).nullable().optional(),
  requiredParts: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  createdBy: z.string().trim().min(1).max(150),
  notes: z.string().trim().max(5000).nullable().optional(),
});

const workOrderSchema = z.object({
  workOrderNumber: z.string().trim().min(1).max(50),
  dateCreated: z.string().datetime().optional(),
  requestedBy: z.string().trim().min(1).max(150),
  department: z.string().trim().min(1).max(100),
  vehicleId: id,
  currentMileage: z.coerce.number().min(0).nullable().optional(),
  maintenanceType: z.string().trim().min(1).max(100),
  workDescription: z.string().trim().min(1).max(5000),
  faultDescription: z.string().trim().max(5000).nullable().optional(),
  requestedRepairs: z.string().trim().max(5000).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  estimatedCompletionDate: z.string().datetime().nullable().optional(),
  assignedTechnician: z.string().trim().max(150).nullable().optional(),
  assignedWorkshop: z.string().trim().max(150).nullable().optional(),
  supervisor: z.string().trim().max(150).nullable().optional(),
  requiredSpareParts: z.string().trim().max(5000).nullable().optional(),
  requiredTools: z.string().trim().max(5000).nullable().optional(),
  estimatedLabourHours: z.coerce.number().min(0).nullable().optional(),
  estimatedPartsCost: z.coerce.number().min(0).nullable().optional(),
  estimatedLabourCost: z.coerce.number().min(0).nullable().optional(),
  estimatedTotalCost: z.coerce.number().min(0).nullable().optional(),
  status: z.enum(["PENDING_APPROVAL", "APPROVED", "ASSIGNED", "IN_PROGRESS", "AWAITING_PARTS", "COMPLETED", "CLOSED", "CANCELLED"]),
  actualCompletionDate: z.string().datetime().nullable().optional(),
  technicianNotes: z.string().trim().max(5000).nullable().optional(),
  finalCost: z.coerce.number().min(0).nullable().optional(),
  managerApproval: z.boolean().optional(),
  managerConfirmation: z.boolean().optional(),
  incidentId: optionalId.optional(),
});

const repairSchema = z.object({
  repairReference: z.string().trim().min(1).max(50),
  vehicleId: id,
  faultReported: z.string().trim().min(1).max(5000),
  dateReported: z.string().datetime(),
  reportedBy: z.string().trim().min(1).max(150),
  faultCategory: z.string().trim().min(1).max(100),
  severityLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  initialDiagnosis: z.string().trim().max(5000).nullable().optional(),
  repairDate: z.string().datetime().nullable().optional(),
  repairStartTime: z.string().datetime().nullable().optional(),
  repairEndTime: z.string().datetime().nullable().optional(),
  assignedTechnician: z.string().trim().max(150).nullable().optional(),
  workshop: z.string().trim().max(150).nullable().optional(),
  repairDescription: z.string().trim().max(5000).nullable().optional(),
  rootCause: z.string().trim().max(5000).nullable().optional(),
  correctiveActionTaken: z.string().trim().max(5000).nullable().optional(),
  partsReplaced: z.string().trim().max(5000).nullable().optional(),
  partNumbers: z.string().trim().max(5000).nullable().optional(),
  quantityUsed: z.coerce.number().int().min(0).nullable().optional(),
  supplier: z.string().trim().max(150).nullable().optional(),
  unitCost: z.coerce.number().min(0).nullable().optional(),
  totalPartsCost: z.coerce.number().min(0).nullable().optional(),
  labourHours: z.coerce.number().min(0).nullable().optional(),
  hourlyRate: z.coerce.number().min(0).nullable().optional(),
  labourCost: z.coerce.number().min(0).nullable().optional(),
  additionalCosts: z.coerce.number().min(0).nullable().optional(),
  totalRepairCost: z.coerce.number().min(0).nullable().optional(),
  vehicleTestConducted: z.boolean().optional(),
  roadworthyStatus: z.enum(["PENDING", "ROADWORTHY", "NOT_ROADWORTHY"]),
  qualityInspectionResult: z.string().trim().max(5000).nullable().optional(),
  technicianComments: z.string().trim().max(5000).nullable().optional(),
  completionDate: z.string().datetime().nullable().optional(),
  repairStatus: z.enum(["IN_PROGRESS", "AWAITING_PARTS", "READY_FOR_INSPECTION", "COMPLETED", "CANCELLED"]),
  supportingDocuments: z.string().trim().max(5000).nullable().optional(),
  beforePhotoUrl: z.string().trim().max(1000).nullable().optional(),
  afterPhotoUrl: z.string().trim().max(1000).nullable().optional(),
});

const complianceSchema = z.object({
  vehicleId: optionalId.optional(),
  driverId: optionalId.optional(),
  itemType: z.string().trim().min(1).max(100),
  itemName: z.string().trim().min(1).max(200),
  issueDate: z.string().datetime().nullable().optional(),
  expiryDate: z.string().datetime().nullable().optional(),
  status: z.enum(["COMPLIANT", "EXPIRING_SOON", "EXPIRED", "MISSING"]),
  referenceNumber: z.string().trim().max(150).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

const nullableDate = value => value ? new Date(value) : null;
const nullableNumber = value => value === null || value === undefined || value === "" ? null : Number(value);
const money = value => nullableNumber(value);

async function resolveRegisteredMechanic(name) {
  const cleanName = typeof name === "string" ? name.trim() : "";
  if (!cleanName) return null;
  const mechanic = await prisma.user.findFirst({
    where: { name: cleanName, role: "TECHNICIAN_MECHANIC", active: true },
    select: { id: true, name: true, workshop: true },
  });
  if (!mechanic) {
    throw new Error(`Mechanic "${cleanName}" is not a registered active Mechanic user.`);
  }
  return mechanic;
}

const scheduleData = data => ({
  scheduleNumber: data.scheduleNumber,
  vehicleId: Number(data.vehicleId),
  assignedDriverId: data.assignedDriverId ? Number(data.assignedDriverId) : null,
  serviceType: data.serviceType,
  maintenanceCategory: data.maintenanceCategory,
  dueDate: nullableDate(data.dueDate),
  dueMileage: nullableNumber(data.dueMileage),
  scheduledDate: new Date(data.scheduledDate),
  priority: data.priority,
  reason: data.reason,
  description: data.description,
  assignedTechnician: data.assignedTechnician || null,
  assignedWorkshop: data.assignedWorkshop || null,
  requiredParts: data.requiredParts || null,
  status: data.status,
  approvalStatus: data.approvalStatus,
  createdBy: data.createdBy,
  notes: data.notes || null,
});

const workOrderData = data => ({
  workOrderNumber: data.workOrderNumber,
  dateCreated: data.dateCreated ? new Date(data.dateCreated) : undefined,
  requestedBy: data.requestedBy,
  department: data.department,
  vehicleId: Number(data.vehicleId),
  currentMileage: nullableNumber(data.currentMileage),
  maintenanceType: data.maintenanceType,
  workDescription: data.workDescription,
  faultDescription: data.faultDescription || null,
  requestedRepairs: data.requestedRepairs || null,
  priority: data.priority,
  estimatedCompletionDate: nullableDate(data.estimatedCompletionDate),
  assignedTechnician: data.assignedTechnician || null,
  assignedWorkshop: data.assignedWorkshop || null,
  supervisor: data.supervisor || null,
  requiredSpareParts: data.requiredSpareParts || null,
  requiredTools: data.requiredTools || null,
  estimatedLabourHours: nullableNumber(data.estimatedLabourHours),
  estimatedPartsCost: money(data.estimatedPartsCost),
  estimatedLabourCost: money(data.estimatedLabourCost),
  estimatedTotalCost: money(data.estimatedTotalCost),
  status: data.status,
  actualCompletionDate: nullableDate(data.actualCompletionDate),
  technicianNotes: data.technicianNotes || null,
  finalCost: money(data.finalCost),
  managerApproval: Boolean(data.managerApproval),
  managerConfirmation: Boolean(data.managerConfirmation),
  incidentId: data.incidentId ? Number(data.incidentId) : null,
});

const repairData = data => ({
  repairReference: data.repairReference,
  vehicleId: Number(data.vehicleId),
  faultReported: data.faultReported,
  dateReported: new Date(data.dateReported),
  reportedBy: data.reportedBy,
  faultCategory: data.faultCategory,
  severityLevel: data.severityLevel,
  initialDiagnosis: data.initialDiagnosis || null,
  repairDate: nullableDate(data.repairDate),
  repairStartTime: nullableDate(data.repairStartTime),
  repairEndTime: nullableDate(data.repairEndTime),
  assignedTechnician: data.assignedTechnician || null,
  workshop: data.workshop || null,
  repairDescription: data.repairDescription || null,
  rootCause: data.rootCause || null,
  correctiveActionTaken: data.correctiveActionTaken || null,
  partsReplaced: data.partsReplaced || null,
  partNumbers: data.partNumbers || null,
  quantityUsed: nullableNumber(data.quantityUsed),
  supplier: data.supplier || null,
  unitCost: money(data.unitCost),
  totalPartsCost: money(data.totalPartsCost),
  labourHours: nullableNumber(data.labourHours),
  hourlyRate: money(data.hourlyRate),
  labourCost: money(data.labourCost),
  additionalCosts: money(data.additionalCosts),
  totalRepairCost: money(data.totalRepairCost),
  vehicleTestConducted: Boolean(data.vehicleTestConducted),
  roadworthyStatus: data.roadworthyStatus,
  qualityInspectionResult: data.qualityInspectionResult || null,
  technicianComments: data.technicianComments || null,
  completionDate: nullableDate(data.completionDate),
  repairStatus: data.repairStatus,
  supportingDocuments: data.supportingDocuments || null,
  beforePhotoUrl: data.beforePhotoUrl || null,
  afterPhotoUrl: data.afterPhotoUrl || null,
});

const complianceData = data => ({
  vehicleId: data.vehicleId ? Number(data.vehicleId) : null,
  driverId: data.driverId ? Number(data.driverId) : null,
  itemType: data.itemType,
  itemName: data.itemName,
  issueDate: nullableDate(data.issueDate),
  expiryDate: nullableDate(data.expiryDate),
  status: data.status,
  referenceNumber: data.referenceNumber || null,
  notes: data.notes || null,
});

async function validateAssignedDriverForVehicle(vehicleId, driverId) {
  if (!driverId) return;
  const assignment = await prisma.assignment.findFirst({
    where: { vehicleId: Number(vehicleId), driverId: Number(driverId), status: "ACTIVE" },
  });
  if (!assignment) {
    throw new Error("The selected driver is not actively allocated to the selected vehicle.");
  }
}

function includeSchedule() {
  return { vehicle: true, assignedDriver: true };
}
function includeWorkOrder() {
  return { vehicle: true, incident: true };
}

async function assertVehicleAvailableForService(vehicleId, kind, excludeId = null) {
  const idValue = Number(vehicleId);
  const activeSchedule = await prisma.maintenanceSchedule.findFirst({ where: { vehicleId: idValue, status: "IN_PROGRESS", ...(kind === "schedule" && excludeId ? { NOT: { id: excludeId } } : {}) } });
  const activeOrder = await prisma.workOrder.findFirst({ where: { vehicleId: idValue, status: "IN_PROGRESS", ...(kind === "workOrder" && excludeId ? { NOT: { id: excludeId } } : {}) } });
  const activeRepair = await prisma.repair.findFirst({ where: { vehicleId: idValue, repairStatus: { in: ["IN_PROGRESS", "AWAITING_PARTS", "READY_FOR_INSPECTION"] }, ...(kind === "repair" && excludeId ? { NOT: { id: excludeId } } : {}) } });
  if (activeSchedule || activeOrder || activeRepair) {
    throw new Error("This vehicle already has a service in progress. Complete the current service before starting another one.");
  }
}
function includeRepair() {
  return { vehicle: true };
}
function includeCompliance() {
  return { vehicle: true, driver: true };
}


async function recordApproval({ entityType, entityId, action, approver = {}, notes = null }) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO approval_record
      (entityType, entityId, action, approvedByUserId, approvedByName, approvedAt, notes)
     VALUES (?, ?, ?, ?, ?, NOW(3), ?)`,
    entityType,
    Number(entityId),
    action,
    approver?.id ? Number(approver.id) : null,
    approver?.name || approver?.email || null,
    notes
  );
}

class MaintenanceService {
  async getDashboard() {
    const [scheduled, openOrders, activeRepairs, compliance, recent] = await Promise.all([
      prisma.maintenanceSchedule.count({ where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } } }),
      prisma.workOrder.count({ where: { status: { notIn: ["COMPLETED", "CLOSED", "CANCELLED"] } } }),
      prisma.repair.count({ where: { repairStatus: { notIn: ["COMPLETED", "CANCELLED"] } } }),
      prisma.compliance.count({ where: { status: { in: ["EXPIRED", "EXPIRING_SOON", "MISSING"] } } }),
      prisma.maintenanceSchedule.findMany({ take: 8, include: includeSchedule(), orderBy: { scheduledDate: "desc" } }),
    ]);
    return { scheduled, openOrders, activeRepairs, complianceAlerts: compliance, recent };
  }

  async listSchedules() {
    return prisma.maintenanceSchedule.findMany({ include: includeSchedule(), orderBy: { scheduledDate: "desc" } });
  }
  async getSchedule(id) {
    return prisma.maintenanceSchedule.findUnique({ where: { id: Number(id) }, include: includeSchedule() });
  }
  async createSchedule(input) {
    const data = scheduleSchema.parse(input);
    const mechanic = await resolveRegisteredMechanic(data.assignedTechnician);
    if (mechanic?.workshop) data.assignedWorkshop = mechanic.workshop;
    await validateAssignedDriverForVehicle(data.vehicleId, data.assignedDriverId);
    if (data.status === "IN_PROGRESS") await assertVehicleAvailableForService(data.vehicleId, "schedule");
    return prisma.maintenanceSchedule.create({ data: scheduleData(data), include: includeSchedule() });
  }
  async updateSchedule(id, input) {
    const data = scheduleSchema.parse(input);
    const mechanic = await resolveRegisteredMechanic(data.assignedTechnician);
    if (mechanic?.workshop) data.assignedWorkshop = mechanic.workshop;
    await validateAssignedDriverForVehicle(data.vehicleId, data.assignedDriverId);
    if (data.status === "IN_PROGRESS") await assertVehicleAvailableForService(data.vehicleId, "schedule", Number(id));
    return prisma.maintenanceSchedule.update({ where: { id: Number(id) }, data: scheduleData(data), include: includeSchedule() });
  }
  async approveSchedule(id, approver = {}) {
    const scheduleId = Number(id);
    const schedule = await prisma.maintenanceSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw new Error("Maintenance schedule not found.");
    const updated = await prisma.maintenanceSchedule.update({
      where: { id: scheduleId },
      data: { approvalStatus: "APPROVED", status: "SCHEDULED" },
      include: includeSchedule(),
    });
    await recordApproval({
      entityType: "MAINTENANCE_SCHEDULE",
      entityId: scheduleId,
      action: "APPROVED",
      approver,
      notes: `Maintenance schedule ${schedule.scheduleNumber} approved.`,
    });
    return updated;
  }

  async deleteSchedule(id) {
    return prisma.maintenanceSchedule.delete({ where: { id: Number(id) } });
  }

  async listWorkOrders() {
    return prisma.workOrder.findMany({ include: includeWorkOrder(), orderBy: { dateCreated: "desc" } });
  }
  async getWorkOrder(id) {
    return prisma.workOrder.findUnique({ where: { id: Number(id) }, include: includeWorkOrder() });
  }
  async createWorkOrder(input) {
    const data = workOrderSchema.parse(input);
    if (!data.assignedTechnician) throw new Error("Select a registered active Mechanic.");
    const mechanic = await resolveRegisteredMechanic(data.assignedTechnician);
    if (mechanic?.workshop) data.assignedWorkshop = mechanic.workshop;
    if (data.status === "IN_PROGRESS") await assertVehicleAvailableForService(data.vehicleId, "workOrder");
    return prisma.workOrder.create({ data: workOrderData(data), include: includeWorkOrder() });
  }
  async updateWorkOrder(id, input) {
    const data = workOrderSchema.parse(input);
    if (!data.assignedTechnician) throw new Error("Select a registered active Mechanic.");
    const mechanic = await resolveRegisteredMechanic(data.assignedTechnician);
    if (mechanic?.workshop) data.assignedWorkshop = mechanic.workshop;
    if (data.status === "IN_PROGRESS") await assertVehicleAvailableForService(data.vehicleId, "workOrder", Number(id));
    const result = await prisma.workOrder.update({ where: { id: Number(id) }, data: workOrderData(data), include: includeWorkOrder() });
    if (["COMPLETED", "CLOSED"].includes(result.status) && result.incidentId) {
      await prisma.incident.update({ where: { id: result.incidentId }, data: { status: "RESOLVED", resolutionNotes: result.technicianNotes || "Maintenance work completed.", resolvedAt: result.actualCompletionDate || new Date(), resolvedBy: result.assignedTechnician || result.requestedBy } });
    }
    return result;
  }
  async approveWorkOrder(id, approver = {}) {
    const orderId = Number(id);
    const order = await prisma.workOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Work order not found.");
    const updated = await prisma.workOrder.update({
      where: { id: order.id },
      data: { status: "APPROVED", managerConfirmation: true },
      include: includeWorkOrder(),
    });
    await recordApproval({
      entityType: "WORK_ORDER",
      entityId: order.id,
      action: "APPROVED",
      approver,
      notes: `Work order ${order.workOrderNumber} approved.`,
    });
    return updated;
  }

  async startWorkOrder(id) {
    const order = await prisma.workOrder.findUnique({ where: { id: Number(id) } });
    if (!order) throw new Error("Work order not found.");
    if (order.status !== "APPROVED") throw new Error("Only an approved work order can be started.");
    await assertVehicleAvailableForService(order.vehicleId, "workOrder", order.id);
    return prisma.workOrder.update({ where: { id: order.id }, data: { status: "IN_PROGRESS" }, include: includeWorkOrder() });
  }

  async deleteWorkOrder(id) {
    return prisma.workOrder.delete({ where: { id: Number(id) } });
  }

  async createIncidentTicket(incidentId, input = {}) {
    const incident = await prisma.incident.findUnique({ where: { id: Number(incidentId) }, include: { vehicle: true, driver: true } });
    if (!incident) throw new Error("Incident not found.");
    if (["RESOLVED", "CLOSED"].includes(incident.status)) throw new Error("This incident is already resolved or closed.");
    const workOrderNumber = `INC-${incident.id}-${Date.now()}`.slice(0, 50);
    const order = await prisma.workOrder.create({
      data: {
        workOrderNumber,
        requestedBy: input.requestedBy || "Fleet Manager",
        department: "Maintenance",
        vehicleId: incident.vehicleId,
        maintenanceType: input.maintenanceType || "INCIDENT REPAIR",
        workDescription: input.workDescription || incident.description,
        faultDescription: incident.description,
        requestedRepairs: input.requestedRepairs || incident.incidentType,
        priority: incident.severity || "MEDIUM",
        status: "ASSIGNED",
        assignedTechnician: input.assignedTechnician || null,
        assignedWorkshop: input.assignedWorkshop || null,
        incidentId: incident.id,
      },
      include: includeWorkOrder(),
    });
    await prisma.incident.update({ where: { id: incident.id }, data: { status: "UNDER_INVESTIGATION" } });
    return order;
  }

  async completeWorkOrder(id, input = {}) {
    const order = await prisma.workOrder.findUnique({ where: { id: Number(id) } });
    if (!order) throw new Error("Work order not found.");
    const now = new Date();
    const notes = input.technicianNotes?.trim() || "Maintenance work completed.";
    const updated = await prisma.workOrder.update({ where: { id: order.id }, data: { status: "COMPLETED", actualCompletionDate: now, technicianNotes: notes }, include: includeWorkOrder() });
    if (updated.incidentId) {
      await prisma.incident.update({ where: { id: updated.incidentId }, data: { status: "RESOLVED", resolutionNotes: notes, resolvedAt: now, resolvedBy: input.resolvedBy || updated.assignedTechnician || updated.requestedBy } });
    }
    return updated;
  }

  async resolveIncident(incidentId, input = {}) {
    const incident = await prisma.incident.findUnique({ where: { id: Number(incidentId) } });
    if (!incident) throw new Error("Incident not found.");
    const updated = await prisma.incident.update({ where: { id: incident.id }, data: { status: "RESOLVED", resolutionNotes: input.resolutionNotes || "Incident resolved.", resolvedAt: new Date(), resolvedBy: input.resolvedBy || "Maintenance" }, include: { vehicle: true, driver: true, workOrder: true } });
    return updated;
  }

  async listRepairs() {
    return prisma.repair.findMany({ include: includeRepair(), orderBy: { dateReported: "desc" } });
  }
  async getRepair(id) {
    return prisma.repair.findUnique({ where: { id: Number(id) }, include: includeRepair() });
  }
  async createRepair(input) {
    const data = repairSchema.parse(input);
    if (!data.assignedTechnician) throw new Error("Select a registered active Mechanic.");
    const mechanic = await resolveRegisteredMechanic(data.assignedTechnician);
    if (mechanic?.workshop) data.workshop = mechanic.workshop;
    if (["IN_PROGRESS", "AWAITING_PARTS", "READY_FOR_INSPECTION"].includes(data.repairStatus)) await assertVehicleAvailableForService(data.vehicleId, "repair");
    return prisma.repair.create({ data: repairData(data), include: includeRepair() });
  }
  async updateRepair(id, input) {
    const data = repairSchema.parse(input);
    if (!data.assignedTechnician) throw new Error("Select a registered active Mechanic.");
    const mechanic = await resolveRegisteredMechanic(data.assignedTechnician);
    if (mechanic?.workshop) data.workshop = mechanic.workshop;
    if (["IN_PROGRESS", "AWAITING_PARTS", "READY_FOR_INSPECTION"].includes(data.repairStatus)) await assertVehicleAvailableForService(data.vehicleId, "repair", Number(id));
    return prisma.repair.update({ where: { id: Number(id) }, data: repairData(data), include: includeRepair() });
  }
  async deleteRepair(id) {
    return prisma.repair.delete({ where: { id: Number(id) } });
  }

  async listCompliance() {
    const rows = await prisma.compliance.findMany({ include: includeCompliance(), orderBy: [{ expiryDate: "asc" }, { id: "desc" }] });
    const now = new Date();
    const soon = new Date(now);
    soon.setDate(soon.getDate() + 30);
    return rows.map(row => {
      let calculated = row.status;
      if (row.expiryDate && row.expiryDate < now) calculated = "EXPIRED";
      else if (row.expiryDate && row.expiryDate <= soon) calculated = "EXPIRING_SOON";
      return { ...row, calculatedStatus: calculated };
    });
  }
  async getCompliance(id) {
    return prisma.compliance.findUnique({ where: { id: Number(id) }, include: includeCompliance() });
  }
  async createCompliance(input) {
    const data = complianceSchema.parse(input);
    return prisma.compliance.create({ data: complianceData(data), include: includeCompliance() });
  }
  async updateCompliance(id, input) {
    const data = complianceSchema.parse(input);
    return prisma.compliance.update({ where: { id: Number(id) }, data: complianceData(data), include: includeCompliance() });
  }
  async deleteCompliance(id) {
    return prisma.compliance.delete({ where: { id: Number(id) } });
  }

  async getServiceHistory(vehicleId) {
    const where = vehicleId ? { vehicleId: Number(vehicleId) } : {};
    const [vehicle, schedules, repairs, workOrders, inspections, maintenance] = await Promise.all([
      vehicleId ? prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } }) : null,
      prisma.maintenanceSchedule.findMany({ where, include: includeSchedule(), orderBy: { scheduledDate: "desc" } }),
      prisma.repair.findMany({ where, include: includeRepair(), orderBy: { dateReported: "desc" } }),
      prisma.workOrder.findMany({ where, include: includeWorkOrder(), orderBy: { dateCreated: "desc" } }),
      prisma.inspection.findMany({ where, include: { vehicle: true, driver: true }, orderBy: { inspectionDate: "desc" } }),
      prisma.maintenance.findMany({ where, include: { vehicle: true }, orderBy: { serviceDate: "desc" } }),
    ]);
    const timeline = [
      ...schedules.map(x => ({ id: `schedule-${x.id}`, kind: "MAINTENANCE", date: x.scheduledDate, title: x.serviceType, status: x.status, cost: null, vehicle: x.vehicle, details: x.description, reference: x.scheduleNumber })),
      ...repairs.map(x => ({ id: `repair-${x.id}`, kind: "REPAIR", date: x.completionDate || x.repairDate || x.dateReported, title: x.faultReported, status: x.repairStatus, cost: x.totalRepairCost, vehicle: x.vehicle, details: x.correctiveActionTaken || x.repairDescription, reference: x.repairReference })),
      ...workOrders.map(x => ({ id: `workorder-${x.id}`, kind: "WORK ORDER", date: x.actualCompletionDate || x.dateCreated, title: x.workDescription, status: x.status, cost: x.finalCost || x.estimatedTotalCost, vehicle: x.vehicle, details: x.technicianNotes || x.faultDescription, reference: x.workOrderNumber })),
      ...inspections.map(x => ({ id: `inspection-${x.id}`, kind: "INSPECTION", date: x.inspectionDate, title: "Vehicle inspection", status: x.overallStatus, cost: null, vehicle: x.vehicle, details: x.remarks, reference: `INS-${x.id}` })),
      ...maintenance.map(x => ({ id: `legacy-maintenance-${x.id}`, kind: "SERVICE", date: x.serviceDate, title: x.serviceType, status: "COMPLETED", cost: x.cost, vehicle: x.vehicle, details: x.description, reference: `M-${x.id}` })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    const numeric = timeline.map(x => Number(x.cost || 0));
    const repairCosts = repairs.map(x => Number(x.totalRepairCost || 0)).filter(Boolean);
    return {
      vehicle,
      timeline,
      statistics: {
        totalServices: schedules.length + maintenance.length,
        totalRepairs: repairs.length,
        totalWorkOrders: workOrders.length,
        totalInspections: inspections.length,
        totalMaintenanceCost: numeric.reduce((a, b) => a + b, 0),
        averageRepairCost: repairCosts.length ? repairCosts.reduce((a, b) => a + b, 0) / repairCosts.length : 0,
      },
    };
  }

  async listApprovals(query = {}) {
    const where = [];
    const params = [];
    if (query.entityType) { where.push("entityType = ?"); params.push(query.entityType); }
    const sql = `SELECT * FROM approval_record ${where.length ? "WHERE "+where.join(" AND ") : ""} ORDER BY approvedAt DESC`;
    return prisma.$queryRawUnsafe(sql, ...params);
  }

  async getReminders() {
    const now = new Date();
    const soon30 = new Date(now); soon30.setDate(soon30.getDate() + 30);
    const soon7 = new Date(now); soon7.setDate(soon7.getDate() + 7);
    const [schedules, compliance, orders] = await Promise.all([
      prisma.maintenanceSchedule.findMany({ where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] }, scheduledDate: { lte: soon30 } }, include: includeSchedule(), orderBy: { scheduledDate: "asc" } }),
      prisma.compliance.findMany({ where: { expiryDate: { lte: soon30 } }, include: includeCompliance(), orderBy: { expiryDate: "asc" } }),
      prisma.workOrder.findMany({ where: { status: { in: ["PENDING_APPROVAL", "APPROVED", "ASSIGNED", "AWAITING_PARTS", "IN_PROGRESS"] } }, include: includeWorkOrder(), orderBy: { estimatedCompletionDate: "asc" } }),
    ]);
    return {
      maintenance: schedules.map(x => ({ ...x, urgency: new Date(x.scheduledDate) < now ? "OVERDUE" : new Date(x.scheduledDate) <= soon7 ? "7_DAYS" : "30_DAYS" })),
      compliance: compliance.map(x => ({ ...x, urgency: new Date(x.expiryDate) < now ? "EXPIRED" : "EXPIRING" })),
      workOrders: orders,
    };
  }
}

export default new MaintenanceService();
