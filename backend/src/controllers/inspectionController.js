import inspectionService from "../services/inspectionService.js";

class InspectionController {

  async getAllInspections(req, res) {

    try {

      const inspections =
        await inspectionService.getAllInspections();

      res.status(200).json({
        success: true,
        count: inspections.length,
        data: inspections,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  }

  async getInspectionById(req, res) {

    try {

      const inspection =
        await inspectionService.getInspectionById(
          req.params.id
        );

      if (!inspection) {

        return res.status(404).json({
          success: false,
          message: "Inspection not found.",
        });

      }

      res.status(200).json({
        success: true,
        data: inspection,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  }

  async createInspection(req, res) {

    try {

      const inspection =
        await inspectionService.createInspection(
          req.body
        );

      res.status(201).json({
        success: true,
        message: "Inspection created successfully.",
        data: inspection,
      });

    } catch (error) {

      console.error(error);

      res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  }

  async updateInspection(req, res) {

    try {

      const inspection =
        await inspectionService.updateInspection(
          req.params.id,
          req.body
        );

      res.status(200).json({
        success: true,
        message: "Inspection updated successfully.",
        data: inspection,
      });

    } catch (error) {

      console.error(error);

      res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  }

  async deleteInspection(req, res) {

    try {

      await inspectionService.deleteInspection(
        req.params.id
      );

      res.status(200).json({
        success: true,
        message: "Inspection deleted successfully.",
      });

    } catch (error) {

      console.error(error);

      res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  }

}

export default new InspectionController();