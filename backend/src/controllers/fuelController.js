import * as fuelService from "../services/fuelService.js";

export async function getAllFuelRecords(req, res) {
  try {
    const records = await fuelService.getAllFuelRecords();

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("GET ALL FUEL RECORDS ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

export async function getFuelRecord(req, res) {
  try {
    const record = await fuelService.getFuelRecordById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Fuel record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("GET FUEL RECORD ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

export async function createFuelRecord(req, res) {
  try {
    console.log("==================================");
    console.log("CREATE FUEL RECORD");
    console.log(req.body);
    console.log("==================================");

    const record = await fuelService.createFuelRecord(req.body);

    return res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("CREATE FUEL RECORD ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

export async function updateFuelRecord(req, res) {
  try {
    const record = await fuelService.updateFuelRecord(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("UPDATE FUEL RECORD ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

export async function deleteFuelRecord(req, res) {
  try {
    await fuelService.deleteFuelRecord(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Fuel record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE FUEL RECORD ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}