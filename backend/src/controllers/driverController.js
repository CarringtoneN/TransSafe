import * as driverService from "../services/driverService.js";

export async function getAllDrivers(req, res) {
  try {
    const drivers = await driverService.getAllDrivers();

    res.status(200).json({
      success: true,
      data: drivers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getDriver(req, res) {
  try {
    const driver =
      await driverService.getDriverById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createDriver(req, res) {
  try {
    const driver =
      await driverService.createDriver(req.body);

    res.status(201).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateDriver(req, res) {
  try {
    const driver =
      await driverService.updateDriver(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteDriver(req, res) {
  try {
    await driverService.deleteDriver(req.params.id);

    res.status(200).json({
      success: true,
      message: "Driver deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}