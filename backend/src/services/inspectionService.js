import prisma from "../config/prisma.js";

class InspectionService {

  async getAllInspections() {

    return await prisma.inspection.findMany({

      include: {
        vehicle: true,
        driver: true,
      },

      orderBy: {
        inspectionDate: "desc",
      },

    });

  }

  async getInspectionById(id) {

    return await prisma.inspection.findUnique({

      where: {
        id: Number(id),
      },

      include: {
        vehicle: true,
        driver: true,
      },

    });

  }

  async createInspection(data) {

    return await prisma.inspection.create({

      data: {

        vehicleId: Number(data.vehicleId),

        driverId: data.driverId
          ? Number(data.driverId)
          : null,

        inspectionDate: new Date(
          data.inspectionDate
        ),

        odometer: Number(data.odometer),

        brakes: data.brakes,

        tyres: data.tyres,

        lights: data.lights,

        engine: data.engine,

        battery: data.battery,

        oilLevel: data.oilLevel,

        coolant: data.coolant,

        mirrors: data.mirrors,

        windshield: data.windshield,

        fireExtinguisher:
          data.fireExtinguisher,

        firstAidKit:
          data.firstAidKit,

        overallStatus:
          data.overallStatus,

        inspectorName:
          data.inspectorName,

        remarks:
          data.remarks,

      },

    });

  }

  async updateInspection(id, data) {

    return await prisma.inspection.update({

      where: {
        id: Number(id),
      },

      data: {

        vehicleId: Number(data.vehicleId),

        driverId: data.driverId
          ? Number(data.driverId)
          : null,

        inspectionDate: new Date(
          data.inspectionDate
        ),

        odometer: Number(data.odometer),

        brakes: data.brakes,

        tyres: data.tyres,

        lights: data.lights,

        engine: data.engine,

        battery: data.battery,

        oilLevel: data.oilLevel,

        coolant: data.coolant,

        mirrors: data.mirrors,

        windshield: data.windshield,

        fireExtinguisher:
          data.fireExtinguisher,

        firstAidKit:
          data.firstAidKit,

        overallStatus:
          data.overallStatus,

        inspectorName:
          data.inspectorName,

        remarks:
          data.remarks,

      },

    });

  }

  async deleteInspection(id) {

    return await prisma.inspection.delete({

      where: {
        id: Number(id),
      },

    });

  }

}

export default new InspectionService();