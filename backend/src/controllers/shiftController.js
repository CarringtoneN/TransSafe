import shiftService from "../services/shiftService.js";

class ShiftController {
  async getAllShifts(req, res) {
    try {
      const shifts = await shiftService.getAllShifts();

      res.status(200).json({
        success: true,
        data: shifts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getShiftById(req, res) {
    try {
      const shift = await shiftService.getShiftById(req.params.id);

      if (!shift) {
        return res.status(404).json({
          success: false,
          message: "Shift not found.",
        });
      }

      res.status(200).json({
        success: true,
        data: shift,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createShift(req, res) {
    try {
      const shift = await shiftService.createShift(req.body);

      res.status(201).json({
        success: true,
        message: "Shift created successfully.",
        data: shift,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateShift(req, res) {
    try {
      const shift = await shiftService.updateShift(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Shift updated successfully.",
        data: shift,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteShift(req, res) {
    try {
      await shiftService.deleteShift(req.params.id);

      res.status(200).json({
        success: true,
        message: "Shift deleted successfully.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new ShiftController();