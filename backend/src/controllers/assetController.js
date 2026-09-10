import * as assetService from "../services/assetService.js";

export async function getAllAssets(req, res) {
  try {
    const assets = await assetService.getAllAssets();

    return res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("GET ALL ASSETS ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

export async function getAsset(req, res) {
  try {
    const asset = await assetService.getAssetById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("GET ASSET ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

export async function createAsset(req, res) {
  try {
    console.log("==================================");
    console.log("CREATE ASSET REQUEST");
    console.log(req.body);
    console.log("==================================");

    const asset = await assetService.createAsset(req.body);

    return res.status(201).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("CREATE ASSET ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

export async function updateAsset(req, res) {
  try {
    const asset = await assetService.updateAsset(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("UPDATE ASSET ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}

export async function deleteAsset(req, res) {
  try {
    await assetService.deleteAsset(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Asset deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ASSET ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
}