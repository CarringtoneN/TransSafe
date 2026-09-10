import prisma from "../config/prisma.js";

export async function getAllDocuments() {
  return prisma.document.findMany({
    include: {
      vehicle: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDocumentById(id) {
  return prisma.document.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      vehicle: true,
    },
  });
}

export async function createDocument(data) {
  return prisma.document.create({
    data: {
      documentName: data.documentName,
      documentType: data.documentType,
      issueDate: data.issueDate
        ? new Date(data.issueDate)
        : null,
      expiryDate: data.expiryDate
        ? new Date(data.expiryDate)
        : null,
      status: data.status,
      filePath: data.filePath,
      notes: data.notes,
      vehicleId: Number(data.vehicleId),
    },
    include: {
      vehicle: true,
    },
  });
}

export async function updateDocument(id, data) {
  return prisma.document.update({
    where: {
      id: Number(id),
    },
    data: {
      documentName: data.documentName,
      documentType: data.documentType,
      issueDate: data.issueDate
        ? new Date(data.issueDate)
        : null,
      expiryDate: data.expiryDate
        ? new Date(data.expiryDate)
        : null,
      status: data.status,
      filePath: data.filePath,
      notes: data.notes,
      vehicleId: Number(data.vehicleId),
    },
    include: {
      vehicle: true,
    },
  });
}

export async function deleteDocument(id) {
  return prisma.document.delete({
    where: {
      id: Number(id),
    },
  });
}