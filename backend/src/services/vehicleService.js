import prisma from "../config/prisma.js";

const currentDriverInclude = { assignment: { where: { status: "ACTIVE", unassignedAt: null }, orderBy: { assignedAt: "desc" }, take: 2, include: { driver: true } } };

class VehicleService {
  async getAllVehicles() { return prisma.vehicle.findMany({ orderBy:{id:"asc"}, include: currentDriverInclude }); }
  async getVehicleById(id) {
    const vehicleId = Number(id);
    const vehicle = await prisma.vehicle.findUnique({ where:{id:vehicleId}, include: currentDriverInclude });
    if (!vehicle) return null;
    const [completedTrips, fuel] = await Promise.all([
      prisma.trip.findMany({ where:{vehicleId, status:"COMPLETED"}, select:{distance:true, actualDistance:true} }),
      prisma.fuelrecord.findMany({ where:{vehicleId}, select:{litres:true}, orderBy:{fuelDate:"desc"} })
    ]);
    const tripDistance = completedTrips.reduce((sum,t)=>sum + Number(t.actualDistance ?? t.distance ?? 0),0);
    const litres = fuel.reduce((sum,f)=>sum + Number(f.litres || 0),0);
    const kmPerLitre = litres > 0 ? tripDistance / litres : null;
    return { ...vehicle, fuelSummary:{totalLitres:litres, completedTripDistanceKm:tripDistance, kmPerLitre, averageTripKm:completedTrips.length ? tripDistance/completedTrips.length : null} };
  }
  async getVehicleHistory(id) {
    const vehicleId=Number(id);
    const [trips, assignments, maintenance, schedules, repairs, documents, fuelRecords, inspections] = await Promise.all([
      prisma.trip.findMany({where:{vehicleId},orderBy:{departureTime:"desc"},include:{driver:true,tripDriver:{include:{driver:true},orderBy:{startTime:"asc"}}}}),
      prisma.assignment.findMany({where:{vehicleId},orderBy:{assignedAt:"desc"},include:{driver:true}}),
      prisma.maintenance.findMany({where:{vehicleId},orderBy:{serviceDate:"desc"}}),
      prisma.maintenanceSchedule.findMany({where:{vehicleId},orderBy:{scheduledDate:"desc"}}),
      prisma.repair.findMany({where:{vehicleId},orderBy:{dateReported:"desc"}}),
      prisma.document.findMany({where:{vehicleId},orderBy:{expiryDate:"desc"}}),
      prisma.fuelrecord.findMany({where:{vehicleId},select:{odometer:true,fuelDate:true,litres:true}}),
      prisma.inspection.findMany({where:{vehicleId},select:{odometer:true,inspectionDate:true}})
    ]);

    const mileageReadings = [
      ...fuelRecords.map(x => Number(x.odometer)).filter(Number.isFinite),
      ...inspections.map(x => Number(x.odometer)).filter(Number.isFinite)
    ];
    const completedTrips = trips.filter(x => ["COMPLETED", "COMPLETE"].includes(String(x.status).toUpperCase())).length;
    const fuelLitres = fuelRecords.reduce((sum,x)=>sum+Number(x.litres||0),0);
    const tripDistance = trips.filter(x=>["COMPLETED","COMPLETE"].includes(String(x.status).toUpperCase())).reduce((sum,x)=>sum+Number(x.actualDistance ?? x.distance ?? 0),0);
    const fuelSummary = { totalLitres:fuelLitres, completedTripDistanceKm:tripDistance, kmPerLitre:fuelLitres>0?tripDistance/fuelLitres:null, averageTripKm:completedTrips?tripDistance/completedTrips:null };
    const vehicle = await prisma.vehicle.findUnique({where:{id:vehicleId},select:{currentMileage:true}});
    const recordedMileage = vehicle?.currentMileage ?? (mileageReadings.length ? Math.max(...mileageReadings) : null);

    return {
      trips,
      drivers: assignments,
      maintenance:[...maintenance.map(x=>({...x,kind:"SERVICE"})),...schedules.map(x=>({...x,kind:"SCHEDULE"})),...repairs.map(x=>({...x,kind:"REPAIR"}))],
      documents,
      summary: {
        totalTrips: trips.length,
        completedTrips,
        totalTripDistanceKm: trips.filter(x=>["COMPLETED","COMPLETE"].includes(String(x.status).toUpperCase())).reduce((sum,x)=>sum+Number(x.actualDistance ?? x.distance ?? 0),0),
        recordedMileage,
        mileageSource: recordedMileage === null ? null : "Vehicle current mileage"
      },
      fuelSummary
    };
  }
  async createVehicle(d) { return prisma.vehicle.create({data:{registration:d.registration,make:d.make,model:d.model,year:Number(d.year),status:d.status||"ACTIVE",vin:d.vin||null,colour:d.colour||null,fuelType:d.fuelType||null,bodyType:d.bodyType||null,carryingCapacity:d.carryingCapacity===""||d.carryingCapacity==null?null:Number(d.carryingCapacity),currentMileage:d.currentMileage===""||d.currentMileage==null?0:Number(d.currentMileage)}}); }
  async updateVehicle(id,d) {
    const vehicleId = Number(id);
    const existing = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { currentMileage: true } });
    if (!existing) throw new Error("Vehicle not found.");
    const requestedMileage = d.currentMileage === "" || d.currentMileage == null ? Number(existing.currentMileage || 0) : Number(d.currentMileage);
    if (!Number.isFinite(requestedMileage) || requestedMileage < Number(existing.currentMileage || 0)) {
      throw new Error(`Vehicle mileage cannot be reduced below the current recorded mileage (${Number(existing.currentMileage || 0).toLocaleString()} km).`);
    }
    return prisma.vehicle.update({where:{id:vehicleId},data:{registration:d.registration,make:d.make,model:d.model,year:Number(d.year),status:d.status,vin:d.vin||null,colour:d.colour||null,fuelType:d.fuelType||null,bodyType:d.bodyType||null,carryingCapacity:d.carryingCapacity===""||d.carryingCapacity==null?null:Number(d.carryingCapacity),currentMileage:requestedMileage}});
  }
  async deleteVehicle(id){ return prisma.vehicle.delete({where:{id:Number(id)}}); }
}
export default new VehicleService();
