import vehicleService from "../services/vehicleService.js";

class VehicleController {
  async getAllVehicles(req, res) {
    try {
      const vehicles = await vehicleService.getAllVehicles();

      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getVehicleById(req, res) {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
      }

      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getVehicleHistory(req, res) {
    try { const history = await vehicleService.getVehicleHistory(req.params.id); res.status(200).json({success:true,data:history}); } catch(error){ console.error(error); res.status(500).json({success:false,message:error.message}); }
  }

  async createVehicle(req, res) {
    try {
      console.log("=================================");
      console.log("CREATE VEHICLE REQUEST");
      console.log(req.body);
      console.log("=================================");

      const vehicle = await vehicleService.createVehicle(req.body);

      res.status(201).json({
        success: true,
        message: "Vehicle created successfully",
        data: vehicle,
      });
    } catch (error) {
      console.error("CREATE VEHICLE ERROR");
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateVehicle(req, res) {
    try {
      const vehicle = await vehicleService.updateVehicle(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: vehicle,
      });
    } catch (error) {
      console.error("UPDATE VEHICLE ERROR");
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteVehicle(req, res) {
    try {
      await vehicleService.deleteVehicle(req.params.id);

      res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    } catch (error) {
      console.error("DELETE VEHICLE ERROR");
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new VehicleController();