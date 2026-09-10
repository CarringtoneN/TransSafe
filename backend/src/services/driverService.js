import prisma from "../config/prisma.js";

export async function getAllDrivers() {
  return prisma.driver.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDriverById(id) {
  return prisma.driver.findUnique({
    where: {
      id: Number(id),
    },
  });
}

export async function createDriver(data) {
  return prisma.driver.create({
    data: {
      employeeNumber: data.employeeNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry
        ? new Date(data.licenseExpiry)
        : null,
      status: data.status,
    },
  });
}

export async function updateDriver(id, data) {
  return prisma.driver.update({
    where: {
      id: Number(id),
    },
    data: {
      employeeNumber: data.employeeNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry
        ? new Date(data.licenseExpiry)
        : null,
      status: data.status,
    },
  });
}

export async function deleteDriver(id) {
  return prisma.driver.delete({
    where: {
      id: Number(id),
    },
  });
}