const router = require("express").Router();
const controller = require("../controllers/operations.controller");
router.get("/:resource", controller.list);
router.post("/:resource", controller.create);
router.get("/:resource/:id", controller.get);
router.put("/:resource/:id", controller.update);
router.delete("/:resource/:id", controller.remove);
module.exports = router;
