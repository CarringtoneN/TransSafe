import prisma from "../config/prisma.js";

class ShiftService {
  async getAllShifts() {
    return await prisma.shift.findMany({
      include: {
        driver: true,
        vehicle: true,
      },
      orderBy: {
        shiftDate: "desc",
      },
    });
  }

  async getShiftById(id) {
    return await prisma.shift.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  async createShift(data) {
    const overlap = await prisma.shift.findFirst({
      where: {
        driverId: Number(data.driverId),

        shiftDate: new Date(data.shiftDate),

        OR: [
          {
            startTime: {
              lt: new Date(data.endTime),
            },
            endTime: {
              gt: new Date(data.startTime),
            },
          },
        ],
      },
    });

    if (overlap) {
      throw new Error("Driver already has a shift during this time.");
    }

    const hours =
      (new Date(data.endTime) - new Date(data.startTime)) /
      1000 /
      60 /
      60;

    return await prisma.shift.create({
      data: {
        driverId: Number(data.driverId),
        vehicleId: Number(data.vehicleId),
        shiftDate: new Date(data.shiftDate),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        totalHours: hours,
        status: data.status,
        notes: data.notes,
      },
    });
  }

  async updateShift(id, data) {
    const hours =
      (new Date(data.endTime) - new Date(data.startTime)) /
      1000 /
      60 /
      60;

    return await prisma.shift.update({
      where: {
        id: Number(id),
      },
      data: {
        driverId: Number(data.driverId),
        vehicleId: Number(data.vehicleId),
        shiftDate: new Date(data.shiftDate),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        totalHours: hours,
        status: data.status,
        notes: data.notes,
      },
    });
  }

  async deleteShift(id) {
    return await prisma.shift.delete({
      where: {
        id: Number(id),
      },
    });
  }
}

export default new ShiftService();