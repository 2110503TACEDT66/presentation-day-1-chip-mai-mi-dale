const Room = require("../models/Room");

//@desc     Get all rooms
//@route    GET /api/v1/rooms
//@access   Public
exports.getRooms = async (req, res, next) => {
    try {
      const rooms = await Room.find();

      res.status(200).json({
        success: true,
        count: rooms.length,
        pagination,
        data: rooms,
      });
    } catch (err) {
      res.status(400).json({ success: false });
    }
  };

//@desc     Get single room
//@route    GET /api/v1/rooms/:id
//@access   Public
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Create a room
//@route    POST /api/v1/rooms
//@access   Private
exports.createRoom = async (req, res, next) => {
  const room = await Room.create(req.body);
  res.status(201).json({
    success: true,
    data: room,
  });
};

//@desc     Update single room
//@route    PUT /api/v1/rooms/:id
//@access   Private
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete single room
//@route    DELETE /api/v1/rooms/:id
//@access   Private
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json({
        success: false,
        message: `Bootcamp not found with id of ${req.params.id}`,
      });
    }

    await room.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
