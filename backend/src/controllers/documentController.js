import * as documentService from "../services/documentService.js";

export async function getAllDocuments(req, res) {
  try {
    const documents =
      await documentService.getAllDocuments();

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getDocument(req, res) {
  try {
    const document =
      await documentService.getDocumentById(
        req.params.id
      );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createDocument(req, res) {
  try {
    const document =
      await documentService.createDocument(req.body);

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateDocument(req, res) {
  try {
    const document =
      await documentService.updateDocument(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteDocument(req, res) {
  try {
    await documentService.deleteDocument(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}