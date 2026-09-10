import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllFuelRecords() {
  return prisma.fuelrecord.findMany({
    include: {
      vehicle: true,
    },
    orderBy: {
      fuelDate: "desc",
    },
  });
}

export async function getFuelRecordById(id) {
  return prisma.fuelrecord.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      vehicle: true,
    },
  });
}

export async function createFuelRecord(data) {
  const vehicleId=Number(data.vehicleId); const odometer=Number(data.odometer);
  const vehicle=await prisma.vehicle.findUnique({where:{id:vehicleId},select:{currentMileage:true}});
  if(!vehicle) throw new Error("Vehicle not found.");
  if(odometer < Number(vehicle.currentMileage||0)) throw new Error(`Fuel odometer cannot be lower than the vehicle current mileage (${Number(vehicle.currentMileage||0).toLocaleString()} km).`);
  const result = await prisma.fuelrecord.create({
    data: {
      vehicleId: Number(data.vehicleId),
      fuelDate: new Date(data.fuelDate),
      litres: Number(data.litres),
      cost: Number(data.cost),
      odometer: Number(data.odometer),
      station: data.station,
      receiptNo: data.receiptNo || null,
      notes: data.notes || null,
    },
    include: { vehicle: true },
  });
  await prisma.vehicle.update({where:{id:vehicleId},data:{currentMileage:odometer}});
  return result;
}

export async function updateFuelRecord(id, data) {
  const vehicleId=Number(data.vehicleId); const odometer=Number(data.odometer);
  const result = await prisma.fuelrecord.update({
    where: {
      id: Number(id),
    },
    data: {
      vehicleId: Number(data.vehicleId),
      fuelDate: new Date(data.fuelDate),
      litres: Number(data.litres),
      cost: Number(data.cost),
      odometer: Number(data.odometer),
      station: data.station,
      receiptNo: data.receiptNo || null,
      notes: data.notes || null,
    },
    include: { vehicle: true },
  });
  const latest=await prisma.fuelrecord.findFirst({where:{vehicleId},orderBy:{odometer:"desc"},select:{odometer:true}});
  if(latest) await prisma.vehicle.update({where:{id:vehicleId},data:{currentMileage:Math.max(Number(latest.odometer||0),odometer)}});
  return result;
}

export async function deleteFuelRecord(id) {
  return prisma.fuelrecord.delete({
    where: {
      id: Number(id),
    },
  });
}