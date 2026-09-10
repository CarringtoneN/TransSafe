import prisma from "../config/prisma.js";

async function getAllAssignments() {
  return prisma.assignment.findMany({
    include: {
      driver: true,
      vehicle: true,
    },
    orderBy: {
      assignedAt: "desc",
    },
  });
}

async function getAssignment(id) {
  return prisma.assignment.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      driver: true,
      vehicle: true,
    },
  });
}

async function createAssignment(data) {
  if (data.status === "ACTIVE") {
    const activeDriver = await prisma.assignment.findFirst({ where: { driverId: Number(data.driverId), status: "ACTIVE" } });
    if (activeDriver) throw new Error("This driver already has an active vehicle assignment. A driver can only have one vehicle at a time.");

    const activeVehicleAssignments = await prisma.assignment.findMany({ where: { vehicleId: Number(data.vehicleId), status: "ACTIVE" } });
    const duplicate = activeVehicleAssignments.find(a => a.driverId === Number(data.driverId));
    if (duplicate) throw new Error("This driver is already assigned to this vehicle.");
    if (activeVehicleAssignments.length >= 2) throw new Error("A vehicle can have a maximum of two active drivers at a time.");
  }

  return prisma.assignment.create({
    data: {
      driverId: Number(data.driverId),
      vehicleId: Number(data.vehicleId),
      assignedAt: new Date(data.assignedAt),
      unassignedAt: data.unassignedAt
        ? new Date(data.unassignedAt)
        : null,
      status: data.status,
      notes: data.notes,
    },
    include: {
      driver: true,
      vehicle: true,
    },
  });
}

async function updateAssignment(id, data) {
  // Check driver
  const activeDriver = await prisma.assignment.findFirst({
    where: {
      driverId: Number(data.driverId),
      status: "ACTIVE",
      NOT: {
        id: Number(id),
      },
    },
  });

  if (activeDriver) {
    throw new Error(
      "Driver already has another active assignment."
    );
  }

  // Check vehicle capacity. Two active drivers are allowed on one vehicle.
  const activeVehicleAssignments = await prisma.assignment.findMany({
    where: { vehicleId: Number(data.vehicleId), status: "ACTIVE", NOT: { id: Number(id) } },
  });
  const duplicate = activeVehicleAssignments.find(a => a.driverId === Number(data.driverId));
  if (duplicate) throw new Error("This driver is already assigned to this vehicle.");
  if (activeVehicleAssignments.length >= 2) throw new Error("A vehicle can have a maximum of two active drivers at a time.");

  return prisma.assignment.update({
    where: {
      id: Number(id),
    },
    data: {
      driverId: Number(data.driverId),
      vehicleId: Number(data.vehicleId),
      assignedAt: new Date(data.assignedAt),
      unassignedAt: data.unassignedAt
        ? new Date(data.unassignedAt)
        : null,
      status: data.status,
      notes: data.notes,
    },
    include: {
      driver: true,
      vehicle: true,
    },
  });
}

async function deleteAssignment(id) {
  return prisma.assignment.delete({
    where: {
      id: Number(id),
    },
  });
}

export default {
  getAllAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};