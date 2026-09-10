import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllAssets() {
  return prisma.asset.findMany({
    include: {
      vehicle: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAssetById(id) {
  return prisma.asset.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      vehicle: true,
    },
  });
}

export async function createAsset(data) {
  return prisma.asset.create({
    data: {
      assetTag: data.assetTag,
      name: data.name,
      category: data.category,
      serialNumber: data.serialNumber || null,
      purchaseDate: data.purchaseDate
        ? new Date(data.purchaseDate)
        : null,
      status: data.status,
      notes: data.notes || null,
      assignedVehicleId: data.assignedVehicleId
        ? Number(data.assignedVehicleId)
        : null,
    },
    include: {
      vehicle: true,
    },
  });
}

export async function updateAsset(id, data) {
  return prisma.asset.update({
    where: {
      id: Number(id),
    },
    data: {
      assetTag: data.assetTag,
      name: data.name,
      category: data.category,
      serialNumber: data.serialNumber || null,
      purchaseDate: data.purchaseDate
        ? new Date(data.purchaseDate)
        : null,
      status: data.status,
      notes: data.notes || null,
      assignedVehicleId: data.assignedVehicleId
        ? Number(data.assignedVehicleId)
        : null,
    },
    include: {
      vehicle: true,
    },
  });
}

export async function deleteAsset(id) {
  return prisma.asset.delete({
    where: {
      id: Number(id),
    },
  });
}