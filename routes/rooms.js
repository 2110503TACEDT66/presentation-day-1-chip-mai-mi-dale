const express = require("express");
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/rooms");

const router = express.Router({ mergeParams: true });
const { protect, authorize } = require("../middleware/auth");

router.route("/").get(getRooms).post(protect, authorize("admin"), createRoom);
router
  .route("/:id")
  .get(getRoom)
  .put(protect, authorize("admin"), updateRoom)
  .delete(protect, authorize("admin"), deleteRoom);

module.exports = router;
