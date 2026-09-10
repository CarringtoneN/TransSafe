import assignmentService from "../services/assignmentService.js";

async function getAllAssignments(req, res) {
  try {
    const assignments =
      await assignmentService.getAllAssignments();

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

async function getAssignment(req, res) {
  try {
    const assignment =
      await assignmentService.getAssignment(
        req.params.id
      );

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

async function createAssignment(req, res) {
  try {
    const assignment =
      await assignmentService.createAssignment(
        req.body
      );

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

async function updateAssignment(req, res) {
  try {
    const assignment =
      await assignmentService.updateAssignment(
        req.params.id,
        req.body
      );

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

async function deleteAssignment(req, res) {
  try {
    await assignmentService.deleteAssignment(
      req.params.id
    );

    res.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

export default {
  getAllAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};